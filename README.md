# АВТОЗАКУП

Итерация 1 интернет-магазина автозапчастей: WordPress + WooCommerce, редактируемая главная по Paper SCR-002, изолированный Docker-контур и подготовленный Git deployment.

Текущий локальный экземпляр работает на `http://localhost:8086/`; админка — `http://localhost:8086/wp-admin/`. Порт задаётся в untracked-файле `.env`, поэтому новый checkout по примеру использует `8080`, пока значение не изменено.

## Текущий статус

- локальная сборка и recovery-контур: `READY_FOR_DEPLOYMENT`;
- сервер: `NOT_DEPLOYED` — target `176.98.184.23` и Git `origin` подтверждены; первая частичная installer-попытка выявила Caddy file-capability failure, после narrow fix вторая подтвердила healthy Caddy и выявила non-TTY WP-CLI boundary; завершённый reconciled run, полный inventory/two-site before-after и public/admin smoke ещё не зафиксированы;
- последний локальный Playwright-прогон: **61 tests: 59 passed, 2 intentionally skipped**;
- Docker persistence: **PASS** — БД и uploads сохранены после restart;
- парный backup/restore drill для MariaDB + uploads: **PASS**;
- `DEC-001…DEC-020` остаются открытыми, поэтому демонстрационная витрина не считается готовым коммерческим контуром.

## Что реализовано

- классическая тема `avtozakup` с desktop 1440 и provisional mobile 390/360;
- responsive primary navigation: desktop panel остаётся видимым при скрытой toggle-button; на mobile exact click/Enter/Space/Escape/name contracts, breakpoint re-entry, outside/internal-link dismissal и VIN Enter-focus outcome проверены на 390/360;
- header city control остаётся честным blocked-state: keyboard Enter открывает native status dialog с exact DEC-001/014 copy, close получает focus и Enter возвращает focus на trigger на `1440/390/360`;
- плагин `avtozakup-core`: Settings API главной, безопасный demo seed, checkout guard и интерфейсы будущих адаптеров;
- 8 демонстрационных категорий верхнего уровня, 10 WooCommerce-товаров, 6 project-owned страниц и 4 read-only Woo page references; Settings различает одноимённые options по `#ID` и принимает не более 8 существующих root-категорий;
- первый срез Итерации 2: единственная header catalog link имеет exact accessible name и same-origin `/shop/` href без query/fragment, фактически открывает настроенную WooCommerce shop page с восемью curated категориями, общими category cards, явной идентичностью по selected term ID, чистыми accessible names и переходом в category archive;
- technical demo PDP baseline: явная provenance, fail-closed technical SKU, unconfirmed availability, отсутствие неподтверждённых related products и exact loop-product-ID → PDP POST-form/submit wiring;
- marked custom homepage card baseline: public demo brand/article без synthetic `AZ-DEMO-*`, explicit demo stock/note и техническая связность permalink/CTA на `1440/390/360`;
- exact cart identity and synchronization: CTA ID/quantity сверяются с exact AJAX POST payload; current Cart Block plus отправляет Store API update-item для exact row key/quantity `2`, а отдельный final-row scenario — exact remove-item с direct response или matched batch inner `200/items_count=0`; official Woo Cart Store synchronizes the independently verified `1→2` plus path and `1→0` removal path, including `Корзина 0`, while row/quantity state survives the accepted reload leg on `1440/390/360`;
- Paper-aligned demo cart presentation: фирменный order-review hero без декоративного мини-заголовка, responsive product/totals cards, localized controls, prominent safety notice и branded Russian empty state с аккуратной cart-иконкой, opaque keyboard focus ring и exact catalog CTA; unapproved default recommendations are hidden, while Woo data/session and demo checkout guard remain authoritative;
- текущий public theme использует meaningful H1–H3 и основной текст без декоративных mini-heading/eyebrow/overline: VIN, B2B, contact и status-dialog сохраняют содержательные заголовки, copy, actions, labels и прежние focus/close/fail-closed contracts; functional demo/status badges, product brands и field/navigation labels сохранены;
- exact demo checkout guard: cart/checkout показывают единый полный safety message, classic button имеет disabled/`aria-disabled`, Store API возвращает тот же message с exact `403` contract;
- guest My Account baseline: canonical same-origin `/my-account/`, desktop-visible «Войти», намеренно скрытый mobile entry в DOM и штатная гостевая Woo login form с exact POST/input/nonce/referer/reset-link wiring; base route получил фирменную Russian split-card presentation на `1440` и stacked card на `390/360` с `52px` controls, while Woo owns all auth behavior; password/remember controls имеют pointer+keyboard/focus contracts и exact local Tab order; lost-password link по Tab/Enter открывает exact GET destination с browser-visible reset-form wiring без отправки, а local `submit ⇄ identifier` keyboard edge сохраняет URL/empty/no-POST и показывает changed visible focus ring;
- provisional generic product search: exact same-origin GET/action/`s`/`post_type=product`/submit wiring, escaped results/no-results context, включая scoped one-result page без Woo auto-redirect, и canonical возврат в каталог; field index/article/brand/ranking не заявлены;
- fail-closed search scope: post-only и mixed post types не получают product-search presentation;
- scoped public Woo copy: shop H1/count, product-search count, breadcrumbs, demo actions и PDP description labels; unapproved ordering UI снят только на shop/search, полная локализация остаётся отдельной задачей;
- E2E isolation: временные unmarked Woo products не получают demo presentation в каталоге, строгом поиске, PDP, собственном same-origin exact category archive и custom homepage maintenance card; exact REST product ID сохраняется в loop CTA и PDP POST submit, custom card — exact SKU/links и standard stock/note/CTA; unmarked и CRUD Woo fixtures всегда объединяют known IDs с exact SKU/slug lookup и идут `product → category`, root/child boundary fixture очищается `child → root`, а temporary `shop_manager` — по exact username с защитой admin ID; повторные lookup дают `0`;
- локальный и production Compose, Caddy с CIDR-ограничением админки, именованные volumes;
- backup/restore связанного комплекта MariaDB + `uploads`;
- Playwright: публичная главная, skip-link/navigation/dialog keyboard contracts, guest login/reset entrypoints, repeated-AJAX, native quantity/final-row removal→header synchronization, localized filled/empty cart и reload/checkout/Back/Forward continuity, exact source-card→cart-row identity, exact UI/API demo checkout guard, админка, exact hero restore, fixture/user cleanup, `shop_manager` negative capability, marked/unmarked isolation, axe и fail-fast deterministic screenshots;
- трассировка требований и честные статусы открытых `DEC-001…DEC-020`.

