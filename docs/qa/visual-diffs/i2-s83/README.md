# I2-S83 — complete Paper frontend inventory

Дата фиксации: 2026-11-07. Источник: live Paper file `01M6BSMXQST9XYEMQYXQARBFFT`, page `p-1-0`, `13` artboards, `4489` nodes. Paper token hash: `811c9dc5`.

Evidence pack contains 13 Paper references, 39 current actual captures and 26 diagnostic comparisons. Всего в каталоге `78 PNG`:

- `13` Paper exports;
- `13 × 3 = 39` current actual screenshots на `desktop-chrome-1440`, `mobile-chrome-390`, `mobile-chrome-360`;
- `13` side-by-side и `13` overlay desktop comparisons.

Это inventory-only итерация. Файлов `after-*` нет: `before-*` означает текущее состояние перед реализацией I2-S84—S90. Никакая production-вёрстка в S83 не менялась.

## Источники и текущие captures

| SCR | Paper artboard / размер | Paper file | Desktop actual / размер | Mobile actuals | Классификация |
|---|---|---|---|---|---|
| SCR-001 | `1-0`, `360×515` | `paper-scr-001-contact-desktop-360x515.png` | `before-scr-001-contact-desktop-chrome-1440.png`, `1440×3469` | `390×5273`, `360×5392` | `PARTIAL`, mobile `PROVISIONAL` |
| SCR-002 | `1H-0`, `1440×3376` | `paper-scr-002-home-desktop-1440.png` | `before-scr-002-home-desktop-chrome-1440.png`, `1440×3469` | `390×5273`, `360×5392` | `PARTIAL`, mobile `PROVISIONAL` |
| SCR-003 | `KQ-0`, `1440×900` | `paper-scr-003-vehicle-desktop-1440.png` | `before-scr-003-vehicle-desktop-chrome-1440.png`, `1440×1100` | `390×1177`, `360×1161` | `MISSING`; actual = `404` evidence |
| SCR-004 | `MC-0`, `1440×900` | `paper-scr-004-vin-desktop-1440.png` | `before-scr-004-vin-desktop-chrome-1440.png`, `1440×1100` | `390×1177`, `360×1161` | `PARTIAL`, mobile `PROVISIONAL` |
| SCR-005 | `NU-0`, `1440×1713` | `paper-scr-005-catalog-desktop-1440.png` | `before-scr-005-catalog-desktop-chrome-1440.png`, `1440×2431` | `390×5871`, `360×5879` | `PARTIAL`, mobile `PROVISIONAL` |
| SCR-006 | `11C-0`, `1440×2276` | `paper-scr-006-category-desktop-1440.png` | `before-scr-006-category-desktop-chrome-1440.png`, `1440×1218` | `390×1898`, `360×1927` | `PARTIAL`, mobile `PROVISIONAL` |
| SCR-007 | `1FR-0`, `1440×2258` | `paper-scr-007-subcategory-desktop-1440.png` | `before-scr-007-subcategory-desktop-chrome-1440.png`, `1440×1100` | `390×1177`, `360×1161` | `MISSING`; actual = `404` evidence |
| SCR-008 | `1RK-0`, `1440×2229` | `paper-scr-008-vehicle-catalog-desktop-1440.png` | `before-scr-008-vehicle-catalog-desktop-chrome-1440.png`, `1440×3469` | `390×5273`, `360×5392` | `MISSING`; actual = status-dialog absence evidence |
| SCR-009 | `28S-0`, `1440×2502` | `paper-scr-009-product-desktop-1440.png` | `before-scr-009-product-desktop-chrome-1440.png`, `1440×1942` | `390×3129`, `360×3154` | `PARTIAL`, mobile `PROVISIONAL` |
| SCR-010 | `2IL-0`, `1440×1489` | `paper-scr-010-cart-desktop-1440.png` | `before-scr-010-cart-desktop-chrome-1440.png`, `1440×1374` | `390×2039`, `360×2085` | `PARTIAL`, mobile `PROVISIONAL` |
| SCR-011 | `2RJ-0`, `1440×1680` | `paper-scr-011-checkout-desktop-1440.png` | `before-scr-011-checkout-desktop-chrome-1440.png`, `1440×2095` | `390×2423`, `360×2431` | `PARTIAL`, mobile `PROVISIONAL` |
| SCR-012 | `306-0`, `1440×2366` | `paper-scr-012-delivery-desktop-1440.png` | `before-scr-012-delivery-desktop-chrome-1440.png`, `1440×1100` | `390×1177`, `360×1161` | `PARTIAL`, mobile `PROVISIONAL` |
| SCR-013 | `384-0`, `1440×2560` | `paper-scr-013-returns-desktop-1440.png` | `before-scr-013-returns-desktop-chrome-1440.png`, `1440×1100` | `390×1177`, `360×1161` | `PARTIAL`, mobile `PROVISIONAL` |

