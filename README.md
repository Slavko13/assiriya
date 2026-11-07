# АВТОЗАКУП

Итерация 1 интернет-магазина автозапчастей: WordPress + WooCommerce, редактируемая главная по Paper SCR-002, изолированный Docker-контур и подготовленный Git deployment.

Текущий локальный экземпляр работает на `http://localhost:8086/`; админка — `http://localhost:8086/wp-admin/`. Порт задаётся в untracked-файле `.env`, поэтому новый checkout по примеру использует `8080`, пока значение не изменено.

## Текущий статус

- локальная сборка и recovery-контур: `READY_FOR_DEPLOYMENT`;
- сервер: `NOT_DEPLOYED` — target `176.98.184.23` и Git `origin` подтверждены; первая частичная installer-попытка выявила Caddy file-capability failure, после narrow fix вторая подтвердила healthy Caddy и выявила non-TTY WP-CLI boundary; завершённый reconciled run, полный inventory/two-site before-after и public/admin smoke ещё не зафиксированы;
- последний локальный Playwright-прогон: **70 tests: 68 passed, 2 intentionally skipped**;
- Docker persistence: **PASS** — БД и uploads сохранены после restart;
- парный backup/restore drill для MariaDB + uploads: **PASS**;
- `DEC-001…DEC-020` остаются открытыми, поэтому локально проверенная витрина не считается готовым коммерческим контуром.

## Что реализовано

