# Статус приёмки Итерации 1

**Состояние:** `READY_FOR_DEPLOYMENT / NOT_DEPLOYED`; `PASS` ниже относится только к явно проверенному критерию и не закрывает открытые DEC или будущую коммерческую функциональность.  
**Главный источник:** `J:\vlad322\docs\07_delivery\test_acceptance_matrix.md`.

**Приёмочный прогон Итерации 1:** `13` tests = `11 passed`, `2 intentional skipped`, `0 failed`.

**Текущий regression после I2-S79 truthful homepage product collections:** `61` tests = `59 passed`, `2 intentional skipped`, `0 failed`; desktop `1440`, compact desktop `900`, mobile `390`, mobile `360`, отдельный serial desktop admin project. Два skip — ожидаемые mobile-копии viewport-независимого Store API guard. I2-S79 strengthens existing homepage/admin scenarios without adding a new test case.

## Технические критерии Итерации 2

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S2A-ACC-001 | Seed не владеет Woo core pages | manifest: `demo_pages=6`, `woocommerce_pages=4`; Woo options и page hashes неизменны после двух `seed(true)` на legacy-БД | `PASS` |
| I2-S2A-ACC-002 | Fresh bootstrap не создаёт core-page дубли | isolated bootstrap ×2: `/shop`, `/cart`, `/checkout`, `/my-account`, без `*-2`, без `_avtozakup_demo` на Woo pages | `PASS` |
| I2-S2A-ACC-003 | Legacy cleanup не выполняется скрыто | текущие option IDs `30/31/32/7` сохранены; автоматического rename/trash/delete нет | `PASS`; repair отдельным срезом |
| I2-S2A-ACC-004 | Текущий UI regression не ухудшен | Playwright на `http://localhost:8086`: `16` tests, `14 passed`, `2` intentional skipped, `0 failed` | `PASS` |

I2-S2A — технический prevention-срез. Он не нормализует текущий legacy URL, не утверждает SEO/canonical policy и не закрывает `PBL-039`.

### I2-S2B — legacy repair

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S2B-ACC-001 | Dry-run не пишет данные | managed snapshot до/после основной legacy-БД идентичен; план `30→4`, `31→5`, `32→6` | `PASS` |
| I2-S2B-ACC-002 | Неоднозначность и user-owned page защищены | isolated custom candidate/revision → nonzero и zero-write; configured `/parts-store` hash/option сохранены | `PASS` |
| I2-S2B-ACC-003 | Ошибка/конкуренция не оставляет partial state | atomic lock; isolated exceptions после option writes и после первого Trash; options/settings/manifest, exact page status/slug/meta/revisions восстановлены | `PASS` |
| I2-S2B-ACC-004 | Confirm меняет только разрешённые ссылки и demo pages | verified backup; options `4/5/6`, canonical hashes/meta неизменны, hero/manifest обновлены, IDs `30/31/32` в Trash | `PASS` |
| I2-S2B-ACC-005 | Repair и seed идемпотентны | повторный confirm no-op; seed ×2 сохраняет options и не создаёт published `*-2` | `PASS` |
| I2-S2B-ACC-006 | Canonical browser journey и demo safety | `/shop/`, `/cart/`, `/checkout/` на `1440/390/360`; classic/Woo Blocks notice; Store API `403`; full `14 passed / 2 skipped` | `PASS` |

I2-S2B не удаляет Trash и не реализует redirect/SEO policy; `PBL-039` остаётся partial.

### I2-S3 — demo provenance

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S3-ACC-001 | Provenance видна только у marked product | unsaved unmarked WC product → `null`; marked unknown source → label без raw source | `PASS` |
| I2-S3-ACC-002 | Archive/search/PDP используют единый predicate | Woo hooks + homepage helper; category/search loop label и PDP disclaimer/source | `PASS` |
| I2-S3-ACC-003 | Путь проверен на трёх viewport | category → multi-result search «Фильтр» → PDP, no-overflow/runtime errors: provenance scenario `3 passed`; весь catalog file `6 passed` (`2` сценария × `3`) | `PASS` |
| I2-S3-ACC-004 | Regression не ухудшен | `19` tests: `17 passed`, `2 intentional skipped`, `0 failed` | `PASS` |

I2-S3 имеет qualifier `PROVISIONAL / DESIGN_REVIEW_REQUIRED`; offers/search/fitment и соответствующие DEC/DG/TC не закрыты.

### I2-S4 — technical demo PDP safety

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S4-ACC-001 | Technical SKU применяется fail-closed | in-memory: unmarked `AZ-DEMO-999` → `null`; marked `CUSTOM-001` → `null`; marked `AZ-DEMO-999` → accepted | `PASS` |
| I2-S4-ACC-002 | Marked PDP не утверждает stock/relations | availability без числа и с «не подтверждено»; demo-cart action; `section.related.products` отсутствует | `PASS` |
| I2-S4-ACC-003 | Штатные технические данные PDP сохранены | DOM-selected product: один matching H1, image/placeholder, short/long description, category link, provenance и technical SKU | `PASS` |
| I2-S4-ACC-004 | Три viewport технически безопасны | scenario `3 passed`; no overflow/runtime errors; axe serious/critical `0`; 3 actual screenshots | `PASS` |
| I2-S4-ACC-005 | Regression не ухудшен | `22` tests: `20 passed`, `2 intentional skipped`, `0 failed` | `PASS` |

I2-S4 имеет qualifier `PROVISIONAL / DESIGN_REVIEW_REQUIRED`; full `SCR-009`, OEM/analogs/fitment/offers/real stock и соответствующие DEC/DG/TC не закрыты.

### I2-S5 — truthful product-search empty state

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S5-ACC-001 | Form не обещает неподдерживаемый article/brand search | current neutral «По товарам» / «Введите запрос», hidden `post_type=product` | `PASS` |
| I2-S5-ACC-002 | Query context escaped и сохраняется | special chars `&`/quotes буквально совпадают в searchbox, H1 и `[data-product-search-query]`; runtime errors `0` | `PASS` |
| I2-S5-ACC-003 | No-results честный и ограниченный | один status-блок, `0` product cards, default Woo notice `0`, canonical `/shop/` return; suggestions отсутствуют | `PASS` |
| I2-S5-ACC-004 | Три viewport технически безопасны | scenario `3 passed`; no overflow/runtime errors; axe serious/critical `0`; 3 actual screenshots | `PASS` |
| I2-S5-ACC-005 | Regression не ухудшен | `25` tests: `23 passed`, `2 intentional skipped`, `0 failed`; existing multi-result search/PDP PASS | `PASS` |

I2-S5 имеет qualifier `PROVISIONAL / DESIGN_REVIEW_REQUIRED`; `TC-003` затронут только presentation/safety частью, `TC-001/002` не покрыты; `PBL-002/006/012`, полные `TC-001—003`, `DG-001/018`, `DEC-003`, index/ranking/normalization и утверждённый search design не закрыты.

### I2-S6 — generic product-search results

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S6-ACC-001 | UI не фиксирует неподтверждённые index fields | neutral form copy; read-only WP_Query content term → `10`, title-only claim removed | `PASS` |
| I2-S6-ACC-002 | Positive results остаются product-only и explicit | `Фильтр` URL/searchbox/H1; `2` fixture cards, non-empty titles, same-origin permalinks + provenance; title match/order не asserted | `PASS` |
| I2-S6-ACC-003 | Shop/ranking presentation не создаёт ложных claims | `.az-shop-categories` и `.woocommerce-ordering` count `0` на results page | `PASS` |
| I2-S6-ACC-004 | Три viewport технически безопасны | positive scenario `3 passed`; весь search file `6 passed`; no overflow/runtime; axe serious/critical `0`; 3 screenshots | `PASS` |
| I2-S6-ACC-005 | Regression не ухудшен | `28` tests: `26 passed`, `2 intentional skipped`, `0 failed` | `PASS` |

I2-S6 имеет qualifier `PROVISIONAL / DESIGN_REVIEW_REQUIRED`; field index contract, ranking, SKU/OEM/brand, `TC-001/002`, `DG-001/018` и `DEC-003` остаются open/blocked.

### I2-S7 — scoped Woo public-copy consistency

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S7-ACC-001 | Shop title локализован без page mutation | `/shop/` H1 «Каталог товаров» на `1440/390/360`; filter-only | `PASS` |
| I2-S7-ACC-002 | Search count локален и scoped | strict product search показывает `[data-product-search-count]` = «Найдено товаров: 2» | `PASS` |
| I2-S7-ACC-003 | Direct-add demo action не выглядит production CTA | обе simple/purchasable/in-stock/AJAX result cards: demo label; in-memory out-of-stock clone сохраняет `Read more`; single PDP action остаётся demo | `PASS` |
| I2-S7-ACC-004 | PDP description labels согласованы | marked PDP tab + heading «Описание» на `1440/390/360`; unconditional presentation filters, content unchanged | `PASS` |
| I2-S7-ACC-005 | Regression не ухудшен | targeted `15 passed`; full `28`: `26 passed`, `2 intentional skipped`, `0 failed` | `PASS` |

I2-S7 имеет qualifier `PROVISIONAL / DESIGN_REVIEW_REQUIRED`; breadcrumb, shop result count/sorting и полная Woo/admin/account/cart/checkout локализация не закрыты.

### I2-S8 — user-owned product isolation regression

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S8-ACC-001 | Fixture явно unmarked и user-owned | authenticated Woo REST create без demo meta; unique user SKU/stock/descriptions; published visible product | `PASS` |
| I2-S8-ACC-002 | Demo loop semantics не протекают | newest shop card visible; demo provenance `0`; CTA не содержит «демо» | `PASS` |
| I2-S8-ACC-003 | Demo PDP semantics не протекают | provenance/meta `0`; exact user SKU; stock contains `3` без demo text; action non-demo; descriptions intact | `PASS` |
| I2-S8-ACC-004 | Cleanup обязателен и проверен | `finally` force-delete + exact-SKU REST absence; post-target/post-full: published products `10`, E2E user products `0` | `PASS` |
| I2-S8-ACC-005 | Regression не ухудшен | targeted `1 passed`; full `29`: `27 passed`, `2 intentional skipped`, `0 failed` | `PASS` |

I2-S8 закрывает только technical isolation regression; production master data, permissions matrix, stock truth, relations и lifecycle остаются open/blocked.

### I2-S9 — truthful canonical shop controls

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S9-ACC-001 | Shop count локален и truthful | one `[data-shop-product-count]` = «Товаров в каталоге: 10»; total >= visible cards | `PASS` |
| I2-S9-ACC-002 | Unapproved ordering UI не показан | `.woocommerce-ordering` = `0` только на canonical shop; query/order filters не менялись | `PASS` |
| I2-S9-ACC-003 | Search/category изолированы | search own count/no-ordering проходит; category has no shop marker и retains standard ordering | `PASS` |
| I2-S9-ACC-004 | Responsive/a11y/runtime не ухудшены | catalog `3 passed` на `1440/390/360`; axe serious/critical `0`; no overflow/runtime; screenshots reviewed | `PASS` |
| I2-S9-ACC-005 | Regression не ухудшен | full `29`: `27 passed`, `2 intentional skipped`, `0 failed` | `PASS` |

I2-S9 закрывает только canonical-shop presentation. Ranking contract, query/data behavior, full localization и visual approval остаются open.

### I2-S10 — fail-closed product-search scope regression

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S10-ACC-001 | Non-product scope не получает product UI | `post_type=post`: successful response, query/scope preserved, product/shop markers `0` | `PASS` |
| I2-S10-ACC-002 | Mixed scope fail closed | `post_type[]=product&post_type[]=post`: params preserved; product count/empty/heading и shop controls `0` | `PASS` |
| I2-S10-ACC-003 | Viewports/runtime не ухудшены | targeted `3 passed` на `1440/390/360`; no overflow/runtime errors | `PASS` |
| I2-S10-ACC-004 | Regression не ухудшен | full `32`: `30 passed`, `2 intentional skipped`, `0 failed` | `PASS` |

I2-S10 закрывает только fail-closed presentation scope. Generic/mixed search UX, search index/ranking и visual approval остаются open.

### I2-S11 — fail-closed Playwright target/admin-write preflight

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S11-ACC-001 | Implicit/unsafe target не допущен | missing `BASE_URL` → exit `1`; malformed/scheme/subpath/credentials/query/fragment covered by unit matrix | `PASS` |
| I2-S11-ACC-002 | Admin-write opt-in неделим и preflight secret-safe | partial credential/flag state → exit `1`; `6` unit tests include error non-disclosure; admin trace/video/screenshot disabled | `PASS` |
| I2-S11-ACC-003 | Public-only path не пишет данные | explicit `BASE_URL` without triplet → admin project `4 skipped` | `PASS` |
| I2-S11-ACC-004 | Full explicit local path доступен | exact local URL + full triplet → `32` tests discovered; credential values absent from output | `PASS` |
| I2-S11-ACC-005 | Regression и cleanup не ухудшены | full `32`: `30 passed`, `2 intentional skipped`; post-full inventory `10/0` | `PASS` |

I2-S11 закрывает только test-harness target/write safety. Opt-in не доказывает remote ownership, не разрешает production writes и не закрывает RBAC/`TC-037`.

### I2-S12 — scoped Woo breadcrumb copy

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S12-ACC-001 | Known breadcrumb copy локализован | shop = «Главная / Каталог товаров»; category/PDP home localized; exact product search uses local label | `PASS` |
| I2-S12-ACC-002 | URLs/data trail сохранены | home `/`, shop `/shop/`; category/product labels unchanged; no query/order mutation | `PASS` |
| I2-S12-ACC-003 | Escaping однократно | `AZ-NO-RESULT-9F3C & "probe"` в browser text совпадает literally; Woo template выполняет `esc_html` | `PASS` |
| I2-S12-ACC-004 | Fail-closed guards работают | shop sentinel `-1` → `null`; paged search keeps `Page 2`; mixed/post-only has no product label; malformed crumb shapes guarded | `PASS` |
| I2-S12-ACC-005 | Responsive/a11y/runtime и visual не ухудшены | catalog/search `18 passed` на `1440/390/360`; existing axe/no-overflow/runtime; `15` screenshots updated/reviewed | `PASS` |
| I2-S12-ACC-006 | Regression не ухудшен | full `32`: `30 passed`, `2 intentional skipped`, `0 failed` | `PASS` |

I2-S12 закрывает только scoped public breadcrumb copy. JSON-LD names следуют тем же labels, но URLs/order не меняются; full i18n, SEO/canonical и visual approval остаются open.

