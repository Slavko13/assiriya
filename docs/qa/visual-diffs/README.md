# Visual QA

Эта папка хранит reference screenshots, фактические screenshots, diff-изображения и краткие отчёты. Наличие картинки не означает PASS.

## Baseline

- `paper-home-desktop-1440.png` — reference текущего Paper SCR-002.
- Размер макета: 1440 × 3376.
- `homepage-desktop-chrome-1440.png` — фактическая страница 1440 × 3491; presentation was cleaned up in I2-S76 and the truthful product collections were recaptured/reviewed in I2-S79.
- `homepage-mobile-chrome-390.png` и `homepage-mobile-chrome-360.png` — фактическая provisional mobile-адаптация, refreshed in I2-S79 with contained product snap rails.
- `catalog-desktop-chrome-1440.png`, `catalog-mobile-chrome-390.png`, `catalog-mobile-chrome-360.png` — actual shop artifacts, refreshed in I2-S78 with the shared Paper-informed native Woo card; an approved full SCR-005/006 baseline is still absent.
- `product-public-copy-desktop-chrome-1440.png`, `product-public-copy-mobile-chrome-390.png`, `product-public-copy-mobile-chrome-360.png` — current customer-facing PDP artifacts, renamed and refreshed in I2-S81 after public provenance/internal seeded SKU labels were removed; they do not approve commercial data or a full PDP baseline.
- `product-technical-baseline-desktop-chrome-1440.png`, `product-technical-baseline-mobile-chrome-390.png`, `product-technical-baseline-mobile-chrome-360.png` — actual PDP technical/presentation artifacts from I2-S4, visually refreshed in I2-S77; desktop follows the safe SCR-009 title/gallery/purchase subset, while mobile remains a provisional reflow because Paper has no mobile PDP frame.
- `product-search-empty-desktop-chrome-1440.png`, `product-search-empty-mobile-chrome-390.png`, `product-search-empty-mobile-chrome-360.png` — actual no-results artifacts from I2-S5, refreshed in I2-S78 on the shared light listing surface; search-results design отсутствует в Paper и не считается утверждённым.
- `product-search-results-desktop-chrome-1440.png`, `product-search-results-mobile-chrome-390.png`, `product-search-results-mobile-chrome-360.png` — actual generic results artifacts from I2-S6, refreshed in I2-S78 with the shared listing card; order/ranking remain unapproved.
- `product-category-desktop-chrome-1440.png`, `product-category-mobile-chrome-390.png`, `product-category-mobile-chrome-360.png` — I2-S78 actual category-listing artifacts with Russian count, no unsupported ordering and the same card contract; the `390px` guard was recaptured/reviewed in I2-S79, and none approve assortment or category business rules.
- `cart-desktop-chrome-1440.png`, `cart-mobile-chrome-390.png`, `cart-mobile-chrome-360.png` — actual responsive cart artifacts from I2-S71, visually refreshed in I2-S75 to remove the decorative cart eyebrow; presentation follows SCR-010 vocabulary but does not prove mixed-offer/business acceptance or pixel-perfect Paper conformance.
- `cart-empty-desktop-chrome-1440.png`, `cart-empty-mobile-chrome-390.png`, `cart-empty-mobile-chrome-360.png` — actual branded empty-cart artifacts from I2-S73, visually refreshed in I2-S75 with the owner-approved no-eyebrow rule and a deterministic cart illustration; Paper has no approved empty-state design, so they remain provisional.
- `account-login-desktop-chrome-1440.png`, `account-login-mobile-chrome-390.png`, `account-login-mobile-chrome-360.png` — actual branded guest-login artifacts I2-S74; Woo keeps the form behavior and Paper has no approved login screen, so they remain provisional.
- `contact-dialog-desktop-chrome-1440.png`, `contact-dialog-mobile-chrome-390.png`, `contact-dialog-mobile-chrome-360.png` — I2-S80 actual baseline with the two currently configured phone/email rows; empty-config behavior is tested separately and renders no fallback action. These verify contained presentation and safe copy, not channel validity, availability or production contact acceptance.
- `status-dialog-desktop-chrome-1440.png`, `status-dialog-mobile-chrome-390.png`, `status-dialog-mobile-chrome-360.png` — actual open shared status-dialog artifacts I2-S76, recaptured in I2-S79 because the backdrop contains the updated homepage; the desktop guard refreshed in I2-S80 after unsupported topbar hours were removed. The set verifies meaningful title/close layout, not domain-flow or final Paper acceptance.
- Baseline остаётся provisional, пока `DEC-019` открыт.
- Mobile baseline отсутствует; 390/360 px screenshots относятся к `DG-017`, имеют статус `PROVISIONAL / DESIGN_REVIEW_REQUIRED` и не закрывают дизайн.

