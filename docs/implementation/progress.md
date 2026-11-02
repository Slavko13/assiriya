# Прогресс

**Дата среза:** 2026-11-02
**Общий статус:** Итерация 1 `READY_FOR_DEPLOYMENT`; Итерация 2 `IN_PROGRESS`; сервер `NOT_DEPLOYED`.

| Область | Фактический результат в checkout | Следующее доказательство | Статус |
|---|---|---|---|
| Аналитика | 29 файлов прочитаны; исходники не изменялись | повторная проверка перед доменной итерацией | `DONE` для анализа Iteration 1 |
| WordPress runtime | WP `7.1.4`, PHP `8.3.36`; dev/prod config/build/up и homepage/REST smoke пройдены | повторить smoke после удалённого deploy | `DONE` для локального runtime |
| WooCommerce | WC `11.2.1` активен; category/product create → edit → selection → homepage → cleanup пройден | master-data и коммерческая семантика только после DEC | `DONE` для технического CRUD Итерации 1 |
| MariaDB | MariaDB `11.4.13`; restart persistence подтверждён | production monitoring/retention после deploy | `DONE` для локального persistence |
| Theme SCR-002 | desktop `1440`, mobile `390` и `360` screenshots; sections, overflow, axe и browser errors проверены; Paper comparison задокументирован | утверждение assets/baseline после DEC-019 | `DONE` для Iteration 1; `DESIGN_REVIEW_REQUIRED`, не pixel-perfect |
| Editable content | admin login/menu и save → homepage → restore исходного hero title пройдены; mutating tests exact-restored category/popular/stock order; Woo `shop_manager` получает Products, но project Settings menu отсутствует и direct URL даёт `403` без mutation | denied-attempt audit и полный role/API/object matrix | `DONE` для admin save/restore и I2-S21 capability subset; full RBAC remains partial |
| Demo catalog | `8` selected categories, `10` products, `10` attachments; `6` plugin-owned pages + `4` read-only Woo references; fresh bootstrap и post-repair seed ×2 идемпотентны; legacy taxonomy не мутируется | бизнес-master-data только после DEC | `DONE` для seed ownership/idempotency и I2-S14 identity boundary; не production catalog |
| Catalog SCR-005 | configured `/shop/` и homepage показывают те же 8 selected top-level term IDs; Settings различает одноимённые terms по `#ID`, показывает только roots и сохраняет максимум 8; legacy terms исключены; link accessible name чистый | demo provenance Woo cards/PDP | `DONE` для `I2-S1/S14/S15/S16/S18`; `PBL-010/011 partial / PROVISIONAL` |
| Woo page ownership | seeder не создаёт/переназначает core pages; fail-closed repair переключил локальные options на `/shop/`, `/cart/`, `/checkout/`; старые marked IDs в Trash | SEO redirects/canonical policy только отдельным решением | `DONE` для `I2-S2A/B`; `PBL-039 partial` |
| Demo provenance Woo | marked products явно подписаны на category/search cards и PDP; PDP показывает whitelisted Paper source, unknown raw meta не публикуется | реальные sources/freshness/offers только после DEC/интеграционных контрактов | `DONE / PROVISIONAL` для `I2-S3`; `PBL-011/FR-CAT-002/FR-OFR-002 partial` |
| Technical demo PDP | exact seed SKU назван техническим, availability не выдаёт численный stock, action ведёт в демо-корзину, default related скрыт у marked demo | полный SCR-009, verified identifiers/relations/fitment/offers после DEC и контрактов | `DONE / PROVISIONAL` для `I2-S4`; `FR-CAT-002/003 partial` |
| Product search baseline | neutral generic form; escaped query context/no-results; positive `Фильтр` → `2` product cards; exact one-result search остаётся на results page; shop category grid исключён; post-only/mixed scopes fail closed | field index/ranking/normalization/suggestions, generic mixed-search UX и утверждённый DG-001/018 | `DONE / PROVISIONAL` для `I2-S5/S6/S10/S13`; `PBL-002/006/012` остаются blocked |
| Scoped Woo public copy | shop H1/total, product-search count, breadcrumb, demo actions и PDP description labels локализованы named hooks; shop/search ordering UI снят до ranking contract | full Woo/admin/account/cart/checkout translation; ranking/query; SEO policy | `DONE / PROVISIONAL` для `I2-S7/S9/S12`; не полный i18n |
| User-owned product isolation | authenticated temporary unmarked products сохраняют user SKU/stock/action/content и не получают demo UI в shop/strict search/PDP/собственном `product_cat` archive; custom homepage maintenance card показывает exact SKU/links и standard stock/note/CTA, отсутствуя в stock-подборке; Settings restore и cleanup подтверждены | production master/RBAC/stock/price/lifecycle | `DONE / TECHNICAL` для `I2-S8/S13/S22/S23`; не business acceptance |
| E2E target/write safety | explicit safe `BASE_URL`; admin writes только с credential pair + `E2E_ALLOW_ADMIN_WRITES=1`; preflight `6 passed`; Woo CRUD cleanup объединяет known IDs с exact SKU/slug lookup, проверяет `404`/lookup `0` и сохраняет product→category order | remote ownership/production authorization, crash/network-proof rollback и полный RBAC/API/object matrix | `DONE / TECHNICAL` для `I2-S11/S24`; admin suite не production smoke и не DB transaction |
| Demo safety | AJAX add, badge, cart page, classic disabled checkout и direct Store API 403 прошли; demo маркировка сохранена | production commerce остаётся blocked до DEC | `DONE` для demo safety Итерации 1 |
| Mobile | `390` и `360` проходят no-overflow, axe baseline и browser-error checks | утверждённый mobile-макет после DEC-019/020 | `DONE` для provisional adaptation; `DESIGN_REVIEW_REQUIRED` |
| Local Docker | dev config/build/up и restart persistence пройдены | повторять после инфраструктурных изменений | `DONE` для локального контура |
| Production Docker | prod config/build/up, smoke и изолированный Caddy CIDR/header drill пройдены локально | remote inventory/preflight и production smoke при появлении доступа | `DONE` для подготовленного контура; server `BLOCKED` |
| Backup/restore | парный DB+uploads backup проверен; isolated restore drill прошёл | production retention и scheduled recovery drill | `DONE` для локального drill |
| Git deployment | ff-only/pre-backup/smoke script подготовлен, но Git remote и серверный target не подтверждены | создать/подтвердить remote, branch и staging/server access | `BLOCKED`; не DEPLOYED |
| Server | доступ и диагностика не подтверждены | inventory existing sites/proxy/ports/volumes | `BLOCKED / NOT_DEPLOYED` |
| E2E/a11y/visual | текущий Playwright: `36` tests, `34 passed`, `2 intentional skipped`, `0 failed`; RBAC capability subset, unmarked category-archive/custom homepage card isolation и 18 stabilized screenshots проходят; Windows local suite serial | утверждение visual baseline после DEC-019/020; full security matrix/audit | Iteration 1 и I2-S1/S3/S4/S5/S6/S7/S8/S9/S10/S11/S12/S13/S14/S15/S16/S17/S18/S19/S20/S21/S22/S23/S24 technical acceptance PASS; `DESIGN_REVIEW_REQUIRED` |