### I2-S13 — user-owned strict-search isolation

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S13-ACC-001 | Единственный strict product result не уходит в PDP автоматически | exact query сохраняет `s` и один `post_type=product`; results count = `1` | `PASS` |
| I2-S13-ACC-002 | Найден именно временный user-owned товар | единственная card = exact `post-${productId}`, title и REST permalink | `PASS` |
| I2-S13-ACC-003 | Demo semantics не протекает | search card/PDP: provenance и demo meta `0`; CTA обычная и без «демо» | `PASS` |
| I2-S13-ACC-004 | User data сохраняются | PDP показывает exact SKU, stock `3`, short/long descriptions | `PASS` |
| I2-S13-ACC-005 | Cleanup точный и полный | force-delete known ID / exact-SKU fallback; после full inventory `10` published, temporary `0` | `PASS` |
| I2-S13-ACC-006 | Regression не ухудшен | targeted `1 passed`; PHP lint; full `32`: `30 passed`, `2 intentional skipped`, `0 failed` | `PASS` |

I2-S13 закрывает только user-owned isolation и scoped one-result presentation. Search fields/completeness/ranking, production master/RBAC/stock/lifecycle и approved design остаются open.

### I2-S14 — curated category identity boundary

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S14-ACC-001 | Public category identities явные и валидные | homepage: ровно 8 unique positive numeric `data-category-id`; links same-origin `/product-category/.../` | `PASS` |
| I2-S14-ACC-002 | Homepage и shop не расходятся | ordered `{id, href}` snapshots exact-equal на `1440/390/360` | `PASS` |
| I2-S14-ACC-003 | Settings — источник curated set | read-only admin: 8 selected option IDs; public set exact-equal независимо от option DOM order | `PASS` |
| I2-S14-ACC-004 | Legacy terms не протекают | public IDs не пересекаются с unselected; current DB audit: 50 same-name unselected IDs | `PASS` |
| I2-S14-ACC-005 | Taxonomy не мутирована | отсутствуют delete/merge/rename/meta writes; production change только escaped data attribute | `PASS` |
| I2-S14-ACC-006 | Regression не ухудшен | PHP lint; targeted public `3 passed`; admin `1 passed`; full `33`: `31 passed`, `2 skipped`; inventory `10/0` | `PASS` |

I2-S14 закрывает только curated identity boundary. Production taxonomy master, legacy cleanup/redirects и design approval остаются open.

### I2-S15 — category-card accessible name

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S15-ACC-001 | Decorative art не загрязняет link name | art span имеет `aria-hidden="true"`; `role="img"` и arbitrary labels удалены | `PASS` |
| I2-S15-ACC-002 | Link name соответствует видимой подписи | все 8 homepage и 8 shop cards: exact accessible name = trimmed visible term name | `PASS` |
| I2-S15-ACC-003 | Responsive/a11y baseline не ухудшен | targeted catalog `3 passed` на `1440/390/360`; existing axe serious/critical gate проходит | `PASS` |
| I2-S15-ACC-004 | Regression не ухудшен | PHP lint; full `33`: `31 passed`, `2 intentional skipped`, `0 failed` | `PASS` |

I2-S15 закрывает только accessible name shared category card. Полный WC/admin/AT/browser accessibility audit и approved design остаются open.

### I2-S16 — distinguishable category options in Settings

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S16-ACC-001 | Одноимённые terms различимы | каждая Settings option имеет escaped формат `name (#ID)` | `PASS` |
| I2-S16-ACC-002 | Label ID соответствует value | browser assertion для всех options: parsed suffix = exact option value, name non-empty | `PASS` |
| I2-S16-ACC-003 | Identity boundary сохранён | selected 8 IDs, homepage set и ordered shop snapshot продолжают проходить | `PASS` |
| I2-S16-ACC-004 | Данные не мутированы | targeted admin test read-only; renderer не меняет option value/settings/taxonomy | `PASS` |
| I2-S16-ACC-005 | Regression не ухудшен | PHP lint; targeted `1 passed`; full `33`: `31 passed`, `2 skipped`, `0 failed` | `PASS` |

I2-S16 закрывает только различимость options в project Settings. Term ID instance-local; production master, legacy cleanup и RBAC остаются open.

### I2-S17 — deterministic visual evidence capture

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S17-ACC-001 | Все actual captures используют единый fail-fast путь | 6 capture points × `1440/390/360` вызывают `captureStableVisual` | `PASS` |
| I2-S17-ACC-002 | Незагруженное изображение не маскируется | helper ждёт fonts/complete, проверяет natural dimensions и `decode()`; timeout/error бросает исключение | `PASS` |
| I2-S17-ACC-003 | Параллельные captures детерминированы | межпроцессный exclusive-file lock; два последовательных targeted run: `18 passed` + exact-equal SHA-256 всех 18 PNG | `PASS` |
| I2-S17-ACC-004 | Полный regression сохраняет visual evidence | full `33`: `31 passed`, `2 skipped`, `0 failed`; все 18 hashes совпали с targeted set | `PASS` |
| I2-S17-ACC-005 | Visual scope заявлен честно | representative artifacts просмотрены; production presentation не менялась; `PROVISIONAL / DESIGN_REVIEW_REQUIRED` сохранён | `PASS` |

I2-S17 закрывает только воспроизводимость actual screenshots. Pixel-perfect/approved baseline не заявляется и остаётся за `DEC-019/020`.

### I2-S18 — curated category input boundary

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S18-ACC-001 | Settings предлагает только root-категории | self-contained temporary root option виден; его child option отсутствует; help явно говорит «до 8 … верхнего уровня» | `PASS` |
| I2-S18-ACC-002 | Forged input фильтруется fail closed | raw POST: child + duplicate root + 9 roots; сохранены первые 8 unique existing roots в порядке первого вхождения | `PASS` |
| I2-S18-ACC-003 | Homepage/shop держат один invariant | homepage IDs exact-equal ожидаемому порядку, child отсутствует; shop snapshot exact-equal homepage | `PASS` |
| I2-S18-ACC-004 | Транзакция полностью обратима | исходный homepage order exact-restored; exact child → root delete; оба GET после cleanup = `404` | `PASS` |
| I2-S18-ACC-005 | Regression/data/visual не ухудшены | PHP lint; targeted `1 passed`; existing CRUD `1 passed`; full `34`: `32 passed`, `2 skipped`; 18 hashes unchanged; inventory products/temp SKU/temp categories `10/0/0` | `PASS` |

I2-S18 закрывает только Settings/runtime top-level/max-8 boundary. Production taxonomy master, hierarchy design, legacy merge/delete/redirect policy и RBAC остаются open.

### I2-S19 — lossless Settings test transactions

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S19-ACC-001 | Test writes не меняют order соседних multiselects | hero, hostile category и Woo CRUD перед submit подставляют ordered hidden values для неизменяемых category/popular/stock fields | `PASS` |
| I2-S19-ACC-002 | Полный stored product order не обрезается public limit | selected-first admin options читаются полностью; homepage сравнивается с exact `.slice(0, 5)` для popular/stock | `PASS` |
| I2-S19-ACC-003 | Restore проверяется по stored и public state | category/popular/stock stored arrays exact-equal исходным; public category order и оба 5-item prefix exact-equal | `PASS` |
| I2-S19-ACC-004 | CRUD cleanup не блокируется предыдущей ошибкой | nested `finally`: restore → product delete/`404` → category delete/`404` | `PASS` |
| I2-S19-ACC-005 | Regression/data не ухудшены | targeted mutating Settings `3 passed`; full `34`: `32 passed`, `2 skipped`; published products / temp CRUD products / temp CRUD categories = `10/0/0` | `PASS` |

I2-S19 закрывает только mutation isolation тестового harness. Production behavior, RBAC, master data и business acceptance не менялись.

### I2-S20 — tolerance-aware visual artifact retention

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S20-ACC-001 | Layout-visible CSS backgrounds готовы до capture | computed `background-image` URLs собраны и проходят `decode()`/positive natural dimensions с timeout до scroll/screenshot | `PASS` |
| I2-S20-ACC-002 | Строго ограниченный encoder/compositor noise не переписывает existing PNG | byte equality fast path; decoded RGBA retain только при `≤10` changed pixels и max channel delta `≤1`; screenshot использует CSS-pixel scale | `PASS` |
| I2-S20-ACC-003 | SVG antialias exception строго локализован | retain только `≤2` pixels, delta `≤64` и все coordinates внутри visible `svg.az-icon`; tests проверяют `2/3`, `64/65`, inside/outside и dimension mismatch | `PASS` |
| I2-S20-ACC-004 | Windows shared-compositor noise не маскируется | параллельная диагностика правильно записала material diff `502 px / delta 32` и `5740 px / delta 3`; local Windows config переведён на 1 worker, cross-worker lock и bounded `EEXIST`/`EPERM` retry сохранены | `PASS` |
| I2-S20-ACC-005 | Regression/data/visual не ухудшены | два targeted run: `19 passed` каждый, baseline→run1 и run1→run2 hashes unchanged; serial full `35`: `33 passed`, `2 skipped`, hashes unchanged; inventory `10/0/0` | `PASS` |

I2-S20 закрывает только устойчивость хранения actual visual evidence к доказанному ограниченному renderer noise. Material candidate по-прежнему записывается; Paper/mobile baseline остаётся `PROVISIONAL / DESIGN_REVIEW_REQUIRED` по `DEC-019/020`.

### I2-S21 — project Settings negative capability

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S21-ACC-001 | Ограниченная сессия реальна и содержательна | admin REST создаёт exact temporary user только с `shop_manager`; отдельная session входит и получает Products `200`, `#posts-filter` и product menu | `PASS` |
| I2-S21-ACC-002 | Project Settings скрыты в UI | на Products page отсутствует `#toplevel_page_avtozakup`; returned role не содержит `administrator` | `PASS` |
| I2-S21-ACC-003 | Direct URL запрещён сервером | exact `/wp-admin/admin.php?page=avtozakup` остаётся тем же URL, отвечает `403`; Settings form, hero field и submit отсутствуют | `PASS` |
| I2-S21-ACC-004 | Отказ не меняет Settings | до/после exact-equal все `avtozakup_homepage[...]` form values и stored order category/popular/stock selections | `PASS` |
| I2-S21-ACC-005 | Temporary identity очищена независимо | nested cleanup закрывает restricted context, force-deletes exact user с reassign admin, проверяет ID `404` и exact username lookup `0` | `PASS` |
| I2-S21-ACC-006 | Regression/data/visual не ухудшены | targeted `1 passed`; admin `7 passed`; full `36`: `34 passed`, `2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S21 закрывает только один WordPress capability boundary для project Settings. Woo `shop_manager` не приравнивается к аналитической роли «Менеджер»; denied-attempt audit, MFA, session/rate-limit controls, all-role/API/object matrix и полный `TC-037/PBL-036` остаются open.

### I2-S22 — unmarked category-archive isolation

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S22-ACC-001 | Fixture изолирован от demo/master данных | REST создаёт unique root `product_cat` и unique published unmarked product, назначенный только этой категории | `PASS` |
| I2-S22-ACC-002 | Taxonomy route и состав архива точны | переход выполняется по реальной category-ссылке с PDP; `body.tax-product_cat`, exact H1 и ровно одна exact product card подтверждены | `PASS` |
| I2-S22-ACC-003 | Unmarked card не получает demo presentation | в exact category card отсутствует `data-demo-provenance`; штатный add-to-cart видим, непуст и не содержит demo-copy | `PASS` |
| I2-S22-ACC-004 | Тест не меняет project Settings | form snapshot `avtozakup_homepage[...]` exact-equal до fixture и после полного cleanup | `PASS` |
| I2-S22-ACC-005 | Cleanup и regression не оставляют следов | product удалён раньше category; exact ID дают `404`, exact SKU/slug lookup — `0`; targeted `1`, admin `7`, full `36`: `34 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S22 закрывает только отрицательную presentation-boundary unmarked товара в taxonomy loop. Он не доказывает category ownership/master, hierarchy/legacy policy, production RBAC, актуальность stock/price или lifecycle.

### I2-S23 — unmarked custom homepage card isolation

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S23-ACC-001 | Fixture использует custom homepage card без нового test footprint | существующий Woo CRUD создаёт published unmarked product с unique SKU и выбирает его первым только в `popular_product_ids` | `PASS` |
| I2-S23-ACC-002 | Card identity и route точны | в maintenance section существует ровно одна exact `data-product-id` card; title/media links ведут на exact permalink, title и `Арт. <SKU>` совпадают с fixture | `PASS` |
| I2-S23-ACC-003 | Unmarked card использует standard presentation branch | stock имеет `is-in-stock` и exact `Есть в наличии`; note — `Срок уточняется при заказе`; card не содержит demo-copy; CTA видима, имеет exact `data-product_id` и текст `В корзину` | `PASS` |
| I2-S23-ACC-004 | Homepage selections остаются изолированными и восстанавливаются | exact product отсутствует в stock section; category/popular/stock stored order и rendered prefixes exact-restored существующим transactional cleanup | `PASS` |
| I2-S23-ACC-005 | Regression и cleanup не оставляют следов | product удалён раньше category, оба exact ID дают `404`; targeted `1`, admin `7`, full `36`: `34 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S23 закрывает только card-local presentation isolation custom homepage helper. Общий collection-level demo disclaimer остаётся намеренным; срез не доказывает реальную актуальность stock/price, offer/master ownership, production RBAC/lifecycle или responsive/a11y acceptance.

### I2-S24 — exact Woo CRUD fixture fallback cleanup

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S24-ACC-001 | Cleanup identifiers известны независимо от REST response body | unique SKU и category slug объявляются до create; category create использует exact predeclared slug | `PASS` |
| I2-S24-ACC-002 | Fallback lookup реально проверяется normal run | product lookup по exact SKU и category lookup по exact slug выполняются всегда; при известном ID результат обязан его содержать | `PASS` |
| I2-S24-ACC-003 | Delete остаётся строго ограниченным | удаляется union known ID и `id > 0`, дополнительно отфильтрованных клиентом по exact SKU/slug; search/name и широкого delete нет | `PASS` |
| I2-S24-ACC-004 | Ошибка lookup не маскируется и не отменяет доступный cleanup | lookup error сохраняется; известные IDs сначала удаляются, затем исходная ошибка пробрасывается; category cleanup остаётся внешним `finally` после product cleanup | `PASS` |
| I2-S24-ACC-005 | Cleanup и regression не оставляют следов | Settings exact-restored; порядок product → category; каждый ID даёт `404`, повторные exact SKU/slug lookup — `0`; targeted `1`, admin `7`, full `36`: `34 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S24 закрывает только exact fallback cleanup одного transactional Woo CRUD fixture при потере сохранённого ID. Это не DB-транзакция, не rollback при отказе REST/БД или остановке процесса, не гарантия для всех fixtures и не production lifecycle/master/RBAC acceptance.

