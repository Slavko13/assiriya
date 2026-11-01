# Прогресс

**Дата среза:** 2026-11-01  
**Общий статус:** `READY_FOR_DEPLOYMENT / NOT_DEPLOYED`.

| Область | Фактический результат в checkout | Следующее доказательство | Статус |
|---|---|---|---|
| Аналитика | 29 файлов прочитаны; исходники не изменялись | повторная проверка перед доменной итерацией | `DONE` для анализа Iteration 1 |
| WordPress runtime | WP `7.1.4`, PHP `8.3.36`; dev/prod config/build/up и homepage/REST smoke пройдены | повторить smoke после удалённого deploy | `DONE` для локального runtime |
| WooCommerce | WC `11.2.1` активен; category/product create → edit → selection → homepage → cleanup пройден | master-data и коммерческая семантика только после DEC | `DONE` для технического CRUD Итерации 1 |
| MariaDB | MariaDB `11.4.13`; restart persistence подтверждён | production monitoring/retention после deploy | `DONE` для локального persistence |
| Theme SCR-002 | desktop `1440`, mobile `390` и `360` screenshots; sections, overflow, axe и browser errors проверены; Paper comparison задокументирован | утверждение assets/baseline после DEC-019 | `DONE` для Iteration 1; `DESIGN_REVIEW_REQUIRED`, не pixel-perfect |
| Editable content | admin login/menu и save → homepage → restore исходного hero title пройдены | negative capability/RBAC test | `DONE` для admin save/restore |
| Demo catalog | повторный seed стабилен: `8` categories, `10` products, `10` attachments, `9` pages, menu `24` | бизнес-master-data только после DEC | `DONE` для технического seed; не production catalog |
| Demo safety | AJAX add, badge, cart page, classic disabled checkout и direct Store API 403 прошли; demo маркировка сохранена | production commerce остаётся blocked до DEC | `DONE` для demo safety Итерации 1 |
| Mobile | `390` и `360` проходят no-overflow, axe baseline и browser-error checks | утверждённый mobile-макет после DEC-019/020 | `DONE` для provisional adaptation; `DESIGN_REVIEW_REQUIRED` |
| Local Docker | dev config/build/up и restart persistence пройдены | повторять после инфраструктурных изменений | `DONE` для локального контура |
| Production Docker | prod config/build/up, smoke и изолированный Caddy CIDR/header drill пройдены локально | remote inventory/preflight и production smoke при появлении доступа | `DONE` для подготовленного контура; server `BLOCKED` |
| Backup/restore | парный DB+uploads backup проверен; isolated restore drill прошёл | production retention и scheduled recovery drill | `DONE` для локального drill |
| Git deployment | ff-only/pre-backup/smoke script подготовлен, но Git remote и серверный target не подтверждены | создать/подтвердить remote, branch и staging/server access | `BLOCKED`; не DEPLOYED |
| Server | доступ и диагностика не подтверждены | inventory existing sites/proxy/ports/volumes | `BLOCKED / NOT_DEPLOYED` |
| E2E/a11y/visual | финальный Playwright: `13` tests, `11 passed`, `2 intentional skipped`, `0 failed`; три viewport-проекта, keyboard/focus и admin project; Paper report сохранён | утверждение visual baseline после DEC-019/020 | `DONE` для Iteration 1 automation; `DESIGN_REVIEW_REQUIRED` |

## Известные блокеры

- Все `DEC-001…DEC-020` открыты.
- `DG-001`, `DG-002`, `DG-009`, `DG-010`, `DG-017`, `DG-018` не закрыты.
- Master systems, integration contracts, real server inventory и legal/privacy inputs отсутствуют.
- Paper не содержит mobile и формальных tokens; screenshots `390/360` имеют `DESIGN_REVIEW_REQUIRED` и не объявляются pixel-perfect.
- Git remote/branch и удалённый server target не подтверждены; deployment остаётся `BLOCKED / NOT_DEPLOYED`.

## Последний подтверждённый прогон

- Playwright: `13` tests = `11 passed`, `2 intentional skipped`, `0 failed`.
- Два skip — ожидаемые mobile-копии viewport-независимого Store API guard; guard выполнен в desktop project.
- Viewports: desktop `1440`, mobile `390`, mobile `360`; admin save/restore выполняется отдельным desktop project.
- Woo category/product CRUD с отражением на главной и cleanup, cart count/page, classic checkout guard и keyboard/focus entry point — `PASS`.
- Runtime: WordPress `7.1.4`, WooCommerce `11.2.1`, PHP `8.3.36`, MariaDB `11.4.13`.
- Seed после повторного запуска: `8` categories, `10` products, `10` attachments, `9` pages, menu `24`.

## Правило отчётности

После каждой проверки добавить команду/условия, результат и путь к артефакту в `acceptance-status.md`. Наличие файла или кода само по себе не означает пройденный тест.