Итог: `0 DONE / 10 PARTIAL / 3 MISSING`.

## Схема имён

Для каждого номера/slug существуют:

- `paper-scr-{NNN}-{slug}-desktop-*.png`;
- `before-scr-{NNN}-{slug}-{project}.png` для трёх проектов;
- `side-by-side-scr-{NNN}-{slug}-desktop.png`;
- `overlay-scr-{NNN}-{slug}-desktop.png`.

Slug-последовательность: `001-contact`, `002-home`, `003-vehicle`, `004-vin`, `005-catalog`, `006-category`, `007-subcategory`, `008-vehicle-catalog`, `009-product`, `010-cart`, `011-checkout`, `012-delivery`, `013-returns`.

## Метод сравнения

- Side-by-side: белый canvas, Paper слева, actual справа, оба изображения top-aligned и `1:1`, без растяжения.
- Overlay: белый canvas размера `max(width) × max(height)`, Paper top-left с opacity `1`, actual top-left с opacity `0.5`, без растяжения.
- SCR-001 намеренно даёт side-by-side шириной `1800px` (`360 + 1440`); это comparison разных контекстов, а не pixel overlay.
- SCR-002—013 дают side-by-side шириной `2880px`; высота равна более длинному источнику.
- Для SCR-003/007/008 comparison доказывает отсутствие реализации и не считается визуальным соответствием.

## Зафиксированные разрывы

- SCR-001: рабочий диалог и подтверждённые contact values, но другая геометрия и нет Paper mobile source.
- SCR-002: общая структура существует, но hero/product collections/content density и controls расходятся с Paper.
- SCR-003: `/vehicle/` возвращает `404`.
- SCR-004: `/vin-request/` — короткий generic page вместо полной формы.
- SCR-005: нет Paper sidebar/filter/view/pagination структуры.
- SCR-006: категория содержит 2 товара и не имеет Paper filter/pagination/content depth.
- SCR-007: child category/route отсутствуют, возвращается `404`.
- SCR-008: selected-vehicle route/state отсутствует; сохранена fail-closed dialog заглушка.
- SCR-009: live Woo PDP стабилен, но осознанно не выдумывает Paper supplier/ETA/city/favorite/offer данные.
- SCR-010: live two-row Woo cart стабилен, но нет неподтверждённых delivery/source/split-shipment элементов Paper.
- SCR-011: route доступен с непустой корзиной, однако guarded Checkout Block визуально остаётся placeholder и не соответствует форме Paper.
- SCR-012/013: опубликованы только заголовок и краткий честный текст; основные Paper sections отсутствуют.

Полный route/component/dead-link/reuse register находится в [frontend-route-matrix.md](../../../implementation/frontend-route-matrix.md).

## Проверки

`tests/e2e/frontend-inventory.spec.ts` выполняет один последовательный scenario на каждый public project:

- получает все 13 состояний, включая exact `404` и status-dialog absence evidence;
- проверяет отсутствие document overflow;
- запускает axe и запрещает `serious`/`critical` violations;
- запрещает неожиданные console/page errors, отдельно подтверждая exact document-404 noise;
- проверяет keyboard open/focus для обоих dialogs;
- перед SCR-009 visual capture фиксирует responsive gallery image к server-rendered canonical `src`, не меняя production markup;
- создаёт реальную двухстрочную Woo-корзину перед SCR-010/011 и ждёт завершения Cart Block hydration: две строки, ноль skeleton-узлов, два полностью декодированных product image; перед visual capture только в test DOM каждый responsive candidate фиксируется к его server-rendered canonical `src`, чтобы история посещения PDP не меняла compositor raster;
- на desktop проверяет current `200/404` route inventory и broken non-home `#vin-request` fragment.

Общий visual helper сохраняет уже опубликованный PNG только при доказанно ограниченном renderer noise: не более `64` pixels с channel delta `1` либо не более `2` inline-SVG antialias pixels с delta `64`. Граничные значения и первый недопустимый случай проверяются отдельным executable contract; raster-image отличия не маскируются и всегда перезаписывают actual с последующей сборкой comparisons.

Missing routes и broken links остаются долгом. Зелёный audit означает, что evidence соответствует честно описанному current state, а не что эти проблемы приняты.