### I2-S25 — marked custom homepage card contract

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S25-ACC-001 | Exact marked fixture детерминированно найден | в maintenance section ровно одна card с exact title `Масляный фильтр MANN-FILTER W 914/2`, numeric `data-product-id` и visibility на `1440/390/360` | `PASS` |
| I2-S25-ACC-002 | Public demo metadata не раскрывает synthetic SKU | brand exact `MANN-FILTER`, article exact `Арт. W 914/2`; строка article не содержит `AZ-DEMO-*` | `PASS` |
| I2-S25-ACC-003 | Marked card использует demo presentation branch | stock имеет `is-in-stock` и exact `Демо: есть в наличии`; note — exact `Цена и наличие демонстрационные` | `PASS` |
| I2-S25-ACC-004 | Route и CTA технически связаны с той же card | title/media используют один product permalink; CTA видима, имеет `В корзину` и exact `data-product_id` карточки | `PASS` |
| I2-S25-ACC-005 | Regression/data/visual не ухудшены | targeted `3 passed`; homepage `7 passed / 2 skipped`; full `36`: `34 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S25 закрывает только presentation contract текущей seeded marked custom card. `W 914/2` не объявляется подтверждённым OEM/артикулом master-системы; срез не доказывает реальную цену/остаток, commercial CTA, permalink policy, ownership/master или business readiness.

### I2-S26 — exact AJAX cart item identity

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S26-ACC-001 | Source product identity фиксируется до mutation | ближайшая custom card имеет numeric `data-product-id`; CTA `data-product_id` exact-equal card ID; title/permalink непусты | `PASS` |
| I2-S26-ACC-002 | AJAX add остаётся успешным | exact CTA получает успешный `wc-ajax=add_to_cart`, payload без `error`, class `added`, badge `1` | `PASS` |
| I2-S26-ACC-003 | Cart содержит именно clicked product | `/cart/` содержит ровно одну row; row содержит exact source title, а classic/Blocks title-link ведёт на exact source permalink | `PASS` |
| I2-S26-ACC-004 | Existing demo guards сохранены | cart/checkout demo notice видим; checkout остаётся disabled/guarded; runtime errors отсутствуют | `PASS` |
| I2-S26-ACC-005 | Regression/data/visual не ухудшены | targeted `3 passed`; homepage `7 passed / 2 skipped`; full `36`: `34 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S26 закрывает только identity одного AJAX-added demo item на текущем локальном cart renderer. Не доказаны quantity/price/tax, reservation, persistence/concurrency, auth/guest policy, checkout/order/payment и cross-install classic/Blocks acceptance.

### I2-S27 — exact root/child category fixture cleanup

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S27-ACC-001 | Cleanup identifiers известны до REST create | unique root/child slugs объявлены заранее, используются в create payload и exact-equal REST response | `PASS` |
| I2-S27-ACC-002 | Fallback lookup реально проверяется normal run и остаётся узким | exact slug lookup выполняется всегда; client filter требует exact slug и positive ID; cleanup IDs — deduplicated union known/found IDs | `PASS` |
| I2-S27-ACC-003 | Restore и dependency order сохранены | полный category/popular/stock order exact-restored до cleanup; child удаляется раньше root; каждый удалённый ID даёт `404`, repeated exact lookup — `0` | `PASS` |
| I2-S27-ACC-004 | Lookup error не маскируется и root cleanup остаётся достижим | доступные known IDs удаляются до rethrow; outer `finally` запускает root cleanup даже после child failure | `PASS` |
| I2-S27-ACC-005 | Regression/data/visual не ухудшены | targeted `1 passed`; admin `7 passed`; full `36`: `34 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S27 закрывает только exact fallback cleanup текущего root/child fixture при выполнении `finally`. Hard kill, старые slugs других marker, отказ delete/БД/сети, concurrency, error aggregation и transactional rollback остаются вне scope.

### I2-S28 — exact unmarked Woo fixture fallback cleanup

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S28-ACC-001 | Cleanup identifiers подтверждены независимо от ID | unique SKU/category slug известны до create; REST product возвращает exact SKU, category — exact slug | `PASS` |
| I2-S28-ACC-002 | Normal run проверяет exact lookup и сохраняет найденные IDs | SKU/slug lookup выполняются всегда; strict filters требуют exact identifier и positive ID; found IDs добавляются в union до known-ID validation | `PASS` |
| I2-S28-ACC-003 | Cleanup остаётся узким и dependency-safe | удаляется deduplicated known/found union; порядок product → category; каждый ID даёт `404`, repeated exact lookup — `0` | `PASS` |
| I2-S28-ACC-004 | Lookup error не отменяет доступный cleanup | validation/lookup error сохраняется; доступный union удаляется, затем исходная ошибка пробрасывается; outer `finally` сохраняет достижимость category cleanup и Settings snapshot | `PASS` |
| I2-S28-ACC-005 | Regression/data/visual не ухудшены | targeted `1 passed`; admin `7 passed`; full `36`: `34 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S28 закрывает только exact fallback cleanup одного unmarked product/category fixture при выполнении `finally`. Hard kill, старые fixtures других marker, отказ delete/БД/сети, concurrency, error aggregation и transactional rollback остаются вне scope.

### I2-S29 — exact demo checkout guard contract

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S29-ACC-001 | Cart и checkout показывают один exact safety message | на обоих canonical routes ровно один Woo notice с полным normalized text; активный `.avtozakup-demo-notice` имеет `role="status"` | `PASS` |
| I2-S29-ACC-002 | Classic checkout action явно недоступна | если active renderer classic, exact button label, native `disabled` и `aria-disabled="true"` проверены | `PASS` |
| I2-S29-ACC-003 | Store API guard использует тот же contract | POST checkout возвращает HTTP `403`, exact code `avtozakup_demo_checkout_disabled`, тот же exact message и `data.status=403` | `PASS` |
| I2-S29-ACC-004 | Existing AJAX identity/runtime gates сохранены | clicked product exact-equal cart row; badge `1`; cart→checkout canonical paths; runtime errors отсутствуют на `1440/390/360` | `PASS` |
| I2-S29-ACC-005 | Regression/data/visual не ухудшены | guard scenarios `4 passed / 2 skipped`; homepage `7 passed / 2 skipped`; full `36`: `34 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S29 закрывает только единый exact demo-safety contract активного локального renderer. Не доказаны quantity/price/tax, cart update/remove, reservation, persistence/concurrency, auth/guest policy, production checkout/order/payment и cross-install classic/Blocks acceptance.

### I2-S30 — guest My Account entrypoint baseline

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S30-ACC-001 | Header entry ведёт на canonical same-origin Woo route | первый account action имеет непустой same-origin URL, exact pathname `/my-account/`, без query/fragment | `PASS` |
| I2-S30-ACC-002 | Responsive presentation соответствует текущему CSS | desktop entry видима и содержит «Войти»; на `390/360` тот же DOM/href намеренно hidden | `PASS` |
| I2-S30-ACC-003 | Guest destination технически пригодна | successful document, `body.woocommerce-account`, ровно одна visible Woo login form и visible username/password/login controls | `PASS` |
| I2-S30-ACC-004 | Базовые UX/runtime gates проходят | horizontal overflow отсутствует; axe serious/critical `0`; console/page errors `0` на `1440/390/360` | `PASS` |
| I2-S30-ACC-005 | Regression/data/visual не ухудшены | targeted `3 passed`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S30 закрывает только гостевой entrypoint и форму текущего локального My Account. Successful login/logout, registration/password reset, cookies/session fixation/CSRF, IDOR, roles, orders/customer data, privacy и production IAM остаются open.

### I2-S31 — exact temporary shop manager cleanup

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S31-ACC-001 | Cleanup identifier известен независимо от user ID | unique username объявлен до create; REST response exact-equal username и role `shop_manager` | `PASS` |
| I2-S31-ACC-002 | Normal run проверяет exact lookup и сохраняет found IDs | encoded search выполняется всегда; client filter требует exact username, positive ID и non-admin; found IDs добавляются до known-ID validation | `PASS` |
| I2-S31-ACC-003 | Delete остаётся узким и admin-safe | удаляется deduplicated known/found union; каждый ID повторно проверяется как non-admin; delete возвращает `deleted=true`, GET — `404`, repeated exact lookup — `0` | `PASS` |
| I2-S31-ACC-004 | Lookup error не отменяет доступный cleanup и state verification | доступный union удаляется до rethrow; outer `finally` сохраняет Settings/form и stored selection exact snapshots | `PASS` |
| I2-S31-ACC-005 | Regression/data/visual не ухудшены | targeted `1 passed`; admin `7 passed`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S31 закрывает только cleanup test-only `shop_manager` identity при выполнении `finally`. Hard kill, старые usernames других marker, отказ delete/БД/сети/Settings, concurrency, error aggregation и production IAM остаются вне scope.

### I2-S32 — exact hero content restore

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S32-ACC-001 | Baseline снят до mutation | exact `hero_title` прочитан из Settings; public `.az-heading-line` сохранены как непустой normalized text array | `PASS` |
| I2-S32-ACC-002 | Изменение реально проходит оба слоя | marker exact-сохранён в admin field и exact-отрендерен в public hero до cleanup | `PASS` |
| I2-S32-ACC-003 | `finally` подтверждает exact stored restore | original value повторно сохранён; перезагруженное поле exact-equal исходному | `PASS` |
| I2-S32-ACC-004 | Successful path подтверждает exact public restore | normalized text и порядок `.az-heading-line` exact-equal pre-mutation snapshot; category/popular/stock restore gates сохранены | `PASS` |
| I2-S32-ACC-005 | Regression/data/visual не ухудшены | targeted `1 passed`; admin `7 passed`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S32 закрывает только successful-path mutation isolation одного presentation field. Raw HTML/classes/edge whitespace, public verification после внутренней ошибки или hard kill, failed save/DB/network, concurrent writes, versioning/audit и production CMS acceptance остаются вне scope.

### I2-S33 — guest login form wiring

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S33-ACC-001 | Form transport остаётся canonical и same-origin | effective action exact `/my-account/` без query/hash; origin совпадает; method POST | `PASS` |
| I2-S33-ACC-002 | Credential controls имеют точную browser semantics | username text/autocomplete/required/aria-required; password password/current-password/required/aria-required; names exact | `PASS` |
| I2-S33-ACC-003 | Submit и hidden wiring присутствуют однозначно | button type submit; один hidden non-empty `woocommerce-login-nonce`; один `_wp_http_referer` exact `/my-account/` | `PASS` |
| I2-S33-ACC-004 | Reset entrypoint canonical | один lost-password link; same-origin exact `/my-account/lost-password/` без query/hash | `PASS` |
| I2-S33-ACC-005 | Responsive/runtime gates сохранены | targeted `3 passed` на `1440/390/360`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S33 закрывает только browser-visible DOM/wiring текущего pinned Woo renderer. Наличие nonce не доказывает его server-side enforcement; login/error/reset, cookies/session, CSRF attack, rate limiting, MFA, IDOR, roles/customer data и production IAM остаются вне scope.

### I2-S34 — product-search form wiring

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S34-ACC-001 | Form transport exact и same-origin | одна `form.az-search`; method exact GET; effective action same-origin exact `/` без query/hash | `PASS` |
| I2-S34-ACC-002 | Query control имеет точную semantics | accessible searchbox имеет `type=search`, `name=s`, exact placeholder | `PASS` |
| I2-S34-ACC-003 | Product-only scope явно передаётся | один hidden control `name=post_type`, `type=hidden`, value exact `product` | `PASS` |
| I2-S34-ACC-004 | Submit control и фактический GET сохранены | один exact «Найти» button `type=submit`; special-character query и `post_type` exact-preserved в result URL | `PASS` |
| I2-S34-ACC-005 | Responsive/runtime gates сохранены | targeted `3 passed` на `1440/390/360`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S34 закрывает только browser-visible wiring текущей header form. Search index, fields, ranking, normalization, server completeness, OEM/article/brand semantics, SEO и production business acceptance остаются вне scope.

### I2-S35 — cart/checkout link wiring

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S35-ACC-001 | Header cart link однозначна и same-origin | одна `.az-cart-link`; href origin совпадает с page origin | `PASS` |
| I2-S35-ACC-002 | Cart route exact до и после клика | pre-click path exact `/cart/`, query/hash пусты; post-click pathname exact `/cart/` | `PASS` |
| I2-S35-ACC-003 | Active checkout branch однозначна | classic/Blocks union содержит ровно одну видимую link с непустым href | `PASS` |
| I2-S35-ACC-004 | Checkout route exact до и после клика | pre-click same-origin path exact `/checkout/`, query/hash пусты; post-click pathname exact `/checkout/`; guard notice сохранён | `PASS` |
| I2-S35-ACC-005 | Responsive/runtime gates сохранены | targeted `3 passed` на `1440/390/360`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S35 закрывает только browser-visible link wiring текущего pinned classic/Blocks renderer. Redirect/SEO policy, cross-install Woo compatibility, cart persistence, quantity/price/tax/stock/reservation, auth, production checkout/order/payment остаются вне scope.

### I2-S36 — marked PDP add-to-cart form identity

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S36-ACC-001 | Catalog identity однозначна | marked loop card содержит одну add-to-cart anchor; `data-product_id` — positive numeric string | `PASS` |
| I2-S36-ACC-002 | PDP form transport exact | одна `form.cart`; method exact POST; effective action same-origin и exact текущий product path без query/hash | `PASS` |
| I2-S36-ACC-003 | Submit identity совпадает с loop product | один `button.single_add_to_cart_button[name=add-to-cart]`; type submit; value exact-equal loop product ID | `PASS` |
| I2-S36-ACC-004 | Demo action label exact | submit text exact `Добавить в демо-корзину`; cart state не мутируется | `PASS` |
| I2-S36-ACC-005 | Responsive/runtime gates сохранены | targeted `3 passed` на `1440/390/360`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S36 закрывает только browser-visible identity/transport wiring текущего pinned simple-product renderer. Cart state, quantity/price/stock/reservation, variable/external products, cross-install Woo compatibility и production commerce остаются вне scope.

### I2-S37 — exact temporary category archive URL

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S37-ACC-001 | PDP taxonomy link однозначна | exact category name возвращает одну link с непустым href | `PASS` |
| I2-S37-ACC-002 | Pre-navigation URL exact | href same-origin; path exact `/product-category/{fixture-slug}/`; query/hash пусты | `PASS` |
| I2-S37-ACC-003 | Actual navigation сохраняет URL contract | loaded origin/path exact-equal href; query/hash пусты; body `tax-product_cat` и exact H1 сохранены | `PASS` |
| I2-S37-ACC-004 | Existing archive isolation/cleanup сохранены | одна exact fixture card без demo semantics; product→category cleanup, ID `404`, repeated SKU/slug lookup `0` | `PASS` |
| I2-S37-ACC-005 | Regression/data/visual не ухудшены | targeted `1 passed`; admin `7 passed`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S37 закрывает только exact URL contract self-contained temporary category при текущей permalink-конфигурации. Taxonomy master/legacy redirects, SEO/canonical policy, arbitrary Unicode slugs, cross-install Woo acceptance и production lifecycle остаются вне scope.

### I2-S38 — unmarked PDP add-to-cart form identity

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S38-ACC-001 | Loop action сохраняет REST identity | одна add-to-cart anchor; `data-product_id` exact-equal temporary product ID; action visible/non-empty/non-demo | `PASS` |
| I2-S38-ACC-002 | PDP form transport exact | одна `form.cart`; method exact POST; effective action same-origin/current-product path; query/hash пусты | `PASS` |
| I2-S38-ACC-003 | PDP submit сохраняет REST identity | один named submit; type submit; value exact-equal temporary product ID | `PASS` |
| I2-S38-ACC-004 | Negative demo boundary сохранена | submit visible, non-empty и не содержит demo-copy; exact locale label намеренно не фиксируется | `PASS` |
| I2-S38-ACC-005 | Regression/data/visual не ухудшены | targeted `1 passed`; admin `7 passed`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S38 закрывает только browser-visible identity/transport одного temporary unmarked simple product. Cart state, localization, quantity/price/stock/reservation, variable/external products, cross-install Woo compatibility и production commerce остаются вне scope.

### I2-S39 — exact AJAX add-to-cart request

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S39-ACC-001 | CTA transport inputs однозначны | source card ID exact-equal CTA `data-product_id`; `data-quantity` exact `1` | `PASS` |
| I2-S39-ACC-002 | AJAX endpoint exact | request method POST; URL same-origin root; единственный `wc-ajax=add_to_cart`; hash пуст | `PASS` |
| I2-S39-ACC-003 | POST payload сохраняет source identity | URL-encoded payload содержит ровно один exact `product_id` и quantity `1` | `PASS` |
| I2-S39-ACC-004 | Existing response/result identity сохранена | HTTP success/no error; CTA added; badge `1`; одна cart row exact title/permalink; checkout guards сохранены | `PASS` |
| I2-S39-ACC-005 | Responsive/runtime gates сохранены | targeted `3 passed` на `1440/390/360`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S39 закрывает только request transport одного simple demo item текущего pinned Woo AJAX renderer. Response fragment schema, update/remove/duplicate/concurrency, price/tax/stock/reservation/persistence и production cart correctness остаются вне scope.

### I2-S40 — exact header catalog-link navigation

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S40-ACC-001 | Header control имеет exact link semantics | ровно один visible `a.az-catalog-button`; accessible name exact `Каталог товаров` | `PASS` |
| I2-S40-ACC-002 | Pre-click destination exact | href same-origin exact `/shop/`; query/hash пусты | `PASS` |
| I2-S40-ACC-003 | Фактическая навигация сохраняет contract | click загружает тот же origin/path; query/hash остаются пустыми | `PASS` |
| I2-S40-ACC-004 | Existing catalog identity сохранена | shop H1, breadcrumb, curated category/product checks, a11y/no-overflow/runtime и visual capture сохранены | `PASS` |
| I2-S40-ACC-005 | Responsive/regression gates сохранены | targeted `3 passed` на `1440/390/360`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S40 закрывает только browser-visible wiring текущей configured header catalog link в pinned local renderer. Woo page-option repair, redirect/canonical/SEO policy, arbitrary permalink/proxy behavior, cross-install compatibility и production catalog acceptance остаются вне scope.

### I2-S41 — guest remember-me control wiring

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S41-ACC-001 | Remember-me структура однозначна | одна visible label; один direct-child `#rememberme[name=rememberme]`; один adjacent visible text span | `PASS` |
| I2-S41-ACC-002 | Checkbox semantics exact | input type checkbox, value `forever`, non-empty accessible name | `PASS` |
| I2-S41-ACC-003 | Default и client toggle сохранены | initial unchecked; два клика по text span дают unchecked → checked → unchecked | `PASS` |
| I2-S41-ACC-004 | Срез не инициирует auth mutation | test не вводит credentials и не активирует submit; проверяется только client checkbox round-trip | `PASS` |
| I2-S41-ACC-005 | Responsive/regression gates сохранены | targeted `3 passed` на `1440/390/360`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S41 закрывает только DOM structure/default state/browser label-toggle текущего pinned Woo guest renderer. POST payload/server handling, cookie/session lifetime, persistence, login/logout/reset, CSRF, privacy/consent, localization, other browsers/versions и production IAM остаются вне scope.

