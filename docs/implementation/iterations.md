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

Qualifier: это prevention-срез; одноразовая локальная миграция legacy URL выполнена отдельно в I2-S2B. I2-S2A не заявляет SEO/canonical policy и не закрывает `PBL-039`.

### I2-S2B — fail-closed repair legacy Woo pages

**Статус:** `DONE`

**Цель:** отдельной CLI-командой перевести только доказанный legacy-набор с demo `*-2` pages на существующие штатные Woo pages; dry-run является режимом по умолчанию.

Критерии среза:

- dry-run показывает option ID, candidate ID, slug и план, не меняя options, posts, meta, settings или manifest;
- настроенная немаркированная Woo page всегда сохраняется без изменений, даже при `--confirm`;
- переключение допустимо только если текущая option page имеет обе точные demo-метки, а canonical candidate — опубликованная немаркированная page с точным slug и консервативной Woo signature;
- любая неоднозначность блокирует весь repair до записи; частичный repair запрещён;
- `--confirm` сначала переключает Woo options, точечно обновляет `hero_primary_url` только при точном совпадении со старым demo permalink, обновляет manifest и перемещает только доказанные demo-дубли в WordPress Trash;
- при исключении выполняется rollback options/settings/manifest и уже перемещённых demo pages;
- повторный dry-run/confirm после успешного repair является no-op; seed ×2 не восстанавливает дубли;
- перед локальным `--confirm` создаётся проверенная парная DB+uploads backup.

Вне scope: redirect/SEO policy, удаление из Trash, изменение title/content/meta немаркированных pages и любые production/server действия.

Выполнено и проверено:

- `wp avtozakup repair-woo-pages` по умолчанию выполняет zero-write dry-run; `--confirm` доступен только после полного fail-closed preflight;
- guard блокирует concurrent confirm через atomic lock, ambiguous markers, missing/multiple candidates, custom title/content, revisions, reused IDs и отключённый WordPress Trash; canonical target hashes проверяются до/после;
- isolated fixture: dry-run zero-write, rollback до cleanup и после первого successful Trash, lock contention, ambiguous fail-closed, custom configured shop preservation, successful confirm, повторный no-op и seed ×2 — `PASS`;
- перед основной локальной миграцией создана и проверена парная backup `20261101T182214Z`;
- основная база: Woo options `30/31/32 → 4/5/6`, `hero_primary_url → /shop/`, manifest обновлён, только marked demo IDs `30/31/32` находятся в Trash; повторный confirm — no-op, seed ×2 не создаёт дубли;
- штатные Woo Cart/Checkout Blocks сохранены без изменения; demo notice расширен на Cart Block, Store API guard остаётся `403`;
- canonical journey `/shop/ → /cart/ → /checkout/` прошёл на `1440/390/360`; полный regression: `16` tests, `14 passed`, `2 intentional skipped`, `0 failed`.

Удаление из WordPress Trash не выполнялось. SEO redirects для старых `*-2` URL и общий canonical policy остаются вне scope и не закрывают `PBL-039`.

### I2-S3 — explicit demo provenance на Woo surfaces

**Статус:** `DONE / PROVISIONAL`

**Связь:** `PBL-011 partial`, `PBL-040 partial`, `FR-CAT-002 partial`, `FR-OFR-002 safety partial`, `UC-SRCH-001` только шаги 3/7/8, `TC-039 partial`.

Критерии среза:

- единый helper распознаёт только явно marked demo products и не публикует произвольные raw meta;
- стандартные Woo shop/category/search cards показывают: «Демонстрационный товар · цена и наличие не подтверждены»;
- PDP показывает: «Демонстрационный товар. Цена, остаток, срок поставки и применяемость не подтверждены внешними системами.»;
- для текущего whitelist source показывается «Источник демо-данных: Paper SCR-002, SCR-006, SCR-007, SCR-009»;
- unmarked product не получает provenance, а homepage custom card использует тот же predicate;
- E2E `1440/390/360`: `/shop/` → marked loop card → поиск по названию «Фильтр» (несколько результатов, без single-result redirect) → marked search result → PDP provenance/source; no overflow/runtime errors; actual screenshots сохранены;
- полный regression не имеет новых failures.

Вне scope: OEM/SKU normalization, ranking/no-results, filters/sort, fitment, supplier offers/freshness, real price/stock/ETA, production checkout и закрытие `DEC-002/003/005/006/019/020`, `DG-001/006/017/018`, `TC-001—006`.

Выполнено и проверено:

