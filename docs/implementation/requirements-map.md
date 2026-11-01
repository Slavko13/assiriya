# Матрица требований реализации

**Срез:** 2026-11-01  
**Итерация:** 1 — Homepage MVP + WordPress + Docker + Git Deployment  
**Общий статус:** Итерация 1 `READY_FOR_DEPLOYMENT`; Итерация 2 `IN_PROGRESS`; сервер `NOT_DEPLOYED`. Результаты ниже не являются закрытием открытых DEC.

## Канонические источники

- `J:\vlad322\docs\01_paper_audit\traceability_matrix.md`
- `J:\vlad322\docs\02_business\brd.md`
- `J:\vlad322\docs\04_requirements\srs.md`
- `J:\vlad322\docs\04_requirements\use_cases.md`
- `J:\vlad322\docs\07_delivery\mvp_and_backlog.md`
- `J:\vlad322\docs\07_delivery\test_acceptance_matrix.md`

Эта матрица дополняет, но не заменяет исходные документы.

## SCR-002 → требования → реализация → проверка

| UI / участок | FR / BR / BRULE / UC | PBL | Реализация | Автотест / проверка | Аналитический TC | Статус |
|---|---|---|---|---|---|---|
| UI-SCR002-001, город | FR-DLV-001; BRULE-DLV-001 | PBL-021, 026 | `header.php`: безопасный status-dialog без расчёта доставки | E2E: открытие сообщения, keyboard/focus | TC-039, TC-040 частично | `BLOCKED`: DEC-001/014 |
| UI-SCR002-002, каталог | FR-CAT-001; BR-003; BRULE-CAT-001; UC-SRCH-001 | PBL-011 | `header.php`, `front-page.php`, `helpers.php`; taxonomy `product_cat` | 8 terms + authenticated category CRUD/render/cleanup | — | Iteration 1 `PASS`; master дерева открыт |
| UI-SCR002-003—005, поиск | FR-SRCH-001—003; BR-003; BRULE-SRCH-001/002; UC-SRCH-001 | PBL-002, 006, 012 | `header.php`: штатный WooCommerce product search | E2E: submit/happy path; error/no-results ещё нет | TC-001—003 | `BLOCKED`: DG-001, DEC-003 |
| UI-SCR002-006, вход | FR-AUTH-002; BR-018/029; BRULE-SEC-001 | PBL-009, 036, 037 | ссылка на WooCommerce My Account | negative access и session tests не созданы | TC-037/038 частично | `IN_PROGRESS` |
| UI-SCR002-007, корзина | новое требование/правило TBD; FR-CART-001 частично | PBL-019 | WooCommerce cart link/count; AJAX add-to-cart | E2E add/count/cart + classic/Store API demo guards | TC-009 не применим полностью | Iteration 1 `PASS`; будущие cart rules blocked |
| UI-SCR002-008—011, авто | FR-CAT-004; FR-SRCH-004; BR-003; BRULE-FIT-001/002; UC-SRCH-001 | PBL-013, 029 | disabled selects и честное status-dialog; `FitmentAdapterInterface` | Проверить отсутствие ложного «подходит» | TC-004 | `BLOCKED`: DEC-004, INT-CAT-001 |
| UI-SCR002-012, 8 плиток | FR-CAT-001; BR-003; UC-SRCH-001 | PBL-011 | реальные WooCommerce terms; декоративные CSS-иллюстрации | CRUD/render + desktop/mobile visual regression | — | Iteration 1 `PASS`; taxonomy master TBD |
| UI-SCR002-013/014, подборки и карточка | FR-CAT-002; FR-OFR-002; BR-002/004/006/020/021; BRULE-CAT-003/OFR-001/OFR-002/PRICE-001 | PBL-011, 014—017 | опубликованные WooCommerce products; демо-маркировка; адаптеры availability/offers | product IDs, CRUD/render/cleanup, price/stock/demo labels | TC-005/006 требуют правил | UI/demo `PASS`; коммерческая семантика blocked |
| UI-SCR002-015, в корзину | FR-CART-001; FR-OFR-003; BR-007—009; BRULE-OFR-003/PRICE-003; UC-CART-001 | PBL-019/020 | стандартный WC AJAX add; demo checkout блокируется | E2E add/count/cart и classic/Store API guards | TC-007/010 позже | Iteration 1 `PASS`; обязательство не создаётся |
| UI-SCR002-016, VIN | FR-VIN-001/002; BR-015/024/029; BRULE-VIN-001/PRIV-001; UC-VIN-001 | PBL-007, 029 | форма-вход без submit; `VinRequestAdapterInterface` без реализации | E2E: статус вместо отправки/ПДн | TC-031/032 | `BLOCKED`: DEC-017/018, DG-010 |
| UI-SCR002-017, B2B | FR-B2B-001; BR-001/016/017; BRULE-B2B-001; UC-B2B-001 | PBL-031/032 | информационный баннер/status-dialog, без привилегий | E2E: отсутствие фиктивной заявки/цены | TC-034—036 позже | `BLOCKED`: DEC-016, DG-009 |
| UI-SCR002-018, получение | FR-DLV-001/002; BR-010/013/014; BRULE-DLV-001 | PBL-021, 026 | информационный блок, без тарифа/адреса | visual + link smoke | — | `BLOCKED`: DEC-014, INT-DLV-001 |
| UI-SCR002-019, изображения | декоративный | техническая декомпозиция PBL-011 | оптимизированные локальные assets и CSS art | размер файлов, alt/aria, visual diff | — | `TESTING` |
| Mobile и системные состояния | NFR-UX-001—003; BR-025—027/030; все клиентские UC | PBL-010, 040 | responsive CSS/JS; mobile nav | 360/390/1440, axe, keyboard focus, no horizontal scroll | TC-039/040 | Iteration 1 `PASS`, mobile provisional / `DESIGN_REVIEW_REQUIRED` |