### I2-S42 — responsive primary-navigation toggle

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S42-ACC-001 | Toggle и panel связаны однозначно | один button с `data-nav-toggle`, `aria-controls=az-primary-nav`, type button; один matching `#az-primary-nav[data-nav-panel]` | `PASS` |
| I2-S42-ACC-002 | Initial state viewport-aware | `aria-expanded=false`, panel без `is-open`; desktop toggle hidden/panel visible; mobile toggle visible/panel hidden | `PASS` |
| I2-S42-ACC-003 | Mobile accessibility/state exact | на 390/360 visible toggle имеет accessible name `Открыть меню`; первый click даёт expanded/open/visible, второй exact-restores collapsed/closed/hidden | `PASS` |
| I2-S42-ACC-004 | Desktop semantics не переутверждены | hidden desktop toggle проверяет только DOM screen-reader text; accessible-name assertion применяется только к visible mobile control | `PASS` |
| I2-S42-ACC-005 | Responsive/regression gates сохранены | targeted `3 passed` на `1440/390/360`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S42 закрывает только current-renderer DOM binding и viewport-aware open/close state. Menu link destinations, keyboard/focus/Escape/outside-click, dynamic button name, resize/orientation, persistence, other browsers и production navigation acceptance остаются вне scope.

### I2-S43 — header city status-dialog keyboard contract

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S43-ACC-001 | City trigger exact | один visible button, type button, delivery status key, dialog semantics и accessible name `Выбрать город` | `PASS` |
| I2-S43-ACC-002 | Initial dialog state closed | один labelled native dialog, hidden, boolean `open` отсутствует | `PASS` |
| I2-S43-ACC-003 | Keyboard open/focus exact | focused trigger + Enter открывает dialog; accessible name exact; close button автоматически focused | `PASS` |
| I2-S43-ACC-004 | Blocked-state copy и close exact | exact DEC-001/014 delivery copy; Enter на close скрывает dialog, убирает `open`, возвращает focus trigger | `PASS` |
| I2-S43-ACC-005 | Responsive/regression gates сохранены | targeted `3 passed` на `1440/390/360`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S43 закрывает только current theme-owned blocked-state copy, native-dialog keyboard open/close и focus round-trip в Chrome. Реальный city selection/persistence, geolocation, delivery methods/cost, other status keys/dialogs, Escape/backdrop, screen-reader/browser matrix и production delivery остаются вне scope.

### I2-S44 — guest password-visibility toggle wiring

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S44-ACC-001 | Toggle exact-linked | один visible sibling button после `#password`, exact `aria-describedby=password`, type button | `PASS` |
| I2-S44-ACC-002 | Initial label usable | initial aria-label non-empty и exact-equal accessible name без locale claim | `PASS` |
| I2-S44-ACC-003 | Reveal state exact | click меняет password type на text и aria-label/accessibility name на другое non-empty значение | `PASS` |
| I2-S44-ACC-004 | Conceal state exact-restored | второй explicit click возвращает type password и исходные aria-label/accessibility name | `PASS` |
| I2-S44-ACC-005 | Responsive/regression gates сохранены | targeted `3 passed` на `1440/390/360`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S44 закрывает только current Woo-injected DOM/client type/accessibility-label round-trip в Chrome. Exact localization, credential value, keyboard/focus, submit/POST/auth/session, OS capture, clipboard/autofill/password managers, AT/browser matrix, cross-version и production security остаются вне scope.

### I2-S45 — contact-dialog keyboard/focus contract

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S45-ACC-001 | Rendered opener semantics exact | каждый текущий `button[data-contact-open]` имеет `aria-haspopup=dialog`; выбран один visible header button с type/button marker и accessible name `Связаться с нами` | `PASS` |
| I2-S45-ACC-002 | Initial dialog state exact | один `dialog[data-contact-dialog]`, labelled `az-contact-title`, initial hidden и без boolean `open` | `PASS` |
| I2-S45-ACC-003 | Keyboard open/focus exact | focused opener + Enter открывает labelled dialog; close button автоматически focused | `PASS` |
| I2-S45-ACC-004 | Channel rendering relational | ровно два visible current contact anchors; phone href exact-equal `tel:` + normalized visible text, email href exact-equal `mailto:` + visible text; значения не hardcoded и ссылки не активируются; `UI-SCR001-003/004` только renderer partial | `PASS` |
| I2-S45-ACC-005 | Close/focus origin exact | Enter на close скрывает dialog, убирает `open` и возвращает focus фактическому opener; mobile nav после сценария exact-restored `aria-expanded=false`, no `is-open`, hidden | `PASS` |
| I2-S45-ACC-006 | Responsive/regression gates сохранены | targeted `3 passed` на `1440/390/360`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0`; PHP/JS syntax и config preflight `10 passed` | `PASS` |

I2-S45 закрывает только current theme-owned SCR-001 native-dialog semantics, renderer relation и keyboard/focus round-trip в Chrome. Реальность/доступность phone/email, external app activation, hours/holidays, Telegram/MAX, callback/form/CRM/SLA, AT/browser matrix и production contact acceptance остаются вне scope.

### I2-S46 — mobile primary-nav Escape/focus contract

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S46-ACC-001 | Existing toggle behavior preserved | shared state helper synchronizes exact `aria-expanded` and `is-open`; click round-trip remains open→closed on 390/360 | `PASS` |
| I2-S46-ACC-002 | Toggle keyboard Escape exact | focused toggle Enter-opens while focus remains toggle; Escape exact-restores expanded false, no `is-open`, hidden panel and toggle focus | `PASS` |
| I2-S46-ACC-003 | Panel-descendant Escape exact | second Enter opens; Tab focuses exact first visible link `Выбрать автомобиль`; bubbled Escape closes and returns focus to toggle | `PASS` |
| I2-S46-ACC-004 | Closed Escape is no-op | second Escape in collapsed state preserves expanded false, no `is-open`, hidden panel and toggle focus | `PASS` |
| I2-S46-ACC-005 | Desktop boundary unchanged | desktop toggle remains hidden and panel visible; mobile-only keyboard assertions are viewport-gated | `PASS` |
| I2-S46-ACC-006 | Responsive/regression gates preserved | targeted `3 passed`; full `39`: `37 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0`; JavaScript syntax `PASS`; independent review no findings | `PASS` |

I2-S46 closes only the current provisional 390/360 Chrome renderer Escape/focus contract. Outside-click, dynamic button name, focus trap/roving tabindex, link activation/destinations, scroll lock, resize/orientation/breakpoint transitions, Space/AT/browser matrix, approved mobile design and production navigation acceptance remain outside scope.

### I2-S47 — homepage blocked status-dialog router/focus contract

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S47-ACC-001 | Rendered trigger semantics exact | каждый current `button[data-status-dialog]` имеет type button и `aria-haspopup=dialog`; Vehicle/VIN/B2B exact selectors существуют по одному, visible и имеют non-empty accessible name | `PASS` |
| I2-S47-ACC-002 | Vehicle blocked copy exact | focused Vehicle trigger + Enter открывает единственный labelled dialog с exact DEC-004/catalog-source copy | `PASS` |
| I2-S47-ACC-003 | VIN/B2B blocked copy exact | focused VIN/B2B trigger + Enter по очереди заменяет copy exact DEC-017/018 и DEC-016 messages; B2B label не hardcoded | `PASS` |
| I2-S47-ACC-004 | Close/focus/URL exact | каждый open auto-focuses close; Enter closes/removes `open`, returns focus actual opener; page URL exact unchanged | `PASS` |
| I2-S47-ACC-005 | Router fails closed on hostile keys | own-property allowlist rejects `unknown`, `constructor`, `toString`, `__proto__`; dialog stays hidden, prior copy and URL unchanged | `PASS` |
| I2-S47-ACC-006 | Responsive/regression gates preserved | PHP/JS syntax `PASS`; targeted `3 passed`; full `42`: `40 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0`; independent review finding fixed | `PASS` |

I2-S47 closes only the current theme/Chrome fail-closed status renderer for already blocked homepage actions. Vehicle/fitment data, VIN validation/submit/contacts/consent/CRM/SLA, B2B application/onboarding/verification/privileges/prices, persistence, AT/browser matrix and production domain acceptance remain outside scope; DEC-004/016/017/018 stay open.

### I2-S48 — mobile primary-nav dynamic accessible name

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S48-ACC-001 | Localized single name source exact | toggle carries escaped exact open/close data labels; exactly one marked hidden-text node starts with `Открыть меню`; no parallel `aria-label` | `PASS` |
| I2-S48-ACC-002 | Initial viewport boundary exact | desktop hidden toggle checked at DOM-text level only; mobile visible toggle computed accessible name exact `Открыть меню` | `PASS` |
| I2-S48-ACC-003 | Pointer name round-trip exact | mobile pointer open synchronizes expanded/panel/name `Закрыть меню`; second click restores collapsed/name `Открыть меню` | `PASS` |
| I2-S48-ACC-004 | Keyboard name round-trip exact | Enter open gives `Закрыть меню`; Escape from toggle and from first panel link each restores `Открыть меню`; closed Escape keeps it unchanged | `PASS` |
| I2-S48-ACC-005 | Existing contact-nav path exact | mobile nav opened for contact trigger reports `Закрыть меню`; post-dialog collapse restores expanded false/no class/hidden/name `Открыть меню` | `PASS` |
| I2-S48-ACC-006 | Responsive/regression gates preserved | PHP/JS syntax `PASS`; targeted `3 passed`; full `42`: `40 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0`; analyst review no findings | `PASS` |

I2-S48 closes only the current provisional 390/360 Chrome computed accessible-name round-trip. It does not prove announcement by a real screen reader, live-region behavior, AT/browser matrix, visible icon/text state, focus trap/outside-click, resize/orientation, approved mobile design, full WCAG/TC-040 or production navigation acceptance.

### I2-S49 — native dialog Escape/outside-pointer dismissal

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S49-ACC-001 | Contact Escape dismissal exact | exact contact opener reopens labelled native dialog; Escape hides/removes `open` and returns focus opener | `PASS` |
| I2-S49-ACC-002 | Contact outside-pointer path exact | child title click preserves open; helper derives an actual viewport corner outside dialog rect and real mouse click closes/restores opener | `PASS` |
| I2-S49-ACC-003 | Mobile nav independence exact | after both contact dismissals mobile nav remains expanded/visible with name `Закрыть меню`; explicit final click restores collapsed/open-label state | `PASS` |
| I2-S49-ACC-004 | Shared status Escape dismissal exact | exact city opener reopens shared status dialog; Escape closes/removes `open` and returns city focus | `PASS` |
| I2-S49-ACC-005 | Shared status outside-pointer path exact | status child-title click stays open; real dynamically outside-rect pointer click closes and restores city focus | `PASS` |
| I2-S49-ACC-006 | Responsive/regression gates preserved | targeted `3 passed`; full `42`: `40 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0`; read-only audit confirms no production change needed | `PASS` |

I2-S49 closes only Escape plus the outside-rectangle primary-pointer path for the two current theme-owned native dialogs in pinned Chrome. Bare-dialog padding/border targets, touch-specific gestures, mobile-nav outside-click, all other openers/keys, cancel interception, nested/dirty dialogs, scroll lock/animation/resize/back, AT/browser matrix and real contact/delivery acceptance remain outside scope.

### I2-S50 — guest password-toggle keyboard/focus contract

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S50-ACC-001 | Exact local keyboard reach | focused `#password` plus one Tab reaches its exact sibling native `button.show-password-input` on `1440/390/360` | `PASS` |
| I2-S50-ACC-002 | Enter reveal and focus handoff exact | Enter changes `type=password→text` and reveal→conceal accessible name; pinned Woo transfers focus to the empty password input | `PASS` |
| I2-S50-ACC-003 | Space conceal and name round-trip exact | one Tab reaches the same toggle again; Space changes `type=text→password`, restores the original accessible name and transfers focus to the empty input | `PASS` |
| I2-S50-ACC-004 | No auth/navigation mutation | credentials remain empty, submit is not activated and pathname remains exact `/my-account/` | `PASS` |
| I2-S50-ACC-005 | Responsive/regression gates preserved | targeted `3 passed`; full `42`: `40 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0`; independent review no findings | `PASS` |

