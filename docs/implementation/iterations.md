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
- Git remote и target теперь известны; server inventory/access и remote deployment отсутствуют, поэтому сервер `NOT_DEPLOYED`.

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

### I2-S36 — marked PDP add-to-cart form identity

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-003/011/PBL-040`; `FR-CART-001/FR-CAT-002` technical/demo partial; production behavior и cart state не меняются.

Критерии среза:

- marked loop action даёт один positive numeric product ID;
- единственная PDP `form.cart` имеет exact POST и effective same-origin current-product action без query/hash;
- единственный named submit имеет exact type и value, совпадающий с loop product ID;
- submit label exact `Добавить в демо-корзину` на `1440/390/360`;
- existing provenance/SKU/availability/description/a11y/runtime/visual gates сохраняются.

Вне scope: cart state, quantity/price/stock/reservation, variable/external products, cross-install Woo compatibility и production commerce.

Выполнено и проверено:

- targeted marked PDP scenario: `3 passed`;
- независимый review: без findings;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только exact add-to-cart form wiring текущего pinned simple-product renderer.

### I2-S37 — exact temporary category archive URL

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-011/PBL-040`; поддерживает `I2-S22`; `FR-CAT-001/002` technical partial; production behavior не меняется.

Критерии среза:

- exact-name PDP taxonomy link единственна и имеет непустой href;
- pre-navigation URL same-origin exact `/product-category/{fixture-slug}/` без query/hash;
- фактический loaded origin/path exact-equal href, query/hash остаются пустыми;
- existing archive H1/card identity, demo-boundary, Settings isolation и product→category cleanup сохраняются.

Вне scope: taxonomy master/legacy redirects, SEO/canonical policy, arbitrary Unicode slugs, cross-install Woo acceptance и production lifecycle.

Выполнено и проверено:

- targeted admin scenario: `1 passed`;
- весь serial admin suite: `7 passed`;
- независимый review: без findings;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только exact URL contract self-contained temporary category fixture.

### I2-S38 — unmarked PDP add-to-cart form identity

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-003/011/PBL-040`; поддерживает `I2-S8/S22`; `FR-CART-001/FR-CAT-002` technical partial; production behavior и cart state не меняются.

Критерии среза:

- temporary REST product ID exact-equal loop anchor `data-product_id`;
- единственная PDP form имеет exact POST и same-origin current-product action без query/hash;
- единственный named submit имеет exact type/value, совпадающий с REST product ID;
- loop/PDP actions visible, non-empty и не содержат demo-copy;
- existing shop/search/PDP/archive/card isolation, Settings snapshot и product→category cleanup сохраняются.

Вне scope: cart state, localization contract, quantity/price/stock/reservation, variable/external products, cross-install Woo compatibility и production commerce.

Выполнено и проверено:

- targeted admin scenario: `1 passed`;
- весь serial admin suite: `7 passed`;
- независимый review: без findings;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только exact add-to-cart form identity одного temporary unmarked simple product.

### I2-S39 — exact AJAX add-to-cart request

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-003/PBL-040`; `FR-CART-001` technical/demo partial; production behavior не меняется.

Критерии среза:

- source card ID exact-equal CTA product ID, CTA quantity exact `1`;
- browser отправляет POST на same-origin root с единственным `wc-ajax=add_to_cart` и пустым hash;
- URL-encoded payload содержит ровно один exact source product ID и quantity `1`;
- existing successful response, added state, badge, exact cart-row identity, canonical links и demo guards сохраняются.

Вне scope: response fragment schema, update/remove/duplicate/concurrency, price/tax/stock/reservation, persistence, variable products и production cart correctness.

Выполнено и проверено:

- targeted AJAX/cart scenario: `3 passed`;
- независимый review: без findings;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только exact request transport одного simple demo item текущего pinned Woo AJAX renderer.

### I2-S40 — exact header catalog-link navigation

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-011/PBL-040`; `FR-CAT-001` technical partial; production behavior не меняется.

Критерии среза:

- header catalog control — ровно один visible anchor с exact accessible name `Каталог товаров`;
- pre-click href same-origin exact `/shop/` без query/hash;
- фактический click загружает exact-equal origin/path без query/hash;
- existing H1/breadcrumb/categories/products/a11y/no-overflow/runtime/visual gates сохраняются.

Вне scope: Woo page-option repair, redirect/canonical/SEO policy, arbitrary permalink/proxy behavior, cross-install compatibility и production catalog acceptance.

Выполнено и проверено:

- targeted catalog scenario: `3 passed`;
- независимый review: без findings;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только exact configured header catalog-link wiring текущего pinned local renderer.

### I2-S41 — guest remember-me control wiring

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-009/PBL-040`; `FR-AUTH-002/TC-037/038` technical partial; auth mutation отсутствует.

Критерии среза:

- одна visible remember-me label содержит exact direct-child checkbox и adjacent visible non-empty text span;
- checkbox имеет exact name/type/value и non-empty accessible name;
- initial unchecked; два клика по text span дают checked и возврат unchecked;
- test не вводит credentials и не активирует submit; проверяется только checkbox client-state round-trip.

Вне scope: POST payload/server handling, cookie/session lifetime, persistence, login/logout/reset, CSRF enforcement, privacy/consent, localization, other browsers/Woo versions и production IAM.