## Имена файлов

```text
paper-home-desktop-1440.png
homepage-desktop-chrome-1440.png
homepage-mobile-chrome-390.png
homepage-mobile-chrome-360.png
catalog-desktop-chrome-1440.png
catalog-mobile-chrome-390.png
catalog-mobile-chrome-360.png
product-public-copy-desktop-chrome-1440.png
product-public-copy-mobile-chrome-390.png
product-public-copy-mobile-chrome-360.png
product-technical-baseline-desktop-chrome-1440.png
product-technical-baseline-mobile-chrome-390.png
product-technical-baseline-mobile-chrome-360.png
product-search-empty-desktop-chrome-1440.png
product-search-empty-mobile-chrome-390.png
product-search-empty-mobile-chrome-360.png
product-search-results-desktop-chrome-1440.png
product-search-results-mobile-chrome-390.png
product-search-results-mobile-chrome-360.png
product-category-desktop-chrome-1440.png
product-category-mobile-chrome-390.png
product-category-mobile-chrome-360.png
cart-desktop-chrome-1440.png
cart-mobile-chrome-390.png
cart-mobile-chrome-360.png
cart-empty-desktop-chrome-1440.png
cart-empty-mobile-chrome-390.png
cart-empty-mobile-chrome-360.png
account-login-desktop-chrome-1440.png
account-login-mobile-chrome-390.png
account-login-mobile-chrome-360.png
contact-dialog-desktop-chrome-1440.png
contact-dialog-mobile-chrome-390.png
contact-dialog-mobile-chrome-360.png
status-dialog-desktop-chrome-1440.png
status-dialog-mobile-chrome-390.png
status-dialog-mobile-chrome-360.png
report-home-YYYYMMDD.md
```

Не перезаписывать Paper reference без новой версии/даты среза и impact analysis.

## Условия сравнения

- чистый/зафиксированный seed и одинаковый набор товаров;
- одинаковый viewport, DPR, browser/version, font loading и reduced-motion;
- отключённые случайные/временные данные;
- полная страница после network idle и загрузки изображений;
- отдельно фиксировать browser console/page errors.

Автоматический capture выполняет общий `tests/e2e/visual.ts`: на время прохода отключает smooth scroll, ждёт fonts и `decode()` layout-visible CSS background URLs, последовательно прокручивает страницу для lazy loading, требует `complete`, положительные natural dimensions и успешный `decode()` у layout-visible `<img>`, возвращает scroll/focus и только затем снимает full page в CSS-pixel scale. Ошибка/таймаут не маскируются. Межпроцессный lock сериализует capture между Playwright workers; `EEXIST` и Windows-only `EPERM` означают contention только внутри bounded timeout. Обычный локальный Windows suite использует один worker, чтобы исключить доказанный noise общего Chrome compositor; CI и раньше использовал один worker.

Перед записью helper сначала проверяет byte equality, затем сравнивает decoded RGBA. Existing artifact сохраняется только при `≤10` изменённых пикселях и максимальной дельте любого RGBA-канала `≤1`. Отдельное исключение для доказанного inline-SVG antialias noise допускает `≤2` пикселя с дельтой `≤64`, только если все координаты находятся внутри видимого `svg.az-icon`. Любое превышение, изменение вне иконки, другой размер или decode error считается material: candidate записывается либо тест падает.

## Что проверять

