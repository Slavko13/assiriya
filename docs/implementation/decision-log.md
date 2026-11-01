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
| TECH-013 | 2026-11-01 | До согласованного индекса UI обещает только product-title search; no-results query явно escaped на Woo output boundary | Убирает ложное обещание article/brand search и XSS-prone raw title output, не меняя query/ranking; отдельный search design остаётся неутверждённым | принято для I2-S5; DG-001/018 и DEC-003 open |

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