Выполнено и проверено:

- targeted account scenario: `3 passed`;
- независимый review: без findings;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только pinned guest remember-me DOM/default state/client label-toggle wiring.

### I2-S42 — responsive primary-navigation toggle

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-010/PBL-040`; `NFR-UX-001/002` technical partial; navigation content не меняется.

Критерии среза:

- единственные button/panel exact-linked через `aria-controls`, ID и data markers;
- initial collapsed state: `aria-expanded=false`, panel без `is-open`;
- desktop: toggle hidden, panel visible; hidden control DOM text проверяется без ложного accessible-tree claim;
- mobile 390/360: visible control exact named, open click синхронизирует expanded/class/visibility, second click exact-restores closed state.

Вне scope: menu link destinations, keyboard/focus/Escape/outside-click, dynamic button name, resize/orientation, persistence, other browsers и production navigation acceptance.

Выполнено и проверено:

- targeted homepage scenario: `3 passed` после viewport-aware уточнения (исходный all-viewport accessible-name assertion честно дал `2 passed / 1 failed` на hidden desktop control);
- независимый review: без findings;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current-renderer responsive toggle→panel DOM/state contract.

### I2-S43 — header city status-dialog keyboard contract

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-021/026/PBL-040`; `FR-DLV-001/NFR-UX-002` technical safety partial; real delivery behavior отсутствует.

Критерии среза:

- единственный visible city button имеет exact type/delivery key/dialog semantics/name;
- labelled native status dialog initial hidden и без `open`;
- keyboard Enter с focused trigger открывает dialog, close auto-focused;
- exact DEC-001/014 blocked copy; close Enter закрывает и возвращает focus trigger.

Вне scope: real city selection/persistence, geolocation, delivery methods/cost, other status keys/dialogs, Escape/backdrop, screen-reader/browser matrix и production delivery.

Выполнено и проверено:

- targeted homepage scenario: `3 passed`;
- независимый review: без findings;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current theme-owned blocked-state native-dialog keyboard/focus contract в Chrome.

### I2-S44 — guest password-visibility toggle wiring

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-009/PBL-040`; `FR-AUTH-002/NFR-SEC-005` technical partial; auth mutation отсутствует.

Критерии среза:

- один visible Woo-injected button — exact sibling password input и type button;
- initial non-empty aria-label exact-equal accessible name, без locale claim;
- first explicit click даёт type text и другое non-empty state label/name;
- second explicit click exact-restores type password и исходный label/name.

Вне scope: exact localization, credential value, keyboard/focus, submit/POST/auth/session, OS capture, clipboard/autofill/password managers, AT/browser matrix, cross-version и production security.

Выполнено и проверено:

- targeted account scenario: `3 passed`;
- независимый review: без findings;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current Woo-injected password type/accessibility-label client round-trip в Chrome.

### I2-S45 — contact-dialog keyboard/focus contract

**Статус:** `DONE / TECHNICAL`

**Связь:** `SCR-001/UI-SCR001-003/004/006` renderer partial, `PBL-040`; `NFR-A11Y-002` technical partial; contact workflow отсутствует.

Критерии среза:

- все rendered theme-owned contact buttons имеют dialog semantics, основной visible header opener — exact type/name/markers;
- один labelled native contact dialog initial closed; focused opener + Enter открывает его, close auto-focused;
- current phone/email anchors видимы и relationally преобразуются в escaped `tel:`/`mailto:` href без hardcoded admin values и без активации внешнего приложения;
- Enter на close закрывает dialog и возвращает focus фактическому opener; mobile nav exact-restored collapsed.

Вне scope: подтверждение phone/email, доступность каналов, часы/праздники, Telegram/MAX, callback/form, external-app behavior, CRM/SLA, AT/browser matrix и production contact acceptance.

Выполнено и проверено:

- targeted homepage scenario: `3 passed` на `1440/390/360`;
- PHP lint двух изменённых templates и JavaScript syntax: `PASS`; config/deployment preflight: `10 passed`;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current theme-owned SCR-001 native-dialog renderer и keyboard/focus round-trip в Chrome.

### I2-S46 — mobile primary-nav Escape/focus contract

**Статус:** `DONE / TECHNICAL`

**Связь:** `PBL-010/PBL-040`; `NFR-UX-001/002` и `NFR-A11Y-002` technical partial; navigation content не меняется.

Критерии среза:

- shared state helper сохраняет существующий click `aria-expanded`/`is-open` contract;
- на 390/360 focused toggle + Enter открывает menu с focus на toggle; Escape exact-restores collapsed state и toggle focus;
- второй Enter открывает, Tab переводит focus на exact first link `Выбрать автомобиль`, Escape из descendant закрывает и возвращает focus toggle;
- Escape в closed state остаётся no-op; desktop hidden-toggle/visible-panel boundary сохраняется.

Вне scope: outside-click, dynamic open/close label, focus trap/roving tabindex, link activation/destinations, scroll lock, resize/orientation/breakpoint transitions, Space/AT/browser matrix, approved mobile design и production navigation acceptance.

Выполнено и проверено:

- JavaScript syntax: `PASS`; targeted homepage scenario: `3 passed` на `1440/390/360`;
- независимый review: без findings;
- full regression: `39` tests, `37 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current provisional mobile Chrome renderer Escape/focus contract.