- ширины контейнеров, сетку, вертикальный ритм и порядок секций;
- typography, цвета, radius, shadows, controls и icons;
- header/footer, hero, 8 категорий, обе product collections, VIN, B2B, pickup;
- изображения/crop/alt, demo labels, empty/disabled states;
- 1440 desktop; provisional 360 mobile без horizontal overflow;
- клавиатуру, focus и zoom 200% отдельным функциональным прогоном.

## Текущий результат 2026-11-01

- Paper: 1440 × 3376; actual: 1440 × 3347, разница по высоте −29 px.
- Структура, порядок секций и общий визуальный язык близки к Paper, но результат не является pixel-perfect.
- Известные осознанные расхождения: один флакон вместо композиции из трёх; демонстрационные товары и тексты; явные demo labels; placeholder для MAHLE и LUZAR из-за недоступных asset URLs.
- Homepage acceptance run: 13 tests, 11 passed, 2 intentional skipped, 0 failed; проверены 1440, 390 и 360 px, отсутствие горизонтального overflow, keyboard focus, admin save+restore, Woo CRUD, AJAX cart/count/page и classic/Store API guards.
- Подробности: [`report-home-20261101.md`](report-home-20261101.md).

## Catalog I2-S1

- actual screenshots configured WooCommerce shop page сохранены для `1440/390/360`;
- сетка восьми curated Woo categories переиспользует category-card главной;
- переход в category archive, breadcrumb, published products, no-overflow и runtime errors проверены;
- targeted: `3 passed`; полный regression: `16 tests`, `14 passed`, `2 intentional skipped`, `0 failed`;
- визуал `PROVISIONAL / DESIGN_REVIEW_REQUIRED`; product loop остаётся штатным Woo baseline и не считается реализацией полного SCR-005/006.

## Demo provenance I2-S3

- category/search cards и PDP явно маркируют только marked demo products;
- на PDP отображается только whitelisted Paper source, произвольное source meta наружу не выводится;
- путь category → multi-result search → PDP проверен на `1440/390/360`: provenance scenario `3 passed`; весь catalog file `6 passed` (`2` сценария × `3`), `0 failed`;
- полный regression после среза: `19 tests`, `17 passed`, `2 intentional skipped`, `0 failed`;
- визуал `PROVISIONAL / DESIGN_REVIEW_REQUIRED`; скриншоты не закрывают полный SCR-006/007/009 и не подтверждают реальные цену, остаток, срок или применяемость.

## Technical demo PDP I2-S4

- DOM-selected marked product сохраняет Woo H1, image/placeholder, descriptions, breadcrumb/category и provenance;
- technical demo-SKU, unconfirmed availability и demo-cart action видны; default related output отсутствует;
- technical PDP scenario: `3 passed`; весь catalog file: `9 passed`; full regression: `22 tests`, `20 passed`, `2 intentional skipped`, `0 failed`;
- axe serious/critical = `0`, no-overflow/runtime assertions прошли на `1440/390/360`;
- визуал `PROVISIONAL / DESIGN_REVIEW_REQUIRED`; full SCR-009, OEM/analogs/fitment/offers и реальные stock/ETA не реализованы.

## Product search empty state I2-S5

- header обещает только generic product search без перечисления полей; article/brand/OEM search не заявлен;
- special-character query проверяет single escaping в H1/searchbox/empty state, один status-блок и canonical catalog return;
- scenario: `3 passed`; full regression: `25 tests`, `23 passed`, `2 intentional skipped`, `0 failed`;
- axe serious/critical = `0`, no-overflow/runtime assertions прошли на `1440/390/360`;
- визуал `PROVISIONAL / DESIGN_REVIEW_REQUIRED`: отдельного утверждённого search-results макета в Paper нет.

## Generic product search results I2-S6

- fixture audit подтверждает content matches, поэтому UI не называет поиск title-only и не обещает field contract;
- `Фильтр` возвращает две fixture product cards с demo provenance/same-origin permalinks; title matching/order/ranking не asserted;
- curated shop categories и unapproved ordering control на search page отсутствуют;
- positive scenario: `3 passed`; search file: `6 passed`; full regression: `28 tests`, `26 passed`, `2 intentional skipped`, `0 failed`;
- axe serious/critical = `0`, no-overflow/runtime assertions прошли на `1440/390/360`; visual `PROVISIONAL / DESIGN_REVIEW_REQUIRED`.

