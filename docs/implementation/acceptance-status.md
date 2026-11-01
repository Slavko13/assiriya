# Статус приёмки Итерации 1

**Состояние:** `READY_FOR_DEPLOYMENT / NOT_DEPLOYED`; `PASS` ниже относится только к явно проверенному критерию и не закрывает открытые DEC или будущую коммерческую функциональность.  
**Главный источник:** `J:\vlad322\docs\07_delivery\test_acceptance_matrix.md`.

**Приёмочный прогон Итерации 1:** `13` tests = `11 passed`, `2 intentional skipped`, `0 failed`.

**Текущий regression после I2-S2B:** `16` tests = `14 passed`, `2 intentional skipped`, `0 failed`; desktop `1440`, mobile `390`, mobile `360`, отдельный desktop admin project. Два skip — ожидаемые mobile-копии viewport-независимого Store API guard.

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
- Наличие actual screenshots не означает утверждённый Paper diff: mobile и общий визуальный результат имеют `DESIGN_REVIEW_REQUIRED`; pixel-perfect не заявляется.

## Условие финального статуса

Локальная Итерация 1 выполнила применимые критерии и имеет разрешённый master prompt статус `READY_FOR_DEPLOYMENT`. Пункты I1-ACC-017/018 требуют отсутствующего server/staging access, поэтому серверный статус остаётся `BLOCKED / NOT_DEPLOYED`; `DEPLOYED` не заявляется. Открытые `DEC-001…020` ограничивают будущий коммерческий scope, но не отменяют завершение независимого технического baseline.