Цены, остатки и сроки на демо-товарах не являются коммерческим предложением. Реальные поиск/применяемость, поставщики, VIN, B2B, checkout, оплата и доставка не активированы до соответствующих решений и интеграций.

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

## Демо-данные

Идемпотентное обновление помеченных demo-сущностей:

```powershell
docker compose --env-file .env -f compose.yaml -f compose.dev.yaml --profile tools run --rm wpcli avtozakup seed-demo
```

`--force` дополнительно возвращает presentation-настройки и формат RUB к демо-baseline; непомеченные записи не изменяются.

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

Текущий config/documentation preflight: **11 passed**. Один filesystem-only guard фиксирует verified `61/59/2/0` и требует совпадения current regression summary в acceptance-status, двух handoff-строках README, progress и deployment; он не запускает Playwright и не доказывает свежесть browser evidence.

Текущий локальный результат: **61 tests: 59 passed, 2 intentionally skipped**. Оба skip относятся к повторному viewport-независимому Store API guard на двух mobile-проектах; сам guard проходит на desktop-проекте. Suite также проверяет branded responsive guest My Account base login на `1440/390/360`, exact login/reset wiring без auth/recovery submit, password/remember keyboard/focus contracts, recovery identifier/submit local Shift+Tab/Tab order with changed visible focus signal, public skip-link transfer, responsive navigation/dialog dismissal/focus contracts, отсутствие четырёх декоративных homepage/dialog pre-heading с сохранёнными meaningful H2 и collision-safe open status dialog, exact header product-search GET wiring, catalog/search/PDP, exact marked PDP add-to-cart form identity, repeated-AJAX badge/name `1 → 2`, native Cart Block plus `1→2` with exact Store API row key and official Cart Store header synchronization through reload, exact separate `1→0` final-row remove with direct response or matched batch inner `200/items_count=0`, settled Store/header `0`, localized branded empty state с детерминированной cart-иконкой без inherited mask и mini-heading, opaque keyboard focus ring and exact `/shop/` transition, cart header/row/guard после exact reload и Back, checkout header/guard после navigation и Forward, Paper-aligned responsive cart order review с localized controls/totals/CTA, curated category identity и root/max-8 input boundary с exact-slug root/child cleanup, marked custom homepage card contract, exact clicked custom-card→единственная cart-row identity, same-origin canonical cart/checkout link wiring, единый exact UI/API demo checkout guard, exact temporary category-archive URL, unmarked category-archive/custom-card isolation, admin save/restore, unmarked и transactional Woo product/category fixtures с always-on exact SKU/slug fallback cleanup и отказ `shop_manager` в доступе к project Settings при сохранённом доступе к Products. Temporary user cleanup всегда объединяет known ID с exact username lookup и исключает admin ID. Mutating Settings-тесты сохраняют полный исходный порядок category/popular/stock selections; hero-сценарий дополнительно сравнивает исходное и восстановленное поле `hero_title`, а также exact normalized text/order публичных `.az-heading-line`. Fixtures удаляются с проверкой `404` и repeated lookup `0`. Все 30 actual screenshots снимаются общим fail-fast helper после загрузки шрифтов, активации lazy images и декодирования layout-visible `<img>`/CSS backgrounds; захват сериализован между workers, а существующий PNG сохраняется только при строго ограниченной decoded-pixel эквивалентности. На Windows локальный suite использует один worker, потому что shared Chrome compositor под параллельной нагрузкой давал крупные небезопасные visual diff; CI уже был serial. HTML-отчёт: [`playwright-report/index.html`](playwright-report/index.html). Точные правила скриншотов и Paper reference: [`docs/qa/visual-diffs/README.md`](docs/qa/visual-diffs/README.md).

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