I2-S50 closes only the current pinned Woo/Chrome DOM/keyboard/type/accessibility-label/focus handoff for the guest password-visibility control. It does not prove credentials, submit/POST, successful or failed login, session/cookie/CSRF enforcement, localization, visible-focus manual review, OS capture, autofill/password-manager behavior, screen-reader/AT/browser matrix, cross-Woo-version compatibility or production IAM/security acceptance.

### I2-S51 — guest remember-me keyboard/focus contract

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S51-ACC-001 | Exact local Tab order | focused password input plus Tab reaches the exact visibility button; the next Tab reaches exact `#rememberme` on `1440/390/360` | `PASS` |
| I2-S51-ACC-002 | Computed focus style exists | keyboard-focused checkbox has a computed non-`none` box-shadow or non-`none` positive-width outline | `PASS / TECHNICAL` |
| I2-S51-ACC-003 | Native Space round-trip exact | Space checks then unchecks; checkbox retains focus and the exact visible-label-derived accessible name after both activations | `PASS` |
| I2-S51-ACC-004 | No auth/navigation mutation | username/password remain empty and pathname remains exact `/my-account/`; pointer S41 round-trip remains passing | `PASS` |
| I2-S51-ACC-005 | Responsive/regression gates preserved | targeted `3 passed`; full `42`: `40 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0`; traceability review finding excluded checkout `TC-040` from claims | `PASS` |

I2-S51 closes only the current pinned Woo/Chrome native checkbox Tab/Space/focus/name round-trip and computed focus-style presence. It does not prove focus contrast or actual rendered visibility, the full form tab order, Enter behavior, credential entry, submit/POST, remember-cookie/session persistence, login/auth/server handling, localization, screen-reader/AT/browser matrix, cross-Woo-version compatibility, full WCAG acceptance or production IAM/security.

### I2-S52 — mobile primary-nav native Space activation

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S52-ACC-001 | Mobile initial boundary exact | on `390/360` the visible exact toggle starts collapsed, named `Открыть меню` and is focused after the existing closed-Escape contract | `PASS` |
| I2-S52-ACC-002 | Native Space open exact | Space produces `aria-expanded=true`, panel `is-open` + visible, hidden label/computed name `Закрыть меню`, while toggle retains focus | `PASS` |
| I2-S52-ACC-003 | Native Space close exact | second Space restores expanded false, removes `is-open`, hides panel, restores hidden label/computed name `Открыть меню` and retains toggle focus | `PASS` |
| I2-S52-ACC-004 | Route/vertical position remain stable | exact pathname and `window.scrollY` captured before activation remain unchanged after both Space presses | `PASS / TECHNICAL` |
| I2-S52-ACC-005 | Desktop/regression gates preserved | desktop retains hidden-toggle/visible-panel presentation boundary; targeted `3 passed`; full `42`: `40 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S52 closes only the current provisional Chrome `390/360` native Space state/name/focus/pathname/vertical-scroll round-trip; desktop evidence is the initial presentation boundary only. It does not prove link activation/destinations, full tab order, outside-click, focus trap, full scroll/scroll-lock behavior, resize/orientation, touch/real-device behavior, screen-reader announcement, AT/browser matrix, approved mobile design, full WCAG or production navigation acceptance. `DG-017/018` remain open and checkout `TC-040` is not claimed.

### I2-S53 — guest login-form local Tab order

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S53-ACC-001 | Six exact local stops are usable | username, password, visibility button, remember checkbox, login submit and lost-password anchor each have one visible instance and a non-empty accessible name | `PASS` |
| I2-S53-ACC-002 | Forward local order exact | from focused username, five successive Tab presses focus the remaining controls in exact DOM/interaction order | `PASS` |
| I2-S53-ACC-003 | Reverse local order exact | from lost-password anchor, five successive Shift+Tab presses return through the exact reverse sequence to username | `PASS` |
| I2-S53-ACC-004 | Directional-leg state remains exact | after programmatically focusing username, the S53 traversal segment emits only Tab/Shift+Tab; after forward and reverse legs exact page URL, empty username/password, `type=password` and unchecked remember state remain unchanged | `PASS / TECHNICAL` |
| I2-S53-ACC-005 | Responsive/regression gates preserved | targeted `3 passed`; full `42`: `40 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0`; independent review no findings | `PASS` |

I2-S53 closes only the current pinned Woo/Chrome six-stop local login-form forward/reverse focus order and end-of-each-leg URL/state stability under Tab/Shift+Tab input. It does not prove entry from before username, behavior after the lost-password anchor, wrap/cycle/focus trap, full-page order, focus-style visibility/contrast for every control, click/Enter/Space activation, credential validation, submit/POST, login/session/cookies, lost-password recovery, localization, screen-reader/AT/browser matrix, cross-Woo-version compatibility, full WCAG or production IAM/security. `DG-002/018` remain open; `TC-040`, `TC-037/038` and `FR-AUTH-003` are not claimed.

### I2-S54 — skip-link target focus transfer

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S54-ACC-001 | Main target is programmatically focusable without joining sequential order | `front-page.php`, `page.php`, `woocommerce.php`, `index.php` each render exact `main#primary[tabindex="-1"]`; PHP lint passes all four | `PASS / SOURCE` |
| I2-S54-ACC-002 | Representative entrypoints expose the exact skip link | on `/`, `/delivery/`, `/shop/`, first desktop Tab focuses visible `.az-skip-link[href="#primary"]` | `PASS` |
| I2-S54-ACC-003 | Skip link has a computed focus style | each representative route reports a non-`none` box-shadow or non-`none` positive-width outline while the link is keyboard-focused | `PASS / TECHNICAL` |
| I2-S54-ACC-004 | Enter transfers focus to primary content | on each representative route Enter yields URL ending `#primary`; exact visible `main#primary[tabindex="-1"]` becomes activeElement | `PASS` |
| I2-S54-ACC-005 | Regression/data gates preserved | pre-fix focus assertion failed as expected; post-fix targeted `1 passed`; full `42`: `40 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S54 closes only the pinned desktop Chrome skip-link focus-transfer path for representative front-page, regular-page and Woo renderer families. `index.php` has source/lint evidence but no stable runtime route in this slice. It does not prove mobile behavior, every route/template combination, actual focus-style contrast/manual appearance, screen-reader announcement, AT/browser matrix, full-page tab order, routing/SEO/content, full WCAG or business acceptance. `DG-018` remains open; checkout `TC-040` is not claimed.

### I2-S55 — compact-header account/cart accessible names

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S55-ACC-001 | Exact ARIA relations survive hidden visual labels | at `900×900`, each hidden label span exists once with exact ID; account/cart anchors reference exact IDs, cart also references the one visible count badge ID | `PASS` |
| I2-S55-ACC-002 | Computed names remain truthful | account exact name is `Войти`; cart exact name is `Корзина {current visible numeric badge text}` | `PASS` |
| I2-S55-ACC-003 | Entrypoint hrefs remain canonical | account same-origin exact `/my-account/`; cart same-origin exact `/cart/`; query/hash empty | `PASS` |
| I2-S55-ACC-004 | Compact header axe gate is clean | header-scoped axe has zero serious/critical violations at exact `900×900` | `PASS / TECHNICAL` |
| I2-S55-ACC-005 | Regression/data gates preserved | pre-fix account exact-name assertion failed; post-fix targeted `1 passed`; `header.php` lint; full `43`: `41 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S55 closes only current guest compact-header renderer relationships and initial computed accessible names at exact `900px` in pinned Chrome. It does not prove authenticated header states, link activation, login/cart mutation, cart count post-AJAX accessible-name refresh or live announcement, pluralization, focus order/style, account-link design at `≤600px`, localization matrix, screen-reader/AT/browser matrix, full responsive/WCAG or production IAM/commerce acceptance. `DG-017/018` remain open and checkout `TC-040` is not claimed.

### I2-S56 — mobile-nav breakpoint state reconciliation

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S56-ACC-001 | Mobile state is open before crossing | on both `390/360`, exact toggle click gives expanded true, `is-open`, visible panel and computed name `Закрыть меню` | `PASS` |
| I2-S56-ACC-002 | Desktop crossing normalizes hidden-control DOM state | at exact `901px`, toggle is hidden and panel visible by desktop CSS; DOM state is false/no `is-open`, hidden label text `Открыть меню` | `PASS / TECHNICAL` |
| I2-S56-ACC-003 | Mobile re-entry remains collapsed | after returning to the exact original viewport, toggle is visible false/open-name, panel lacks `is-open` and is hidden | `PASS` |
| I2-S56-ACC-004 | Shared implementation and URL boundary remain exact | one document-lifetime MQL change listener calls existing `setNavOpen(false)` on both crossings; exact page URL remains unchanged | `PASS / TECHNICAL` |
| I2-S56-ACC-005 | Regression/data gates preserved | pre-fix mobile assertions retained true and failed; JS syntax `PASS`; targeted `3 passed`; full `43`: `41 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0` | `PASS` |

I2-S56 closes only current pinned Chrome exact `max-width:900px` boundary DOM-normalization and safe re-entry for initial `390/360` viewports. Because the desktop toggle is hidden, this does not claim desktop accessible-name or visible-panel `aria-expanded` semantics. It also does not prove focus/scroll preservation, arbitrary repeated/same-side resize, real orientation/device behavior, initial/bfcache/SPA reconciliation, link activation/content, screen-reader/AT/browser matrix, approved responsive design, full WCAG or production navigation acceptance. `DG-017/018` remain open and checkout `TC-040` is not claimed.

### I2-S57 — post-AJAX cart accessible-name refresh

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S57-ACC-001 | Existing real AJAX path remains exact | current Woo add-to-cart request succeeds, response is not error, CTA reaches added state and visible header badge becomes exact `1` | `PASS` |
| I2-S57-ACC-002 | Computed cart name follows the rendered badge | the one existing `.az-cart-link` has exact computed accessible name `Корзина 1` after the badge mutation | `PASS` |
| I2-S57-ACC-003 | Responsive renderer evidence is exact | the same post-AJAX badge/name state passes on `1440/390/360` | `PASS / TECHNICAL` |
| I2-S57-ACC-004 | Production and announcement scope remain unchanged | S57 changes only E2E evidence; no live region, custom announcement or cart production behavior is added | `PASS / SOURCE` |
| I2-S57-ACC-005 | Regression/data gates preserved | targeted `3 passed`; full `43`: `41 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0`; independent review no findings | `PASS` |

I2-S57 closes only the current pinned guest Woo/Chrome computed accessible-name state after one successful existing AJAX add. It does not prove that the changed name is announced by a real screen reader, any `aria-live` behavior, pluralization, whether the badge represents units or cart lines, multi-item/update/remove behavior, quantity/business correctness, persistence, concurrency, AT/browser matrix, full WCAG or production commerce acceptance. `DG-018` remains open; `TC-009/TC-040` are not claimed.

### I2-S58 — repeated AJAX add cart-counter consistency

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S58-ACC-001 | Both add requests retain exact identity | two separate successful same-origin root `wc-ajax=add_to_cart` POSTs each carry the exact rendered product ID and `quantity=1`; neither response reports Woo error | `PASS` |
| I2-S58-ACC-002 | Header count follows current Woo cart units | first add renders exact badge `1`; repeated same-product add renders exact `2` through `#az-cart-count` from `get_cart_contents_count()` | `PASS / TECHNICAL` |
| I2-S58-ACC-003 | Computed name follows each replaced badge | the existing S55 relation computes exact `Корзина 1`, then exact `Корзина 2` after the second fragment replacement | `PASS / TECHNICAL` |
| I2-S58-ACC-004 | Same-product cart identity remains exact | cart contains one row whose title and permalink exactly match the clicked source product on `1440/390/360` | `PASS` |
| I2-S58-ACC-005 | Regression/data gates preserved | pre-fix targeted `3 failed` with second badge still `1`; post-fix targeted `3 passed`; PHP/JS syntax; full `43`: `41 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0`; independent review P3 wording fixed and no code findings | `PASS` |

I2-S58 closes only the current pinned guest Woo/Chrome repeated same-product AJAX renderer consistency with the already-used Woo cart-contents count. It does not choose a business meaning for units versus lines, or prove arbitrary quantity, different products/offers, mixed cart, update/remove/reload/session persistence, auth, concurrency, price/stock/reservation, checkout/order/payment, live announcement/SR/AT, browser/Woo matrix, full WCAG or production commerce acceptance. `TC-009/TC-040` are not claimed.

