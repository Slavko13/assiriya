# Развёртывание

**Текущий серверный статус:** `NOT_DEPLOYED`.  
Target `176.98.184.23` и Git `origin` подтверждены. Первая partial installer-попытка выявила Caddy file-capability failure; после narrow fix вторая подтвердила healthy Caddy и выявила non-TTY WP-CLI boundary. `run -T` fix подготовлен. Завершённый reconciled run, сохранённый полный inventory/two-site before-after и public preview/admin smoke отсутствуют. Локальные и partial remote проверки не меняют статус на `DEPLOYED`.

## Локальный запуск

1. Скопировать `.env.example` в untracked `.env` и заменить все `change-me-*`.
2. Проверить итоговую конфигурацию:

```powershell
docker compose --env-file .env -f compose.yaml -f compose.dev.yaml config --quiet
```

3. Запустить изолированный stack:

```powershell
docker compose --env-file .env -f compose.yaml -f compose.dev.yaml up -d --build --wait
```

4. Выполнить идемпотентную установку:

```powershell
docker compose --env-file .env -f compose.yaml -f compose.dev.yaml run --rm --entrypoint sh wpcli /workspace/scripts/bootstrap-wordpress.sh
```

Проверенные локальные адреса: сайт `http://localhost:8086/`, админка `http://localhost:8086/wp-admin/`. Порт задаётся локальным `.env`. Начальные имя/пароль берутся из локального `.env`; их нельзя добавлять в отчёт или Git. Bootstrap не сбрасывает пароль уже установленного администратора.

В dev исходники темы и плагина подключаются bind mounts для немедленного отражения изменений. В production тема и плагин встраиваются в image, а container entrypoint синхронизирует версию из image в рабочее дерево. Production deployment не должен зависеть от bind mounts checkout.

## Persistence

Данные находятся в `avtozakup_db_data`, WordPress files — `avtozakup_wordpress_data`, uploads — `avtozakup_uploads_data`. Для проверки использовать `restart`, а не удаление volumes. Команда `down -v` запрещена для штатной остановки.

Операционная резервная копия является парой: дамп MariaDB + архив uploads с общим timestamp-идентификатором. Восстановление выполняется только согласованной парой, чтобы записи БД не ссылались на отсутствующие медиафайлы. Изолированное локальное restore drill завершено со статусом `PASS`.

## Production preflight

До первого `up` на сервере сохранить read-only inventory:

- `docker compose ls`, `docker ps --all`, networks и volumes;
- открытые TCP-порты и владельцев 80/443/планируемого `CADDY_HTTP_PORT`;
- конфигурацию существующего reverse proxy;
- URL и health двух существующих сайтов;
- свободное место, backup directory и права;
- текущий Git remote/branch/commit.

Не останавливать, не переименовывать и не подключать к сетям существующие containers. Project name, networks, volumes и выбранный host port должны быть уникальны.

## Production config

1. Создать untracked `.env.prod` из `.env.production.example`.
2. Задать реальный `PUBLIC_URL`, свободный `CADDY_HTTP_PORT`, trusted `ADMIN_ALLOWED_CIDR`, длинные разные пароли и absolute безопасный `BACKUP_DIR`.
3. Удалить все placeholder values; `deploy.sh` отклонит их.
4. Проверить:

```bash
docker compose --env-file .env.prod -f compose.yaml -f compose.prod.yaml config --quiet
```

Caddy production profile предназначен только для контролируемого HTTP/IP demo-доступа и ограничивает admin по CIDR. Для production административной панели обязателен VPN, SSH tunnel либо согласованный HTTPS/TLS edge с доверенным сертификатом; `auto_https off` не выполняет `NFR-SEC-003`. Quick Tunnel ниже имеет отдельное явно принятое владельцем demo-исключение с публичной WordPress login form.

## Однокомандный Quick Tunnel preview

Этот вариант предназначен для временной демонстрации без изменения host Caddy и без публикации нового server port. Требования на сервере: Docker Engine с Compose v2, Git, curl, OpenSSL, gzip и tar. После push commit выполнить на `176.98.184.23`:

