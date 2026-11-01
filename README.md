# АВТОЗАКУП

Итерация 1 интернет-магазина автозапчастей: WordPress + WooCommerce, редактируемая главная по Paper SCR-002, изолированный Docker-контур и подготовленный Git deployment.

Текущий локальный экземпляр работает на `http://localhost:8086/`; админка — `http://localhost:8086/wp-admin/`. Порт задаётся в untracked-файле `.env`, поэтому новый checkout по примеру использует `8080`, пока значение не изменено.

## Текущий статус

- локальная сборка и recovery-контур: `READY_FOR_DEPLOYMENT`;
- сервер: `NOT_DEPLOYED` — серверный доступ и Git `origin` отсутствуют, inventory существующих сайтов и реальный deploy не выполнялись;
- последний локальный Playwright-прогон: **30 passed, 2 intentionally skipped**;
- Docker persistence: **PASS** — БД и uploads сохранены после restart;
- парный backup/restore drill для MariaDB + uploads: **PASS**;
- `DEC-001…DEC-020` остаются открытыми, поэтому демонстрационная витрина не считается готовым коммерческим контуром.

## Что реализовано

- классическая тема `avtozakup` с desktop 1440 и provisional mobile 390/360;
- плагин `avtozakup-core`: Settings API главной, безопасный demo seed, checkout guard и интерфейсы будущих адаптеров;
- 8 демонстрационных категорий, 10 WooCommerce-товаров, 6 project-owned страниц и 4 read-only Woo page references;
- первый срез Итерации 2: динамическая настроенная WooCommerce shop page с восемью curated категориями, общими category cards и переходом в category archive;
- technical demo PDP baseline: явная provenance, fail-closed technical SKU, unconfirmed availability и отсутствие неподтверждённых related products;
- provisional generic product search: escaped results/no-results context, включая scoped one-result page без Woo auto-redirect, и canonical возврат в каталог; field index/article/brand/ranking не заявлены;
- fail-closed search scope: post-only и mixed post types не получают product-search presentation;
- scoped public Woo copy: shop H1/count, product-search count, breadcrumbs, demo actions и PDP description labels; unapproved ordering UI снят только на shop/search, полная локализация остаётся отдельной задачей;
- E2E isolation: временный unmarked Woo product не получает demo presentation в каталоге, строгом поиске и PDP; `finally` cleanup и отсутствие temporary SKU проверяются;
- локальный и production Compose, Caddy с CIDR-ограничением админки, именованные volumes;
- backup/restore связанного комплекта MariaDB + `uploads`;
- Playwright: публичная главная, AJAX cart, Store API guard, админка, сохранение настроек, axe и screenshots;
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

Текущий локальный результ: **32 tests: 30 passed, 2 intentionally skipped**. Оба skip относятся к повторному viewport-независимому Store API guard на двух mobile-проектах; сам guard проходит на desktop-проекте. Suite также проверяет catalog/search/PDP, demo guards, admin save/restore и transactional Woo CRUD/cleanup на `1440/390/360`. HTML-отчёт: [`playwright-report/index.html`](playwright-report/index.html). Правила скриншотов и Paper reference: [`docs/qa/visual-diffs/README.md`](docs/qa/visual-diffs/README.md).

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

HTTP по IP допустим только для ограниченной демонстрации без клиентских/платёжных данных. Удалённая админка требует VPN/SSH tunnel либо доверенного HTTPS edge.

Текущая production-конфигурация является HTTP demo-контуром, а не публичным магазином: TLS edge не настроен, сервер не предоставлен, Git `origin` отсутствует, два существующих сайта не инвентаризировались. Реальные поиск и применяемость, VIN/B2B, резервы, checkout, оплата, доставка и возвраты остаются заблокированы открытыми `DEC-001…DEC-020` и отсутствующими интеграционными контрактами.

Подробный runbook: [`docs/implementation/deployment.md`](docs/implementation/deployment.md).

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

Итог: локальный пакет имеет статус `READY_FOR_DEPLOYMENT`; серверный статус — `NOT_DEPLOYED`.