- классическая тема `avtozakup` с desktop 1440 и provisional mobile 390/360;
- responsive primary navigation: desktop panel остаётся видимым при скрытой toggle-button; на mobile exact click/Enter/Space/Escape/name contracts, breakpoint re-entry, outside/internal-link dismissal и VIN Enter-focus outcome проверены на 390/360;
- header city control остаётся честным blocked-state: keyboard Enter открывает native status dialog с нейтральным customer-facing сообщением, close получает focus и Enter возвращает focus на trigger на `1440/390/360`;
- плагин `avtozakup-core` `0.4.0`: Settings API главной, идемпотентное обновление только project-owned каталога, checkout guard и интерфейсы будущих адаптеров;
- 8 выбранных категорий верхнего уровня, 10 WooCommerce-товаров, 6 project-owned страниц и 4 read-only Woo page references; legacy project-owned copy/slugs/SKU/media обновляются без удаления сущностей, а непомеченные записи не изменяются; Settings различает одноимённые options по `#ID` и принимает не более 8 существующих root-категорий;
- первый срез Итерации 2: единственная header catalog link имеет exact accessible name и same-origin `/shop/` href без query/fragment, фактически открывает настроенную WooCommerce shop page с восемью curated категориями, общими category cards, явной идентичностью по selected term ID, чистыми accessible names и переходом в category archive;
- Paper SCR-009 product detail: theme `0.15.0` preserves native Woo title/gallery/price/quantity/add form and composes the measured `392/413/423` desktop grid, visible gallery zoom, VIN route, semantic live price/availability summary, specifications/description/reviews and provisional `390/360` reflow; only Woo name plus project-owned brand/article are shown, while supplier ranking, city, ETA, favorites and invented attributes remain absent;
- тема `avtozakup` `0.14.0` даёт shop, category и strict product search одну Paper-informed карточку без Woo template override: native thumbnail/title/permalink/price/type-specific action остаются authoritative, публичные карточки не показывают provenance/internal seed metadata, а непомеченный товар сохраняет доступные `pa_brand`/native SKU; desktop/provisional mobile используют сетку `4/3/2/1` и action не ниже `48px`, category count локализован, а неподтверждённая сортировка скрыта;
- две homepage-подборки используют customer-facing identity и нативное type-specific действие WooCommerce: поля `popular_title/text` и `stock_title/text` реально управляют публичными заголовками/copy, fake brand/reference/availability/ETA и неработающие favorite/filter controls удалены; успешное AJAX-добавление меняет исходную кнопку на `Перейти в корзину` без дополнительной Woo-ссылки и повторного POST, а reload сохраняет server-rendered cart state; desktop сохраняет пять карточек, `390/360` — доступную snap-ленту без page overflow;
- exact cart identity and synchronization: CTA ID/quantity сверяются с exact AJAX POST payload; current Cart Block plus отправляет Store API update-item для exact row key/quantity `2`, а отдельный final-row scenario — exact remove-item с direct response или matched batch inner `200/items_count=0`; official Woo Cart Store synchronizes the independently verified `1→2` plus path and `1→0` removal path, including `Корзина 0`, while row/quantity state survives the accepted reload leg on `1440/390/360`;
- Paper SCR-010 cart presentation: compact breadcrumbs/H1/live unit count and exact `860/396` desktop columns wrap the real Cart Block rows/totals/actions; quantity `1→2`, one-of-two removal, last-row empty state, header badge, reload continuity, catalog/checkout navigation and guard stay Woo-owned; unsupported selection/favorites/city/ETA/supplier claims and decorative mini-headings are absent, while `390/360` keep `44px` controls without overflow;
- complete Paper frontend inventory I2-S83: all `13` live artboards are exported and mapped to exact current routes/components; `39` current captures on `1440/390/360` and `26` diagnostic comparisons prove the reviewed `0 DONE / 10 PARTIAL / 3 MISSING` state; missing vehicle/subcategory/selected-vehicle screens, dead links, visual gaps and reusable/missing components are explicit in the route matrix, with no production frontend/backend or WordPress-data mutation;
- текущий public theme использует meaningful H1–H3 и основной текст без декоративных mini-heading/eyebrow/overline: VIN, B2B, contact и status-dialog сохраняют содержательные заголовки, copy, actions, labels и прежние focus/close/fail-closed contracts; functional status badges, product brands и field/navigation labels сохранены;
- окно «Связаться с нами» показывает только заданные в project Settings телефон и email: отображаемые строки имеют безопасные mobile touch-targets, нейтральный текст и точные `tel:`/`mailto:` связи, а пустая конфигурация не получает фиктивных fallback-ссылок; неподтверждённые часы работы и внутренняя подсказка про WordPress удалены, а валидность/доступность каналов, Telegram/MAX и CRM/SLA не заявляются;
- exact checkout guard: cart/checkout показывают единое нейтральное сообщение о временно недоступном онлайн-оформлении, classic button имеет disabled/`aria-disabled`, Store API возвращает тот же message с exact `403` contract;
- guest My Account baseline: canonical same-origin `/my-account/`, desktop-visible «Войти», намеренно скрытый mobile entry в DOM и штатная гостевая Woo login form с exact POST/input/nonce/referer/reset-link wiring; base route получил фирменную Russian split-card presentation на `1440` и stacked card на `390/360` с `52px` controls, while Woo owns all auth behavior; password/remember controls имеют pointer+keyboard/focus contracts и exact local Tab order; lost-password link по Tab/Enter открывает exact GET destination с browser-visible reset-form wiring без отправки, а local `submit ⇄ identifier` keyboard edge сохраняет URL/empty/no-POST и показывает changed visible focus ring;
- provisional generic product search: exact same-origin GET/action/`s`/`post_type=product`/submit wiring, escaped results/no-results context, включая scoped one-result page без Woo auto-redirect, и canonical возврат в каталог; field index/article/brand/ranking не заявлены;
- fail-closed search scope: post-only и mixed post types не получают product-search presentation;
- scoped public Woo copy: shop H1/count, product-search/category count, breadcrumbs, customer-facing actions и PDP description labels; unapproved ordering UI снят на shop/search/category, полная локализация остаётся отдельной задачей;
- E2E isolation: временные unmarked Woo products не получают project-owned presentation в каталоге, строгом поиске, PDP, собственном same-origin exact category archive и custom homepage maintenance card; exact REST product ID сохраняется в loop CTA и PDP POST submit, custom card — exact SKU/links и нативное Woo action без fake stock/ETA; unmarked и CRUD Woo fixtures всегда объединяют known IDs с exact SKU/slug lookup и идут `product → category`, root/child boundary fixture очищается `child → root`, а temporary `shop_manager` — по exact username с защитой admin ID; повторные lookup дают `0`;
- локальный и production Compose, Caddy с CIDR-ограничением админки, именованные volumes;
- backup/restore связанного комплекта MariaDB + `uploads`;
- Playwright: публичная главная, exact category/business/oils routes, skip-link/navigation/dialog keyboard contracts, guest login/reset entrypoints, same-node AJAX cart transition, native quantity/final-row removal→header synchronization, localized filled/empty cart и reload/checkout/Back/Forward continuity, exact source-card→cart-row identity, exact UI/API checkout guard, админка, exact hero restore, fixture/user cleanup, `shop_manager` negative capability, project-owned/unmarked isolation, axe и fail-fast deterministic screenshots;
- трассировка требований и честные статусы открытых `DEC-001…DEC-020`.

Цены, остатки и сроки на текущих тестовых товарах не являются коммерческим предложением. Реальные поиск/применяемость, поставщики, VIN, B2B, checkout, оплата и доставка не активированы до соответствующих решений и интеграций.

## Быстрый локальный запуск

Требования: Windows 11, Docker Desktop и PowerShell.

```powershell
Copy-Item .env.example .env
# Заменить все change-me значения и при необходимости выбрать свободный WP_PORT.
.\scripts\start.ps1
```