```bash
curl -fsSL https://raw.githubusercontent.com/Slavko13/assiriya/main/scripts/install-quick-tunnel.sh | sudo env EXPECTED_SERVER_IP='176.98.184.23' EXISTING_SITE_URLS='https://test.itsoft.store/ https://wine-keep-soldier-settle.trycloudflare.com/' bash
```

Оба URL обязательны и зафиксированы владельцем как текущие контрольные endpoints. Скрипт fail-closed проверяет их HTTP(S)-health до любых Docker-изменений и после запуска. Второй endpoint сам является ephemeral Quick Tunnel; если его hostname изменится, значение в команде нужно обновить.

Workflow:

1. проверить публичный IPv4 target, clean checkout, свободное место и два существующих URL;
2. снять read-only snapshot foreign containers и listeners 80/443;
3. отклонить конфликтующие containers/networks/volumes `avtozakup_*`;
4. создать mode-600 `.env.quick` со случайными секретами либо сохранить существующий;
5. при повторном deploy создать парный DB/uploads backup;
6. запустить outbound-only `cloudflared`, получить новый `https://*.trycloudflare.com` и атомарно сохранить его как `PUBLIC_URL`;
7. передать один обязательный `PUBLIC_URL` одновременно `wordpress` и `wpcli`, чтобы bootstrap создавал native taxonomy/page menu objects и project pages сразу на публичном origin;
8. поднять DB и WordPress, затем выполнить идемпотентный non-TTY WP-CLI bootstrap (`run -T`) **до** пересоздания project Caddy;
9. пересоздать только project Caddy, выполнить public smoke и fail-closed отклонить homepage links/actions с `localhost`, `127.0.0.1` или internal `caddy`;
10. подтвердить доступность public WordPress login/admin entry point, неизменность двух URL, foreign container IDs/states и listeners 80/443;
11. вывести `AVTOZAKUP_PREVIEW_URL=...` последней строкой.

Маршрут: `Cloudflare edge → cloudflared → project Caddy:8080 → WordPress:80`. `compose.quick-tunnel.yaml` не содержит `ports`, не использует host networking и не подключается к сетям двух существующих сайтов. По явному решению владельца project Caddy пропускает `/wp-admin/` и `/wp-login.php` к штатной WordPress-аутентификации. CIDR-ограничение здесь не заявляется; это public demo exception, не production security baseline.

Caddy остаётся `read_only`, `no-new-privileges` и `cap_drop: ALL`, но получает обратно единственную capability `NET_BIND_SERVICE`: официальный бинарник несёт соответствующую file capability и без неё Linux отклоняет сам `exec` с `Operation not permitted`. Capability не публикует порт; Caddy по-прежнему слушает только container-internal `:8080`.

Deploy не печатает настроенные bootstrap credentials. Получить их в SSH-сессии сервера (если пароль затем менялся внутри WordPress, `.env.quick` его не заменяет):

```bash
sudo grep -E '^WP_ADMIN_(USER|PASSWORD)=' /opt/avtozakup/.env.quick
```

Не передавать preview URL и пароль в одном публичном сообщении. Успешный smoke требует, чтобы `/wp-login.php` отвечал `2xx` и содержал WordPress `#loginform`, а unauthenticated `/wp-admin/` same-origin перенаправлял на login form.

Quick Tunnel является временным публичным preview без SLA: URL прекращает работу вместе с connector и обычно меняется после его пересоздания. Автоперезапуск `cloudflared` выключен, чтобы после Docker/host restart не возникал новый URL при старом `WP_HOME`; для восстановления нужно повторить ту же one-command установку. Для стабильного DNS нужен named Cloudflare Tunnel или согласованный production edge; ограничения Quick Tunnel описаны в [официальной документации Cloudflare](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/).

## Playwright target safety

Playwright всегда требует явный absolute root `BASE_URL`; fallback target отсутствует. URL с subpath, credentials, query, fragment или non-HTTP(S) scheme отклоняется до запуска browser, потому что suite использует root-relative routes.

