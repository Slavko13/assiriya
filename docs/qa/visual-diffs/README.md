# Visual QA

Эта папка хранит reference screenshots, фактические screenshots, diff-изображения и краткие отчёты. Наличие картинки не означает PASS.

## Baseline

- `paper-home-desktop-1440.png` — reference текущего Paper SCR-002.
- Размер макета: 1440 × 3376.
- `homepage-desktop-chrome-1440.png` — фактическая страница 1440 × 3347.
- `homepage-mobile-chrome-390.png` и `homepage-mobile-chrome-360.png` — фактическая provisional mobile-адаптация.
- Baseline остаётся provisional, пока `DEC-019` открыт.
- Mobile baseline отсутствует; 390/360 px screenshots относятся к `DG-017`, имеют статус `PROVISIONAL / DESIGN_REVIEW_REQUIRED` и не закрывают дизайн.

## Имена файлов

```text
paper-home-desktop-1440.png
homepage-desktop-chrome-1440.png
homepage-mobile-chrome-390.png
homepage-mobile-chrome-360.png
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
- Playwright: 13 tests, 11 passed, 2 intentional skipped, 0 failed; проверены 1440, 390 и 360 px, отсутствие горизонтального overflow, keyboard focus, admin save+restore, Woo CRUD, AJAX cart/count/page и classic/Store API guards.
- Подробности: [`report-home-20261101.md`](report-home-20261101.md).

## Отчёт

Для каждого расхождения указать: компонент, координату/селектор, expected, actual, severity, источник (`Paper`, `DG`, `DEC`), принятое действие и статус. Не «исправлять» неоднозначность Paper без записи в decision log.

