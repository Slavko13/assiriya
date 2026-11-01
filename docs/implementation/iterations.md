# Итерации

## Итерация 1 — Homepage MVP + WordPress + Docker + Git Deployment

**Статус:** `DONE (LOCAL) / READY_FOR_DEPLOYMENT`; сервер `NOT_DEPLOYED`  
**Начало:** 2026-11-01  
**Paper:** текущий SCR-002, baseline не утверждён (`DEC-019 OPEN`); mobile `DESIGN_REVIEW_REQUIRED`, pixel-perfect не заявляется.

### Цель

Дать воспроизводимый фундамент: изолированный WordPress/WooCommerce, редактируемую главную по доступному Paper, реальные записи WooCommerce с явно отделёнными demo-данными, локальный/production Compose и безопасный deployment path.

### В scope

- theme и core plugin без изменения WordPress/WooCommerce core;
- SCR-002 desktop и provisional mobile;
- Settings API для presentation content;
- WooCommerce categories/products/menus/pages и idempotent demo seed;
- add-to-cart demo с запретом production checkout;
- local/prod Docker, Caddy, backup/restore/deploy/smoke;
- техническая документация, трассировка и visual artifacts.

### Вне scope / BLOCKED

- OEM normalization/ranking и DG-001;
- реальная fitment;
- supplier offers, real stock, reserve/procurement/pricing;
- submit VIN/CRM, B2B onboarding;
- production checkout/payment/delivery/returns;
- изменение двух существующих серверных сайтов.

### Критерии завершения

1. Compose build/up проходит; WordPress, WooCommerce, theme и plugin активны.
2. Главная и `/wp-admin` доступны; контент сохраняется.
3. Категории/товары из WooCommerce появляются на главной; demo отмечено и checkout blocked.
4. DB/uploads сохраняются после restart.
5. Browser console/page errors отсутствуют в согласованном smoke-наборе.
6. Desktop comparison и provisional mobile screenshot зафиксированы; расхождения документированы.
7. Keyboard/axe/viewport checks выполнены; failures не скрыты.
8. Production compose config, port/isolation preflight, backup и restore procedure проверены.
9. Git deployment, production Compose, reverse proxy и recovery path подготовлены; при отсутствии server access допустим `READY_FOR_DEPLOYMENT`, но не `DEPLOYED`.

Remote inventory и реальный deployment выполняются только после предоставления доступа и не имитируются локальными результатами.

### Подтверждено локально

- dev/prod Compose config/build/up;
- WordPress `7.1.4`, WooCommerce `11.2.1`, PHP `8.3.36`, MariaDB `11.4.13`;
- admin login/menu и save → homepage → restore исходного значения;
- Woo category/product create → edit → homepage selection → restore/delete cleanup;
- повторный seed: `8` categories, `10` products, `10` attachments, `9` pages, menu `24`;
- Woo storefront visibility, AJAX cart, badge, cart page, classic checkout guard и Store API 403;
- DB/uploads persistence после restart;
- парный DB+uploads backup и isolated restore drill;
- production image/config/up/smoke и isolated Caddy CIDR/header drill;
- Playwright: `13` tests = `11 passed`, `2 intentional skipped`, `0 failed` на desktop `1440`, mobile `390`, mobile `360` и отдельном admin project.

### Почему сервер ещё не DEPLOYED

- mobile имеет `DESIGN_REVIEW_REQUIRED`, а desktop не заявляется pixel-perfect до утверждения baseline/assets;
- все `DEC-001…DEC-020` остаются `OPEN`;
- Git remote, server inventory/access и remote deployment отсутствуют; сервер `NOT_DEPLOYED`.

### История

| Дата | Изменение | Результат |
|---|---|---|
| 2026-11-01 | Создан технический каркас темы, плагина, Compose и scripts | implementation присутствует; проверки ещё фиксируются |
| 2026-11-01 | Создана документация реализации | трассировка и границы зафиксированы; acceptance не повышен |
| 2026-11-01 | Проверены dev/prod Compose и runtime versions | config/build/up PASS; WP `7.1.4`, WC `11.2.1`, PHP `8.3.36`, MariaDB `11.4.13` |
| 2026-11-01 | Повторён demo seed | стабильные counts: `8/10/10/9`, menu `24`; technical idempotency PASS |
| 2026-11-01 | Проверены admin edit и persistence | save/home/restore и DB/uploads restart persistence PASS |
| 2026-11-01 | Выполнены backup и isolated restore | парный DB+uploads backup и restore drill PASS |
| 2026-11-01 | Устранён WooCommerce Coming soon и закрыт demo commerce flow | cart/count/page + classic/Store API guards PASS |
| 2026-11-01 | Проверены Woo CRUD и keyboard focus | create/edit/render/cleanup и visible focus PASS |
| 2026-11-01 | Завершён финальный Playwright | `13`: `11 passed`, `2 intentional skipped`, `0 failed`; `1440/390/360`; visual `DESIGN_REVIEW_REQUIRED` |
| 2026-11-01 | Проверена готовность deployment package | Caddy drill PASS; Git remote/server access отсутствуют; package `READY_FOR_DEPLOYMENT`, server `NOT_DEPLOYED` |