HTTP production-profile по IP допустим только для ограниченной демонстрации без клиентских/платёжных данных; его удалённая админка требует VPN/SSH tunnel либо доверенного HTTPS edge. Ниже отдельно описано принятое владельцем Quick Tunnel demo-исключение с публичной WordPress login form.

Текущая production-конфигурация является demo-контуром, а не публичным магазином: первая частичная remote installer-попытка выявила Caddy file-capability failure; после narrow fix вторая подтвердила healthy project Caddy и выявила non-TTY WP-CLI boundary. Исправление `run -T` подготовлено, но завершённый повторный run, полный inventory, before/after evidence двух существующих сайтов и public preview/admin smoke ещё отсутствуют. Реальные поиск и применяемость, VIN/B2B, резервы, checkout, оплата, доставка и возвраты остаются заблокированы открытыми `DEC-001…DEC-020` и отсутствующими интеграционными контрактами.

Подробный runbook: [`docs/implementation/deployment.md`](docs/implementation/deployment.md).

### Однокомандный временный preview через Cloudflare

После push текущего commit выполнить **на сервере `176.98.184.23`** одну команду:

```bash
curl -fsSL https://raw.githubusercontent.com/Slavko13/assiriya/main/scripts/install-quick-tunnel.sh | sudo env EXPECTED_SERVER_IP='176.98.184.23' EXISTING_SITE_URLS='https://test.itsoft.store/ https://wine-keep-soldier-settle.trycloudflare.com/' bash
```

Установщик использует `/opt/avtozakup`, clean `main` и только fast-forward update. Отдельный Compose-проект не публикует host ports, не подключается к сетям существующего Caddy и не выполняет `down`, prune или `--remove-orphans`. До и после запуска проверяются оба URL, foreign container IDs/states и listeners 80/443. При первом запуске создаётся untracked `/opt/avtozakup/.env.quick` с режимом `600` и случайными секретами; при повторном запуске файл и данные сохраняются, а работающий DB/uploads-контур предварительно резервируется.

Последняя строка успешного запуска имеет вид `AVTOZAKUP_PREVIEW_URL=https://...trycloudflare.com`. Это временная публичная preview-ссылка, а не постоянный DNS. Автоперезапуск connector выключен, чтобы не получить новый URL при старом `WP_HOME`; после Docker/host restart нужно повторить ту же команду. По явному решению владельца `/wp-admin/` и `/wp-login.php` доступны через preview и защищены штатной WordPress-аутентификацией со случайным длинным паролем. Настроенные bootstrap credentials не печатаются deploy-скриптом; прочитать их только на сервере (если пароль затем менялся внутри WordPress, актуален уже новый пароль):

```bash
sudo grep -E '^WP_ADMIN_(USER|PASSWORD)=' /opt/avtozakup/.env.quick
```

Public admin является demo-исключением, не production security baseline; ссылку и credentials нельзя публиковать вместе.

## Документация

- [`AGENTS.md`](AGENTS.md) — правила продолжения работы;
- [`docs/implementation/requirements-map.md`](docs/implementation/requirements-map.md) — трассировка;
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