## Scoped Woo public copy I2-S7

- existing shop/search/PDP screenshots обновлены: «Каталог товаров», «Найдено товаров: N», demo loop action и «Описание»;
- targeted catalog/search/PDP: `15 passed`; full regression: `28 tests`, `26 passed`, `2 intentional skipped`, `0 failed`;
- это не полный translation baseline: breadcrumb, shop result count/sorting и прочие Woo strings остаются открыты;
- visual `PROVISIONAL / DESIGN_REVIEW_REQUIRED`.

## Deterministic visual evidence I2-S17

- все 6 capture points (`homepage`, `catalog`, два PDP, results и empty search) переведены на общий fail-fast helper; production DOM/CSS/PHP не менялись;
- каждый capture проверен на `1440/390/360`, всего 18 PNG;
- до сериализации параллельный прогон менял 2 из 18 hashes, а isolated capture был стабилен; после cross-worker lock два последовательных targeted-прогона дали `18 passed` и byte-identical SHA-256 для всех 18 файлов;
- полный regression: `33` tests = `31 passed`, `2 intentional skipped`, `0 failed`; hashes совпали с последним targeted-прогоном;
- representative desktop/mobile artifacts просмотрены; baseline остаётся `PROVISIONAL / DESIGN_REVIEW_REQUIRED` и не объявляется pixel-perfect.

## Tolerance-aware visual retention I2-S20

- последующие прогоны выявили редкое PNG encoder/compositor noise: byte hash мог отличаться при одинаковых decoded pixels либо на 1—2 antialias pixels inline SVG; историческое доказательство I2-S17 при этом не пересматривается;
- helper дополнительно ждёт layout-visible CSS backgrounds и сохраняет existing PNG только по двум строго ограниченным RGBA-правилам выше; material candidate продолжает записываться;
- comparator boundary test проверяет exact, `10/11` pixels, channel delta `1/2`, SVG `2/3`, delta `64/65`, inside/outside и разные размеры;
- parallel Windows diagnostics правильно классифицировали как material два крупных нестабильных кадра (`502 px / delta 32` и `5740 px / delta 3`); пороги не расширялись, вместо этого Windows local suite переведён на один worker;
- два обычных targeted run: `19 passed` каждый = comparator + 18 capture scenarios; baseline→run1 и run1→run2 hashes всех 19 repository PNG (18 actual + Paper reference) остались неизменны;
- serial full regression: `35` tests = `33 passed`, `2 intentional skipped`, `0 failed`; hashes снова неизменны, inventory published/temp product/temp category = `10/0/0`;
- baseline остаётся `PROVISIONAL / DESIGN_REVIEW_REQUIRED`; tolerance не является visual approval или pixel-perfect claim.

## Responsive demo cart I2-S71

- current Woo Cart Block remains the data/control source; theme presentation adds the order-review intro, responsive product/totals cards, localized labels and prominent demo notice; classic fallback CSS is not visual acceptance evidence;
- actual screenshots captured deterministically for `1440/390/360`; mobile keeps a single-column summary with the CTA in document flow so it does not cover quantity or totals;
- targeted scenario: `3 passed`; full regression: `52` tests = `50 passed`, `2 intentional skipped`, `0 failed`; axe serious/critical, no-overflow and runtime gates pass;
- 19 pre-existing repository PNG remained byte-identical; 3 new cart artifacts bring the repository total to 22 PNG;
- result is `PROVISIONAL / DESIGN_REVIEW_REQUIRED`: it does not close SCR-010 mixed-offer rules, `DG-018`, `DEC-008—014/018—020` or production commerce.

## Branded empty cart I2-S73