### I2-S59 — mobile-nav outside-click dismissal

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S59-ACC-001 | Inside-panel click does not dismiss | real click in the visible mobile nav padding leaves exact true/`is-open`/visible state on `390/360` | `PASS` |
| I2-S59-ACC-002 | Non-interactive outside click closes truthfully | click on visible `main#primary h1` calls the shared state path and yields exact false/no `is-open`/hidden/`Открыть меню`; exact URL remains unchanged | `PASS` |
| I2-S59-ACC-003 | Outside action is not swallowed by reflow | exact visible hero VIN link retains same-origin/path/search and applies `#vin-request` while the nav reaches false/no-class/hidden | `PASS / TECHNICAL` |
| I2-S59-ACC-004 | Dialog event order preserves prior contract | clicks whose originating target belongs to a dialog do not dismiss nav even if the dialog removes `open` before document bubbling; existing close focus-return assertions pass | `PASS / TECHNICAL` |
| I2-S59-ACC-005 | Regression/data gates preserved | pre-fix targeted desktop passed/mobile `2 failed`; unsafe `pointerdown` fix rejected by P1 review; final JS syntax and targeted `3 passed`; full `43`: `41 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0`; final independent review no findings | `PASS` |

I2-S59 closes only current pinned Chrome outside-click state reconciliation on `390/360`, including one exact same-page activation and existing dialog event-order/focus-return contract. It does not prove explicit focus transfer after dismissal, focus trapping, arbitrary link destinations, scroll locking, real touch/swipe/multi-pointer behavior, shadow DOM/iframes, AT/browser/device matrix, approved mobile design, full WCAG or production navigation acceptance. `DG-017/018` remain open and `TC-040` is not claimed.

### I2-S60 — guest login local keyboard-focus style

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S60-ACC-001 | Traversal is keyboard-derived and exact | password focus + Shift+Tab reaches username; five real Tabs then reach password, visibility button, remember checkbox, login submit and lost-password link in order | `PASS / TECHNICAL` |
| I2-S60-ACC-002 | Every stop is in focus-visible state | all six exact controls are focused at assertion time and match Chrome `:focus-visible` on `1440/390/360` | `PASS / TECHNICAL` |
| I2-S60-ACC-003 | Ring signal is focus-specific and non-transparent | the passing box-shadow or outline branch itself differs from a truly unfocused baseline, has non-transparent computed color and non-zero geometry/width | `PASS / TECHNICAL` |
| I2-S60-ACC-004 | Form state remains inert | exact `/my-account/` URL, empty username/password, password type and unchecked remember state remain unchanged; no submit/POST occurs | `PASS` |
| I2-S60-ACC-005 | Regression/data gates preserved | initial presence-only helper rejected by P2 review; first hardening run exposed and fixed a declaration-order test error; branch-specific delta and true-unfocused baseline review findings closed; final targeted `3 passed`; full `43`: `41 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0`; final reviews no findings | `PASS` |

I2-S60 closes only the current pinned Chrome single-layer computed keyboard-focus signal for the six existing guest-login controls. It does not prove focus-ring color/contrast/occlusion or manual visibility, full-page/outside-form/wrap order, mouse-focus behavior, activation/submit/POST, credentials/auth/session/recovery, OS/autofill/password-manager behavior, AT/SR/browser/Woo matrix, full WCAG or production IAM/security. `DG-018` remains open and `TC-040` is not claimed.

### I2-S61 — homepage skip-link public-viewport transfer

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S61-ACC-001 | First keyboard stop is exact and unique | after a fresh homepage load, the first real Tab focuses the sole `.az-skip-link[href="#primary"]` on public projects `1440/390/360` | `PASS / TECHNICAL` |
| I2-S61-ACC-002 | Focused link is exposed in the viewport | the exact link is visible, matches `:focus-visible` and passes Playwright full-ratio in-viewport assertion at all three public widths | `PASS / TECHNICAL` |
| I2-S61-ACC-003 | Activation transfers URL fragment and focus exactly | Enter preserves origin/path/search, adds exact `#primary` and focuses the one visible `main#primary[tabindex="-1"]` | `PASS / TECHNICAL` |
| I2-S61-ACC-004 | Runtime and existing renderer evidence remain intact | no watched runtime errors; no production source changed; the earlier S54 desktop front/page/Woo renderer-family contract remains in the full suite | `PASS` |
| I2-S61-ACC-005 | Regression/data gates preserved | targeted `3 passed`; full `46`: `44 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0`; two independent reviews found no findings | `PASS` |

I2-S61 closes only the current homepage skip-link transfer in pinned Chrome public projects at `1440/390/360`, while I2-S54 retains desktop evidence for representative front-page, regular-page and Woo renderer families. It does not prove other mobile routes/renderer families, screen-reader announcement, focus-ring contrast/color/occlusion or manual visibility, touch-only behavior, AT/browser/device matrix, full WCAG or production business acceptance. `DG-018` remains open and `TC-040` is not claimed.

### I2-S62 — mobile-nav internal VIN-link dismissal/focus transfer

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S62-ACC-001 | Internal link and opt-in destination are exact | one visible/named `a.az-nav-cta--quiet[href="#vin-request"]` when the mobile panel is open; one `section#vin-request[tabindex="-1"]`, absent from the ordinary Tab sequence | `PASS / TECHNICAL` |
| I2-S62-ACC-002 | Pointer activation preserves action while dismissing | real pointer click produces false/no-class/hidden/`Открыть меню` and preserves origin/path/search plus exact `#vin-request` on `390/360` | `PASS / TECHNICAL` |
| I2-S62-ACC-003 | Keyboard activation does not lose focus | toggle opens by Enter, two real Tabs reach the exact link, Enter preserves the fragment, dismisses the panel and finishes focused on the visible opt-in VIN section | `PASS / TECHNICAL` |
| I2-S62-ACC-004 | Existing event boundaries remain intact | panel-padding click stays open; contact button/dialog ancestry and focus-return assertions remain passing; outside-link and desktop presentation paths remain passing | `PASS` |
| I2-S62-ACC-005 | Regression/data gates preserved | pre-fix desktop passed/mobile `2 failed` at retained expanded state; first fix targeted `3 passed`, then P2 hidden-focus finding was closed; final targeted `3 passed`; JS/PHP syntax; full `46`: `44 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0`; final reviews no findings | `PASS` |

I2-S62 closes only current pinned Chrome homepage behavior for the exact internal VIN anchor on `390/360`. It does not prove VIN validation/submit/contact/consent/CRM, destination business correctness, arbitrary panel anchors/routes/fragments or encoded IDs, pointer/outside-click focus outcome, scroll landing/in-viewport focus, focus-ring/announcement, modified clicks, touch/swipe/multi-pointer, screen-reader/AT/browser/device matrix, approved mobile design, full WCAG or production navigation/VIN acceptance. `DG-017/018` remain open; `FR-VIN-001` and `TC-040` are not claimed complete.

### I2-S63 — cross-page cart-header continuity

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S63-ACC-001 | Repeated AJAX state is exact before navigation | after two exact same-product `quantity=1` AJAX requests, the sole visible header link has visible badge `2`, exact label+badge `aria-labelledby` and computed name `Корзина 2` on `1440/390/360` | `PASS / TECHNICAL` |
| I2-S63-ACC-002 | Cart full navigation retains the header state | after canonical `/cart/` document navigation/network idle in the same guest context, the re-resolved visible header link/badge retain exact relation/count/name `2`/`Корзина 2` | `PASS / TECHNICAL` |
| I2-S63-ACC-003 | Checkout full navigation retains the header state | after canonical `/checkout/` document navigation/network idle in the same guest context, the re-resolved visible header link/badge retain exact relation/count/name `2`/`Корзина 2` | `PASS / TECHNICAL` |
| I2-S63-ACC-004 | Existing cart and demo-safety identity remain intact | one exact source-product cart row, canonical links, exact demo notices and disabled/blocked checkout renderer assertions remain passing | `PASS` |
| I2-S63-ACC-005 | Regression/data gates preserved | initial targeted `3 passed`; independent P3 review required explicit link/badge visibility and was closed; final targeted `3 passed`; full `46`: `44 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0`; final reviews no findings | `PASS` |

I2-S63 closes only current rendered header continuity through two canonical full navigations in one pinned Chrome guest browser context after two exact same-product unit adds. Network-idle evidence does not prove that the value came exclusively from server HTML rather than Woo post-load reconciliation. Manual reload, back/forward, new tab, browser restart, cookie TTL, authenticated merge, cross-device persistence, arbitrary/mixed quantities, update/remove/concurrency, price/stock/reservation, live announcement/SR/AT/browser/Woo matrix and production commerce remain outside scope. No units-vs-lines business rule or checkout `TC-040` completion is claimed.

### I2-S64 — guest lost-password keyboard entry/wiring

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S64-ACC-001 | Recovery entry is keyboard reachable | from the focused visible login submit, one real Tab reaches the login form's sole lost-password anchor; it is visible, named, focused and matches `:focus-visible` on `1440/390/360` | `PASS / TECHNICAL` |
| I2-S64-ACC-002 | Activation reaches the exact destination | Enter yields a successful document GET with the same origin, exact `/my-account/lost-password/` path and empty query/fragment | `PASS / TECHNICAL` |
| I2-S64-ACC-003 | Current reset renderer wiring is exact | one visible Woo reset form has effective same-origin exact POST action; one empty required identifier input with exact name/type/autocomplete and non-empty accessible name, hidden `wc_reset_password=true`, non-empty nonce, exact referer and one visible/named submit | `PASS / TECHNICAL` |
| I2-S64-ACC-004 | Scenario remains non-mutating and technically usable | identifier remains empty; no POST reaches the exact recovery action; no overflow/runtime errors; serious/critical automated axe violations empty on all three public projects | `PASS` |
| I2-S64-ACC-005 | Regression/data gates preserved | targeted `3 passed`; full `49`: `47 passed / 2 skipped`; 19 PNG hashes unchanged; inventory `10/0/0/0`; two independent reviews found no findings | `PASS` |

I2-S64 closes only keyboard GET navigation and browser-visible DOM/effective-action wiring for the current guest Woo reset renderer on pinned Chrome `1440/390/360`. It does not prove arrival focus/order/style, identifier validation or reset submission, neutral existing-vs-unknown response, enumeration resistance, email/token delivery/expiry/reuse, password change/login/session, nonce enforcement, CSRF/rate limiting, localization/copy approval, screen-reader/AT/browser/Woo matrix, full WCAG or production IAM/security. The nonce claim is presence-only, the axe gate is serious/critical automation only, and the no-POST claim applies only to the exact recovery action in this non-submit scenario. `DG-002/018` remain open; `FR-AUTH-003` is not claimed complete.

### I2-S65 — root README verification handoff sync

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S65-ACC-001 | Summary count matches latest verified suite | README top status reports exact `49 tests: 47 passed, 2 intentionally skipped`, matching acceptance/progress S64 evidence | `PASS / DOCUMENTATION` |
| I2-S65-ACC-002 | Detailed Tests handoff matches | README Tests section repeats exact `49/47/2` and retains the two viewport-independent Store API skip explanation | `PASS / DOCUMENTATION` |
| I2-S65-ACC-003 | Current technical highlights are represented | README now names responsive nav/focus, repeated/cross-page cart-header continuity and guest reset-entry wiring/no-submit evidence | `PASS / DOCUMENTATION` |
| I2-S65-ACC-004 | Safety/status boundaries remain truthful | server stays `NOT_DEPLOYED`; first-attempt Caddy file-capability failure, second-attempt healthy-Caddy/non-TTY boundary and the missing completed run/inventory/two-site before-after/public-admin smoke are explicit; DEC/demo/credential/admin-write warnings remain unchanged; no new deployment claim added | `PASS` |
| I2-S65-ACC-005 | Document diff is structurally clean | exact-string comparison and `git diff --check` pass; source evidence remains S64 full `49`: `47 passed / 2 skipped`, 19 PNG unchanged, inventory `10/0/0/0` | `PASS` |

I2-S65 is a handoff/documentation synchronization only. It adds no runtime, functional, business, security, WCAG, production or deployment evidence and does not prevent future README drift automatically.

### I2-S66 — current regression documentation drift guard

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S66-ACC-001 | Current verified aggregate is deliberate | filesystem-only Node test requires exact locked tuple `49/47/2/0`, one canonical current acceptance summary and valid total arithmetic | `PASS / DOCUMENTATION` |
| I2-S66-ACC-002 | Both README handoff locations stay aligned | line-anchored top-status and detailed Tests parsers each find exactly one summary and compare it with canonical total/passed/skipped | `PASS / DOCUMENTATION` |
| I2-S66-ACC-003 | Current implementation handoff stays aligned | exact current progress-table row and deployment verification bullet each compare all four values with the canonical tuple | `PASS / DOCUMENTATION` |
| I2-S66-ACC-004 | Guard is part of the standard preflight | targeted documentation test `1 passed`; combined explicit-file config/documentation preflight `11 passed`, `0 failed` | `PASS` |
| I2-S66-ACC-005 | Scope remains truthful | no production, Playwright spec, browser, screenshot, inventory or server mutation; latest runtime evidence remains I2-S64 `47 passed / 2 skipped`, 19 PNG unchanged and inventory `10/0/0/0` | `PASS` |

I2-S66 prevents silent disagreement among the selected current Markdown summaries and requires deliberate tuple updates. It does not derive results from a Playwright report, prove evidence freshness, validate historical counts or deployment chronology, auto-edit documents, or add functional/security/WCAG/production acceptance. Its anchored Markdown wording is intentionally a formatting contract.

### I2-S67 — immediate canonical cart reload continuity

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S67-ACC-001 | Canonical cart document reload succeeds without route drift | after two exact same-product AJAX additions and full cart navigation, `page.reload({ waitUntil: 'networkidle' })` returns successful response and preserves the exact URL | `PASS / TECHNICAL` |
| I2-S67-ACC-002 | Header cart state survives the reload | visible exact header link/badge retain `aria-labelledby`, count `2` and computed name `Корзина 2` on `1440/390/360` | `PASS / TECHNICAL` |
| I2-S67-ACC-003 | Exact cart identity and safety renderer survive the reload | one cart row remains; exact source product name/permalink and exact demo checkout notice are re-asserted from the reloaded document | `PASS / TECHNICAL` |
| I2-S67-ACC-004 | Journey continues from the new document | checkout locator is created after reload; canonical `/checkout/` navigation, header state and demo checkout guard remain successful | `PASS / TECHNICAL` |
| I2-S67-ACC-005 | Regression/data/visual gates remain clean | targeted `3 passed`; full `49`: `47 passed / 2 skipped`; 19 repository PNG unchanged; inventory `10/0/0/0` | `PASS` |

