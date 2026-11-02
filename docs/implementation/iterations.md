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

### I2-S9 — truthful canonical shop controls

**Статус:** `DONE / PROVISIONAL`

**Связь:** `SCR-005`, `PBL-010/PBL-012 partial`; presentation/ranking safety без новой business semantics.

Критерии среза:

- canonical shop определяется fail-closed как `is_shop() && !is_search()`;
- default Woo result count заменяется named renderer «Товаров в каталоге: N» из `wc_get_loop_prop('total')`;
- ordering control снимается только с canonical shop; query, default order, URL `orderby` и data не меняются;
- product search сохраняет own scoped count/no-ordering; category archive сохраняет standard ordering;
- `1440/390/360`: cards/URLs/category journey, axe serious/critical, no overflow/runtime errors и screenshots проходят.

Вне scope: ranking contract, изменение query/order, category/tag localization, pagination wording, full i18n и approved visual design.

Выполнено и проверено:

- named shop predicate/config/count renderer добавлены без template override, `gettext` и CSS hiding;
- shop показывает `data-shop-product-count` = «Товаров в каталоге: 10», `.woocommerce-ordering` отсутствует;
- visible product cards и links сохранены; category archive не получает shop marker и сохраняет ordering;
- targeted catalog: `3 passed`; PHP lint: `PASS`; screenshots обновлены и просмотрены;
- full regression: `29` tests, `27 passed`, `2 intentional skipped`, `0 failed`.

Статус закрывает только truthful canonical-shop presentation. Ranking/query/data и visual approval остаются open.

### I2-S10 — fail-closed product-search scope regression

**Статус:** `DONE / TECHNICAL`

**Связь:** regression safety для I2-S5/S6/S9, `PBL-002/PBL-012 partial`; business scope не расширяется.

Критерии среза:

- crafted `post_type=post` и `post_type[]=product&post_type[]=post` возвращают successful WordPress documents и сохраняют query scope;
- exact-product custom markers/count/empty state и canonical-shop controls не протекают в non-product/mixed search;
- test не утверждает generic search layout/result semantics и не меняет WordPress query;
- `1440/390/360`: no horizontal overflow и no runtime errors;
- full regression проходит без failures.

Вне scope: generic site search UX, mixed-result design, search index/ranking, normalization/suggestions и screenshot baseline.

Выполнено и проверено:

- новый browser regression проходит post-only и mixed URL на каждом viewport;
- custom product/search/shop markers и product-specific heading отсутствуют; query и post-type params сохранены;
- targeted: `3 passed`; no overflow/runtime errors;
- full regression: `32` tests, `30 passed`, `2 intentional skipped`, `0 failed`.

Статус относится только к fail-closed presentation boundary. Generic/mixed search UX и business search contract остаются open.

### I2-S11 — fail-closed Playwright target/admin-write preflight

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-036/PBL-040 technical safety partial`; production behavior и business scope не меняются.

Критерии среза:

- Playwright config требует explicit absolute HTTP(S) `BASE_URL`; implicit localhost target отсутствует;
- malformed/non-HTTP URL, subpath, credentials, query и fragment в target отклоняются до browser/HTTP;
- admin credential pair и `E2E_ALLOW_ADMIN_WRITES=1` образуют неделимый opt-in; любой partial state завершает config с ошибкой без supplied values, admin failure artifacts отключены;
- с explicit `BASE_URL` без triplet public suite доступен, admin tests отмечены skipped и writes не выполняются;
- с full triplet обнаруживаются все tests и full regression проходит;
- documentation явно отделяет mutating local/disposable admin E2E от production smoke.

Вне scope: доказательство remote ownership, RBAC/`TC-037`, production authorization, CI secret manager и server deployment.

Выполнено и проверено:

- standalone env validator подключён к Playwright config; fallback `http://localhost:8080` удалён;
- Node preflight matrix: `6 passed`, включая secret non-disclosure;
- no `BASE_URL` и credential pair without flag: config exit `1` до test discovery;
- `BASE_URL` only: admin project `4 skipped`; full triplet: `32` tests discovered;
- full regression с exact local target/full triplet: `32` tests, `30 passed`, `2 intentional skipped`, `0 failed`;
- post-full inventory: published products `10`, temporary E2E products `0`.

Статус закрывает только test-harness target/write safety. Он не разрешает mutating E2E на production и не закрывает RBAC/security acceptance.

### I2-S12 — scoped Woo breadcrumb copy