### I2-S47 — homepage blocked status-dialog router/focus contract

**Статус:** `DONE / TECHNICAL`

**Связь:** `UI-SCR002-011/016/017`; `FR-SRCH-004/FR-VIN-001/002/FR-B2B-001` safety partial; `PBL-007/013/029/031/032/PBL-040`; `NFR-A11Y-002` technical partial. DEC-004/016/017/018 остаются open.

Критерии среза:

- все rendered status buttons имеют type/button dialog semantics; exact Vehicle/VIN/B2B triggers visible и named;
- focused trigger + Enter открывает один labelled native status dialog с exact existing DEC-blocked copy для каждого route;
- close auto-focused; Enter exact-closes/removes `open`, returns focus actual opener и не меняет URL;
- message router uses own-property allowlist; `unknown`, `constructor`, `toString`, `__proto__` не открывают dialog и не меняют retained copy/URL.

Вне scope: Vehicle/fitment source and compatibility, VIN validation/submit/contacts/consent/CRM/SLA, B2B application/onboarding/verification/privileges/prices, persistence, AT/browser matrix и production domain acceptance.

Выполнено и проверено:

- PHP lint двух templates и JavaScript syntax: `PASS`;
- targeted blocked-actions scenario: `3 passed` на `1440/390/360` после исправления test-only stale locator; hostile inherited-key review finding затем закрыт own-property allowlist;
- full regression: `42` tests, `40 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current theme/Chrome fail-closed blocked-status renderer и keyboard/focus round-trip.

### I2-S48 — mobile primary-nav dynamic accessible name

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation `I2-S42/I2-S46`; `SCR-002` header, `DG-017/018`, `PBL-010/PBL-040`; `NFR-A11Y-002/TC-040` technical partial. Нового FR/UI business scope нет.

Критерии среза:

- theme server-rendered button содержит localized escaped open/close data labels и один marked hidden-text name source; initial no-JS name — `Открыть меню`;
- desktop hidden toggle проверяется только на DOM text; mobile initial computed name exact `Открыть меню`;
- pointer open/close синхронно даёт `Закрыть меню`→`Открыть меню` вместе с existing aria/class state;
- Enter open и Escape с toggle/first panel link дают тот же name round-trip; closed Escape no-op; contact-nav path также exact-restores open label.

Вне scope: actual screen-reader announcement, live region, AT/browser matrix, visible text/icon change, focus trap/outside-click, link destinations, resize/orientation, approved mobile design, full WCAG/TC-040 и production navigation acceptance.

Выполнено и проверено:

- PHP lint и JavaScript syntax: `PASS`; targeted homepage scenario: `3 passed` на `1440/390/360`;
- аналитический read-only review: без findings;
- full regression: `42` tests, `40 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current provisional mobile Chrome computed accessible-name round-trip.

### I2-S49 — native dialog Escape/outside-pointer dismissal

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation `I2-S43/I2-S45/I2-S47`; `SCR-001/UI-SCR001-006`, `UI-SCR002-001/FR-DLV-001` safety partial, `PBL-021/026/PBL-040`, `NFR-A11Y-002` technical partial. Contact/delivery workflows не расширяются.

Критерии среза:

- exact contact opener reopens dialog; native Escape closes/removes `open` and returns opener focus;
- child contact title click stays open; real mouse click at a dynamically selected viewport corner outside `getBoundingClientRect()` closes/restores focus;
- mobile contact dismissal leaves nav expanded/name Close until explicit exact restore;
- exact city opener repeats the same Escape plus child-content/outside-rect pointer paths on shared status dialog.

Вне scope: bare-dialog padding/border targets, touch-specific gesture, outside-click mobile nav, all other openers/keys, cancel interception, nested/dirty dialogs, scroll lock/animation/resize/back navigation, AT/browser matrix и real contact/delivery acceptance.

Выполнено и проверено:

- production code unchanged: native Escape and existing target-exact pointer handler already satisfied the tested outside-rect/child-content paths;
- targeted homepage scenario: `3 passed` на `1440/390/360` после dynamic outside-rect helper;
- read-only audit: duplicate custom Escape listener не нужен;
- full regression: `42` tests, `40 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current two theme-owned native-dialog Escape/outside-rectangle primary-pointer paths в pinned Chrome.

### I2-S50 — guest password-toggle keyboard/focus contract

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation `I2-S44`; `PBL-009/PBL-040`, `FR-AUTH-002` renderer-only technical partial и `NFR-A11Y-002` technical partial. `DG-002` и весь auth/security business scope остаются open.

Критерии среза:

- focused empty password input передаёт focus exact sibling native visibility button ровно одним Tab;
- Enter меняет password→text и reveal→conceal accessible name; Woo переводит focus обратно в password input;
- повторный Tab и Space меняют text→password, возвращают исходное имя и снова переводят focus в input;
- input остаётся пустым, submit не активируется, pathname остаётся exact `/my-account/`.

Вне scope: credentials/value, submit/POST, successful/failed login, logout/reset, session/cookies, server-side CSRF, localization, visible-focus manual review, OS capture, autofill/password managers, screen-reader/AT/browser matrix, other Woo/browser versions и production IAM/security acceptance.

Выполнено и проверено:

- production code unchanged: native button и текущий Woo focus handoff уже удовлетворяют контракту, duplicate keydown handler не нужен;
- targeted account scenario: `3 passed` на `1440/390/360`;
- independent read-only review: findings отсутствуют, границы claims подтверждены;
- full regression: `42` tests, `40 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current pinned Woo/Chrome password-toggle keyboard/type/name/focus-handoff renderer contract.