- one native final-row remove is verified against the exact same-origin Store API request key, a successful direct response or matched batch inner `200/items_count=0`, and settled official Cart Store state;
- current Woo empty renderer remains in place but receives exact Russian title/CTA, honest empty-specific intro copy and a compact branded card; unapproved default `New in store` recommendations are hidden through narrow current-sibling selectors;
- configured catalog CTA has an opaque visible keyboard focus ring, prevalidates exact same-origin `/shop/` and loads the configured shop while header remains `0` / `Корзина 0`;
- targeted scenario: `3 passed`; cart file: `9 passed`; full regression: `58` tests = `56 passed`, `2 intentional skipped`, `0 failed`; axe serious/critical, no-overflow and runtime gates pass on `1440/390/360`;
- 22 pre-existing repository PNG remained unchanged; 3 new empty-cart artifacts bring the repository total to 25 PNG (`24` actual + Paper reference); independent visual review found no customer-demo blockers;
- result is `PROVISIONAL / DESIGN_REVIEW_REQUIRED`: Paper has no empty/last-row design, and the artifacts do not accept undo/minus/multi-row/mixed cart, arbitrary navigation, classic renderer or production commerce.

## Branded guest login I2-S74

- only the logged-out base `/my-account/` receives the branded shell; the current Woo form, password toggle, remember control, nonce/referer, submit and lost-password route remain authoritative;
- desktop `1440` uses a navy intro beside a white form card; `390/360` stack the same shell and retain at least `48px` input/toggle/submit targets without overflow;
- exact current Woo guest-login copy is localized server-side for this route, while lost-password and authenticated endpoints remain outside the presentation scope;
- pre-fix targeted `3 failed`; post-fix targeted `3 passed`; account file `9 passed`; full regression: `61` tests = `59 passed`, `2 intentional skipped`, `0 failed`; axe serious/critical, no-overflow, runtime and empty/no-POST gates pass on `1440/390/360`;
- 25 pre-existing repository PNG remained unchanged; 3 new login artifacts bring the repository total to 28 PNG (`27` actual + Paper reference); independent code and visual reviews found no findings;
- result is `PROVISIONAL / DESIGN_REVIEW_REQUIRED`: Paper has no approved login design, and the artifacts do not accept successful/failed authentication, registration, recovery submission, session/security/authenticated states, cross-Woo compatibility, AT/browser/full WCAG or production IAM.

## Polished cart heading and empty icon I2-S75

- decorative «Ваш заказ» was removed from the shared cart hero; the meaningful `Корзина` H1 and filled/empty explanatory copy remain on `1440/390/360`;
- the inherited Woo empty-title mask that rendered as a broken blue block was explicitly reset and replaced with one self-authored decorative blue cart SVG; no DOM control, accessible-name contribution or new focus stop was added;
- pre-fix targeted `3 failed`; post-fix targeted `3 passed`; cart file `9 passed`; full regression remains `61` tests = `59 passed`, `2 intentional skipped`, `0 failed`;
- all 6 existing cart artifacts were deterministically refreshed and independently reviewed; repository total stays 28 PNG (`27` actual + Paper reference), and no clipping/overflow/hierarchy issue was found;
- result is `PROVISIONAL / DESIGN_REVIEW_REQUIRED`: Paper has no approved empty-state icon; other then-current legacy mini-headings were handled separately by I2-S76, while cart behavior/commercial rules, classic renderer, AT/browser/full WCAG and production commerce remain unaccepted.

## Remaining frontend mini-heading cleanup I2-S76

- the VIN visual, B2B banner, contact dialog and shared status dialog no longer render decorative pre-headings; meaningful H2/copy/actions, functional badges/brands/labels and existing dialog behavior remain;
- all 3 homepage artifacts were deterministically refreshed, and 3 open status-dialog artifacts were added to make the long status title/close-button boundary visible on `1440/390/360`;
- valid pre-fix targeted run: `3 failed` with exactly 4 nodes; post-fix targeted run: `3 passed`; homepage file: `13 passed / 2 intentional skipped`; full regression: `61` tests = `59 passed`, `2 intentional skipped`, `0 failed`;
- repository total is `31` PNG (`30` actual + Paper reference); axe serious/critical, no-overflow and runtime gates pass, inventory is `10/0/0/0`, and independent code/visual reviews found no findings or title/close collision;
- result is `PROVISIONAL / DESIGN_REVIEW_REQUIRED`: stored-settings cleanup, VIN/B2B integrations, typography redesign, Paper approval, AT/browser/full WCAG and production behavior remain outside this visual slice.