**Статус:** `DONE / PROVISIONAL`

**Связь:** `PBL-010/011/012/PBL-040 presentation partial`; business semantics, query и SEO не меняются.

Критерии среза:

- `woocommerce_breadcrumb_defaults` меняет только home label на «Главная»;
- shop label меняется только по exact permalink валидной published configured shop page, не совпадающей с front page;
- strict non-paged product search меняет только current crumb с exact Woo request URL на «Поиск товаров: «query»»;
- query передаётся к Woo template без premature escaping; template выполняет `esc_html` один раз;
- missing shop sentinel, pagination, malformed third-party crumbs и mixed/post-only search fail closed; category/product/page labels не меняются;
- breadcrumb URLs/order/delimiter и query не меняются; named filters не используют `gettext`, template override или CSS hiding.

Вне scope: full Woo/admin/account/cart/checkout localization, canonical/robots/sitemap/SEO policy, pagination translation и approved visual design.

Выполнено и проверено:

- installed Woo 11.2.1 hook/template contract сверен; visual breadcrumb и JSON-LD используют один filtered trail, URLs сохранены;
- shop/category/PDP/positive + special-character product search проходят на `1440/390/360`; mixed/post-only product label не получают;
- in-memory controls: Woo shop sentinel `-1` → `null`; paged product-search trail сохраняет `Page 2`;
- targeted catalog/search/PDP: `18 passed`; PHP lint `PASS`; `15` screenshots обновлены, representative desktop/mobile просмотрены;
- full regression: `32` tests, `30 passed`, `2 intentional skipped`, `0 failed`.

Статус закрывает только scoped public breadcrumb copy. JSON-LD names следуют тем же labels намеренно; full localization, SEO/canonical и design approval остаются open.

### I2-S13 — user-owned strict-search isolation

**Статус:** `DONE / TECHNICAL`

**Связь:** regression safety для I2-S5/S6/S8/S10, `PBL-002/011/PBL-040 partial`; business search scope не расширяется.

Критерии среза:

- authenticated temporary unmarked product с уникальным title остаётся на results page при strict `post_type=product`, даже если найден один товар;
- query содержит один exact `post_type=product`, count равен `1`, а единственная card совпадает по post ID, title и permalink;
- search card и PDP не получают demo provenance/CTA/meta; user SKU, stock и descriptions сохраняются;
- Woo single-result redirect отключается named filter только для exact product search; query, index, ranking и другие search scopes не меняются;
- cleanup удаляет только известный ID или exact SKU и подтверждает отсутствие записи.

Вне scope: SKU/article/OEM/brand search, normalization/transliteration, typo correction, ranking, suggestions, filters, production master/RBAC/stock/lifecycle и утверждённый search design.

Выполнено и проверено:

- first targeted run зафиксировал штатный Woo 302 на единственный товар; scoped filter оставляет exact product search на results page;
- targeted serial admin scenario: `1 passed`; PHP lint: `PASS`;
- единственная card имеет exact `post-${productId}`, title/permalink, обычную непустую CTA и не содержит demo provenance;
- переход по search card сохраняет exact user SKU, stock `3`, short/long descriptions и отсутствие demo UI;
- full regression: `32` tests, `30 passed`, `2 intentional skipped`, `0 failed`; post-full inventory `10` published / `0` temporary.

Статус относится только к isolation и стабильной one-result presentation. Он не доказывает поля/полноту/ранжирование поиска и не является business acceptance.

### I2-S14 — curated category identity boundary

**Статус:** `DONE / TECHNICAL`

**Связь:** regression safety для I2-S1, `PBL-011/PBL-040 partial`; taxonomy/master-data scope не расширяется.

Критерии среза:

- shared category card публикует escaped numeric `data-category-id` из `WP_Term::term_id` без visual/data mutation;
- homepage и canonical shop показывают ровно восемь unique positive IDs, одинаковые identities/order/same-origin taxonomy URLs;
- admin Settings selected IDs сравниваются с public DOM как set, поскольку option DOM order не является сохранённым presentation order;
- любой unselected term, включая одноимённые legacy duplicates, не попадает в homepage/shop;
- terms не удаляются, не объединяются, не переименовываются и не перемаркировываются.

Вне scope: production taxonomy master, canonical slug/redirect policy, legacy cleanup/merge, external IDs, hierarchy redesign и approved visual design.

Выполнено и проверено:

- shared `helpers.php` card получила только `data-category-id`; PHP lint: `PASS`;
- public catalog identity journey на `1440/390/360`: `3 passed`; homepage/shop snapshots exact-equal по ID/order/href;
- read-only admin identity scenario: `1 passed`; selected set содержит восемь unique IDs и не пересекается с unselected set;
- WP-CLI evidence текущей БД: selected `[93,90,87,94,91,89,88,92]`, `50` unselected terms имеют имя одной из selected categories;
- full regression: `33` tests, `31 passed`, `2 intentional skipped`, `0 failed`; post-full inventory `10` published / `0` temporary;
- screenshot changes от offscreen lazy-load не относились к срезу и не включены; DOM/visual layout production-кодом не менялся.

Статус закрывает только curated identity boundary. Legacy taxonomy остаётся неизменённой до отдельного master-data решения.

### I2-S15 — category-card accessible name

**Статус:** `DONE / TECHNICAL`

**Связь:** `NFR-UX-002`, `PBL-010/PBL-040 partial`, regression safety для I2-S1/S14; business/taxonomy scope не меняется.

Критерии среза:

- декоративная CSS illustration не имеет `role="img"`/произвольного `aria-label` и скрыта через `aria-hidden="true"`;
- accessible name каждой category link равен только непустому видимому term name;
- правило проверяется для всех восьми cards на homepage и canonical shop на `1440/390/360`;
- DOM identity, href, layout, taxonomy и visual styling не меняются.

Вне scope: полный accessibility audit Woo/admin/account/cart/checkout, approved assistive-technology matrix, taxonomy master и visual redesign.

Выполнено и проверено:

- удалён массив несвязанных art labels; декоративный span исключён из accessibility tree;
- targeted catalog journey: `3 passed` на `1440/390/360`; существующий axe serious/critical gate сохранён;
- PHP lint: `PASS`; full regression: `33` tests, `31 passed`, `2 intentional skipped`, `0 failed`;
- screenshot lazy-load noise не относится к DOM/layout change и не включён в срез.

Статус закрывает только accessible name shared category card. Полная accessibility acceptance остаётся partial.

### I2-S16 — distinguishable category options in Settings

**Статус:** `DONE / TECHNICAL`

**Связь:** admin safety для I2-S14, `PBL-011/PBL-040 partial`; taxonomy/master-data scope не расширяется.

Критерии среза:

- каждая `product_cat` option в project Settings отображает escaped `name (#term_id)`;
- numeric suffix точно совпадает с HTML option `value`, а имя остаётся непустым;
- selected IDs, порядок public presentation и save value не меняются;
- проверка read-only: настройки и taxonomy не сохраняются/не мутируются.

Вне scope: глобальный Woo category editor, external/master IDs, legacy merge/delete/rename, canonical redirects и RBAC matrix.

Выполнено и проверено:

- category renderer приведён к уже используемому product option pattern `Name (#ID)`;
- read-only admin identity scenario: `1 passed`; все options имеют suffix, равный value, selected/public checks сохранены;
- PHP lint: `PASS`; full regression: `33` tests, `31 passed`, `2 intentional skipped`, `0 failed`;
- ID документирован только как локальная identity текущего экземпляра, не переносимый master identifier.

Статус закрывает только различимость одноимённых options в project Settings. Taxonomy cleanup и production master-data остаются open.

### I2-S17 — deterministic visual evidence capture

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-040`, regression evidence для `NFR-UX-001—003` и `TC-039/040`; production presentation и design scope не меняются.

Критерии среза:

- все 6 screenshot points используют один helper на `1440/390/360`;
- smooth scroll временно отключён; fonts, lazy-loaded layout-visible images и decoded pixels готовы до capture;
- image error/decode/timeout завершает тест ошибкой вместо тихого продолжения;
- параллельные Playwright workers не выполняют full-page capture одновременно;
- два одинаковых targeted-прогона дают byte-identical SHA-256 всех 18 PNG.

Вне scope: утверждение Paper/mobile baseline, pixel-perfect redesign, изменение DOM/CSS/PHP и замена provisional visual статуса.

Выполнено и проверено:

- добавлен `tests/e2e/visual.ts`; шесть прежних screenshot blocks заменены общим helper;
- диагностически подтверждено, что без lock менялись `2/18` hashes, тогда как isolated catalog capture был стабилен; добавлена межпроцессная сериализация;
- два последовательных targeted-прогона: `18 passed` каждый, все 18 SHA-256 exact-equal;
- полный regression: `33` tests, `31 passed`, `2 intentional skipped`, `0 failed`; все hashes сохранились;
- representative homepage/catalog/search/PDP desktop/mobile artifacts просмотрены, lazy images загружены; production-код не менялся.

Статус закрывает воспроизводимость actual visual evidence. Утверждение дизайна остаётся заблокировано `DEC-019/020`.

### I2-S18 — curated category input boundary

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-011/PBL-040`, enforcement уже заявленного I2-S1 top-level/max-8 invariant; taxonomy/master-data scope не расширяется.