### I2-S51 — guest remember-me keyboard/focus contract

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation `I2-S41`; `PBL-009/PBL-040`, `FR-AUTH-002` renderer/control partial и `NFR-A11Y-002` technical partial; direct Paper control mapping отсутствует. `DG-018` остаётся open; checkout `TC-040`, `TC-037/038` и `NFR-SEC-*` этим срезом не принимаются.

Критерии среза:

- от focused password input первый Tab достигает exact visibility button, второй — exact remember-me checkbox;
- keyboard-focused checkbox имеет computed non-none box-shadow либо non-none positive-width outline;
- native Space даёт unchecked→checked→unchecked, сохраняя checkbox focus и exact visible-label-derived accessible name;
- username/password остаются пустыми, pathname — exact `/my-account/`; existing pointer-label round-trip сохраняется.

Вне scope: focus contrast/actual rendered visibility, full form tab order, Enter, credential entry, submit/POST, remember cookie/session persistence, login/auth/server handling, localization, screen-reader/AT/browser matrix, other Woo/browser versions, full WCAG и production IAM/security acceptance.

Выполнено и проверено:

- production code unchanged: native checkbox, browser Space semantics и existing theme focus style уже удовлетворяют узкому контракту;
- targeted account scenario: `3 passed` на `1440/390/360`;
- independent review: code findings отсутствуют; traceability finding закрыт исключением checkout `TC-040` из claims;
- full regression: `42` tests, `40 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current pinned Woo/Chrome remember-me native keyboard/focus/name/computed-style renderer contract.

### I2-S52 — mobile primary-nav native Space activation

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation `I2-S42/I2-S46/I2-S48`; `SCR-002` header, `PBL-010/PBL-040`, `NFR-A11Y-002` technical partial. `DG-017/018` остаются open; checkout `TC-040` и production navigation acceptance не затрагиваются.

Критерии среза:

- на provisional `390/360` exact visible toggle начинает Space path collapsed, named `Открыть меню` и focused;
- первый native Space synchronously даёт expanded true, `is-open`, visible panel, hidden/computed name `Закрыть меню` и сохраняет toggle focus;
- второй Space exact-restores collapsed/no-class/hidden/name `Открыть меню` и сохраняет focus;
- exact pathname и vertical `window.scrollY` до path не меняются после обеих активаций;
- desktop сохраняет только existing hidden-toggle/visible-panel initial presentation boundary.

Вне scope: link activation/destinations/content, full tab order, outside-click, focus trap, horizontal/full scroll and scroll-lock, resize/orientation, touch/real device, screen-reader announcement, AT/browser matrix, approved mobile design, full WCAG и production navigation acceptance.

Выполнено и проверено:

- production code unchanged: native button Space и existing shared state helper уже удовлетворяют узкому контракту, duplicate key handler не нужен;
- targeted homepage scenario: `3 passed` на `1440/390/360`;
- independent review: blocking findings отсутствуют; pathname/vertical-scroll claim boundary применена;
- full regression: `42` tests, `40 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current provisional mobile Chrome native-Space menu renderer contract; desktop — presentation boundary only.

### I2-S53 — guest login-form local Tab order

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation `I2-S30/I2-S33/I2-S50/I2-S51`; `PBL-009/PBL-040`, `FR-AUTH-002` renderer-only technical partial и `NFR-A11Y-002` technical partial; direct Paper control mapping отсутствует. `DG-002/018` остаются open; `TC-040`, `TC-037/038` и `FR-AUTH-003` этим срезом не принимаются.

Критерии среза:

- current form имеет ровно по одному visible и non-empty named username, password, visibility toggle, remember checkbox, login submit и lost-password anchor;
- от focused username пять Tab дают exact последовательность остальных пяти controls;
- от lost-password anchor пять Shift+Tab дают exact reverse sequence назад к username;
- после programmatic focus username только traversal-сегмент S53 отправляет Tab/Shift+Tab; после forward и reverse legs exact URL, пустые credentials, `type=password` и unchecked remember state остаются неизменны; activation submit/link не проверяется.

Вне scope: entry from header/before username, after-link behavior, wrap/cycle/focus trap, full-page tab order, focus style/contrast каждого control, Enter/Space activation, credentials, submit/POST, login/session/cookies/server handling, recovery behavior, localization, screen-reader/AT/browser matrix, other Woo versions, full WCAG и production IAM/security acceptance.

Выполнено и проверено:

- production code unchanged: current native Woo DOM order уже удовлетворяет узкому локальному контракту, tabindex/focus manager не добавлялись;
- targeted account scenario: `3 passed` на `1440/390/360`;
- independent review: код/mapping подтверждены; overclaim finding закрыт отдельной проверкой state после каждого directional leg и исключением activation claim;
- full regression: `42` tests, `40 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current pinned Woo/Chrome six-stop local login-form focus-order renderer contract.

### I2-S54 — skip-link target focus transfer

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation existing skip-link baseline; `PBL-040`, `NFR-A11Y-002` technical partial; direct domain FR/Paper control mapping отсутствует. `DG-018` остаётся open; checkout `TC-040`, PBL-010 completion и full WCAG не заявляются.

Критерии среза:

- `front-page.php`, `page.php`, `woocommerce.php`, `index.php` render exact `main#primary[tabindex=-1]`, не добавляя target в sequential Tab order;
- на `/`, `/delivery/`, `/shop/` first desktop Tab focuses visible exact skip link `href=#primary`;
- keyboard-focused link имеет computed non-none box-shadow либо non-none positive-width outline;
- Enter добавляет `#primary`, exact visible target становится focused activeElement;
- runtime generic `index.php` не заявляется: для него в срезе только source и PHP-lint evidence.

Вне scope: mobile behavior, every route/template combination, focus contrast/manual appearance, screen-reader announcement, AT/browser matrix, full-page tab order, routing/SEO/content, full WCAG и business/production acceptance.

Выполнено и проверено:

- pre-fix diagnostic: fragment/visibility passed, `main#primary` focus assertion failed;
- production fix: four theme templates получили одинаковый `tabindex=-1`; PHP lint `4 passed`;
- post-fix targeted three-route desktop scenario: `1 passed`;
- independent review: implementation/mapping accepted, generic-index runtime claim explicitly excluded;
- full regression: `42` tests, `40 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current pinned desktop Chrome skip-link focus transfer for representative front/page/Woo renderer families.

### I2-S55 — compact-header account/cart accessible names

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation `I2-S30/I2-S35`; `UI-SCR002-006/007`, `PBL-009/PBL-019/PBL-010/PBL-040`, `FR-AUTH-002/FR-CART-001` entrypoint renderer partial и `NFR-A11Y-002` technical partial. `DG-017/018` остаются open; checkout `TC-040` и auth/cart business acceptance не заявляются.

Критерии среза:

- на exact `900×900` visible account/cart anchors имеют по одному CSS-hidden localized span с unique exact IDs;
- account exact `aria-labelledby` вычисляет name `Войти`;
- cart exact relation к label + visible count badge вычисляет `Корзина {current numeric badge text}` без static label;
- href сохраняют same-origin exact `/my-account/` и `/cart/` без query/hash;
- header-scoped axe serious/critical violations отсутствуют.

Вне scope: authenticated header states, link activation, login/cart mutation, post-AJAX accessible-name refresh/live announcement, pluralization, focus order/style, account-link design at `≤600px`, localization matrix, screen-reader/AT/browser matrix, full responsive/WCAG и production IAM/commerce acceptance.

Выполнено и проверено:

- pre-fix diagnostic: compact account link exact-name assertion получил empty name;
- production fix: `header.php` использует exact `aria-labelledby` existing nodes; PHP lint `PASS`;
- targeted compact-header scenario: `1 passed`; independent review подтвердил ARIA semantics, exact relation assertions добавлены;
- full regression: `43` tests, `41 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current pinned guest Chrome compact-header accessible-name renderer contract at exact `900px`.

### I2-S56 — mobile-nav breakpoint state reconciliation

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation `I2-S42/I2-S46/I2-S48/I2-S52`; `SCR-002` header, `PBL-010/PBL-040`, `NFR-A11Y-002` re-entry truthfulness technical partial. `DG-017/018` остаются open; checkout `TC-040` и production navigation acceptance не заявляются.

Критерии среза:

- на `390/360` exact click создаёт open mobile state: true/`is-open`/visible/name `Закрыть меню`;
- crossing current CSS boundary к exact `901px` скрывает toggle и показывает panel по desktop CSS, но DOM state нормализуется false/no-class/hidden-label `Открыть меню`;
- crossing обратно к exact original viewport даёт visible collapsed toggle с computed name `Открыть меню` и hidden panel;
- exact page URL не меняется; existing shared state helper остаётся единственным writer.

Вне scope: desktop hidden-toggle accessible-name/visible-panel aria truthfulness, focus/scroll preservation, arbitrary repeated or same-side resize, real orientation/device, initial/bfcache/SPA reconciliation, link activation/content, screen-reader/AT/browser matrix, approved responsive design, full WCAG и production navigation acceptance.

Выполнено и проверено:

- pre-fix diagnostic: both mobile projects retained `aria-expanded=true` at `901px` and failed;
- production fix: one document-lifetime MQL change listener delegates to idempotent `setNavOpen(false)` on both boundary directions; JavaScript syntax `PASS`;
- targeted homepage scenario: `3 passed`; independent review found no code issues and confirmed hidden-control claim boundary;
- full regression: `43` tests, `41 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current pinned Chrome exact-breakpoint DOM reconciliation and mobile re-entry renderer contract.

### I2-S57 — post-AJAX cart accessible-name refresh

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation `I2-S26/I2-S39/I2-S55`; `UI-SCR002-007`, `PBL-019/PBL-040`, `FR-CART-001` renderer-only technical/demo partial и `NFR-A11Y-002` technical partial. Production/cart business behavior не меняется; `DG-018` остаётся open; `TC-009/TC-040` не заявляются.

Критерии среза:

- existing real Woo AJAX add и прежние request/response/identity guards сохраняются;
- successful response даёт visible header badge exact `1`;
- existing S55 label+badge relation вычисляет exact cart name `Корзина 1`;
- результат одинаков на `1440/390/360`.

Вне scope: live announcement, real screen reader/AT, `aria-live` policy, pluralization, semantic meaning of the numeric badge, multi-item/update/remove, quantity/business correctness, persistence/concurrency, browser matrix, full WCAG и production commerce.

Выполнено и проверено:

- production source не менялся; в existing AJAX scenario добавлено одно post-mutation Playwright assertion;
- targeted scenario: `3 passed`; independent review found no findings and confirmed narrow claim boundaries;
- full regression: `43` tests, `41 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current pinned guest Woo/Chrome one-add computed accessible-name state.

### I2-S58 — repeated AJAX add cart-counter consistency

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation `I2-S26/I2-S39/I2-S55/I2-S57`; `UI-SCR002-007/015`, `PBL-019/PBL-040`, `FR-CART-001` technical/demo partial и `NFR-A11Y-002` technical partial. Production cart semantics остаётся штатной WooCommerce; `TC-009/TC-040` не заявляются.

Критерии среза:

- один exact currently rendered AJAX-capable product дважды добавляется отдельными успешными `wc-ajax=add_to_cart` POST с `quantity=1`;
- после первого add visible badge/computed cart name равны exact `1` / `Корзина 1`;
- после второго add те же состояния равны exact `2` / `Корзина 2`;
- cart сохраняет одну exact строку исходного товара; результат одинаков на `1440/390/360`.

Вне scope: общее бизнес-решение units-vs-lines, arbitrary quantity, разные товары/offers, mixed cart, update/remove/reload/session persistence, auth/concurrency, price/stock/reservation, checkout/order/payment, live announcement/SR/AT, browser/Woo matrix и production commerce.

Выполнено и проверено:

- pre-fix targeted diagnostic: `3 failed`; оба POST успешны, но second-add badge остался exact `1` на `1440/390/360`;
- production fix: custom header-badge fragment через standard Woo fragment API заменяет exact `#az-cart-count` escaped `get_cart_contents_count()`; custom mini-cart line-count JS удалён;
- PHP/JS syntax `PASS`; post-fix targeted scenario `3 passed`;
- full regression: `43` tests, `41 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users;
- independent review: P3 wording mismatch исправлен; code/API/security findings отсутствуют.

Статус закрывает только current pinned guest Woo/Chrome repeated same-product AJAX badge/name consistency with current Woo units count.

### I2-S59 — mobile-nav outside-click dismissal

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation `I2-S42/I2-S46/I2-S48/I2-S49/I2-S52/I2-S56`; `SCR-002` header, `PBL-010/PBL-040` и `NFR-A11Y-002` state-consistency technical partial. `DG-017/018` остаются open; navigation content/business scope не меняется.

Критерии среза:

- только на `390/360` open menu сохраняется после real pointer click внутри nav panel;
- real pointer click по safe non-interactive main target вне toggle/panel переводит state в false/no-class/hidden/open-label без URL change;
- safe same-page main link сохраняет собственную `#vin-request` activation одновременно с dismissal;
- pointer interaction внутри open native dialog не закрывает nav, сохраняя I2-S49 dialog contract; desktop presentation остаётся без изменений.

Вне scope: explicit focus transfer после click dismissal, focus trap/roving tabindex, другие link destinations, scroll lock, swipe/touch gesture semantics beyond click, multi-pointer/shadow DOM/iframe, screen-reader/AT/browser/device matrix, approved mobile design, full WCAG и production navigation acceptance.

Выполнено и проверено:

- pre-fix targeted diagnostic: desktop passed, both mobile projects failed with retained `aria-expanded=true` after outside main click;
- first `pointerdown` implementation отклонён до commit: independent P1 probe доказал layout reflow между pointerdown/up и потерю exact hero-link activation;
- bubble `click` сохраняет target activation; exact `#vin-request` regression добавлен;
- intermediate `dialog[open]` guard exposed bubble-order nav dismissal after successful dialog close/focus return: `open` was already removed before document bubble, so the guard now uses originating `dialog` ancestry;
- final JavaScript syntax and targeted homepage scenario: `3 passed`; independent repeat review found no remaining findings;
- full regression: `43` tests, `41 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current pinned Chrome mobile outside-click, one exact target-activation and existing dialog event-order renderer contract.

### I2-S60 — guest login local keyboard-focus style

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation `I2-S51/I2-S53`; `PBL-009/PBL-040`, `FR-AUTH-002` renderer-only technical partial и `NFR-A11Y-002` technical partial. `DG-018` остаётся open; direct Paper control mapping и auth behavior отсутствуют.

Критерии среза:

- exact local keyboard traversal охватывает username, password, visibility button, remember checkbox, login submit и lost-password link;
- на каждом focused stop computed style имеет non-none box-shadow либо non-none outline style с non-zero width;
- после traversal URL exact `/my-account/`, credentials empty, password type `password`, remember unchecked на `1440/390/360`.

Вне scope: focus-ring color/contrast/occlusion/manual visual proof, full-page/wrap order, mouse focus, activation/submit/POST, credentials/auth/session/recovery, OS/autofill/password manager, AT/SR/browser/Woo matrix, full WCAG и production IAM/security.

Выполнено и проверено:

- initial presence-only helper targeted `3 passed`, но independent review отклонил его как false-positive-prone для transparent/zero/permanent decoration;
- hardening добавил `:focus-visible`, truly unfocused baseline, branch-specific delta, non-transparent color and non-zero shadow geometry/outline width;
- first hardening run `3 failed` на test-only declaration-order `ReferenceError`; baseline объявление перенесено после locator creation;
- repeat reviews нашли active-but-not-focus-visible checkbox baseline и global-delta loophole; password получает focus до baseline, а passing ring branch теперь сама обязана отличаться;
- final targeted account scenario: `3 passed`; independent repeat reviews found no remaining findings;
- production source не менялся; full regression: `43` tests, `41 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только current pinned Chrome single-layer computed keyboard-focus signal for the six current guest-login controls.

