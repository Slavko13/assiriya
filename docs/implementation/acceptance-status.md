# Статус приёмки Итерации 1

**Состояние:** `READY_FOR_DEPLOYMENT / NOT_DEPLOYED`; `PASS` ниже относится только к явно проверенному критерию и не закрывает открытые DEC или будущую коммерческую функциональность.  
**Главный источник:** `J:\vlad322\docs\07_delivery\test_acceptance_matrix.md`.

**Приёмочный прогон Итерации 1:** `13` tests = `11 passed`, `2 intentional skipped`, `0 failed`.

**Текущий regression после I2-S13:** `32` tests = `30 passed`, `2 intentional skipped`, `0 failed`; desktop `1440`, mobile `390`, mobile `360`, отдельный serial desktop admin project. Два skip — ожидаемые mobile-копии viewport-независимого Store API guard.

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
| I1-ACC-017 | Git deployment проходит на staging/disposable host | локальный Git и deploy mechanism подготовлены; remote log/URL невозможны без target | `BLOCKED` только для remote: нет Git origin и server/staging access |
| I1-ACC-018 | Два существующих сайта не затронуты | before/after inventory and health | `BLOCKED` только для remote: server access не предоставлен |

## Связь с 42 аналитическими TC

| TC | Применимость сейчас | Статус / причина |
|---|---|---|
| TC-001/002 | search exact/OEM | `BLOCKED`: BRULE-SRCH, DEC-003, DG-001 |
| TC-003 | no results | `BLOCKED`: DG-001/018 |
| TC-004 | fitment unknown/conflict | safe UI обещание проверяется, полный TC `BLOCKED` |
| TC-005/006 | multiple/stale offers | `BLOCKED`: real SupplierOffer отсутствует |
| TC-007 | changed offer | `NOT_APPLICABLE` к demo homepage; future cart |
| TC-031/032 | VIN submit/validation | `BLOCKED`: DEC-017/018, DG-010, CRM |
| TC-037 | RBAC | admin settings negative capability test `NOT_TESTED`; полный role matrix позже |
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

Локальная Итерация 1 выполнила применимые критерии и имеет разрешённый master prompt статус `READY_FOR_DEPLOYMENT`. Пункты I1-ACC-017/018 требуют отсутствующего server/staging access, поэтому серверный статус остаётся `BLOCKED / NOT_DEPLOYED`; `DEPLOYED` не заявляется. Открытые `DEC-001…020` ограничивают будущий коммерческий scope, но не отменяют завершение независимого технического baseline.