Критерии среза:

- Settings показывает только `product_cat` с `parent=0` и объясняет лимит 8;
- sanitizer принимает только существующие `WP_Term` той же taxonomy с `parent=0`;
- unique IDs сохраняют порядок первого вхождения, девятый valid root отбрасывается;
- homepage повторно применяет `parent=0` и `number=8`, shop filter остаётся defense-in-depth;
- taxonomy не переименовывается, не объединяется и не очищается.

Вне scope: production taxonomy master, допустимая коммерческая иерархия, legacy cleanup/merge, canonical redirects, external IDs и RBAC matrix.

Выполнено и проверено:

- category Settings query ограничен roots; description изменён на «Можно выбрать до 8 категорий верхнего уровня»;
- sanitizer последовательно проверяет `get_term`, taxonomy/root identity и останавливается после восьмого valid unique ID;
- self-contained admin E2E создаёт exact temporary root + child и отправляет hostile payload `child + duplicate root + 9 roots`;
- targeted boundary `1 passed`; child option отсутствует, root option виден, homepage/shop получают первые 8 roots в точном порядке;
- исходный homepage order exact-restored; child и root удалены в правильном порядке, оба GET = `404`;
- PHP lint: `PASS`; existing Woo CRUD `1 passed`; full regression: `34` tests, `32 passed`, `2 intentional skipped`, `0 failed`; 18 visual hashes unchanged;
- post-full inventory: `10` published products / `0` temporary product SKU / `0` temporary root-or-child category fixtures.

Статус закрывает только fail-closed category selection boundary. Taxonomy master-data и legacy policy остаются open.

### I2-S19 — lossless Settings test transactions

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-040`, safety существующих admin-write E2E; production behavior и business scope не меняются.

Критерии среза:

- каждый mutating Settings test сохраняет точный исходный порядок category, popular и stock selections;
- product selections читаются полностью из selected-first Settings options, а не из ограниченного пятью homepage output;
- неизменяемые multiselects отправляются ordered hidden inputs вместо DOM/title order;
- restore подтверждается и по stored arrays, и по публичному category order / первым пяти product IDs;
- Woo CRUD cleanup выполняется независимо: restore → product → category, exact resources после delete дают `404`.

Вне scope: production Settings redesign, RBAC, taxonomy/product master-data, изменение seed и business acceptance.

Выполнено и проверено:

- общий helper поддерживает ordered category/popular/stock submission;
- S18 hostile category POST сохраняет обе product selections; hero save/restore стабилизирует все multiselects перед обоими submit;
- Woo CRUD снимает полный stored order, не обрезает selection хвост homepage limit и exact-restores все три массива;
- targeted mutating suite: `3 passed`, `0 failed`; независимый review: замечаний нет;
- full regression: `34` tests, `32 passed`, `2 intentional skipped`, `0 failed`;
- post-full inventory: `10` published products / `0` temporary CRUD products / `0` temporary CRUD categories.

Статус закрывает только побочные мутации и cleanup тестового harness. Остальные продуктовые и security gaps остаются открыты.

### I2-S20 — tolerance-aware visual artifact retention

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-040`, regression evidence для `NFR-UX-001—003` и `TC-039/040`; production presentation и design scope не меняются.

Критерии среза:

- layout-visible CSS background URLs декодированы до capture, full-page screenshot снимается в CSS pixels;
- existing PNG сохраняется только при exact bytes, `≤10` RGBA-changed pixels с delta `≤1` либо `≤2` pixels с delta `≤64` строго внутри visible `svg.az-icon`;
- любое превышение, dimension mismatch или decode failure не маскируется;
- Windows cross-worker lock повторяет `EEXIST`/`EPERM` до bounded timeout;
- обычный local Windows suite использует один worker, поскольку shared compositor под параллельной нагрузкой дал material diff за пределами безопасных tolerance bounds;
- comparator имеет граничные positive/negative tests, а полный regression не меняет visual hashes.

