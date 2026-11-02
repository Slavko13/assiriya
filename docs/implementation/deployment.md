# Развёртывание

**Текущий серверный статус:** `NOT_DEPLOYED`.  
Target `176.98.184.23` и Git `origin` подтверждены, но серверный запуск не выполнялся. Два существующих сайта, занятые порты, reverse proxy и ресурсы target фактически не проверялись. Локальные проверки не меняют статус на `DEPLOYED`.

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

Caddy profile предназначен только для контролируемого HTTP/IP demo-доступа и ограничивает admin по CIDR. Для публичной административной панели обязателен VPN, SSH tunnel либо согласованный HTTPS/TLS edge с доверенным сертификатом; `auto_https off` не выполняет `NFR-SEC-003`.

## Однокомандный Quick Tunnel preview

Этот вариант предназначен для временной демонстрации без изменения host Caddy и без публикации нового server port. Требования на сервере: Docker Engine с Compose v2, Git, curl, OpenSSL, gzip и tar. После push commit выполнить на `176.98.184.23`, заменив оба placeholder URL:

```bash
curl -fsSL https://raw.githubusercontent.com/Slavko13/assiriya/main/scripts/install-quick-tunnel.sh | sudo env EXPECTED_SERVER_IP='176.98.184.23' EXISTING_SITE_URLS='https://SITE_1.EXAMPLE https://SITE_2.EXAMPLE' bash
```

Оба URL обязательны: фактические домены двух сайтов отсутствуют в репозитории и истории, поэтому скрипт не угадывает их. Он fail-closed проверяет их HTTP(S)-health до любых Docker-изменений и после запуска.

Workflow:

1. проверить публичный IPv4 target, clean checkout, свободное место и два существующих URL;
2. снять read-only snapshot foreign containers и listeners 80/443;
3. отклонить конфликтующие containers/networks/volumes `avtozakup_*`;
4. создать mode-600 `.env.quick` со случайными секретами либо сохранить существующий;
5. при повторном deploy создать парный DB/uploads backup;
6. запустить outbound-only `cloudflared`, получить новый `https://*.trycloudflare.com` и атомарно сохранить его как `PUBLIC_URL`;
7. build/start/recreate только services Compose-проекта `avtozakup`, выполнить идемпотентный bootstrap и public smoke;
8. подтвердить public admin `403`, неизменность двух URL, foreign container IDs/states и listeners 80/443;
9. вывести `AVTOZAKUP_PREVIEW_URL=...` последней строкой.

Маршрут: `Cloudflare edge → cloudflared → project Caddy:8080 → WordPress:80`. `compose.quick-tunnel.yaml` не содержит `ports`, не использует host networking и не подключается к сетям двух существующих сайтов. Project Caddy полностью блокирует публичные `/wp-admin/` и `/wp-login.php`, потому что за `cloudflared` нельзя безопасно применять исходное CIDR-правило по адресу посетителя.

Quick Tunnel является временным публичным preview без SLA: URL прекращает работу вместе с connector и обычно меняется после его пересоздания. Автоперезапуск `cloudflared` выключен, чтобы после Docker/host restart не возникал новый URL при старом `WP_HOME`; для восстановления нужно повторить ту же one-command установку. Для стабильного DNS нужен named Cloudflare Tunnel или согласованный production edge; ограничения Quick Tunnel описаны в [официальной документации Cloudflare](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/).

## Playwright target safety

Playwright всегда требует явный absolute root `BASE_URL`; fallback target отсутствует. URL с subpath, credentials, query, fragment или non-HTTP(S) scheme отклоняется до запуска browser, потому что suite использует root-relative routes.

Admin E2E выполняет временные settings writes и Woo fixture create/edit/force-delete. Он разрешён только при одновременном наличии `WP_ADMIN_USER`, `WP_ADMIN_PASSWORD` и `E2E_ALLOW_ADMIN_WRITES=1`, после ручной проверки exact target ownership. Partial opt-in завершает config с ошибкой, в которой нет supplied values; trace/video/screenshot для admin project отключены.

Mutating admin E2E не является production smoke и не запускается в deploy workflow. Production smoke ограничивается нижеперечисленными read-only/public проверками и demo guard.

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
- `/` и `/wp-json/` не перенаправляются на localhost/internal host;
- разрешённый IP открывает admin, посторонний получает 403;
- главная, категории, товар, cart и demo checkout guard работают;
- DB persistence после restart;
- два существующих сайта имеют те же URL, containers, networks и health;
- commit, URL, время, backup path и результаты smoke сохранены в отчёте.

Только после этих фактов статус может стать `DEPLOYED`.

## Подтверждённые локальные проверки 2026-11-01—2026-11-02

- smoke `/` — `PASS`;
- smoke `/wp-json/` — `PASS`;
- WooCommerce Store API smoke/guard — `PASS`;
- WooCommerce storefront visibility (`coming_soon=no`, `store_pages_only=no`), cart page и classic checkout guard — `PASS`;
- isolated Caddy security drill — `PASS`: homepage `200`, external admin `403`, trusted admin `200`, `X-Content-Type-Options: nosniff`;
- paired DB+uploads backup/restore — `PASS`;
- isolated restore drill — `PASS`;
- Playwright/deployment preflight: 10 unit tests passed; missing/unsafe target, partial admin-write opt-in и Quick Tunnel isolation guards проверены.
- Playwright: 39 tests, 37 passed, 2 intentional skipped, 0 failed; desktop 1440, mobile 390/360, admin save+restore, Woo CRUD/cleanup, project Settings negative capability, catalog/search/PDP, demo guards и bounded visual comparator.

Application runtime результаты относятся к локальному адресу `http://localhost:8086/`. Quick Tunnel package отдельно прошёл Bash syntax, Compose no-published-ports, pinned image и Caddy validation checks. Реального server deployment не было: `NOT_DEPLOYED`.