- centralized helper распознаёт `_avtozakup_demo=1` и legacy `_az_demo_product=yes`; homepage card и стандартные Woo surfaces используют один predicate;
- unknown raw source meta не публикуется; только текущий whitelist source отображается как Paper SCR-002/006/007/009;
- category/search loops и single product summary получают provenance через именованные Woo hooks без template override;
- E2E на `1440/390/360`: каталог → «Тормозная система» → marked card → multi-result product-name search «Фильтр» → marked result → PDP disclaimer/source; provenance scenario `3 passed`, весь `catalog.spec.ts` `6 passed` (`2` сценария × `3` viewport), `0 failed`;
- actual PDP screenshots: `product-demo-provenance-desktop-chrome-1440.png`, `product-demo-provenance-mobile-chrome-390.png`, `product-demo-provenance-mobile-chrome-360.png`;
- full regression: `19` tests, `17 passed`, `2 intentional skipped`, `0 failed`.

Статус относится только к явной demo provenance. `PBL-011`, `FR-CAT-002`, `FR-OFR-002`, перечисленные TC/DG/DEC остаются partial/open; visual имеет `DESIGN_REVIEW_REQUIRED`.

### I2-S4 — technical demo PDP safety baseline

**Статус:** `DONE / PROVISIONAL`

**Связь:** `PBL-011 partial`, `PBL-040 partial`, `FR-CAT-002 partial`, `FR-CAT-003 safety partial`; полный `SCR-009` не реализуется.

Критерии среза:

- marked demo product сохраняет штатные Woo H1, image/placeholder, short/long description, breadcrumb и category links;
- только точный seed identifier `AZ-DEMO-###` подписывается как «Технический демо-SKU» и не объявляется OEM, артикулом производителя или поставщика;
- single-product availability не показывает подтверждённый численный остаток, а кнопка явно добавляет позицию в демо-корзину;
- стандартный Woo `Related products` для marked demo PDP не выводится: совпадение category/tag не доказывает аналог или применяемость;
- unmarked products не получают custom demo-meta и сохраняют штатное Woo-поведение;
- E2E `1440/390/360`: product выбирается из DOM без hardcoded ID/slug; один корректный H1, image/placeholder, descriptions, category, technical SKU, provenance; related отсутствует; no overflow/runtime errors; axe serious/critical = 0; actual screenshots сохранены;
- полный regression не имеет новых failures.

Вне scope: OEM/article normalization, confirmed analogs, fitment, variants/fasovka, supplier offers/freshness/ranking, real price/stock/ETA, production checkout и полный Paper styling. `DEC-002—006`, `DG-001/006/017/018` и связанные TC остаются open.

Выполнено и проверено:

- для marked demo PDP сохранён штатный Woo content, а точный `AZ-DEMO-###` показан как технический demo-SKU с явным отрицанием OEM/артикула производителя;
- численный stock assertion заменён на «Демо-наличие не подтверждено внешними системами», single-product action подписан «Добавить в демо-корзину»;
- default `Related products` снят только для marked demo PDP; unmarked products сохраняют штатное Woo-поведение, а marked product с custom SKU — штатный meta UI;
- in-memory predicate control: unmarked exact-looking SKU и marked custom SKU отклонены, только marked `AZ-DEMO-###` принят; CLI/non-product filters unchanged;
- E2E technical PDP scenario на `1440/390/360`: `3 passed`; весь `catalog.spec.ts`: `9 passed`; H1/image/descriptions/category/provenance/SKU, отсутствие related, no-overflow/runtime и axe serious/critical проверены;
- actual screenshots: `product-technical-baseline-desktop-chrome-1440.png`, `product-technical-baseline-mobile-chrome-390.png`, `product-technical-baseline-mobile-chrome-360.png`;
- full regression: `22` tests, `20 passed`, `2 intentional skipped`, `0 failed`.

Статус относится только к технической безопасности marked demo PDP. `SCR-009`, `PBL-011`, `FR-CAT-002/003` и перечисленные DEC/DG/TC остаются partial/open; visual имеет `DESIGN_REVIEW_REQUIRED`.

### I2-S5 — truthful product-search empty state

**Статус:** `DONE / PROVISIONAL`

**Связь:** `PBL-002/006/012 safety partial`, `FR-SRCH-001—003 presentation partial`, `UC-SRCH-001` только submit/context/no-results; `TC-003 presentation/safety partial`, `TC-001/002 blocked`. Отдельный search-results дизайн отсутствует в Paper.

Критерии среза:

- header form не обещает артикул/бренд/нормализацию и сохраняет `post_type=product`; после field-аудита I2-S6 copy нейтрализована до «По товарам» / «Введите запрос»;
- product search page показывает escaped query context в H1 и сохраняет значение в searchbox;
- zero-result product search показывает один понятный status-блок с escaped query и canonical ссылкой на configured shop;
- empty state не предлагает выдуманные аналоги, fitment, offers или auto-corrections;
- E2E `1440/390/360`: уникальный no-results query, H1/searchbox/status/catalog return, `0` product cards, no overflow/runtime errors, axe serious/critical = 0, actual screenshots;
- существующий multi-result search/PDP и полный regression не ухудшаются.

Вне scope: SKU/article/brand/OEM index, normalization/transliteration, typo correction, ranking, suggestions, filters/sort, analytics, fitment/offers and approved search design. `DEC-002—006`, `DG-001/018` и полные `TC-001—003` остаются open.

Выполнено и проверено:

- header presentation больше не обещает поиск «по артикулу/номеру детали/бренду»; финальная нейтральная copy I2-S6 не фиксирует неподтверждённые поля индекса;
- product-only query context выводится через named `woocommerce_page_title` filter с explicit escaping raw query; значение searchbox сохраняется один раз без double escaping;
- штатный Woo no-products notice заменяется только для product search на один escaped status-блок с configured shop link; query/ranking не меняются;
- special-character query `AZ-NO-RESULT-9F3C & "probe"` буквально сохранён в URL/searchbox/H1/empty state, product cards `0`, default notice отсутствует;
- E2E empty-state scenario на `1440/390/360`: `3 passed`; axe serious/critical, no-overflow/runtime errors пройдены; actual screenshots сохранены;
- full regression, включая multi-result search → PDP: `25` tests, `23 passed`, `2 intentional skipped`, `0 failed`.

Статус относится только к технически честному no-results состоянию. `PBL-002/006/012`, полные `TC-001—003`, `DG-001/018`, `DEC-003` и утверждённый search design остаются partial/open/blocked; `TC-001/002` не покрыты срезом.

### I2-S6 — generic product-search results baseline

**Статус:** `DONE / PROVISIONAL`

**Связь:** `PBL-002/006/012 safety partial`, `FR-SRCH-001—003 presentation partial`, `UC-SRCH-001` submit/results/context; `TC-003 presentation partial`, `TC-001/002 blocked`.

Критерии среза:

- search form использует нейтральные «По товарам» / «Введите запрос» и не обещает конкретные index fields;
- штатный Woo/WP query не модифицируется: fixture-аудит подтверждает, что он может учитывать content (`Демонстрационная` → `10`), поэтому title-only claim удаляется;
- multi-result query `Фильтр` сохраняется в URL/searchbox/H1 и возвращает только product cards текущего fixture;
- результатные cards имеют product links и explicit demo provenance; empty state отсутствует;
- порядок/ranking не фиксируются и не выдаются за согласованный алгоритм; штатный `Relevance` ordering control скрыт на product search;
- E2E `1440/390/360`: product-only multi-result context, axe serious/critical, no overflow/runtime errors, actual screenshots;
- полный regression не ухудшается.

Вне scope: field index contract, SKU/article/brand/OEM, normalization/transliteration, typo correction, ranking, suggestions, filters/sort, pagination contract, analytics, fitment/offers and approved search design. `DEC-002—006`, `DG-001/018`, `TC-001/002` остаются open/blocked.

Выполнено и проверено:

- read-only `WP_Query` fixture audit: generic content term `Демонстрационная` совпадает с `10` products, поэтому прежний title-only claim удалён из UI/документации;
- header использует нейтральные «По товарам» / «Введите запрос»; search query/data/ranking не модифицированы;
- `Фильтр` сохраняется в URL/searchbox/H1 и возвращает ровно `2` fixture product cards, обе с non-empty title, same-origin permalink и demo provenance; title matching/order не проверяются;
- ошибочно появлявшийся curated shop category grid исключён из search results и защищён assertion;
- `Relevance` ordering control исключён только из product search, поскольку ranking contract отсутствует; result count сохранён;
- E2E search file на `1440/390/360`: `6 passed` (`2` сценария × `3` viewport); positive-result actual screenshots сохранены;
- full regression: `28` tests, `26 passed`, `2 intentional skipped`, `0 failed`.

Статус относится только к generic fixture results presentation. Поля индекса, ranking и все перечисленные PBL/TC/DG/DEC остаются partial/open/blocked; visual имеет `DESIGN_REVIEW_REQUIRED`.

### I2-S7 — scoped Woo public-copy consistency

**Статус:** `DONE / PROVISIONAL`

**Связь:** presentation quality для `I2-S1/S4/S6`, `PBL-010/011/012/PBL-040 partial`; бизнес-требования не расширяются.