Повторный запуск безопасен: bootstrap не удаляет данные и не сбрасывает существующего администратора. Запрещено использовать `docker compose down -v` для обычной остановки.

Проверка состояния:

```powershell
docker compose --env-file .env -f compose.yaml -f compose.dev.yaml ps
curl.exe -I -L http://localhost:8086/
```

Учётные данные администра берутся только из `WP_ADMIN_USER` и `WP_ADMIN_PASSWORD` локального `.env`. Не копируйте их в README, команды, логи, Git или отчёты. Playwright требует явный `BASE_URL` и не имеет target по умолчанию; записывающие admin-сценарии дополнительно требуют `E2E_ALLOW_ADMIN_WRITES=1`.

## Начальные данные каталога

Идемпотентное обновление только сущностей, помеченных как принадлежащие проекту:

```powershell
docker compose --env-file .env -f compose.yaml -f compose.dev.yaml --profile tools run --rm wpcli avtozakup seed-demo
```

`--force` дополнительно возвращает presentation-настройки и формат RUB к project baseline; непомеченные записи не изменяются и автоматически не удаляются.

## Тесты

```powershell
npm install
npm run test:preflight
$env:BASE_URL='http://localhost:8086'
$env:WP_ADMIN_USER=(Get-Content .env | Where-Object { $_ -like 'WP_ADMIN_USER=*' } | Select-Object -First 1).Split('=',2)[1]
$env:WP_ADMIN_PASSWORD=(Get-Content .env | Where-Object { $_ -like 'WP_ADMIN_PASSWORD=*' } | Select-Object -First 1).Split('=',2)[1]
$env:E2E_ALLOW_ADMIN_WRITES='1'
npm run test:e2e
```

Перед установкой opt-in сверьте exact root `BASE_URL` и убедитесь, что стенд локальный или disposable и принадлежит вам: admin suite временно меняет settings и создаёт/удаляет Woo fixtures. Этот suite не является production smoke; trace/video/screenshot для admin project отключены.

Текущий config/documentation preflight: **12 passed**. Filesystem-only guards фиксируют verified `70/68/2/0`, требуют совпадения current regression summary в acceptance-status, двух handoff-строках README, progress и deployment, а также полноту 13-row I2-S83 route matrix/evidence; они не запускают Playwright и не доказывают свежесть browser evidence.

Текущий локальный результат: **70 tests: 68 passed, 2 intentionally skipped**. Оба skip относятся к повторному viewport-независимому Store API guard на двух mobile-проектах; desktop guard проходит. I2-S83 добавляет по одному последовательному 13-screen inventory scenario на каждый public project: exact current routes/404, contact/vehicle dialogs и focus, реальная двухстрочная Woo-корзина, checkout entry, desktop dead-route/fragment audit, axe serious/critical, no-overflow и runtime gates. Existing suite сохраняет SCR-009/010 commerce-state checks, final-row empty state, checkout guard, guest account, search/catalog, admin save/restore, partial-marker fail-closed isolation и CRUD/RBAC/cleanup. Visual package теперь содержит все 13 Paper references, 39 current actuals и 26 новых comparisons; repository total `133` PNG (`87` actual captures + `16` Paper references + `30` comparisons). Post-suite inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary shop managers. На Windows локальный suite использует один worker; CI также serial. HTML-отчёт: [`playwright-report/index.html`](playwright-report/index.html). Точные правила: [`docs/qa/visual-diffs/README.md`](docs/qa/visual-diffs/README.md).

## Persistence, backup и restore

Проверка restart подтвердила сохранность БД и uploads: **PASS**. Парный recovery drill также завершён со статусом **PASS**: `backup.sh` создал согласованные архивы `*.sql.gz` и `*.uploads.tar.gz`, оба архива прошли проверку, а `restore.sh` восстановил контрольные данные и media.

Для обычной остановки или перезапуска не используйте `docker compose down -v`: эта команда удаляет именованные volumes. Production-команды backup/restore и обязательное явное подтверждение destructive restore описаны в [`docs/implementation/deployment.md`](docs/implementation/deployment.md).

## Production и Git deployment

Production-код темы/плагина встраивается в image; live checkout не bind-mounted. До запуска на сервере обязательны read-only inventory двух существующих сайтов, проверка proxy/портов/firewall/resources и выбор свободного `CADDY_HTTP_PORT`.

```bash
cp .env.production.example .env.prod
# Заполнить реальные секреты, PUBLIC_URL, ADMIN_ALLOWED_CIDR и свободный порт.
docker compose --env-file .env.prod -f compose.yaml -f compose.prod.yaml config --quiet
ENV_FILE=/opt/avtozakup/.env.prod ./scripts/deploy.sh
```

