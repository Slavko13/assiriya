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
report-home-YYYYMMDD.md
```

Не перезаписывать Paper reference без новой версии/даты среза и impact analysis.

## Условия сравнения

- чистый/зафиксированный seed и одинаковый набор товаров;
- одинаковый viewport, DPR, browser/version, font loading и reduced-motion;
- отключённые случайные/временные данные;
- полная страница после network idle и загрузки изображений;
- отдельно фиксировать browser console/page errors.

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

- header обещает только текущий product-title search; article/brand/OEM search не заявлен;
- special-character query проверяет single escaping в H1/searchbox/empty state, один status-блок и canonical catalog return;
- scenario: `3 passed`; full regression: `25 tests`, `23 passed`, `2 intentional skipped`, `0 failed`;
- axe serious/critical = `0`, no-overflow/runtime assertions прошли на `1440/390/360`;
- визуал `PROVISIONAL / DESIGN_REVIEW_REQUIRED`: отдельного утверждённого search-results макета в Paper нет.

## Отчёт

Для каждого расхождения указать: компонент, координату/селектор, expected, actual, severity, источник (`Paper`, `DG`, `DEC`), принятое действие и статус. Не «исправлять» неоднозначность Paper без записи в decision log.