Вне scope: утверждение Paper/mobile baseline, pixel-perfect redesign, общий perceptual threshold, маскирование динамических областей и production DOM/CSS/PHP.

Выполнено и проверено:

- capture helper ждёт computed CSS backgrounds, сравнивает decoded RGBA и аннотирует причину retention;
- exact/`10×1`, `11×1`, `1×2`, SVG `2×64`, `3×64`, outside SVG, `2×65` и dimension mismatch покрыты одним desktop comparator test;
- редкий Windows `EPERM` на exclusive-file open диагностирован полным прогоном и закрыт platform-scoped retry;
- два parallel Windows full run выявили material shared-compositor diff (`502 px / delta 32` и `5740 px / delta 3`); comparator правильно не скрыл их, поэтому безопасный threshold не расширялся;
- local Windows config переведён на `workers: 1`; два targeted visual slice: `19 passed` каждый, baseline→run1 и run1→run2 hashes неизменны;
- serial full regression: `35` tests, `33 passed`, `2 intentional skipped`, `0 failed`; hashes неизменны;
- post-full inventory: `10` published products / `0` temporary E2E products / `0` temporary E2E categories; независимый review после cleanup bitmap замечаний не оставил.

Статус закрывает только устойчивость хранения actual screenshots к строго ограниченному renderer noise. Baseline остаётся `PROVISIONAL / DESIGN_REVIEW_REQUIRED` по `DEC-019/020`.

### I2-S21 — project Settings negative capability

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-036`, `TC-037`, `NFR-SEC-005` partial; production capabilities и role model не меняются.

Критерии среза:

- admin REST создаёт unique temporary user только с Woo role `shop_manager`;
- отдельная browser session доказывает meaningful Products access, но не видит project Settings menu;
- direct exact Settings URL отвечает `403`, не редиректит на login и не отдаёт форму;
- denied access не меняет scalar/media form values или exact category/popular/stock order;
- restricted context, exact user и оба Settings snapshots завершаются nested cleanup независимо;
- temporary user force-deleted с reassign admin, exact ID даёт `404`, username lookup пуст.

Вне scope: сопоставление Woo `shop_manager` с бизнес-ролью «Менеджер», denied-attempt audit, MFA, session hardening, rate limits, all-role/API/object ownership matrix и production IAM.

Выполнено и проверено:

- общий login helper поддерживает отдельные credentials; Settings form snapshot исключает nonce/action и включает только `avtozakup_homepage[...]`;
- Products `200`, product body/menu/form и отсутствие project menu подтверждают содержательную ограниченную сессию;
- direct Settings request остаётся на exact URL, получает `403`; единственный допустимый console class — ожидаемый navigation 403;
- full form snapshot и existing stored-order helper exact-equal до/после;
- targeted RBAC: `1 passed`; весь admin suite: `7 passed`; независимые design/security reviews после nested-cleanup fixes — без findings;
- full regression: `36` tests, `34 passed`, `2 intentional skipped`, `0 failed`; все 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает один отрицательный capability check project Settings. Полный `TC-037/PBL-036` остаётся partial до утверждённой матрицы, server audit и остальных security controls.

### I2-S22 — unmarked category-archive isolation

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-011/PBL-040` regression safety; `FR-CAT-001/002` presentation partial; production catalog behavior не меняется.

Критерии среза:

- self-contained unique root category и unmarked published product;
- переход на archive по реальной taxonomy-ссылке с PDP;
- exact H1, единственная exact product card и отсутствие demo provenance;
- штатный add-to-cart без demo-copy;
- exact Settings no-mutation;
- nested cleanup строго product → category с ID `404` и exact SKU/slug lookup `0`.

Вне scope: category ownership/master, hierarchy/legacy merge/delete/redirect policy, production RBAC, real stock/price и lifecycle.

Выполнено и проверено:

- targeted scenario: `1 passed`;
- весь serial admin suite: `7 passed`;
- независимый review: без findings;
- full regression: `36` tests, `34 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только отрицательную presentation-boundary unmarked товара в taxonomy loop; category ownership/master и business acceptance остаются открытыми.

### I2-S23 — unmarked custom homepage card isolation

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-011/PBL-040` regression safety; `FR-CAT-002/FR-OFR-002` presentation partial; production behavior не меняется.

Критерии среза:

- существующий transactional Woo CRUD fixture получает unique SKU и остаётся unmarked;
- exact custom card находится только в maintenance-подборке;
- title/media links, updated title и SKU совпадают с fixture;
- stock-copy, note и add-to-cart используют standard non-demo branch;
- exact product отсутствует в stock-подборке;
- исходный category/popular/stock order exact-restored; cleanup идёт product → category с ID `404`.

Вне scope: collection-level demo disclaimer, REST-response-without-ID cleanup fallback, real stock/price, commercial CTA semantics, offer/master ownership, production RBAC/lifecycle и responsive/a11y acceptance.

Выполнено и проверено:

- targeted scenario: `1 passed`;
- весь serial admin suite: `7 passed`;
- независимый review: без findings;
- full regression: `36` tests, `34 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только отрицательную card-local presentation-boundary custom homepage helper.

### I2-S24 — exact Woo CRUD fixture fallback cleanup

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-040` test mutation isolation; поддерживает `I2-S19/I2-S23`; production behavior не меняется.

Критерии среза:

- unique SKU и category slug известны до REST create;
- normal run всегда выполняет exact SKU/slug lookup и сверяет известный ID;
- cleanup IDs — deduplicated union known ID и exact-filtered lookup IDs;
- Settings restore остаётся первым этапом, fixture cleanup идёт product → category;
- каждый удалённый ID даёт `404`, повторные exact lookup — `0`;
- lookup error не проглатывается: known-ID cleanup выполняется до rethrow.

Вне scope: DB transaction, crash/network-proof rollback, недействительный nonce, отказ REST delete/БД, cleanup всех fixtures, production lifecycle/master/RBAC.

Выполнено и проверено:

- targeted scenario: `1 passed`;
- весь serial admin suite: `7 passed`;
- независимый review: без findings;
- full regression: `36` tests, `34 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только mutation-isolation cleanup конкретного Woo CRUD fixture.

### I2-S25 — marked custom homepage card contract

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-011/PBL-040` regression safety; поддерживает `I2-S3/I2-S23`; `FR-CAT-002/FR-OFR-002` presentation partial; production behavior не меняется.

Критерии среза:

- exact seeded marked product находится в maintenance-подборке на `1440/390/360`;
- custom card показывает public demo brand/article и не публикует synthetic `AZ-DEMO-*`;
- stock/note используют exact marked demo branch;
- title/media ведут на один product permalink;
- CTA связана с numeric product ID карточки;
- existing axe/no-overflow/runtime и visual gates сохраняются.

Вне scope: verified OEM/article, real stock/price, commercial CTA semantics, ownership/master, permalink policy, production lifecycle/RBAC и новая design acceptance.

Выполнено и проверено:

- targeted public viewport scenario: `3 passed`;
- весь homepage suite: `7 passed`, `2 intentional skipped`;
- независимый review: без findings;
- full regression: `36` tests, `34 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только marked custom-card presentation baseline текущего seeded fixture.

### I2-S26 — exact AJAX cart item identity

**Статус:** `DONE / TECHNICAL`

**Связь:** `FR-CART-001` technical/demo partial; `PBL-003/PBL-040` regression safety; production behavior не меняется.

Критерии среза:

- source custom card numeric ID, exact title/permalink фиксируются до click;
- CTA ID exact-equal card ID;
- AJAX response успешен, payload без error, CTA получает added state, badge становится `1`;
- единственная cart row имеет exact source title, а classic/Blocks title-link — exact source permalink;
- existing demo checkout notices, guards и runtime checks сохраняются.

Вне scope: quantity/price/tax, stock reservation, persistence/concurrency, auth/guest policy, checkout/order/payment и cross-install classic/Blocks acceptance.

Выполнено и проверено:

- targeted public viewport scenario: `3 passed`;
- весь homepage suite: `7 passed`, `2 intentional skipped`;
- независимый review: без findings;
- full regression: `36` tests, `34 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только exact identity текущего локального AJAX-added demo item.

### I2-S27 — exact root/child category fixture cleanup

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-040` test mutation isolation; поддерживает `I2-S18`; production behavior не меняется.

Критерии среза:

- unique root/child slugs известны до REST create и exact-equal response;
- normal run всегда выполняет exact slug lookup и сверяет известный ID;
- cleanup IDs — strict-filtered deduplicated union known/found IDs;
- Settings restore остаётся первым, cleanup идёт child → root;
- каждый удалённый ID даёт `404`, repeated exact lookup — `0`;
- lookup error пробрасывается после попытки available known-ID cleanup, root cleanup остаётся во внешнем `finally`.

Вне scope: hard kill, старые fixtures других marker, отказ delete/БД/сети, concurrent run, error aggregation, DB transaction/rollback и production lifecycle/master/RBAC.

Выполнено и проверено:

- targeted scenario: `1 passed`;
- весь serial admin suite: `7 passed`;
- независимый review: без findings;
- full regression: `36` tests, `34 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только mutation-isolation cleanup конкретного root/child category fixture при выполнении `finally`.