## Срезы Итерации 2

| Slice | Требования / backlog | Реализация | Проверка | Статус и границы |
|---|---|---|---|---|
| I2-S1 — SCR-005 верхний каталог | FR-CAT-001 partial; UC-SRCH-001 шаги 1—3; PBL-011/PBL-040 partial; TC-039 partial | configured shop page: 8 curated top-level `product_cat`, reusable category card; Woo breadcrumb; category archive | Playwright `1440/390/360`: shop → «Тормозная система», products, no-overflow, runtime errors; `3 passed` | `DONE / PROVISIONAL`; canonical slug, search/filter/fitment/offers вне scope |
| I2-S2A — Woo page ownership boundary | PBL-039 technical safety partial; PBL-040 regression support | seeder owns 6 demo pages and references 4 configured Woo pages read-only; split manifest with compatible aggregate | current legacy DB: seed ×2 preserves Woo options/hashes/page IDs; isolated fresh install: bootstrap ×2, canonical core slugs, no `*-2`, no demo meta | `DONE`; current legacy canonical repair remains separate; SEO policy and `PBL-039` remain open |
| I2-S2B — fail-closed legacy repair | PBL-039 technical URL hygiene partial; PBL-040 regression support | dry-run/confirm CLI with ownership/signature/revision/Trash guards, rollback and candidate hash protection; Cart Block demo notice | isolated rollback/ambiguity/custom/no-op/seed tests; local `30/31/32 → 4/5/6`; canonical route E2E `1440/390/360`; full `14 passed / 2 skipped` | `DONE`; old demo pages remain recoverable in Trash; redirects/SEO policy and `PBL-039` remain open |
| I2-S3 — explicit demo provenance | FR-CAT-002 partial; FR-OFR-002 safety partial; UC-SRCH-001 шаги 3/7/8; PBL-011/PBL-040 partial; TC-039 partial | centralized marked-product predicate; archive/search loop label; PDP disclaimer + whitelisted Paper source | predicate raw-source safety; category → search «Фильтр» → PDP on `1440/390/360`: provenance `3 passed`, catalog file `6 passed`; full `17 passed / 2 skipped`; 3 screenshots | `DONE / PROVISIONAL`; search correctness, offers, fitment, real price/stock and all named DEC/DG/TC remain open |

## Статусы исходного backlog