I2-S67 closes only one immediate canonical `/cart/` reload in the same guest Chrome context after two exact same-product `quantity=1` AJAX additions. It does not prove server-only rendering, delayed/repeated reload, back/forward, new tab, browser restart, cookie TTL, authenticated merge, cross-device behavior, arbitrary/mixed products or quantities, update/remove/concurrency/reservation, live SR/AT, other browsers, production persistence or commerce correctness.

### I2-S68 — checkout-to-cart browser Back continuity

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S68-ACC-001 | History starts from exact canonical destinations | cart and checkout post-click URLs each equal their prevalidated exact canonical href, not pathname-only approximations | `PASS / TECHNICAL` |
| I2-S68-ACC-002 | One browser Back restores the exact cart destination | `page.goBack({ waitUntil: 'networkidle' })` returns to the saved exact canonical cart URL without requiring a non-null Response | `PASS / TECHNICAL` |
| I2-S68-ACC-003 | Header and exact cart identity survive history restoration | visible header relation/count/name remain `2`/`Корзина 2`; one row retains exact source product name/permalink on `1440/390/360` | `PASS / TECHNICAL` |
| I2-S68-ACC-004 | Demo safety and runtime remain intact | exact cart demo notice is present after Back and runtime error collection remains empty | `PASS / TECHNICAL` |
| I2-S68-ACC-005 | Regression/data/visual gates remain clean | targeted `3 passed`; full `49`: `47 passed / 2 skipped`; 19 repository PNG unchanged; inventory `10/0/0/0` | `PASS` |

I2-S68 closes only one immediate checkout→cart browser Back traversal in the same page/context after the exact S67 journey. It deliberately does not attribute restoration to BFCache, browser cache or server response and does not prove Forward, repeated history, reload after Back, new tab/restart/cookie TTL, authenticated merge, cross-device behavior, arbitrary/mixed products or quantities, cart mutation/concurrency, AT/browser matrix or production persistence/commerce.

### I2-S69 — recovery-form local keyboard focus edge

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S69-ACC-001 | Local reverse traversal reaches the identifier | after programmatic submit focus seeds only the local edge, real `Shift+Tab` focuses the exact visible/named recovery identifier on `1440/390/360` | `PASS / TECHNICAL` |
| I2-S69-ACC-002 | Local forward traversal returns to submit | one real `Tab` from identifier focuses the exact visible/named recovery submit without an unexpected intermediate tab stop | `PASS / TECHNICAL` |
| I2-S69-ACC-003 | Each keyboard stop has a changed visible focus signal | identifier and submit both match `:focus-visible`; computed box-shadow or outline differs from its unfocused baseline, has non-transparent color and non-zero geometry | `PASS / TECHNICAL` |
| I2-S69-ACC-004 | Traversal remains non-mutating | exact recovery URL stays unchanged, identifier remains empty and no POST reaches the exact recovery action | `PASS` |
| I2-S69-ACC-005 | Regression/data/visual gates remain clean | targeted `3 passed`; full `49`: `47 passed / 2 skipped`; 19 repository PNG unchanged; inventory `10/0/0/0` | `PASS` |

I2-S69 closes only the local submit↔identifier keyboard edge after a programmatic submit seed in pinned Chrome/current Woo renderer. It does not prove arrival focus after GET, entry/full-page order, wrap/trap, activation, ring contrast/occlusion/manual appearance, screen-reader/AT or browser matrix, identifier validation/submission/neutral response/enumeration, email/token/password/session, nonce enforcement/CSRF/rate limiting or production IAM/security.

### I2-S70 — cart-to-checkout browser Forward restoration

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S70-ACC-001 | One Forward restores the exact checkout destination | after the verified checkout→cart Back, `page.goForward({ waitUntil: 'networkidle' })` returns to the prevalidated exact canonical checkout URL without requiring a Response | `PASS / TECHNICAL` |
| I2-S70-ACC-002 | Header cart state survives Forward | visible exact relation/count/name remain `2`/`Корзина 2` on `1440/390/360` | `PASS / TECHNICAL` |
| I2-S70-ACC-003 | Checkout safety renderer survives Forward | exact demo notice remains; classic button is disabled with `aria-disabled=true` and exact label, or the Woo Blocks checkout remains visible | `PASS / TECHNICAL` |
| I2-S70-ACC-004 | Runtime remains clean | page-level accumulated console/page error collections remain empty through reload, checkout, Back and Forward | `PASS` |
| I2-S70-ACC-005 | Regression/data/visual gates remain clean | targeted `3 passed`; full `49`: `47 passed / 2 skipped`; 19 repository PNG unchanged; inventory `10/0/0/0` | `PASS` |

I2-S70 closes only one immediate cart→checkout browser Forward after the exact S68 Back in the same page/context. It does not attribute restoration to BFCache/cache/server and does not prove repeated history, reload after history, new tab/restart/cookie TTL, auth merge, cross-device, arbitrary cart mutations, AT/browser matrix or production persistence/commerce.

### I2-S71 — Paper-aligned responsive demo cart presentation

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S71-ACC-001 | Cart has a distinct order-review composition | Russian H1/original eyebrow/copy and two-step indicator render before the untouched Woo Cart Block; the eyebrow was removed by I2-S75 while current step still exposes `aria-current=step` | `PASS / PROVISIONAL` |
| I2-S71-ACC-002 | Current Woo product remains the source of truth | after one real AJAX add, the sole row retains the exact source-card name, a visible decodable cart image, quantity `1`, header count `1` and canonical checkout href | `PASS / TECHNICAL` |
| I2-S71-ACC-003 | Controls and summary are localized and usable | exact Woo-chrome selectors localize desktop semantic headers, quantity/plus/remove accessible names, totals labels and checkout CTA without touching product copy; product rowheader remains exposed at every viewport and totals/CTA do not overlap | `PASS / PROVISIONAL` |
| I2-S71-ACC-004 | Responsive/a11y/runtime gates pass | targeted `3 passed` on `1440/390/360`; no horizontal overflow, serious/critical axe findings, console errors or page errors | `PASS` |
| I2-S71-ACC-005 | Visual/regression/data evidence is retained | 3 new deterministic cart screenshots; full `52`: `50 passed / 2 skipped`; 19 pre-existing repository PNG unchanged; inventory `10/0/0/0`; PHP/JS syntax checks pass | `PASS` |

I2-S71 changes the current Cart Block presentation only and remains `DESIGN_REVIEW_REQUIRED`: the classic CSS fallback is not separately accepted, and the slice does not claim Paper pixel-perfect acceptance or implement mixed warehouse/supplier grouping, offer source/ETA/freshness, selection/favorites, city/delivery, commercial validation, update/remove business rules, production checkout/order/payment or closure of any DEC.

### I2-S72 — Cart Block quantity/header synchronization

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S72-ACC-001 | Native plus uses the current Woo cart mutation path | from one exact row, plus completes same-origin Store API `/cart/update-item` directly or inside `/batch`; exact row key and `quantity=2` are asserted | `PASS / TECHNICAL` |
| I2-S72-ACC-002 | Header follows official Woo cart state | cart-only script depends on registered `wc-blocks-data-store`, reads `getCartData().itemsCount` and updates the existing badge; count/name become exact `2` / `Корзина 2` | `PASS / TECHNICAL` |
| I2-S72-ACC-003 | Row identity and reload continuity remain exact | the sole row retains the clicked source-product name; quantity/header state persists through one successful immediate exact-URL reload on `1440/390/360` | `PASS / TECHNICAL` |
| I2-S72-ACC-004 | Regression and residue gates remain clean | pre-fix header remained `1`; post-fix targeted `3 passed`, cart file `6 passed`, full `55`: `53 passed / 2 skipped`; no overflow/runtime errors; inventory `10/0/0/0` | `PASS` |

I2-S72 closes only one current Cart Block plus mutation from `1` to `2` in the same guest session. Minus/remove/empty, arbitrary/mixed carts, commercial quantity rules, price/stock/reservation/freshness/concurrency, auth merge/cross-device, live announcement/AT/browser matrix and production commerce remain open.

### I2-S73 — branded last-item removal and empty cart

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S73-ACC-001 | Native last-row remove is exact and successful | one current row key matches same-origin Store API remove-item request; direct response or the matched batch inner response has `status=200` and `body.items_count=0` | `PASS / TECHNICAL` |
| I2-S73-ACC-002 | Woo state is settled at zero | official Cart Store reports `itemsCount=0`, zero items, no pending operations and removed key no longer pending; header badge/name are exact `0` / `Корзина 0` | `PASS / TECHNICAL` |
| I2-S73-ACC-003 | Empty state is localized and focused | exactly one visible current empty block has honest Russian intro/title, one visible configured-shop CTA and opaque keyboard focus ring; unapproved default recommendations/product cards are not visible | `PASS / PROVISIONAL` |
| I2-S73-ACC-004 | Catalog transition is exact | CTA prevalidates same-origin exact `/shop/` without query/hash, real click loads the exact configured shop route and keeps header `0` / `Корзина 0` | `PASS / TECHNICAL` |
| I2-S73-ACC-005 | Responsive/regression/data gates remain clean | pre-fix targeted `3 failed`; post-fix targeted `3 passed`, cart file `9 passed`, full `58`: `56 passed / 2 skipped`; 3 new screenshots, no overflow/serious-critical axe/runtime errors; inventory `10/0/0/0`; reviews no findings | `PASS` |

I2-S73 accepts only one native removal of the final exact demo row in the current Woo Cart Block and a provisional empty-state transition. Paper has no approved empty/last-row design, so the slice remains `DESIGN_REVIEW_REQUIRED`; undo/restore, minus-to-zero, partial/mixed carts, source-PDP/history return, arbitrary redirects, persistence/auth/concurrency/errors, reserve/price/stock/offer rules, live announcements/focus transfer/AT/browser matrix, classic renderer, full WCAG and production commerce remain open.

### I2-S74 — branded guest login presentation

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S74-ACC-001 | Branded shell is narrow and responsive | only the logged-out base `/my-account/` receives one navy intro plus white form card on `1440` and a stacked card on `390/360`; lost-password endpoint remains outside the shell | `PASS / PROVISIONAL` |
| I2-S74-ACC-002 | Woo form ownership is preserved | one existing POST form retains action/method, credential names, required/autocomplete semantics, native password toggle, remember checkbox, nonce, referer, submit and exact lost-password href; no template override or auth POST | `PASS / TECHNICAL` |
| I2-S74-ACC-003 | Russian presentation and usable controls | current exact Woo guest-login strings are localized server-side only on the base route; username/password/toggle/submit are at least `48px`, CTA matches field width and existing pointer/keyboard/focus contracts remain passing | `PASS / PROVISIONAL` |
| I2-S74-ACC-004 | Responsive/regression/data gates remain clean | pre-fix targeted `3 failed`; post-fix targeted `3 passed`, account file `9 passed`, full `61`: `59 passed / 2 skipped`; 3 new screenshots, no overflow/serious-critical axe/runtime errors; inventory `10/0/0/0`; code/visual reviews no findings | `PASS` |

I2-S74 accepts presentation only for the current logged-out base-account renderer. Paper has no approved login screen, so the slice remains `DESIGN_REVIEW_REQUIRED`; successful/failed login, registration, logout, recovery submission, validation/error/loading/lockout/session states, remember-cookie behavior, CSRF/enumeration/rate-limit/MFA/RBAC/IDOR, authenticated pages, privacy, autofill/password managers, cross-Woo localization, AT/browser matrix, zoom/full WCAG and production IAM remain open.

### I2-S75 — polished empty-cart icon and cart heading cleanup

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S75-ACC-001 | Decorative cart eyebrow is removed | `.az-cart-intro__eyebrow` and «Ваш заказ» are absent while one meaningful `Корзина` H1 and the filled/empty explanatory copy remain | `PASS / PROVISIONAL` |
| I2-S75-ACC-002 | Empty icon is recognizable and decorative | existing Woo empty-title pseudo-element loads the self-authored `empty-cart.svg`, resets both masks, stays at least `84×84`, adds no DOM control/name/focus stop and preserves the sole H2 | `PASS / PROVISIONAL` |
| I2-S75-ACC-003 | Existing cart behavior and accessibility remain intact | exact native remove and Store/header zero state, sole catalog CTA/focus ring, Woo ownership, no recommendations, axe/no-overflow/runtime gates remain passing on `1440/390/360` | `PASS / TECHNICAL` |
| I2-S75-ACC-004 | Regression and evidence stay clean | pre-fix targeted `3 failed`; post-fix targeted `3 passed`, cart file `9 passed`, full `61`: `59 passed / 2 skipped`; 6 existing cart PNG refreshed, total stays 28; inventory `10/0/0/0`; code/visual reviews no findings | `PASS` |

I2-S75 accepts only the current Blocks cart presentation cleanup. Paper has no approved empty-state icon, so the slice remains `DESIGN_REVIEW_REQUIRED`; other then-current legacy mini-headings were tracked separately and removed by I2-S76, while undo/minus/multi-row/mixed carts, behavioral navigation changes, commercial rules, live announcements/focus transfer, AT/browser matrix, classic renderer, full WCAG and production commerce remain open.

### I2-S76 — remaining frontend decorative mini-heading cleanup

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S76-ACC-001 | Four remaining decorative pre-headings are absent | executable homepage contract finds zero VIN visual, B2B and shared dialog eyebrow nodes; «ПОДБОР ПО VIN», B2B eyebrow, «Помощь с подбором» and «Предварительная функция» are no longer rendered | `PASS / PROVISIONAL` |
| I2-S76-ACC-002 | Meaningful hierarchy and behavior remain intact | VIN/B2B/contact/status H2 and copy remain; contact/status `aria-labelledby`, automatic close focus, Enter/Escape/outside dismissal, opener focus return and fail-closed status routing stay covered | `PASS / TECHNICAL` |
| I2-S76-ACC-003 | Responsive presentation remains usable | targeted `3 passed`; homepage file `13 passed / 2 intentional skipped`; refreshed homepage and new open status-dialog screenshots show no overflow, hierarchy regression or title/close collision on `1440/390/360` | `PASS / PROVISIONAL` |
| I2-S76-ACC-004 | Regression, evidence and data stay clean | full `61`: `59 passed / 2 skipped`; 3 homepage PNG refreshed + 3 status-dialog PNG added, total `31` (`30` actual + Paper); inventory `10/0/0/0`; independent code/visual reviews no findings | `PASS` |