## Итерация 2 — Catalog / Search / PDP

**Статус:** `IN_PROGRESS` короткими срезами примерно по 30 минут.

**Принцип:** реализовывать только независимые части исходного backlog; не закрывать `PBL-011—017`, `DG-001/017/018` или `DEC-002—006` частичным UI.

### I2-S1 — SCR-005: верхний уровень каталога

**Статус:** `DONE / PROVISIONAL`

**Связь:** `PBL-011 partial`, `PBL-040 partial`, `FR-CAT-001 partial`, `UC-SRCH-001` шаги 1—3, `TC-039 partial`.

Выполнено:

- настроенная WooCommerce shop page выводит восемь выбранных в Settings API top-level categories без hardcoded IDs;
- category-card главной переиспользуется на странице каталога;
- штатный WooCommerce breadcrumb добавлен в общий Woo shell;
- переход «Тормозная система» открывает category archive с опубликованными demo-товарами;
- actual screenshots сохранены для `1440/390/360`;
- Playwright catalog journey: `3 passed`; полный regression: `16 tests`, `14 passed`, `2 intentional skipped`, `0 failed`.

Не входит в срез:

- поиск, ranking, no-results и `DG-001/018`;
- фильтры, сортировка или придуманное дерево категорий;
- fitment, offers, freshness, реальные цена/остаток;
- очистка старых одноимённых terms: используются curated category IDs, автоматическое слияние запрещено без master-data решения.

Следующий допустимый 30-минутный срез: явная demo provenance на стандартных WooCommerce archive/PDP, без изменения поиска, сортировки и коммерческой семантики.

Отдельно зафиксировано: canonical shop slug ещё не нормализован (локальная установка использует URL, заданный WooCommerce page option); это не скрывается и не исправляется в I2-S1.

### I2-S2A — граница владения WooCommerce pages

**Статус:** `DONE`

**Цель:** прекратить создание дублей `/shop-2`, `/cart-2`, `/checkout-2` при свежем bootstrap и повторном demo seed, не меняя пользовательские WooCommerce pages.

Критерии среза:

- demo seeder создаёт и обновляет только принадлежащие проекту страницы (`home`, `delivery`, `returns`, `vin`, `business`, `contacts`);
- `shop`, `cart`, `checkout`, `myaccount` берутся из валидной конфигурации WooCommerce и не получают demo-метки;
- даже `seed-demo --force` не меняет Woo page options, title, slug, content или meta валидных настроенных страниц;
- manifest раздельно фиксирует `demo_pages` и read-only ссылки `woocommerce_pages`, сохраняя совместимый агрегат `pages` для текущей темы;
- два последовательных seed не меняют Woo page IDs/options/content hashes и не создают новые страницы с суффиксом `-2`;
- текущая legacy-БД в этом срезе не очищается: одноразовый repair выполняется отдельной dry-run/confirm операцией после исправления seeder.

Блокер безопасности: WooCommerce не хранит надёжный owner-marker для автоматически созданной немаркированной страницы. Поэтому seeder не пытается угадывать владение, переименовывать, перезаписывать или удалять такую страницу.

Выполнено и проверено:

- plugin-owned seed сокращён с 9 до 6 страниц; manifest содержит `demo_pages: 6`, `woocommerce_pages: 4` и совместимый агрегат `pages: 10`;
- на существующей legacy-БД два `seed(true)` сохранили Woo options, hashes и полный набор page IDs без изменений;
- на изолированной fresh-install базе два полных bootstrap сохранили canonical IDs и slug `/shop`, `/cart`, `/checkout`, `/my-account`; `*-2` не созданы, Woo pages не маркированы как demo;
- полный текущий Playwright regression после изменения: `16` tests, `14 passed`, `2 intentional skipped`, `0 failed`;
- временные контейнеры, сети и три test-only volume удалены после проверки; основной runtime не затронут.

Qualifier: это prevention-срез. Текущие legacy `/shop-2`, `/cart-2`, `/checkout-2` остаются до отдельного fail-closed repair; I2-S2A не заявляет SEO/canonical policy и не закрывает `PBL-039`.

## Следующие итерации

| Итерация-кандидат | Scope по исходному backlog | Gate |
|---|---|---|
| 2 — `IN_PROGRESS` | catalog/search/PDP: PBL-002, 006, 011—017; I2-S1 завершён | DEC-002—006, DG-001/018, INT-CAT/ERP/SUP contracts |
| 3 | cart/checkout/order: PBL-003—005, 018—023 | DEC-008—014, DG-004—008, PSP/DLV/WMS sandbox |
| 4 | procurement/receiving/pickup: PBL-024—027/033 | operational ownership, ERP/WMS/SUP contracts, DG-013—016 |
| 5 | account/VIN/B2B/returns: PBL-028—032/041 | DEC-015—018, CRM/IDP/legal, DG-002/003/009—011 |
| Сквозная | PBL-034—040 | approved NFR, privacy/security, observability, test gates |