Admin E2E выполняет временные settings writes и Woo fixture create/edit/force-delete. Он разрешён только при одновременном наличии `WP_ADMIN_USER`, `WP_ADMIN_PASSWORD` и `E2E_ALLOW_ADMIN_WRITES=1`, после ручной проверки exact target ownership. Partial opt-in завершает config с ошибкой, в которой нет supplied values; trace/video/screenshot для admin project отключены.

Mutating admin E2E не является production smoke и не запускается в deploy workflow. Production smoke ограничивается нижеперечисленными read-only/public проверками и checkout guard.

## Git deployment

На сервере должен быть clean checkout на `DEPLOY_BRANCH` и настроенный origin. Запуск:

```bash
ENV_FILE=/absolute/path/to/.env.prod ./scripts/deploy.sh
```

Последовательность: validate → optional pre-backup → fetch/pull `--ff-only` → build/up/wait → bootstrap → smoke. Ошибка кода возвращает предыдущий commit; автоматический DB rollback по умолчанию выключен, потому что он разрушителен и может потерять новые данные.

## Backup и restore

Парный backup DB + uploads:

```bash
ENV_FILE=/absolute/path/to/.env.prod ./scripts/backup.sh
```

Restore выполняется только из проверенного backup set и с явным подтверждением:

```bash
ENV_FILE=/absolute/path/to/.env.prod ./scripts/restore.sh /absolute/path/to/avtozakup-TIMESTAMP.sql.gz --confirm
```

Restore согласованно возвращает DB и uploads, поэтому сначала делает парный safety backup и останавливает только WordPress этого Compose-проекта. Изолированное restore drill — `PASS`; перед production restore всё равно требуется отдельное операционное подтверждение.

## Проверка после deployment

- Compose services healthy;
- `/` и `/wp-json/` не перенаправляются на localhost/internal host; rendered homepage links/actions также не содержат `localhost`, `127.0.0.1` или internal `caddy`;
- production CIDR-profile: разрешённый IP открывает admin, посторонний получает `403`; Quick Tunnel demo-profile: public login отвечает и guest `/wp-admin/` ведёт на same-origin login;
- главная, exact oils/maintenance/business destinations, direct oils CTA, категории, товар, cart и neutral checkout guard работают;
- DB persistence после restart;
- два существующих сайта имеют те же URL, containers, networks и health;
- commit, URL, время, backup path и результаты smoke сохранены в отчёте.

Только после этих фактов статус может стать `DEPLOYED`.

## Подтверждённые локальные проверки 2026-11-01—2026-11-07

