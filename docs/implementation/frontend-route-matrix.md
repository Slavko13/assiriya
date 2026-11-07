# Frontend route matrix

Актуально для итерации `I2-S83` от 2026-11-07. Матрица построена по живому Paper-файлу `01M6BSMXQST9XYEMQYXQARBFFT`: `13` артбордов, `4489` узлов, token hash `811c9dc5`. Это инвентаризация текущего состояния, а не визуальная приёмка.

## Матрица экранов

| SCR | Экран | Route/component | Paper reference | Actual 1440 | Mobile | Статус | Следующая задача |
|---|---|---|---|---|---|---|---|
| SCR-001 | Контакты | Глобальный `dialog[data-contact-dialog]`, открывается с любой страницы | [Paper](../qa/visual-diffs/i2-s83/paper-scr-001-contact-desktop-360x515.png) | [1440](../qa/visual-diffs/i2-s83/before-scr-001-contact-desktop-chrome-1440.png) | [390](../qa/visual-diffs/i2-s83/before-scr-001-contact-mobile-chrome-390.png) / [360](../qa/visual-diffs/i2-s83/before-scr-001-contact-mobile-chrome-360.png), `PROVISIONAL` | `PARTIAL` | I2-S90: глобальное состояние и mobile |
| SCR-002 | Главная | `/`, `front-page.php` | [Paper](../qa/visual-diffs/i2-s83/paper-scr-002-home-desktop-1440.png) | [1440](../qa/visual-diffs/i2-s83/before-scr-002-home-desktop-chrome-1440.png) | [390](../qa/visual-diffs/i2-s83/before-scr-002-home-mobile-chrome-390.png) / [360](../qa/visual-diffs/i2-s83/before-scr-002-home-mobile-chrome-360.png), `PROVISIONAL` | `PARTIAL` | I2-S90: общий mobile/final pass |
| SCR-003 | Выбор автомобиля | `/vehicle/`; route отсутствует, текущий ответ `404` | [Paper](../qa/visual-diffs/i2-s83/paper-scr-003-vehicle-desktop-1440.png) | [404 actual](../qa/visual-diffs/i2-s83/before-scr-003-vehicle-desktop-chrome-1440.png) | [390](../qa/visual-diffs/i2-s83/before-scr-003-vehicle-mobile-chrome-390.png) / [360](../qa/visual-diffs/i2-s83/before-scr-003-vehicle-mobile-chrome-360.png) | `MISSING` | I2-S86: создать route и выбор автомобиля |
| SCR-004 | Подбор по VIN | `/vin-request/`, общий `page.php` | [Paper](../qa/visual-diffs/i2-s83/paper-scr-004-vin-desktop-1440.png) | [1440](../qa/visual-diffs/i2-s83/before-scr-004-vin-desktop-chrome-1440.png) | [390](../qa/visual-diffs/i2-s83/before-scr-004-vin-mobile-chrome-390.png) / [360](../qa/visual-diffs/i2-s83/before-scr-004-vin-mobile-chrome-360.png), `PROVISIONAL` | `PARTIAL` | I2-S87: полноценный VIN-экран |
| SCR-005 | Каталог | `/shop/`, Woo shop archive | [Paper](../qa/visual-diffs/i2-s83/paper-scr-005-catalog-desktop-1440.png) | [1440](../qa/visual-diffs/i2-s83/before-scr-005-catalog-desktop-chrome-1440.png) | [390](../qa/visual-diffs/i2-s83/before-scr-005-catalog-mobile-chrome-390.png) / [360](../qa/visual-diffs/i2-s83/before-scr-005-catalog-mobile-chrome-360.png), `PROVISIONAL` | `PARTIAL` | I2-S88: каталог, фильтры и состояния |
| SCR-006 | Категория | `/product-category/tormoznaya-sistema/`, Woo taxonomy archive | [Paper](../qa/visual-diffs/i2-s83/paper-scr-006-category-desktop-1440.png) | [1440](../qa/visual-diffs/i2-s83/before-scr-006-category-desktop-chrome-1440.png) | [390](../qa/visual-diffs/i2-s83/before-scr-006-category-mobile-chrome-390.png) / [360](../qa/visual-diffs/i2-s83/before-scr-006-category-mobile-chrome-360.png), `PROVISIONAL` | `PARTIAL` | I2-S88: категория, фильтры и pagination |
| SCR-007 | Подкатегория | `/product-category/tormoznye-diski/`; taxonomy term отсутствует, текущий ответ `404` | [Paper](../qa/visual-diffs/i2-s83/paper-scr-007-subcategory-desktop-1440.png) | [404 actual](../qa/visual-diffs/i2-s83/before-scr-007-subcategory-desktop-chrome-1440.png) | [390](../qa/visual-diffs/i2-s83/before-scr-007-subcategory-mobile-chrome-390.png) / [360](../qa/visual-diffs/i2-s83/before-scr-007-subcategory-mobile-chrome-360.png) | `MISSING` | I2-S88: создать child taxonomy и экран |
| SCR-008 | Каталог выбранного автомобиля | Отдельный route/state отсутствует; actual — честная status-dialog заглушка с главной | [Paper](../qa/visual-diffs/i2-s83/paper-scr-008-vehicle-catalog-desktop-1440.png) | [absence evidence](../qa/visual-diffs/i2-s83/before-scr-008-vehicle-catalog-desktop-chrome-1440.png) | [390](../qa/visual-diffs/i2-s83/before-scr-008-vehicle-catalog-mobile-chrome-390.png) / [360](../qa/visual-diffs/i2-s83/before-scr-008-vehicle-catalog-mobile-chrome-360.png) | `MISSING` | I2-S86: vehicle context и каталог применяемости |
| SCR-009 | Карточка товара | Dynamic Woo product permalink, `single-product` + project hooks | [Paper](../qa/visual-diffs/i2-s83/paper-scr-009-product-desktop-1440.png) | [1440](../qa/visual-diffs/i2-s83/before-scr-009-product-desktop-chrome-1440.png) | [390](../qa/visual-diffs/i2-s83/before-scr-009-product-mobile-chrome-390.png) / [360](../qa/visual-diffs/i2-s83/before-scr-009-product-mobile-chrome-360.png), `PROVISIONAL` | `PARTIAL` | I2-S84: завершить визуальные блоки PDP |
| SCR-010 | Корзина | `/cart/`, Woo Cart Block + theme presentation | [Paper](../qa/visual-diffs/i2-s83/paper-scr-010-cart-desktop-1440.png) | [1440](../qa/visual-diffs/i2-s83/before-scr-010-cart-desktop-chrome-1440.png) | [390](../qa/visual-diffs/i2-s83/before-scr-010-cart-mobile-chrome-390.png) / [360](../qa/visual-diffs/i2-s83/before-scr-010-cart-mobile-chrome-360.png), `PROVISIONAL` | `PARTIAL` | I2-S84: завершить визуальные блоки корзины |
| SCR-011 | Checkout | `/checkout/`, Woo Checkout Block + fail-closed guard | [Paper](../qa/visual-diffs/i2-s83/paper-scr-011-checkout-desktop-1440.png) | [1440](../qa/visual-diffs/i2-s83/before-scr-011-checkout-desktop-chrome-1440.png) | [390](../qa/visual-diffs/i2-s83/before-scr-011-checkout-mobile-chrome-390.png) / [360](../qa/visual-diffs/i2-s83/before-scr-011-checkout-mobile-chrome-360.png), `PROVISIONAL` | `PARTIAL` | I2-S85: сверстать checkout по Paper |
| SCR-012 | Доставка и оплата | `/delivery/`, общий `page.php` | [Paper](../qa/visual-diffs/i2-s83/paper-scr-012-delivery-desktop-1440.png) | [1440](../qa/visual-diffs/i2-s83/before-scr-012-delivery-desktop-chrome-1440.png) | [390](../qa/visual-diffs/i2-s83/before-scr-012-delivery-mobile-chrome-390.png) / [360](../qa/visual-diffs/i2-s83/before-scr-012-delivery-mobile-chrome-360.png), `PROVISIONAL` | `PARTIAL` | I2-S89: полный информационный экран |
| SCR-013 | Гарантия и возврат | `/returns/`, общий `page.php` | [Paper](../qa/visual-diffs/i2-s83/paper-scr-013-returns-desktop-1440.png) | [1440](../qa/visual-diffs/i2-s83/before-scr-013-returns-desktop-chrome-1440.png) | [390](../qa/visual-diffs/i2-s83/before-scr-013-returns-mobile-chrome-390.png) / [360](../qa/visual-diffs/i2-s83/before-scr-013-returns-mobile-chrome-360.png), `PROVISIONAL` | `PARTIAL` | I2-S89: гарантия, возврат и FAQ |