### I2-S28 — exact unmarked Woo fixture fallback cleanup

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-040` test mutation isolation; поддерживает `I2-S8/S13/S22/S23`; production behavior не меняется.

Критерии среза:

- unique SKU/category slug известны до REST create и exact-equal response;
- normal run всегда выполняет exact SKU/slug lookup и сверяет известный ID;
- found IDs попадают в strict-filtered deduplicated union до validation;
- cleanup идёт product → category, затем проверяется Settings no-mutation snapshot;
- каждый удалённый ID даёт `404`, repeated exact lookup — `0`;
- lookup/validation error пробрасывается после попытки available union cleanup, category cleanup остаётся во внешнем `finally`.

Вне scope: hard kill, старые fixtures других marker, отказ delete/БД/сети, concurrent run, error aggregation, DB transaction/rollback и production lifecycle/master/RBAC.

Выполнено и проверено:

- targeted scenario: `1 passed`;
- весь serial admin suite: `7 passed`;
- независимый review: без findings;
- full regression: `36` tests, `34 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только mutation-isolation cleanup конкретного unmarked product/category fixture при выполнении `finally`.

### I2-S29 — exact demo checkout guard contract

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-003/PBL-040` regression safety; `FR-CART-001` technical/demo partial; production behavior не меняется.

Критерии среза:

- cart и checkout содержат ровно один notice с единым exact safety message;
- active Blocks notice имеет `role="status"`;
- active classic checkout button имеет exact label, native disabled и `aria-disabled="true"`;
- Store API POST возвращает exact HTTP/code/message/data-status contract;
- existing AJAX product identity, badge, canonical routes и runtime gates сохраняются.

Вне scope: quantity/price/tax, update/remove cart, stock reservation, persistence/concurrency, auth/guest policy, production checkout/order/payment и cross-install classic/Blocks acceptance.

Выполнено и проверено:

- guard scenarios: `4 passed`, `2 intentional skipped`;
- весь homepage suite: `7 passed`, `2 intentional skipped`;
- независимый review: без findings;
- full regression: `36` tests, `34 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только exact demo checkout guard contract текущего локального renderer.

### I2-S30 — guest My Account entrypoint baseline

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-009/PBL-040`; `FR-AUTH-002/TC-037/038` technical partial; production behavior не меняется.

Критерии среза:

- header account entry имеет canonical same-origin `/my-account/` без query/fragment;
- desktop entry видима с «Войти», mobile `390/360` сохраняет тот же DOM/href в hidden state;
- direct guest route успешен и содержит одну штатную Woo login form с username/password/submit;
- no-overflow, axe serious/critical и runtime gates проходят на трёх viewport.

Вне scope: successful login/logout, registration/password reset, cookies/sessions/CSRF, IDOR, roles, orders/customer data, CRM/privacy и production IAM.

Выполнено и проверено:

- targeted public viewport scenario: `3 passed`;
- независимый review: без findings;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только guest My Account entrypoint/form baseline текущего локального renderer.

### I2-S31 — exact temporary shop manager cleanup

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-040` test identity isolation; поддерживает `I2-S21`; production behavior не меняется.

Критерии среза:

- unique username известен до REST create и exact-equal response;
- normal run всегда выполняет exact username lookup;
- strict filter требует exact username, positive ID и исключает admin ID;
- found IDs попадают в deduplicated union до known-ID validation;
- каждый cleanup ID повторно проверяется как non-admin; delete даёт `deleted=true`, GET `404`, repeated exact lookup `0`;
- lookup/validation error пробрасывается после available cleanup, Settings/selection snapshots остаются во внешнем `finally`.

Вне scope: hard kill, старые usernames других marker, отказ delete/БД/сети/Settings, concurrent run, error aggregation, DB transaction/rollback и production IAM.

Выполнено и проверено:

- targeted scenario: `1 passed`;
- весь serial admin suite: `7 passed`;
- независимый review: без findings;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только identity-isolation cleanup конкретного temporary `shop_manager` при выполнении `finally`.