- smoke `/` — `PASS`;
- smoke `/wp-json/` — `PASS`;
- WooCommerce Store API smoke/guard — `PASS`;
- WooCommerce storefront visibility (`coming_soon=no`, `store_pages_only=no`), cart page и classic checkout guard — `PASS`;
- isolated Caddy security drill — `PASS`: homepage `200`, external admin `403`, trusted admin `200`, `X-Content-Type-Options: nosniff`;
- paired DB+uploads backup/restore — `PASS`;
- isolated restore drill — `PASS`;
- Config/documentation preflight: 11 unit tests passed; missing/unsafe target, partial admin-write opt-in, shared WordPress/WP-CLI `PUBLIC_URL`, bootstrap-before-Caddy and Quick Tunnel isolation/internal-link guards проверены, current regression summaries line-compared against the deliberate `67/65/2/0` lock.
- Playwright: 67 tests, 65 passed, 2 intentional skipped, 0 failed; desktop 1440, mobile 390/360, admin save+restore and CRUD/cleanup, project Settings negative capability, SCR-009 marked/unmarked/partial-marker isolation with native price/focus/add/reload/reopen, SCR-010 one/multi-row quantity/count/total/remove/reload/navigation, exact native routes, same-node homepage cart CTA, nav/dialog/auth/search contracts, axe/no-overflow/runtime and deterministic visual evidence.
- I2-S78 listing-card evidence: shop/category/strict product search keep native Woo thumbnail/title/permalink/price/type-specific action inside a Paper-informed `4/3/2/1` responsive shell with `>=48px` CTA; marked demo identity fails closed, unmarked admin SKU remains exact, category count is Russian and unsupported ordering is absent. Targeted public run `6 passed`, localized category refresh `3 passed`, admin target plus dependencies `53 passed / 2 intentional skipped`; final full regression `61` = `59 passed / 2 intentional skipped / 0 failed`.
- I2-S79 homepage-collection evidence: exact admin `popular_title/text` and `stock_title/text` save/public-render/restore passes; custom cards keep native Woo data/action generation, fail-closed marked/unmarked identity and no invented stock/ETA/favorite/filter semantics; desktop five-card grid and contained mobile snap rails pass `1440/390/360`. Valid pre-fix `3 failed`, post-fix homepage target `3 passed`, changed admin targets pass; final full regression remains `61` = `59 passed / 2 intentional skipped / 0 failed`, inventory `10/0/0/0`; 3 homepage, 3 status-background and one existing `390px` category artifact were refreshed, repository total remains `34` (`33` actual + Paper).
- I2-S80 contact-dialog evidence: theme `0.13.0` renders only nonempty renderable admin-backed `contact_phone`/`contact_email` values with normalized links, neutral copy, wrapping and `>=64px` rows on `1440/390/360`; explicit empty config has no fallback actions, unsupported topbar/dialog hours and internal admin instructions are absent, while existing close/Enter/Escape/outside/focus-return behavior remains. Valid pre-fix `3 failed`, post-fix contact target `3 passed`, admin save/clear/restore target `1 passed`; final full regression remains `61` = `59 passed / 2 intentional skipped / 0 failed`, inventory `10/0/0/0`; 3 contact artifacts were added and 12 existing artifacts refreshed (all desktop surfaces plus the `390px` category guard), repository total `37` (`36` actual + Paper). This is local evidence only; server remains `NOT_DEPLOYED` until a completed reconciled installer run.
- I2-S81 storefront/deployment evidence: core `0.4.0` performs exact project-owned customer-copy migration without deletion; theme `0.14.0` removes public provenance/internal-seed/demo labels, resolves native routes and morphs a successful homepage action in place to the canonical cart link. Two seed runs preserve 72 marked terms, 10 products, 10 media, 6 pages and menu ID while cleaning 59 legacy slugs; nav/oils/cart targets pass; all 36 actual PNG are refreshed and PDP artifacts renamed `product-public-copy-*`, total remains `37` (`36` actual + Paper); final full regression remains `61` = `59 passed / 2 intentional skipped / 0 failed`, inventory `10/0/0/0`. Quick Tunnel config/smoke fixes are local evidence only; server remains `NOT_DEPLOYED` until a completed reconciled installer run.
- I2-S82 local presentation evidence: theme `0.15.0` aligns current marked PDP and Cart Block to Paper SCR-009/010 while Woo owns all live commerce state; six new public scenarios cover native price/focus/add/reload/reopen and multi-row totals/removal/navigation, with partial-marker fail-closed admin isolation. Final full regression is `67` = `65 passed / 2 intentional skipped / 0 failed`; repository has `55` PNG including Paper/before/after/side-by-side/overlay; inventory is `10/0/0/0`; code/test findings are fixed and final visual review has no blockers. This does not change Quick Tunnel or server status: `NOT_DEPLOYED` remains until a complete remote run.

Application runtime результаты относятся к локальному адресу `http://localhost:8086/`. Quick Tunnel package отдельно прошёл Bash syntax, Compose no-published-ports, pinned image, shared WordPress/WP-CLI public URL, bootstrap-before-Caddy, internal-link smoke guard и Caddy validation checks. Первая partial remote installer-попытка выявила Caddy file-capability failure; после narrow fix вторая подтвердила healthy project Caddy и выявила non-TTY WP-CLI boundary. Последующие `run -T`/URL/order/smoke fixes подтверждены локально, но завершённый reconciled run, полный inventory/two-site before-after и public preview/admin smoke не зафиксированы, поэтому server остаётся `NOT_DEPLOYED`.

