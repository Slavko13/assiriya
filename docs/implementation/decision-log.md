# Журнал технических решений

Технические записи ниже обратимы и **не закрывают** `DEC-001…DEC-020` из `J:\vlad322\docs\00_index\decision_register.md`.

| ID | Дата | Решение | Обоснование / последствия | Статус |
|---|---|---|---|---|
| TECH-001 | 2026-11-01 | WordPress + WooCommerce в закреплённых Docker images | Воспроизводимый фундамент; версии меняются отдельным тестируемым решением | принято для Iteration 1 |
| TECH-002 | 2026-11-01 | Presentation в теме, settings/safety/adapters в core plugin | Не меняется core; будущие интеграции не привязываются к шаблонам | принято |
| TECH-003 | 2026-11-01 | WooCommerce records Итерации 1 являются demo и маркируются | Не утверждает master data; checkout демо-позиций блокируется | принято |
| TECH-004 | 2026-11-01 | Отдельные project/network/volume names `avtozakup_*` | Снижает риск конфликта с двумя существующими сайтами; требует server audit | принято, не проверено на сервере |
| TECH-005 | 2026-11-01 | Production edge — Caddy на настраиваемом порту, admin по CIDR | Поддерживает IP-доступ без вмешательства в существующий proxy; isolated 200/403/200 + header drill PASS | принято локально; server preflight pending |
| TECH-006 | 2026-11-01 | Пять initial adapter interfaces без implementations | Фиксирует границы catalog/availability/fitment/offers/VIN и не имитирует реальные ответы | принято |
| TECH-007 | 2026-11-01 | Mobile layout реализуется provisional | В Paper нет mobile; нельзя считать design gap закрытым | принято как временное |
| TECH-008 | 2026-11-01 | Git deployment только clean branch + ff-only + pre-backup + smoke | Исключает скрытый merge и сохраняет recovery path | принято; local package READY, remote end-to-end blocked без target |
| TECH-009 | 2026-11-01 | Demo seeder владеет только проектными pages; настроенные Woo core pages используются read-only | Не создаёт `*-2`, не перезаписывает выбор администратора и отделяет ownership в manifest | принято; fresh/bootstrap + post-repair seed PASS |
| TECH-010 | 2026-11-01 | Legacy Woo page repair — отдельная dry-run/confirm CLI с atomic lock, fail-closed ownership/signature/revision/Trash guards и exact rollback | Немаркированные pages не редактируются; только точные demo-дубли перемещаются в recoverable Trash после backup; ambiguous/concurrent state блокирует apply | принято; isolated suite + local repair PASS, SEO policy open |
| TECH-011 | 2026-11-01 | Demo provenance определяется единым predicate; наружу выводятся только whitelisted public source labels | Archive/search/PDP не расходятся по demo-статусу и не раскрывают произвольные meta; это не объявляет Woo master-системой или данные актуальными | принято для I2-S3; DEC-002/003/005/006 open |
| TECH-012 | 2026-11-01 | Только точный marked `AZ-DEMO-###` называется technical demo-SKU; default related скрывается на marked demo PDP | Внутренний seed ID не выдаётся за OEM/артикул, а category/tag similarity — за подтверждённый аналог; unmarked products остаются штатными, marked custom SKU сохраняет стандартный meta UI | принято для I2-S4; DEC-003/004 open |
| TECH-013 | 2026-11-01 | До согласованного индекса UI обещает только generic product search без перечисления полей; no-results query явно escaped на Woo output boundary | Убирает ложное обещание article/brand search и XSS-prone raw title output, не меняя query/ranking; отдельный search design остаётся неутверждённым | принято для I2-S5/S6; DG-001/018 и DEC-003 open |
| TECH-014 | 2026-11-01 | Curated shop category grid выводится только на shop, не на product search | Woo `is_shop()` включает search archive; явный `!is_search()` сохраняет смысл SCR-005 и не засоряет results unrelated navigation | принято для I2-S6; search design всё ещё provisional |
| TECH-015 | 2026-11-01 | `Relevance` ordering control скрывается только на product search до ranking contract | Не создаёт ложного впечатления утверждённого ranking; underlying Woo/WP query и result count не меняются | принято для I2-S6; ranking остаётся blocked |
| TECH-016 | 2026-11-01 | Четыре проверенных Woo public labels локализуются named hooks/filters без gettext/template override; demo loop CTA меняется только в direct-add state | Сужает blast radius, сохраняет labels out-of-stock/variable states и не меняет user-owned page/content/data; full translation catalog остаётся отдельной задачей | принято для I2-S7; partial public copy only |
| TECH-017 | 2026-11-01 | Demo presentation boundary проверяется временным authenticated unmarked product с обязательным validated force-delete cleanup | Даёт browser-level доказательство отсутствия demo leakage в loop/PDP; exact-SKU REST check подтверждает cleanup в штатном test run | принято для I2-S8; production master/RBAC/lifecycle open |
| TECH-018 | 2026-11-01 | Canonical shop показывает local total и не показывает ordering UI до ranking contract | Named hooks меняют только presentation при `is_shop() && !is_search()`; query/default order/data не изменяются, category/search изолированы | принято для I2-S9; ranking и design open |
| TECH-019 | 2026-11-01 | Custom product-search presentation включается только для exact product scope; post-only и mixed scopes fail closed | Исключает ложные product-specific count/empty/catalog semantics на crafted generic search URL, не меняя WordPress query и не проектируя generic search | принято для I2-S10; generic search UX remains outside scope |
| TECH-020 | 2026-11-02 | Playwright не имеет implicit target; root URL обязателен; mutating admin E2E требует credential pair + `E2E_ALLOW_ADMIN_WRITES=1` | Предотвращает случайный browser/admin write против default, sibling root или чужого target; partial config падает до HTTP без supplied values; admin failure artifacts отключены | принято для I2-S11; opt-in не доказывает remote ownership и не production smoke |
| TECH-021 | 2026-11-02 | Woo breadcrumb copy локализуется named filters: home default, exact valid shop URL, exact non-paged product-search request URL | Не меняет trail order/URLs/query/data; raw `-1` shop sentinel, paged `Page N` и third-party crumb shapes fail closed; Woo template сам экранирует label | принято для I2-S12; JSON-LD names follow labels intentionally, full i18n/SEO open |
| TECH-022 | 2026-11-02 | Exact product search сохраняет results page при одном видимом товаре вместо штатного Woo single-result redirect | Сохраняет уже проверенные count/card/provenance semantics и позволяет доказать изоляцию user-owned товара; named filter действует только при strict product search и не меняет query/index/ranking | принято как provisional technical baseline I2-S13; финальный search UX и DG-001/018 open |
| TECH-023 | 2026-11-02 | Curated category identity проверяется по selected term ID, а не по name/slug/demo meta | В legacy DB одноимённые terms и marker могут повторяться; shared card публикует escaped numeric `data-category-id`, homepage/settings/shop сверяются без taxonomy mutation | принято для I2-S14; merge/delete/rename и production master-data policy open |
| TECH-024 | 2026-11-02 | CSS category illustration является декоративной и исключается из accessibility tree | Произвольный art label не описывает действие ссылки и загрязнял accessible name; видимый term name остаётся единственным именем category link | принято для I2-S15; полный WC/a11y audit продолжается |
| TECH-025 | 2026-11-02 | Category options в project Settings показывают локальный term ID рядом с именем | В текущей БД много одноимённых legacy terms; `name (#ID)` позволяет администратору различить записи и сверить selected identity без изменения value/taxonomy | принято для I2-S16; ID остаётся instance-local, master/merge policy open |
| TECH-026 | 2026-11-02 | Actual screenshots проходят единый fail-fast stabilization и сериализованный capture | Параллельные full-page captures конкурировали за lazy-load/paint и меняли 2 из 18 PNG; helper временно отключает smooth scroll, ждёт fonts, прокручивает страницу, проверяет visible images/decoded pixels, возвращает scroll/focus и берёт межпроцессный lock | принято для I2-S17; visual baseline остаётся provisional до DEC-019/020 |
| TECH-027 | 2026-11-02 | Curated category Settings принимают только 8 существующих root terms в порядке первого вхождения | UI, sanitizer и runtime обязаны одинаково держать I2-S1 top-level/max-8 invariant; forged child/duplicate/9th IDs fail closed без taxonomy mutation | принято для I2-S18; production taxonomy master/legacy cleanup остаются open |
| TECH-028 | 2026-11-02 | Mutating Settings E2E сохраняют multiselect values через ordered hidden inputs и проверяют публичный prefix | Обычный HTML multi-select отправляет DOM/title order и мог тихо переставлять category/product selections; полный stored product order читается из selected-first admin renderer, public cards проверяют первые 5 | принято для I2-S19; относится только к test mutation isolation |