### I2-S32 — exact hero content restore

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-040` test mutation isolation; поддерживает admin save/restore; production behavior не меняется.

Критерии среза:

- до mutation снимаются exact значение `hero_title` и непустой normalized массив public `.az-heading-line`;
- marker сохраняется в Settings и exact-рендерится в public hero;
- `finally` восстанавливает original value и проверяет exact admin field после reload;
- successful path сравнивает exact normalized public text/order с исходным snapshot;
- существующие exact category/popular/stock restore assertions сохраняются.

Вне scope: raw HTML/classes/edge whitespace, public verification после внутренней ошибки или hard kill, failed save/БД/сеть, concurrent writes, content versioning/audit и production CMS acceptance.

Выполнено и проверено:

- targeted hero scenario: `1 passed`;
- весь serial admin suite: `7 passed`;
- независимый review: без findings;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только exact restore одного presentation field в успешном test transaction.

### I2-S33 — guest login form wiring

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-009/PBL-040`; `FR-AUTH-002/TC-037/038` technical partial; production behavior и auth state не меняются.

Критерии среза:

- effective form action same-origin exact `/my-account/`, без query/hash; method POST;
- username/password names, types, autocomplete, required и aria-required exact;
- ровно один hidden non-empty Woo login nonce и exact `/my-account/` referer;
- login button submit; lost-password URL same-origin exact `/my-account/lost-password/` без query/hash;
- существующие axe, no-overflow и runtime gates проходят на `1440/390/360`.

Вне scope: server-side nonce/CSRF enforcement, valid/invalid login, reset behavior, cookies/session, brute-force/rate limit, MFA, IDOR, roles/customer data/privacy и production IAM.

Выполнено и проверено:

- targeted public viewport scenario: `3 passed`;
- независимый review: без findings;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только DOM/wiring гостевой login form текущего pinned Woo renderer.

### I2-S34 — product-search form wiring

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-002/006/012/PBL-040` search safety partial; production behavior не меняется.

Критерии среза:

- одна header search form имеет exact GET и effective same-origin root action без query/hash;
- accessible searchbox имеет exact `type=search`, `name=s` и placeholder;
- один hidden scope control имеет exact `type=hidden`, `name=post_type`, value `product`;
- один submit button «Найти» имеет exact `type=submit`;
- существующий special-character submit сохраняет exact query и product scope на `1440/390/360`.

Вне scope: index/fields/ranking/normalization, OEM/article/brand semantics, server completeness, SEO/canonical policy и production business search acceptance.

Выполнено и проверено:

- targeted empty-search scenario: `3 passed`;
- независимый review: без findings;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только DOM/transport wiring текущей header search form.

### I2-S35 — cart/checkout link wiring

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-003/PBL-040`; `FR-CART-001` technical/demo partial; production behavior не меняется.

Критерии среза:

- единственная header cart link имеет same-origin exact `/cart/` без query/hash;
- единственная active classic/Blocks checkout link имеет same-origin exact `/checkout/` без query/hash;
- существующие post-click pathname assertions сохраняют доказательство фактической навигации;
- existing AJAX source-card/cart-row identity, badge и exact demo guard сохраняются на `1440/390/360`.

Вне scope: redirect/SEO policy, cross-install Woo compatibility, cart persistence, quantity/price/tax/stock/reservation, auth, production checkout/order/payment.

Выполнено и проверено:

- targeted AJAX/cart scenario: `3 passed`;
- независимый review: без findings;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только exact link wiring текущего pinned cart/checkout renderer.

## Следующие итерации

| Итерация-кандидат | Scope по исходному backlog | Gate |
|---|---|---|
| 2 — `IN_PROGRESS` | catalog/search/PDP: PBL-002, 006, 011—017; I2-S1 завершён | DEC-002—006, DG-001/018, INT-CAT/ERP/SUP contracts |
| 3 | cart/checkout/order: PBL-003—005, 018—023 | DEC-008—014, DG-004—008, PSP/DLV/WMS sandbox |
| 4 | procurement/receiving/pickup: PBL-024—027/033 | operational ownership, ERP/WMS/SUP contracts, DG-013—016 |
| 5 | account/VIN/B2B/returns: PBL-028—032/041 | DEC-015—018, CRM/IDP/legal, DG-002/003/009—011 |
| Сквозная | PBL-034—040 | approved NFR, privacy/security, observability, test gates |