**Итог:** `0 DONE`, `10 PARTIAL`, `3 MISSING`.

`PROVISIONAL` не считается отдельным одиннадцатым результатом: это qualifier для responsive-версий и осознанных адаптаций, потому что Paper содержит только desktop-артборды, кроме компактного SCR-001.

## Визуальные разрывы

| SCR | Основной разрыв с Paper | Severity | Действие |
|---|---|---|---|
| SCR-001 | Текущий рабочий modal использует только подтверждённые телефон/email и другую геометрию полного viewport; точного mobile-макета нет | medium | Уточнить global/mobile в I2-S90, не выдумывать каналы связи |
| SCR-002 | Отличаются hero, карточки и их данные/изображения, отсутствуют часть Paper-состояний и controls | high | Финальный общий проход после S84—S89 |
| SCR-003 | Вместо экрана — стандартный `404` | blocker | Создать в I2-S86 |
| SCR-004 | Вместо многошаговой VIN-формы — краткая статическая страница | high | Реализовать в I2-S87 |
| SCR-005 | Нет Paper sidebar/filter/view/pagination композиции; current archive короче | high | Реализовать в I2-S88 |
| SCR-006 | Нет sidebar/filter/pagination и полного наполнения Paper; только 2 товара | high | Реализовать в I2-S88 |
| SCR-007 | Нет taxonomy term и route | blocker | Создать в I2-S88 |
| SCR-008 | Нет vehicle context, route и каталога применяемости; показана только fail-closed заглушка | blocker | Создать в I2-S86 |
| SCR-009 | Нет подтверждённых supplier/ETA/city/favorite/variant/offer данных; упрощены таблицы и нижние секции | high | Визуально завершить без ложных обещаний в I2-S84 |
| SCR-010 | Нет Paper delivery/source/favorite/split-shipment данных; current cart использует честный native Woo state | high | Визуально завершить в I2-S84 |
| SCR-011 | Current Checkout Block остаётся в placeholder-состоянии под guard; нет Paper fields, summary и payment/delivery choices | blocker | Реализовать presentation в I2-S85, не активируя заказ |
| SCR-012 | Только заголовок и один абзац вместо секций способов, сроков, оплаты и FAQ | high | Реализовать в I2-S89 |
| SCR-013 | Только заголовок и один абзац вместо правил, шагов возврата, гарантийных состояний и FAQ | high | Реализовать в I2-S89 |