## Состояние DEC

| DEC | Тема | Статус / влияние на Итерацию 1 |
|---|---|---|
| DEC-001 | юрлица/склады/города/каналы | `OPEN`; город и «наш склад» только demo/info |
| DEC-002 | master data | `OPEN`; WooCommerce не объявляется master |
| DEC-003 | товар/артикул/OEM/аналоги | `OPEN`; расширенный поиск blocked |
| DEC-004 | применяемость | `OPEN`; vehicle picker не обещает fit |
| DEC-005 | свежесть offer | `OPEN`; real supplier availability blocked |
| DEC-006 | основной offer | `OPEN`; demo card не доказывает ranking |
| DEC-007 | закупка | `OPEN`; procurement не реализуется |
| DEC-008 | остаток/резерв | `OPEN`; WC stock demo, резерва нет |
| DEC-009 | B2C/B2B price | `OPEN`; demo price не оферта |
| DEC-010 | фиксация цены | `OPEN`; production checkout blocked |
| DEC-011 | guest checkout/identity | `OPEN`; полноценный checkout/auth не принимается |
| DEC-012 | mixed order | `OPEN`; один WC status не использовать как модель |
| DEC-013 | payment/fiscalization | `OPEN`; PSP/FISC не подключены |
| DEC-014 | delivery | `OPEN`; блок получения информационный |
| DEC-015 | cancel/return/warranty | `OPEN`; только навигационный контент |
| DEC-016 | B2B MVP | `OPEN`; баннер без onboarding/privileges |
| DEC-017 | VIN fields/SLA/channel | `OPEN`; запрос не отправляется |
| DEC-018 | privacy | `OPEN`; реальные ПДн не собирать |
| DEC-019 | Paper baseline/gaps | `OPEN`; visual result provisional |
| DEC-020 | SLO/volume/browser/a11y | `OPEN`; measurements informative, не acceptance SLO |

## Правило добавления записи

Запись включает контекст, варианты, решение, дату, автора/утвердившего, затронутые требования, миграцию и rollback. Изменение решения создаёт новую запись; старая не удаляется.