## Известные блокеры

- Все `DEC-001…DEC-020` открыты.
- `DG-001`, `DG-002`, `DG-009`, `DG-010`, `DG-017`, `DG-018` не закрыты.
- Master systems, integration contracts, real server inventory и legal/privacy inputs отсутствуют.
- Paper не содержит mobile и формальных tokens; screenshots `390/360` имеют `DESIGN_REVIEW_REQUIRED` и не объявляются pixel-perfect.
- Git remote/branch и удалённый server target не подтверждены; deployment остаётся `BLOCKED / NOT_DEPLOYED`.
- В локальной БД есть старые одноимённые `product_cat` вне выбранного demo-набора; `I2-S1` намеренно использует восемь curated IDs. Автоматическое объединение/удаление не выполняется до отдельного master-data решения.

## Последний подтверждённый прогон

- Playwright: `36` tests = `34 passed`, `2 intentional skipped`, `0 failed`.
- Playwright env preflight: `6 passed`; no-target/unsafe-target/partial-admin states fail closed before browser.
- Два skip — ожидаемые mobile-копии viewport-независимого Store API guard; guard выполнен в desktop project.
- Visual evidence: исторические два последовательных I2-S17 targeted-прогона по 18 capture points прошли `18/18`; два I2-S20 targeted run прошли `19/19` (comparator + 18 captures) без hash changes, serial Windows full regression также сохранил все 19 repository PNG.
- Viewports: desktop `1440`, mobile `390`, mobile `360`; admin save/restore выполняется отдельным desktop project.
- Woo category/product CRUD с отражением на главной и cleanup, cart count, classic/Woo Blocks cart/checkout guard и keyboard/focus entry point — `PASS`.
- Configured shop page → curated categories → «Тормозная система» archive, breadcrumb, products и no-overflow на `1440/390/360` — `PASS`.
- Marked category card → product-name search «Фильтр» → marked search result → PDP provenance/source на `1440/390/360` — `PASS`.
- DOM-selected marked product → technical SKU, unconfirmed demo availability, demo-cart action, no default related, image/descriptions/category, axe/no-overflow/runtime на `1440/390/360` — `PASS`.
- Generic product special-character no-results → escaped H1/searchbox/status, no product cards, configured `/shop/` return, axe/no-overflow/runtime на `1440/390/360` — `PASS`.
- Generic `Фильтр` results → two fixture product cards with provenance/permalinks, no shop category grid, axe/no-overflow/runtime на `1440/390/360` — `PASS`.
- Canonical shop → local total `10`, no ordering UI; category retains standard ordering, cards/URLs + axe/no-overflow/runtime на `1440/390/360` — `PASS`.
- Woo breadcrumb → «Главная», configured shop «Каталог товаров», exact product-search label; category/product/page names и URLs preserved — `PASS`.
- Settings selected category IDs → exact homepage set → identical ordered shop IDs/URLs; 50 same-name unselected legacy terms excluded — `PASS`.
- Forged Settings payload child + duplicate + 9 roots → child rejected, unique input order preserved, first 8 roots saved; exact settings order restored, root/child fixtures deleted — `PASS`.
- Hero/S18/Woo CRUD writes → exact stored category/popular/stock orders restored, public 5-item prefixes exact; Woo fixture cleanup всегда сверяет exact SKU/slug, удаляет union known/found IDs строго product → category, проверяет ID `404` и repeated lookup `0` — `PASS`.
- Category cards → decorative CSS art excluded from accessibility tree; link accessible name equals visible term name on homepage/shop and all viewports — `PASS`.
- Post-only/mixed crafted search scopes → no product/shop presentation leakage, params preserved, no-overflow/runtime на `1440/390/360` — `PASS`.
- Authenticated temporary unmarked fixtures → shop, exact strict-search card, PDP, собственный `product_cat` archive и custom homepage maintenance card без card-local demo semantics; exact SKU/title/links, standard stock/note/CTA, selection isolation, Settings restore, product→category cleanup и post-full inventory `10/0/0/0` — `PASS`.
- Post-full inventory I2-S20: `10` published products / `0` temporary E2E products / `0` temporary E2E categories — `PASS`.
- RBAC subset: temporary Woo `shop_manager` retains Products access, project menu is absent, direct Settings URL returns `403`, no Settings mutation; exact user cleanup and post-full inventory `10/0/0/0` — `PASS / PARTIAL TC-037`.
- Runtime: WordPress `7.1.4`, WooCommerce `11.2.1`, PHP `8.3.36`, MariaDB `11.4.13`.
- Seed после I2-S2B: `8` categories, `10` products, `10` attachments, `6` plugin-owned pages + `4` Woo page references, menu `24`; options `4/5/6/7`, confirm no-op и seed ×2 подтверждены.

## Правило отчётности

После каждой проверки добавить команду/условия, результат и путь к артефакту в `acceptance-status.md`. Наличие файла или кода само по себе не означает пройденный тест.