## Переиспользуемые компоненты

Уже есть и должны развиваться без создания параллельных вариантов:

- общий header/navigation/search/cart и общий footer;
- contact/status dialogs с focus return;
- category card и shared Woo listing card;
- native Woo product gallery/price/quantity/cart controls с проектной PDP-композицией;
- native Woo Cart Block с проектной оболочкой;
- базовые button/input/focus tokens.

Не хватает общих компонентов:

- field wrapper, hint/error/validation и grouped form controls;
- notification, loading, empty, error и success states;
- filter/sidebar, pagination и view toggle;
- order summary, delivery method и payment method;
- vehicle context, fitment badge и выбранный автомобиль;
- FAQ accordion.

Риски дублирования: homepage cards и Woo loop cards пока имеют две реализации; Woo breadcrumbs и вручную собранные cart crumbs расходятся; empty/error states и form fields фрагментированы. Эти риски закрываются общими компонентами, а не копированием разметки по каждому SCR.

## Ссылки и маршруты

| Состояние | Маршруты |
|---|---|
| `200` | `/`, `/vin-request/`, `/shop/`, `/product-category/tormoznaya-sistema/`, `/cart/`, `/checkout/` с непустой корзиной, `/delivery/`, `/returns/`, `/contacts/` |
| Ожидаемый текущий `404` | `/vehicle/`, `/product-category/tormoznye-diski/`, `/about/`, `/faq/`, `/documents/`, `/offer/`, `/privacy/` |
| Broken fragment | header-ссылка `#vin-request` существует на внутренних страницах, но target есть только на `/` |
| Orphaned | `/contacts/` опубликован и отвечает `200`, но публичные контакты открываются dialog-кнопками и route не связан с навигацией |

404 и broken fragment являются найденным долгом, а не успешным acceptance. Автоматический I2-S83 audit фиксирует exact current statuses, чтобы изменение обязательно сопровождалось обновлением этой матрицы.

## Осознанные отклонения

- Не добавлены вымышленные поставщики, остатки, сроки, города, способы доставки/оплаты и рабочие заявки.
- Отсутствующие SCR-003/007/008 не подменены декоративными страницами.
- Responsive captures на `390/360` — техническая адаптация без Paper mobile source и остаются `PROVISIONAL`.
- Диагностические overlay/side-by-side не являются pixel-perfect approval; SCR-001 дополнительно сравнивает Paper `360×515` с full-page actual `1440px` без масштабирования.
- В I2-S83 production PHP/CSS/JS, данные WordPress и backend не изменялись; ни одно открытое `DEC` не закрыто.