Критерии среза:

- configured shop H1 отображается как «Каталог товаров» без изменения user-owned Woo page title;
- product search result count отображается как «Найдено товаров: N» только на strict product search;
- standard Woo loop action marked demo product подписан «Добавить в демо-корзину» только для direct-add simple/purchasable/in-stock/AJAX state; остальные состояния сохраняют штатный label;
- PDP description tab и heading получают presentation label «Описание» без изменения content;
- существующие catalog/search/PDP E2E утверждают эти labels на `1440/390/360` и screenshots обновляются;
- data/query/ranking/cart guards и unmarked business data не меняются; полный regression не ухудшается.

Вне scope: полноценный translation catalog, breadcrumb localization, admin copy, checkout/account/cart translation, approved typography/design and any business semantics.

Выполнено и проверено:

- shop H1 локализован presentation-only `woocommerce_page_title` filter; post title немаркированной Woo page не изменён;
- strict product search заменяет только result-count callback на «Найдено товаров: N»; default query/count source сохранён;
- direct-add marked demo Woo loop action и single action используют «Добавить в демо-корзину»; другие product states и checkout guard не менялись;
- in-memory CTA gate control: current seeded direct-add product → demo label; cloned out-of-stock state сохраняет исходный `Read more`;
- description tab/heading локализованы filters до «Описание» без template override/content mutation;
- catalog/search/PDP targeted на `1440/390/360`: `15 passed`, `0 failed`; actual screenshots обновлены и визуально проверены;
- full regression: `28` tests, `26 passed`, `2 intentional skipped`, `0 failed`.

Статус относится только к четырём проверенным public labels. Breadcrumb, shop result count/sorting и остальные Woo/admin/account/cart/checkout strings остаются вне scope; visual `PROVISIONAL / DESIGN_REVIEW_REQUIRED`.

### I2-S8 — user-owned product isolation regression

**Статус:** `DONE / TECHNICAL`

**Связь:** regression safety для I2-S3/S4/S7, `PBL-011/PBL-040 partial`; бизнес-функции не расширяются.

Критерии среза:

- authenticated Woo REST создаёт временный published unmarked simple product с user SKU/stock и возвращает permalink;
- standard shop loop у временного товара не получает demo provenance или demo CTA;
- PDP сохраняет user SKU и штатную availability/action, не получает demo provenance/technical meta и не теряет description content;
- unconditional presentation-only label «Описание» допускается и явно отделён от demo semantics;
- product удаляется `force=true` в `finally`, cleanup проверяет exact-SKU REST lookup; test не мутирует seed entities;
- desktop admin project проверяет create → shop/PDP isolation → cleanup; runtime errors отсутствуют;
- полный regression после cleanup не имеет failures.

Вне scope: production product lifecycle, permissions matrix, real inventory truth, related-products semantics для unmarked data и server deployment.

Выполнено и проверено:

- serial admin E2E создаёт через authenticated Woo REST unmarked simple product с unique name/SKU, price, stock `3`, short/long descriptions и visible catalog status;
- shop loop по newest order подтверждает отсутствие demo provenance/demo CTA у user-owned product;
- PDP подтверждает отсутствие demo provenance/technical meta, сохранение exact user SKU, non-demo stock/action и обоих descriptions; global «Описание» остаётся только presentation label;
- `finally` выполняет authenticated `force=true` delete и проверяет absence exact temporary SKU; targeted scenario `1 passed`;
- post-target и post-full cleanup controls: `published_products=10`, `e2e_user_products=0`;
- full regression: `29` tests, `27 passed`, `2 intentional skipped`, `0 failed`.

Статус относится только к автоматизированной isolation/regression границе. Он не утверждает production master data, RBAC matrix, real stock или lifecycle.

## Следующие итерации

| Итерация-кандидат | Scope по исходному backlog | Gate |
|---|---|---|
| 2 — `IN_PROGRESS` | catalog/search/PDP: PBL-002, 006, 011—017; I2-S1 завершён | DEC-002—006, DG-001/018, INT-CAT/ERP/SUP contracts |
| 3 | cart/checkout/order: PBL-003—005, 018—023 | DEC-008—014, DG-004—008, PSP/DLV/WMS sandbox |
| 4 | procurement/receiving/pickup: PBL-024—027/033 | operational ownership, ERP/WMS/SUP contracts, DG-013—016 |
| 5 | account/VIN/B2B/returns: PBL-028—032/041 | DEC-015—018, CRM/IDP/legal, DG-002/003/009—011 |
| Сквозная | PBL-034—040 | approved NFR, privacy/security, observability, test gates |

