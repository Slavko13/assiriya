# Статус приёмки Итерации 1

**Состояние:** `READY_FOR_DEPLOYMENT / NOT_DEPLOYED`; `PASS` ниже относится только к явно проверенному критерию и не закрывает открытые DEC или будущую коммерческую функциональность.  
**Главный источник:** `J:\vlad322\docs\07_delivery\test_acceptance_matrix.md`.

**Приёмочный прогон Итерации 1:** `13` tests = `11 passed`, `2 intentional skipped`, `0 failed`.

**Текущий regression после I2-S58:** `43` tests = `41 passed`, `2 intentional skipped`, `0 failed`; desktop `1440`, compact desktop `900`, mobile `390`, mobile `360`, отдельный serial desktop admin project. Два skip — ожидаемые mobile-копии viewport-независимого Store API guard.

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

### OPS-QT-001 — isolated Quick Tunnel deployment package

| ID | Критерий | Доказательство | Статус |
|---|---|---|---|
| OPS-QT-001-ACC-001 | Preview не занимает host ports | rendered Compose JSON: published port entries `0` | `PASS` локально |
| OPS-QT-001-ACC-002 | Edge config валиден, запускается under hardening и не блокирует public admin | `caddy validate`; exact `read-only + cap_drop ALL + cap_add NET_BIND_SERVICE + no-new-privileges` runtime health `200`; admin deny отсутствует, HTTPS forwarding сохранён | `PASS` локально |
| OPS-QT-001-ACC-003 | Connector pinned и доступен | official manifest для amd64/arm64; container reports `cloudflared version 2026.10.7` | `PASS` локально |
| OPS-QT-001-ACC-004 | Installer/deploy scripts синтаксически валидны | Git Bash `bash -n` для двух scripts | `PASS` локально |
| OPS-QT-001-ACC-005 | Guardrails и non-interactive bootstrap зафиксированы regression test | combined config preflight `10 passed`, включая no ports/host network, two-site/IP/snapshot, forbidden global removal и WP-CLI `run -T` checks | `PASS` локально |
| OPS-QT-001-ACC-006 | Два существующих сайта не затронуты на target | mandatory before/after URL, container и listener checks внутри installer | `BLOCKED` до server run с двумя реальными URL |
| OPS-QT-001-ACC-007 | Public preview и WordPress-authenticated admin entry работают через Cloudflare | remote smoke `/`, REST, Store API, `/wp-login.php` final `2xx` + `#loginform` и unauthenticated `/wp-admin/` → same-origin login | `BLOCKED` до server run |

Package имеет статус `TESTING / SERVER_VALIDATION_REQUIRED`, а server остаётся `NOT_DEPLOYED`. Случайный `trycloudflare.com` URL и WordPress login public; длинный credential остаётся только в mode-600 env. Это ephemeral preview без production SLA, stable DNS, rate-limit/MFA или production admin acceptance.

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
| I1-ACC-017 | Git deployment проходит на staging/disposable host | origin/target и one-command mechanism подготовлены; remote log/URL отсутствуют до server run | `BLOCKED` только для remote execution |
| I1-ACC-018 | Два существующих сайта не затронуты | mandatory before/after URL, foreign-container и listener guards реализованы | `BLOCKED` до server run с двумя фактическими URL |

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
- Наличие actual screenshots не означает утверждённый Paper diff: mobile и общий визуальный результат имеют `DESIGN_REVIEW_REQUIRED`; pixel-perfect не заявляется.

## Условие финального статуса

Локальная Итерация 1 выполнила применимые критерии и имеет разрешённый master prompt статус `READY_FOR_DEPLOYMENT`. Пункты I1-ACC-017/018 требуют фактического server run и before/after evidence, поэтому серверный статус остаётся `BLOCKED / NOT_DEPLOYED`; `DEPLOYED` не заявляется. Открытые `DEC-001…020` ограничивают будущий коммерческий scope, но не отменяют завершение независимого технического baseline.