HTTP production-profile по IP допустим только для ограниченного preview без клиентских/платёжных данных; его удалённая админка требует VPN/SSH tunnel либо доверенного HTTPS edge. Ниже отдельно описано принятое владельцем Quick Tunnel preview-исключение с публичной WordPress login form.

Текущая production-конфигурация является preview-контуром, а не готовым публичным магазином: первая частичная remote installer-попытка выявила Caddy file-capability failure; после narrow fix вторая подтвердила healthy project Caddy и выявила non-TTY WP-CLI boundary. Последующие `run -T`/shared-URL/bootstrap-order/smoke fixes подтверждены локально, но завершённый повторный run, полный inventory, before/after evidence двух существующих сайтов и public preview/admin smoke ещё отсутствуют. Реальные поиск и применяемость, VIN/B2B, резервы, checkout, оплата, доставка и возвраты остаются заблокированы открытыми `DEC-001…DEC-020` и отсутствующими интеграционными контрактами.

Подробный runbook: [`docs/implementation/deployment.md`](docs/implementation/deployment.md).

### Однокомандный временный preview через Cloudflare

После push текущего commit выполнить **на сервере `176.98.184.23`** одну команду:

```bash
curl -fsSL https://raw.githubusercontent.com/Slavko13/assiriya/main/scripts/install-quick-tunnel.sh | sudo env EXPECTED_SERVER_IP='176.98.184.23' EXISTING_SITE_URLS='https://test.itsoft.store/ https://wine-keep-soldier-settle.trycloudflare.com/' bash
```

Установщик использует `/opt/avtozakup`, clean `main` и только fast-forward update. Отдельный Compose-проект не публикует host ports, не подключается к сетям существующего Caddy и не выполняет `down`, prune или `--remove-orphans`. Один и тот же `PUBLIC_URL` передаётся WordPress и WP-CLI до bootstrap, поэтому native taxonomy/page menu objects и project pages создаются сразу с публичным origin; smoke отклоняет ссылки и actions на `localhost`, `127.0.0.1` и внутренний `caddy`. До и после запуска проверяются оба URL, foreign container IDs/states и listeners 80/443. При первом запуске создаётся untracked `/opt/avtozakup/.env.quick` с режимом `600` и случайными секретами; при повторном запуске файл и данные сохраняются, а работающий DB/uploads-контур предварительно резервируется.

Последняя строка успешного запуска имеет вид `AVTOZAKUP_PREVIEW_URL=https://...trycloudflare.com`. Это временная публичная preview-ссылка, а не постоянный DNS. Автоперезапуск connector выключен, чтобы не получить новый URL при старом `WP_HOME`; после Docker/host restart нужно повторить ту же команду. По явному решению владельца `/wp-admin/` и `/wp-login.php` доступны через preview и защищены штатной WordPress-аутентификацией со случайным длинным паролем. Настроенные bootstrap credentials не печатаются deploy-скриптом; прочитать их только на сервере (если пароль затем менялся внутри WordPress, актуален уже новый пароль):

```bash
sudo grep -E '^WP_ADMIN_(USER|PASSWORD)=' /opt/avtozakup/.env.quick
```

Public admin является preview-исключением, не production security baseline; ссылку и credentials нельзя публиковать вместе.

## Документация

- [`AGENTS.md`](AGENTS.md) — правила продолжения работы;
- [`docs/implementation/requirements-map.md`](docs/implementation/requirements-map.md) — трассировка;
- [`docs/implementation/frontend-route-matrix.md`](docs/implementation/frontend-route-matrix.md) — все 13 Paper-экранов, routes/components, gaps и следующий slice;
- [`docs/implementation/architecture.md`](docs/implementation/architecture.md) — архитектура;
- [`docs/implementation/acceptance-status.md`](docs/implementation/acceptance-status.md) — фактическая приёмка;
- [`docs/implementation/progress.md`](docs/implementation/progress.md) — прогресс и ограничения;
- [`docs/implementation/decision-log.md`](docs/implementation/decision-log.md) — технические решения и открытые DEC;
- [`docs/implementation/deployment.md`](docs/implementation/deployment.md) — deployment/recovery runbook;
- [`docs/implementation/iterations.md`](docs/implementation/iterations.md) — история и следующий scope;
- [`docs/implementation/iteration-1-report.md`](docs/implementation/iteration-1-report.md) — итоговый отчёт Итерации 1;
- [`docs/qa/visual-diffs/README.md`](docs/qa/visual-diffs/README.md) — правила visual QA и provisional baseline;
- аналитический источник остаётся в `J:\vlad322\README.md` и `J:\vlad322\docs`.

Итог: локальный пакет и изолированный Quick Tunnel installer имеют статус `READY_FOR_DEPLOYMENT`; серверный статус — `NOT_DEPLOYED` до успешного server run и before/after проверок двух сайтов.
