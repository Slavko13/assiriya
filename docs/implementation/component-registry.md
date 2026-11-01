# Реестр компонентов

**Источник дизайна:** Paper SCR-001/SCR-002 и `J:\vlad322\docs\01_paper_audit`.  
**Статус:** компоненты Итерации 1 реализованы и локально проверены; Paper comparison сохранён, mobile/окончательный baseline имеют `DESIGN_REVIEW_REQUIRED`.

| Компонент | Источник Paper / UI | Код | Данные | Состояния в Итерации 1 | Переиспользование / статус |
|---|---|---|---|---|---|
| Site header / topbar | SCR-002, UI-001—009 | `header.php`, `main.css`, `main.js` | Settings, WC URLs/cart | desktop/mobile nav, contact dialog; город/search targets частичны | общий для всех страниц; `TESTING` |
| Logo | SCR-002 | `header.php` | WP custom logo/fallback | link/fallback | общий; `TESTING` |
| City selector | UI-SCR002-001 | `header.php`, status dialog | нет delivery source | честный blocked state | общий; `BLOCKED` |
| Catalog CTA/menu | UI-SCR002-002/012; SCR-005 | `header.php`, `front-page.php`, Woo archive hook | curated `product_cat` | empty + populated; configured shop → category проверен | общий; I2-S1 `PASS / PROVISIONAL` |
| Product search | UI-SCR002-003—005 | `header.php`, named Woo hooks | generic WC/WP product search | multi/one-result cards/PDP + provisional escaped no-results; exact product scope keeps the results page; field contract/DG/index/ranking отсутствуют, ordering control hidden | общий; I2-S5/S6/S10/S13 `PASS / PROVISIONAL`, overall `BLOCKED` |
| Account/cart actions | UI-SCR002-006/007 | `header.php` | WC pages/session | AJAX add, count, cart page, guarded checkout проверены | общий; Iteration 1 `PASS` |
| Vehicle picker | UI-SCR002-008—011 | `front-page.php` | будущий Fitment adapter | controls disabled + explanation | будущие SCR-003/008; `BLOCKED` |
| Hero/promo | SCR-002 | `front-page.php`, Settings API | editable copy/media | normal + image fallback via defaults | homepage; `TESTING` |
| Benefits row | SCR-002 | `front-page.php` | static presentation copy | normal | reusable card pattern; `TESTING` |
| Category card/grid | UI-SCR002-012; SCR-005 | shared `helpers.php`, homepage и shop hook | Woo category | populated + CRUD/render/cleanup; reused on configured shop page | I2-S1 `PASS / PROVISIONAL`; master taxonomy TBD |
| Catalog archive controls | SCR-005; PBL-010/012 partial | named Woo hooks in `functions.php` | Woo loop total | canonical shop: local total count, no ordering UI; search/category scopes isolated | I2-S9 `PASS / PROVISIONAL`; ranking/query/design open |
| Woo breadcrumb | SCR-005/006/009; PBL-010/011/012 partial | named Woo breadcrumb filters | configured shop URL + exact product-search request | «Главная», «Каталог товаров», product-search label; category/product/page crumbs preserved | I2-S12 `PASS / PROVISIONAL`; full i18n/SEO/design open |
| Product card/row | UI-SCR002-013—015 | `helpers.php`, Woo filters | WC product | demo/real label, in/out stock; standard Woo direct-add loop имеет explicit demo action; CRUD/render проверен | I2-S3/S7 `PASS / PROVISIONAL`; business meaning `BLOCKED` |
| Product detail technical baseline | SCR-009 partial | Woo hooks/filters, no template override | WC product + demo marker | provenance, technical SKU, unconfirmed availability, demo action, description labels; related suppressed for demo; unmarked isolation E2E | I2-S3/S4/S7/S8 `PASS / PROVISIONAL`; full PDP `BLOCKED` |
| VIN entry block | UI-SCR002-016 | `front-page.php` | no persistence | partial input + status, no submit | SCR-004 later; `BLOCKED` |
| B2B banner | UI-SCR002-017 | `front-page.php` | editable copy | info/status only | DG-009 later; `BLOCKED` |
| Pickup/delivery block | UI-SCR002-018 | `front-page.php` | editable copy, no tariff | illustrative map/status | SCR-011/012 later; `BLOCKED` |
| Footer | SCR-002 and full pages | `footer.php` | menus/contact settings | fallback menus/contact modal | общий; `TESTING` |
| Contact dialog | SCR-001 | `footer.php`, `main.js` | contact settings | open/close/keyboard requires E2E | общий; `TESTING` |
| Status dialog | DG-safe placeholder | `footer.php`, `main.js` | local messages only | vehicle/VIN/B2B/delivery explanations | не считать бизнес-UI; `TESTING` |
| Button/icon/input primitives | повторяются во всех SCR | `helpers.php`, `main.css` | presentation | default/disabled + keyboard skip-link/focus ring проверены | common library; Iteration 1 `PASS`, полный state set развивается |

## Визуальные основы

- Desktop baseline SCR-002: `1440 × 3376`.
- Mobile-макетов нет. Адаптация на 360 px является **provisional** по `DG-017`, `DEC-019`, `DEC-020`.
- Семантика из Paper: синий — primary action; зелёный — собственный склад/наличие; янтарный — поставщик/под заказ.
- Основной шрифт — Inter; Paper также содержит Arial и Golos Text. Формальные tokens отсутствуют, поэтому значения темы считаются техническим baseline до утверждения.
- Базовый keyboard focus/disabled state проверен; полный набор hover/error/loading/empty/partial/stale остаётся `DG-018`.

## Assets

Локальные изображения темы находятся в `wp-content/themes/avtozakup/assets/images`. Их наличие не подтверждает лицензию внешнего каталога или окончательное соответствие Paper. Перед production для каждого asset фиксируются источник, лицензия, alt/декоративность и оптимизированный размер.

## Правило изменения

Новый повторяемый блок сначала добавляется сюда с variants/states и источником требования. Нельзя копировать product card/header/footer в отдельные несовместимые реализации.