I2-S76 accepts only removal of current public-theme decorative pre-headings. Functional demo/status badges, product brands, field/navigation labels and semantic H1–H3 remain valid; stored-settings schema cleanup, VIN/B2B integrations, typography redesign, Paper approval, AT/browser matrix, full WCAG and production domain behavior remain outside the slice.

### I2-S77 — Paper-aligned responsive Woo product detail shell

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S77-ACC-001 | Woo remains authoritative | named hooks move the native H1 but do not replace a Woo template; gallery, price, short/long description, stock renderer, exact quantity and POST form remain Woo-owned | `PASS / TECHNICAL` |
| I2-S77-ACC-002 | Public identity fails closed | marked demo exposes sanitized seed brand/article; public identity never contains synthetic `AZ-DEMO-*`; temporary unmarked admin-owned product receives no demo identity/provenance and keeps exact title/SKU/price/stock/form | `PASS / TECHNICAL` |
| I2-S77-ACC-003 | Responsive SCR-009 subset is usable | exact Paper desktop measurements inform title, gallery and purchase card; mobile has no Paper frame and therefore uses a provisional one-column reflow; quantity is `52px`, CTA is `52px`, controls do not overlap and gallery/summary order passes on `1440/390/360` | `PASS / PROVISIONAL` |
| I2-S77-ACC-004 | Regression, evidence and data stay clean | valid pre-fix `3 failed`; post-fix targeted `3 passed`, catalog file `9 passed`, admin target/dependencies `53 passed / 2 skipped`, full `61`: `59 passed / 2 skipped`; six PDP plus two desktop guard PNG refreshed, total stays `31`; axe/no-overflow/runtime; inventory `10/0/0/0`; code finding fixed/rechecked and visual reviews clean | `PASS` |

I2-S77 accepts only the current simple-product presentation and safe existing metadata. Offers, variants, fitment, analogs, favorites, reviews, real price/stock/ETA, quantity business rules, stale/revalidation, Paper mobile/pixel-perfect approval, AT/browser matrix, full WCAG and production commerce remain outside the slice.

### I2-S78 — Paper-informed shared Woo listing cards

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S78-ACC-001 | Woo remains authoritative across supported listings | shop, product category and strict product search use named loop hooks plus scoped CSS; native thumbnail, title/permalink, price and product-type action remain Woo-owned, with no `content-product.php` override | `PASS / TECHNICAL` |
| I2-S78-ACC-002 | Public identity fails closed | marked demo cards expose only sanitized seed brand/article and never `AZ-DEMO-*`; temporary unmarked admin product keeps its optional `pa_brand`/exact native SKU and has no demo provenance across shop/search/category | `PASS / TECHNICAL` |
| I2-S78-ACC-003 | Shared responsive presentation is usable and narrow | Paper SCR-006/007 informs the desktop card; shared `4/3/2/1` grid, non-clipped content and `>=48px` CTA pass on `1440/390/360`; category uses Russian exact count and omits unsupported ordering; PDP related/upsell and mixed search are excluded | `PASS / PROVISIONAL` |
| I2-S78-ACC-004 | Targeted evidence and visual inventory stay bounded | valid pre-fix `6 failed`; post-fix listing target `6 passed`; localized category refresh `3 passed`; admin target plus dependencies `55`: `53 passed / 2 intentional skipped`; final full regression `61`: `59 passed / 2 intentional skipped / 0 failed`; six catalog/search PNG refreshed and three category PNG added, total `34` (`33` actual + Paper) | `PASS` |

I2-S78 accepts presentation and existing Woo data only. Sorting semantics, filters, ranking, offers, fitment, OEM/analogs, favorites, reviews, real stock/price/ETA, business add-to-cart success, Paper mobile/pixel-perfect approval, AT/browser matrix, full WCAG and production commerce remain outside the slice.

### I2-S79 — truthful responsive homepage product collections

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I2-S79-ACC-001 | Existing presentation Settings are the public source | admin scenario saves unique `popular_title/text` and `stock_title/text` markers, verifies exact stored/public values, then restores all four original values plus hero/selections and verifies the restored public render | `PASS / TECHNICAL` |
| I2-S79-ACC-002 | Homepage identity and provenance fail closed | demo cards expose only curated brand/article plus marked provenance; temporary unmarked card exposes exact native SKU and no fallback brand/demo copy; favorite, fake reference, availability and ETA nodes/text are absent | `PASS / TECHNICAL` |
| I2-S79-ACC-003 | Native actions and responsive collections remain usable | renderer calls native Woo loop action with `finally` restoration; homepage-only exact-default localization leaves merchant/plugin and non-home loop labels untouched; five desktop cards and contained mobile snap rails keep every action `>=48px`, reachable and unclipped | `PASS / PROVISIONAL` |
| I2-S79-ACC-004 | Evidence and cleanup stay bounded | valid pre-fix `3 failed`; post-fix homepage `3 passed`; both changed admin targets pass; full `61`: `59 passed / 2 skipped / 0 failed`; seven existing PNG refreshed, total stays `34`; PHP lint/preflight/diff clean; inventory `10/0/0/0`; independent scope finding fixed and visual review clean, including the `390px` category recapture | `PASS` |

I2-S79 accepts only truthful rendering of existing Woo data and existing homepage selections/copy. Real stock/ETA/offers, favorite/filter behavior, fitment/OEM/analogs, Paper mobile/pixel-perfect approval, AT/browser matrix, full WCAG and production commerce remain outside the slice.

### OPS-QT-001 — isolated Quick Tunnel deployment package

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| OPS-QT-001-ACC-001 | Preview не занимает host ports | rendered Compose JSON: published port entries `0` | `PASS` локально |
| OPS-QT-001-ACC-002 | Edge config валиден, запускается under hardening и не блокирует public admin | `caddy validate`; exact `read-only + cap_drop ALL + cap_add NET_BIND_SERVICE + no-new-privileges` runtime health `200`; admin deny отсутствует, HTTPS forwarding сохранён | `PASS` локально |
| OPS-QT-001-ACC-003 | Connector pinned и доступен | official manifest для amd64/arm64; container reports `cloudflared version 2026.10.7` | `PASS` локально |
| OPS-QT-001-ACC-004 | Installer/deploy scripts синтаксически валидны | Git Bash `bash -n` для двух scripts | `PASS` локально |
| OPS-QT-001-ACC-005 | Guardrails и non-interactive bootstrap зафиксированы regression test | combined config/documentation preflight `11 passed`: прежние 10 environment/deployment guards, включая no ports/host network, two-site/IP/snapshot, forbidden global removal и WP-CLI `run -T`, плюс current-summary drift guard | `PASS` локально |
| OPS-QT-001-ACC-006 | Два существующих сайта не затронуты на target | mandatory before/after URL, container и listener checks внутри installer | `BLOCKED` до завершённого server run с сохранённым two-site evidence |
| OPS-QT-001-ACC-007 | Public preview и WordPress-authenticated admin entry работают через Cloudflare | remote smoke `/`, REST, Store API, `/wp-login.php` final `2xx` + `#loginform` и unauthenticated `/wp-admin/` → same-origin login | `BLOCKED` до завершённого server run |

Package имеет статус `TESTING / SERVER_VALIDATION_REQUIRED`, а server остаётся `NOT_DEPLOYED`. Первая partial remote попытка выявила Caddy file-capability failure; после narrow fix вторая подтвердила healthy Caddy и выявила non-TTY WP-CLI boundary. Ни одна не дала successful bootstrap, complete before/after inventory или public/admin smoke; подготовленный `run -T` fix требует повторного полного run. Случайный `trycloudflare.com` URL и WordPress login public; длинный credential остаётся только в mode-600 env. Это ephemeral preview без production SLA, stable DNS, rate-limit/MFA или production admin acceptance.

## Технические критерии Итерации 1

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| I1-ACC-001 | `docker compose` config/build/up без конфликтов | dev и prod config/build/up завершены успешно | `PASS` |
| I1-ACC-002 | WordPress homepage и REST отвечают | HTTP/browser smoke на локальном runtime | `PASS` |
| I1-ACC-003 | `/wp-admin` доступен разрешённому администратору | Playwright admin login/menu; credential не публикуется | `PASS` |
| I1-ACC-004 | Settings главной сохраняются и отображаются | Playwright save → homepage assertion → restore original | `PASS` |
| I1-ACC-005 | Woo category/product CRUD отражается на главной | authenticated WC REST create/edit, Settings selection, homepage assertion, restore/delete cleanup | `PASS` |
| I1-ACC-006 | Demo seed повторяем и не дублирует записи | исторический I1-прогон: `8` categories, `10` products, `10` attachments, `9` pages, menu `24`; после I2-S2A ownership разделён на 6 demo + 4 Woo references | `PASS` |
| I1-ACC-007 | Demo checkout заблокирован classic/Blocks и Store API | classic/Cart/Checkout Blocks показывают notice; classic button disabled; Store API POST возвращает 403/code | `PASS` |
| I1-ACC-008 | Cart add/count/cart работают для demo до guard | AJAX add, header badge `1`, cart row и переход к guarded checkout на `1440/390/360` | `PASS` |
| I1-ACC-009 | DB/uploads сохраняются после restart | before/after persistence check | `PASS` |
| I1-ACC-010 | Desktop 1440 визуально сопоставлен SCR-002 | reference/actual и ручной отчёт `report-home-20261101.md` с известными расхождениями | `PASS` для сравнения; `DESIGN_REVIEW_REQUIRED`, не pixel-perfect |
| I1-ACC-011 | Provisional 360 не имеет горизонтального обрезания | `homepage-mobile-chrome-360.png` + overflow assertion | `PASS` для no-overflow |
| I1-ACC-012 | Нет page errors/console errors на smoke routes | финальный Playwright: `0 failed`; runtime error assertions пройдены | `PASS` для проверенного smoke-набора |
| I1-ACC-013 | Keyboard/focus/labels и axe baseline | axe serious/critical PASS на `1440/390/360`; desktop Tab → visible skip-link/focus ring → target PASS | `PASS` для Iteration 1 baseline |
| I1-ACC-014 | Production Compose/Caddy проходит config checks | prod config/build/up PASS; isolated drill: public 200, external admin 403, trusted admin 200, `nosniff` | `PASS` локально; remote preflight при доступе |
| I1-ACC-015 | Backup создаётся и проверяется | парные `.sql.gz` + `.uploads.tar.gz`, integrity check | `PASS` |
| I1-ACC-016 | Restore возвращает контрольную запись | isolated DB+uploads restore drill | `PASS` |
| I1-ACC-017 | Git deployment проходит на staging/disposable host | origin/target и one-command mechanism подготовлены; partial attempts recorded, но successful final log/URL отсутствуют до completed run | `BLOCKED` только для completed remote execution |
| I1-ACC-018 | Два существующих сайта не затронуты | mandatory before/after URL, foreign-container и listener guards реализованы | `BLOCKED` до completed run с сохранённым two-site evidence |

## Связь с 42 аналитическими TC

| TC | Применимость сейчас | Статус / причина |
|---|---|---|
| TC-001/002 | search exact/OEM | `BLOCKED`: BRULE-SRCH, DEC-003, DG-001 |
| TC-003 | no results | `BLOCKED`: DG-001/018 |
| TC-004 | fitment unknown/conflict | safe UI обещание проверяется, полный TC `BLOCKED` |
| TC-005/006 | multiple/stale offers | `BLOCKED`: real SupplierOffer отсутствует |
| TC-007 | changed offer | `NOT_APPLICABLE` к demo homepage; future cart |
| TC-031/032 | VIN submit/validation | `BLOCKED`: DEC-017/018, DG-010, CRM |
| TC-037 | RBAC | project Settings negative capability для Woo `shop_manager` `PASS / PARTIAL`; denied-attempt audit и полный role/API/object matrix позже |
| TC-038 | IDOR | защищённых custom objects пока нет; WP baseline требует security suite |
| TC-039 | responsive chain | homepage `1440/390/360` subset `PASS`; end-to-end business chain `BLOCKED` |
| TC-040 | accessibility | homepage axe + keyboard focus subset `PASS`; полный target/масштабы остаются DEC-020 |
| TC-041/042 | observability/replay | `BLOCKED`: integrations not implemented |

Остальные TC относятся к будущим order/payment/procurement/warehouse/delivery/return flows и не объявляются выполненными.

## Visual artifacts

- Paper reference: `docs/qa/visual-diffs/paper-home-desktop-1440.png`.
- Actual desktop: `docs/qa/visual-diffs/homepage-desktop-chrome-1440.png`.
- Actual mobile: `docs/qa/visual-diffs/homepage-mobile-chrome-390.png`, `docs/qa/visual-diffs/homepage-mobile-chrome-360.png`.
- Demo provenance PDP: `docs/qa/visual-diffs/product-demo-provenance-desktop-chrome-1440.png`, `product-demo-provenance-mobile-chrome-390.png`, `product-demo-provenance-mobile-chrome-360.png`.
- Technical demo PDP: `docs/qa/visual-diffs/product-technical-baseline-desktop-chrome-1440.png`, `product-technical-baseline-mobile-chrome-390.png`, `product-technical-baseline-mobile-chrome-360.png`.
- Product search empty state: `docs/qa/visual-diffs/product-search-empty-desktop-chrome-1440.png`, `product-search-empty-mobile-chrome-390.png`, `product-search-empty-mobile-chrome-360.png`.
- Product search results: `docs/qa/visual-diffs/product-search-results-desktop-chrome-1440.png`, `product-search-results-mobile-chrome-390.png`, `product-search-results-mobile-chrome-360.png`.
- Product category listing: `docs/qa/visual-diffs/product-category-desktop-chrome-1440.png`, `product-category-mobile-chrome-390.png`, `product-category-mobile-chrome-360.png`.
- Open status dialog: `docs/qa/visual-diffs/status-dialog-desktop-chrome-1440.png`, `status-dialog-mobile-chrome-390.png`, `status-dialog-mobile-chrome-360.png`.
- Наличие actual screenshots не означает утверждённый Paper diff: mobile и общий визуальный результат имеют `DESIGN_REVIEW_REQUIRED`; pixel-perfect не заявляется.

## Условие финального статуса

Локальная Итерация 1 выполнила применимые критерии и имеет разрешённый master prompt статус `READY_FOR_DEPLOYMENT`. Пункты I1-ACC-017/018 требуют successful completed server run и сохранённого before/after evidence; две partial attempts этого не закрывают, поэтому серверный статус остаётся `BLOCKED / NOT_DEPLOYED` и `DEPLOYED` не заявляется. Открытые `DEC-001…020` ограничивают будущий коммерческий scope, но не отменяют завершение независимого технического baseline.