| PBL | Статус в Итерации 1 | Причина |
|---|---|---|
| PBL-006/012 | `BLOCKED` | Нет согласованного DG-001 и правил нормализации/ранжирования. |
| PBL-007/029 | `BLOCKED` | Нет полей, согласия, SLA, CRM-контракта и success/queue UI. |
| PBL-010 | `TESTING` | Provisional responsive 360/390 технически проверен; утверждённых mobile-макетов нет. |
| PBL-011 | `TESTING` | Категории/товары и CRUD проверены; production master-data остаётся DEC-зависимым. |
| PBL-013—017 | `BLOCKED` | Применяемость, офферы, основной оффер, свежесть и цена не согласованы. |
| PBL-019 | `TESTING` | Базовая WC-корзина есть; mixed cart и бизнес-правила не закрыты. |
| PBL-031 | `BLOCKED` | B2B onboarding отсутствует по DG-009/DEC-016. |
| PBL-036/037 | `IN_PROGRESS` | Есть технический baseline; полная security/privacy acceptance не пройдена. |
| PBL-039 | `IN_PROGRESS` | Базовые WP/WC URL доступны; SEO-политика TBD. |
| PBL-040 | `TESTING` | Iteration 1 E2E/visual/axe/keyboard suite зафиксирован; полная аналитическая матрица расширяется по мере реализации доменных потоков. |

## Сущности аналитика → WordPress/WooCommerce → будущее хранилище

| Сущность аналитика | Реализация Итерации 1 | Дополнительное хранилище / расширение | Связанные требования | Статус |
|---|---|---|---|---|
| Brand | атрибут товара `pa_brand`/термин | нормализованный справочник с external IDs после DEC-002/003 | FR-CAT-002 | provisional |
| Category | `product_cat` | внешнее отображение ID/master-version при интеграции | FR-CAT-001 | реализовано, master TBD |
| Product | WooCommerce `product` | поля provenance/version; не дублировать продукт отдельной сущностью без решения | FR-CAT-001—005 | demo |
| ProductIdentifier | SKU и допустимые meta | отдельный индекс исходного/нормализованного артикула и OEM | FR-SRCH-001/002 | blocked |
| ProductRelation | отсутствует | custom table/сервис связей с evidence и verification | FR-CAT-003; FR-SRCH-005 | blocked |
| Vehicle / Fitment | отсутствуют; только UI-заглушка | adapter + versioned tables/cache с source/confidence | FR-CAT-004; FR-SRCH-004 | blocked |
| Supplier | отсутствует | профиль интеграции/внешняя master-система | FR-SUP-* | blocked |
| SupplierOffer | не сводить к текущей цене WC | отдельная offer projection: source, price, qty, ETA, min/multiple, actual_at | FR-OFR-* | blocked |
| Warehouse / StockBalance | WC stock только демо | WMS/ERP master + source-attributed snapshot | FR-WHS-001 | blocked |
| Reservation / StockMovement | отсутствуют | атомарный WMS/ERP контур и неизменяемые движения | FR-WHS-002—005 | blocked |
| Cart / CartLine | стандартная WC session/cart | offer_id, checked_at и source snapshot после решений | FR-CART-* | partial |
| SalesOrder / OrderLine | WC order/item предусмотрены платформой, но demo checkout закрыт | HPOS + неизменяемые commercial snapshots и external mappings | FR-ORD-* | not implemented |
| PriceSnapshot | WC order item meta в будущем | versioned calculation components; текущая цена товара не история | FR-PRICE-004 | blocked |
| Fulfillment / FulfillmentLine | отсутствуют | отдельные сущности/таблицы или внешний OMS; не один WC status | FR-ORD-003/004 | blocked |
| ProcurementOrder / Line | отсутствуют | ERP/procurement adapter + mapping/outbox | FR-SUP-* | blocked |
| GoodsReceipt / Line | отсутствуют | WMS/ERP receipt and discrepancy model | FR-WHS-004 | blocked |
| Customer | WP user/WC customer | CRM mapping и consent records | FR-AUTH/ACC | partial |
| Organization / OrganizationUser | отсутствуют | B2B domain tables + capabilities, не произвольные user meta | FR-B2B-* | blocked |
| Payment / Refund | стандартные WC extension points, не подключены | PSP adapter/webhooks/idempotency/reconciliation | FR-PAY/RET | blocked |
| Delivery / Address | WC address только будущий checkout | delivery adapter, shipment/fulfillment linkage | FR-DLV-* | blocked |
| ReturnRequest / Claim | отсутствуют | workflow entities linked to order lines | FR-RET-* | blocked |
| VinRequest | отсутствует; adapter contract | CRM/workflow mapping + status history + consent | FR-VIN-* | blocked |
| DomainEvent / AuditEntry | WP logs не являются контрактом | outbox/audit storage with correlation/idempotency and retention | NFR-OBS/SEC/PRIV | blocked |