## Paper-informed responsive product detail I2-S77

- exact SCR-009 node inspection supplies the `1280px` content width, `29px` H1, public brand/article language, bordered gallery, light-blue purchase surface, `37px` price and control rhythm; unsupported characteristics, variants, offers, stock counts and city modules are deliberately absent;
- desktop shows one title/identity header with gallery and purchase columns; `390/360` keep the same source order in one column because Paper contains no mobile PDP artboard;
- all 6 existing product screenshots were deterministically refreshed, so the repository total remains `31` PNG (`30` actual + Paper reference); gallery image, purchase card, quantity/CTA and description remain readable without clipping or overlap;
- the mandatory full regression also refreshed the desktop homepage and open status-dialog guard artifacts; follow-up review found no header/cart, mini-heading or dialog title/close regression;
- valid pre-fix targeted `3 failed`; post-fix targeted `3 passed`; catalog file `9 passed`; full regression remains `61` tests = `59 passed`, `2 intentional skipped`, `0 failed`; axe serious/critical, no-overflow and runtime gates pass, inventory is `10/0/0/0`;
- independent visual review found no hierarchy, crop, control or mobile defects; the functional Woo «Описание» tab is not treated as a decorative mini-heading. Result remains `PROVISIONAL / DESIGN_REVIEW_REQUIRED`, not Paper mobile/pixel-perfect, full WCAG/AT/browser or production commerce acceptance.

## Paper-informed shared Woo listing cards I2-S78

- exact SCR-006/007 inspection supplies the desktop `316×391` card vocabulary: `180px` media, brand/title/reference/price rhythm, bordered white surface and blue action; the implementation keeps native Woo thumbnail, title/permalink, price and type-specific action instead of copying commerce markup;
- shop, category and strict product search share the scoped card marker and responsive `4/3/2/1` grid; CTA is `>=48px`, long content stays unclipped, and `390/360` use a provisional one-column reflow because Paper has no mobile listing frame;
- marked demo cards expose only curated brand/article and explicit provenance without `AZ-DEMO-*`; an authenticated unmarked fixture keeps its native SKU and no demo semantics across all three supported surfaces;
- all 3 catalog and 3 product-search-results artifacts were deterministically refreshed; 3 product-category artifacts were added after replacing the English Woo count/sorting surface with an exact Russian count and no unsupported ordering;
- the final suite also refreshed all 3 empty-search artifacts on the shared light listing surface plus the desktop homepage/status-dialog guard frames; manual review found no header, dialog, overflow or hierarchy regression;
- repository total is `34` PNG (`33` actual + Paper reference); valid pre-fix target `6 failed`, post-fix target `6 passed`, category refresh `3 passed`, admin target/dependencies `53 passed / 2 intentional skipped`, and final full regression `61` = `59 passed / 2 intentional skipped / 0 failed`;
- result is `PROVISIONAL / DESIGN_REVIEW_REQUIRED`: filters/sorting/ranking, offer/stock/price/ETA truth, fitment/OEM/analogs/favorites, business add-to-cart acceptance, Paper mobile/pixel-perfect, AT/browser/full WCAG and production commerce remain outside this visual slice.

## Truthful responsive homepage product collections I2-S79

- both SCR-002 product collections now render the four existing admin title/text fields, fail-closed demo/unmarked identity and native Woo action output; hard-coded collection copy, fake brand/reference/availability/ETA, dead favorite and inert filter pills are absent;
- desktop keeps five evenly aligned cards with `180px` media and bottom-aligned `>=48px` actions; `390/360` show one complete `270px` card plus a deliberate next-card peek in a contained horizontal snap rail, with every card reachable and no document overflow;
- all 3 homepage artifacts and 3 open status-dialog artifacts were deterministically refreshed; the dialog files changed because their fixed backdrop includes the updated homepage. The full suite also recaptured the existing `product-category-mobile-chrome-390.png`; independent review found no category clipping, spacing, CTA or overflow regression. Repository total remains `34` PNG (`33` actual + Paper reference);
- valid pre-fix homepage target `3 failed`; post-fix target `3 passed`; changed admin save/render/restore and CRUD-card targets pass; final full regression remains `61` = `59 passed / 2 intentional skipped / 0 failed`; axe serious/critical, no-overflow, runtime and inventory `10/0/0/0` pass;
- independent review found no card hierarchy, clipping, CTA, rail-affordance or dialog regression. Real product imagery remains preferable to honest Woo placeholders; mobile rail and compact provenance remain `PROVISIONAL / DESIGN_REVIEW_REQUIRED`, not Paper mobile/pixel-perfect, full WCAG/AT/browser or production commerce acceptance.

