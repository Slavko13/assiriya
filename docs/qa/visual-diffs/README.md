# Visual QA

Эта папка хранит reference screenshots, фактические screenshots, diff-изображения и краткие отчёты. Наличие картинки не означает PASS.

## Baseline

- `paper-home-desktop-1440.png` — reference текущего Paper SCR-002.
- Размер макета: 1440 × 3376.
- `homepage-desktop-chrome-1440.png` — фактическая страница 1440 × 3347.
- `homepage-mobile-chrome-390.png` и `homepage-mobile-chrome-360.png` — фактическая provisional mobile-адаптация.
- `catalog-desktop-chrome-1440.png`, `catalog-mobile-chrome-390.png`, `catalog-mobile-chrome-360.png` — actual artifacts среза I2-S1; отдельного утверждённого SCR-005 baseline в проекте реализации пока нет.
- `product-demo-provenance-desktop-chrome-1440.png`, `product-demo-provenance-mobile-chrome-390.png`, `product-demo-provenance-mobile-chrome-360.png` — actual PDP artifacts среза I2-S3; это функциональное доказательство явной demo provenance, а не утверждённый PDP baseline.
- `product-technical-baseline-desktop-chrome-1440.png`, `product-technical-baseline-mobile-chrome-390.png`, `product-technical-baseline-mobile-chrome-360.png` — actual technical PDP artifacts среза I2-S4; не являются полным SCR-009/Paper baseline.
- `product-search-empty-desktop-chrome-1440.png`, `product-search-empty-mobile-chrome-390.png`, `product-search-empty-mobile-chrome-360.png` — actual no-results artifacts I2-S5; search-results design отсутствует в Paper и не считается утверждённым.
- `product-search-results-desktop-chrome-1440.png`, `product-search-results-mobile-chrome-390.png`, `product-search-results-mobile-chrome-360.png` — actual generic results artifacts I2-S6; порядок/ранжирование не утверждаются.
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
product-demo-provenance-desktop-chrome-1440.png
product-demo-provenance-mobile-chrome-390.png
product-demo-provenance-mobile-chrome-360.png
product-technical-baseline-desktop-chrome-1440.png
product-technical-baseline-mobile-chrome-390.png
product-technical-baseline-mobile-chrome-360.png
product-search-empty-desktop-chrome-1440.png
product-search-empty-mobile-chrome-390.png
product-search-empty-mobile-chrome-360.png
product-search-results-desktop-chrome-1440.png
product-search-results-mobile-chrome-390.png
product-search-results-mobile-chrome-360.png
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

## Отчёт

Для каждого расхождения указать: компонент, координату/селектор, expected, actual, severity, источник (`Paper`, `DG`, `DEC`), принятое действие и статус. Не «исправлять» неоднозначность Paper без записи в decision log.