### I2-S61 — homepage skip-link public-viewport transfer

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation `I2-S54`; `PBL-040` и `NFR-A11Y-002` technical partial. `DG-018` остаётся open; direct Paper control/business mapping отсутствует.

Критерии среза:

- на public projects `1440/390/360` первый Tab exact-focuses единственную homepage skip link;
- ссылка видима, полностью находится во viewport, matches `:focus-visible` и указывает exact `#primary`;
- Enter добавляет exact fragment и переводит focus на visible `main#primary[tabindex=-1]` без runtime errors.

Вне scope: другие mobile routes/renderer families, screen-reader announcement, focus-ring contrast/color/occlusion, manual visual review, touch-only activation, AT/browser/device matrix, full WCAG и production business acceptance.

Выполнено и проверено:

- отдельный homepage scenario сохраняет fresh first-keyboard-stop semantics и не меняет URL/focus существующего большого homepage scenario;
- public projects `1440/390/360`: exact unique skip link focused, visible, fully in viewport and matches `:focus-visible`; Enter preserves origin/path/search, adds exact `#primary` and focuses visible `main#primary[tabindex="-1"]`;
- targeted scenario: `3 passed`; full regression: `46` tests, `44 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users;
- production source не менялся; два independent reviews found no findings.

Статус закрывает только current homepage skip-link transfer в pinned Chrome public projects `1440/390/360`; desktop evidence S54 для representative front/page/Woo renderer families сохраняется.

### I2-S62 — mobile-nav internal VIN-link dismissal/focus transfer

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation `I2-S42/S46/S48/S52/S56/S59`; `SCR-002/UI-SCR002-009` renderer navigation partial; `PBL-010/PBL-040`; `NFR-A11Y-002` technical partial. `DG-017/018` остаются open; `FR-VIN-001` business completion не заявляется.

Критерии среза:

- на `390/360` exact visible/named internal VIN anchor закрывает mobile nav через shared state при pointer и native Enter activation, сохраняя origin/path/search и exact `#vin-request`;
- keyboard/non-pointer same-document activation имеет guarded source-level focus handoff, а реальный Enter-сценарий заканчивается focus на visible `section#vin-request[tabindex=-1]`;
- panel padding остаётся open, contact button/dialog ancestry и focus-return не ломаются, desktop presentation boundary сохраняется.

Вне scope: VIN validation/submit/contact/consent/CRM, arbitrary anchors/routes/fragments/encoded IDs, pointer/outside-click focus outcome, scroll landing/in-viewport focus, focus-ring/announcement, modified clicks, touch/swipe/multi-pointer, screen-reader/AT/browser/device matrix, approved mobile design, full WCAG и production navigation/VIN acceptance.

Выполнено и проверено:

- pre-fix targeted run: desktop `1 passed`, mobile `2 failed` с `aria-expanded=true` после exact fragment activation;
- delegated panel bubble handler закрывает только descendant anchors через existing `setNavOpen(false)` и не отменяет default activation;
- первый fix дал targeted `3 passed`, но independent P2 review выявил потерю keyboard focus на `BODY`; labelled VIN section получил `tabindex=-1`, а guarded requestAnimationFrame source path выполняется только для keyboard/non-pointer same-document fragment;
- final targeted scenario: `3 passed`; `main.js` syntax и changed PHP template lint прошли; independent final reviews закрыли P2 без новых findings;
- full regression: `46` tests, `44 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users.

Статус закрывает только exact homepage internal VIN-link dismissal и итоговый Enter focus outcome в pinned Chrome на `390/360`.

### I2-S63 — cross-page cart-header continuity

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation `I2-S35/I2-S55/I2-S57/I2-S58`; `UI-SCR002-007`; `PBL-019/PBL-040`; `FR-CART-001` renderer/session technical partial; `NFR-A11Y-002` computed-name partial. Production behavior и cart business rules не меняются.

Критерии среза:

- after two exact same-product `quantity=1` AJAX adds, visible header link/badge expose exact relation/count/name `2`/`Корзина 2`;
- тот же exact visible header contract сохраняется после canonical full navigation к `/cart/` и затем `/checkout/` в одной guest browser session на `1440/390/360`;
- existing exact cart-row identity, canonical links и demo checkout guards остаются passing.

Вне scope: exclusive server-render proof, manual reload, back/forward, new tab, browser restart, cookie TTL, authenticated cart merge, cross-device persistence, arbitrary quantity/different products/mixed cart, update/remove/concurrency, price/stock/reservation, live announcement/SR/AT/browser/Woo matrix и production commerce.

Выполнено и проверено:

- initial targeted scenario `3 passed`: exact `2`/`Корзина 2` сохранились на homepage, cart и checkout;
- independent P3 review указал, что text/name assertions пропускают hidden badge; helper hardened exact `toBeVisible()` для link и badge, final targeted scenario `3 passed`;
- live Playwright locators re-resolve each new document; network-idle evidence не объявляется доказательством exclusively server-rendered HTML;
- full regression: `46` tests, `44 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users;
- production source не менялся; final independent reviews found no remaining findings.