## Settings-backed contact dialog I2-S80

- SCR-001 contact presentation contains a meaningful title, neutral intro and up to two nonempty renderable Settings-backed rows. The baseline has phone and email with exact escaped `tel:`/`mailto:` relations; the admin scenario proves save → public render → explicit-empty zero-action state → exact restore;
- hard-coded working hours and the customer-facing WordPress admin instruction are absent. Telegram, MAX, callback, availability and CRM/SLA are deliberately not shown because no approved source exists;
- scoped `0.13.0` styling gives each row an icon, wrapping value and `>=64px` action geometry inside a `408px` maximum dialog; existing initial close focus, Enter/Escape/outside dismissal and opener focus return remain covered on `1440/390/360`;
- 3 new contact-dialog artifacts were added. Removing the visible desktop topbar hours refreshed all 11 existing desktop full-page artifacts (account, cart, empty cart, catalog, homepage, category, both PDP guards, both search guards and status dialog); the existing `product-category-mobile-chrome-390.png` guard was also deterministically recaptured and reviewed. Repository total is `37` PNG (`36` actual + Paper reference);
- valid pre-fix target `3 failed`; post-fix target `3 passed`; admin save/clear/restore target `1 passed`; final full regression `61` = `59 passed / 2 intentional skipped / 0 failed`; PHP lint, axe serious/critical, no-overflow, runtime, preflight `11/11`, diff and inventory `10/0/0/0` pass;
- independent review found no overflow, wrapping, target-size, focus or shared-dialog regression. This remains `PROVISIONAL / DESIGN_REVIEW_REQUIRED`, not verification of contact channels, hours, external apps, Paper mobile/pixel-perfect, full WCAG/AT/browser or production contact acceptance.

## Public storefront copy, routes and cart CTA I2-S81

- core `0.4.0` and theme `0.14.0` retain internal ownership while public category/card/PDP/cart/footer surfaces use customer-facing language without provenance, internal seeded SKU or demo-site labels; neutral stock/checkout-unavailable copy does not claim verified inventory or active checkout;
- primary oils/maintenance/business navigation and `Смотреть масла →` resolve exact same-origin native taxonomy/page destinations; one successful homepage add morphs the original action to `Перейти в корзину`, emits no sibling action or second add request and survives reload as server-rendered cart state;
- all 36 actual screenshots were deterministically refreshed because public/footer copy can affect every full-page surface; the three former PDP provenance artifacts were renamed to `product-public-copy-*`; repository total remains `37` PNG (`36` actual + Paper reference);
- nav/oils/cart targets pass; the one PDP category-link contrast finding (`4.35`) was fixed and the scenario retested; final full regression remains `61` = `59 passed / 2 intentional skipped / 0 failed`; PHP/JS syntax, preflight `11/11`, diff, axe serious/critical, no-overflow/runtime and inventory `10/0/0/0` pass;
- independent code and visual reviews cover desktop/mobile homepage, public-copy PDP, cart states and shared dialogs. Result remains `PROVISIONAL / DESIGN_REVIEW_REQUIRED`: no Paper mobile/pixel-perfect, full WCAG/AT/browser, commercial-data or production deployment acceptance is claimed.

## Отчёт

Для каждого расхождения указать: компонент, координату/селектор, expected, actual, severity, источник (`Paper`, `DG`, `DEC`), принятое действие и статус. Не «исправлять» неоднозначность Paper без записи в decision log.