Статус закрывает только current pinned Chrome/current Woo rendered-header continuity within one exact guest browser session.

### I2-S64 — guest lost-password keyboard entry/wiring

**Статус:** `DONE / TECHNICAL`

**Связь:** continuation `I2-S33/I2-S53/I2-S60`; `PBL-009/PBL-040`; `FR-AUTH-003` entrypoint/renderer-only technical partial; `NFR-A11Y-002` technical partial. `DG-002/018` остаются open; direct Paper recovery screen отсутствует.

Критерии среза:

- from focused login submit, one real Tab reaches the exact visible/named lost-password anchor in `:focus-visible` state;
- Enter performs successful same-origin exact GET `/my-account/lost-password/` without query/hash;
- one visible current Woo reset form exposes exact effective POST action, empty required identifier input with exact name/type/autocomplete/accessibility, hidden marker, non-empty nonce, exact referer and visible/named submit;
- identifier stays empty, no POST reaches the exact recovery action, no-overflow/runtime and serious/critical axe gates pass on `1440/390/360`.

Вне scope: reset-page arrival focus/order/style; identifier validation/submission and neutral existing-vs-unknown response; enumeration resistance; email/token delivery, expiry and reuse; password change/login/session; nonce enforcement, CSRF/rate limit; localization/copy approval; screen-reader/AT/browser/Woo matrix; full WCAG и production IAM/security.

Выполнено и проверено:

- separate non-mutating browser scenario activates the existing link by real Tab + Enter and distinguishes successful document GET from recovery POST;
- current form action/controls/hidden wiring are asserted without logging nonce values or entering an identifier; exact-action POST listener remains empty;
- targeted scenario: `3 passed`; two independent reviews found no findings and constrained nonce/no-POST/axe claims;
- full regression: `49` tests, `47 passed`, `2 intentional skipped`, `0 failed`; 19 PNG hashes неизменны;
- post-full inventory: `10` published products / `0` temporary products / `0` temporary categories / `0` temporary `shop_manager` users;
- production source не менялся.

Статус закрывает только current guest Woo lost-password entrypoint GET и browser-visible reset-form wiring in pinned Chrome public projects.

### OPS-QT-001 — isolated one-command Quick Tunnel preview

**Статус:** `TESTING / SERVER_VALIDATION_REQUIRED`

**Связь:** `I1-ACC-017/018`, `PBL-040`, deployment partial `NFR-SEC-003`; коммерческий production scope не расширяется.

Критерии среза:

- installer получает exact expected IPv4 и два фактических existing-site URL, fail-closed проверяя их до и после;
- Compose project `avtozakup` не публикует host ports, не использует foreign networks/Caddy и не выполняет global removal/prune;
- random secrets остаются в mode-600 untracked env; repeat deploy создаёт парный DB/uploads backup;
- `cloudflared` pinned, случайный URL атомарно становится `PUBLIC_URL`, bootstrap/smoke повторяемы;
- owner-approved public `/wp-login.php` отвечает `2xx`, unauthenticated `/wp-admin/` ведёт на same-origin WordPress login; pre-existing foreign container IDs/states/health и listeners 80/443 не меняются;
- remote proof требуется до статуса `DEPLOYED`.

Выполнено локально: Bash syntax `PASS`; Compose config `PASS`, published ports `0`; Caddy validate `PASS`; official cloudflared `2026.10.7` image/version `PASS`; deployment preflight вместе с Playwright env `10 passed`. Server run сознательно не заявлен.

## Следующие итерации

| Итерация-кандидат | Scope по исходному backlog | Gate |
|---|---|---|
| 2 — `IN_PROGRESS` | catalog/search/PDP: PBL-002, 006, 011—017; I2-S1 завершён | DEC-002—006, DG-001/018, INT-CAT/ERP/SUP contracts |
| 3 | cart/checkout/order: PBL-003—005, 018—023 | DEC-008—014, DG-004—008, PSP/DLV/WMS sandbox |
| 4 | procurement/receiving/pickup: PBL-024—027/033 | operational ownership, ERP/WMS/SUP contracts, DG-013—016 |
| 5 | account/VIN/B2B/returns: PBL-028—032/041 | DEC-015—018, CRM/IDP/legal, DG-002/003/009—011 |
| Сквозная | PBL-034—040 | approved NFR, privacy/security, observability, test gates |

