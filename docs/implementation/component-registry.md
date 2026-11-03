# Реестр компонентов

**Источник дизайна:** Paper SCR-001/SCR-002 и `J:\vlad322\docs\01_paper_audit`.  
**Статус:** компоненты Итерации 1 реализованы и локально проверены; Paper comparison сохранён, mobile/окончательный baseline имеют `DESIGN_REVIEW_REQUIRED`.

| Компонент | Источник Paper / UI | Код | Данные | Состояния в Итерации 1 | Переиспользование / статус |
|---|---|---|---|---|---|
| Site header / topbar | SCR-002, UI-001—009 | `header.php`, `main.css`, `main.js` | Settings, WC URLs/cart | nav click/Enter/Space/Escape/name; exact breakpoint reset/re-entry; inside/outside click plus internal VIN pointer/Enter dismissal with preserved fragment and guarded non-pointer target-focus handoff; dialog ancestry/contact retained; город/search targets частичны | общий для всех страниц; I2-S42/S46/S48/S49/S52/S56/S59/S62 nav/dialog `PASS / TECHNICAL`, overall `TESTING` |
| Skip link / primary landmark | direct Paper control mapping отсутствует | `header.php`, four theme main templates, `main.css` | none | first Tab on homepage at `1440/390/360` gives visible fully-in-viewport `:focus-visible` link and exact main transfer; desktop front/page/Woo renderer-family evidence retained | I2-S54/S61 `PASS / TECHNICAL`; generic index runtime, other mobile routes, SR/AT/browser/full WCAG open |
| Logo | SCR-002 | `header.php` | WP custom logo/fallback | link/fallback | общий; `TESTING` |
| City selector | UI-SCR002-001 | `header.php`, status dialog | нет delivery source | честный blocked state | общий; `BLOCKED` |
| Catalog CTA/menu | UI-SCR002-002/012; SCR-005 | `header.php`, `front-page.php`, Woo archive hook | curated `product_cat` | empty + populated; configured shop → category проверен | общий; I2-S1 `PASS / PROVISIONAL` |
| Product search | UI-SCR002-003—005 | `header.php`, named Woo hooks | generic WC/WP product search | multi/one-result cards/PDP + provisional escaped no-results; exact product scope keeps the results page; field contract/DG/index/ranking отсутствуют, ordering control hidden | общий; I2-S5/S6/S10/S13 `PASS / PROVISIONAL`, overall `BLOCKED` |
| Header account/cart actions | UI-SCR002-006/007 | `header.php`, `functions.php` | WC page URLs/session/cart fragments | canonical entry links; at 900px hidden label relations retain `Войти` and `Корзина {current count}` names; custom badge fragment through the standard Woo API keeps repeated same-product `1 → 2` and exact computed names on `1440/390/360`; after exact cart navigation and one immediate reload, visible relation/count/name `2`/`Корзина 2`, exact row identity and demo notice persist; subsequent checkout navigation retains header state and notice in the same guest session | общий; Iteration 1 и I2-S30/S35/S55/S57/S58/S63/S67 renderer/session `PASS / TECHNICAL`; live announcement, repeated/delayed reload, restart/cookie policy, units-vs-lines/business correctness, auth/commerce remain open |
| Guest My Account renderer | FR-AUTH-002/003; direct Paper control mapping отсутствует | Woo core renderer, без theme override | guest login/reset-form renderer only | login form wiring; password/remember pointer+keyboard states; six-stop local order/focus signal; lost-password real Tab/Enter → exact GET plus reset action/input/marker/nonce/referer/submit wiring and exact-action no-POST | I2-S30/S33/S41/S44/S50/S51/S53/S60/S64 `PASS / TECHNICAL`; reset submission/neutral response/token/security, ring contrast/occlusion, auth/session/IAM остаются open |
| Vehicle picker | UI-SCR002-008—011 | `front-page.php` | будущий Fitment adapter | controls disabled + exact DEC-004 status dialog/focus | I2-S47 renderer `PASS / TECHNICAL`; будущие SCR-003/008/domain `BLOCKED` |
| Hero/promo | SCR-002 | `front-page.php`, Settings API | editable copy/media | normal + image fallback via defaults | homepage; `TESTING` |
| Benefits row | SCR-002 | `front-page.php` | static presentation copy | normal | reusable card pattern; `TESTING` |
| Category card/grid | UI-SCR002-012; SCR-005 | shared `helpers.php`, homepage/shop hook, Settings select | curated Woo term IDs | exactly 8 selected identities/order/URLs; admin options show `name (#ID)`; legacy terms excluded; link name = visible term name | I2-S1/S14/S15/S16 `PASS / PROVISIONAL`; master taxonomy TBD |
| Catalog archive controls | SCR-005; PBL-010/012 partial | named Woo hooks in `functions.php` | Woo loop total | canonical shop: local total count, no ordering UI; search/category scopes isolated | I2-S9 `PASS / PROVISIONAL`; ranking/query/design open |
| Woo breadcrumb | SCR-005/006/009; PBL-010/011/012 partial | named Woo breadcrumb filters | configured shop URL + exact product-search request | «Главная», «Каталог товаров», product-search label; category/product/page crumbs preserved | I2-S12 `PASS / PROVISIONAL`; full i18n/SEO/design open |
| Product card/row | UI-SCR002-013—015 | `helpers.php`, Woo filters | WC product | demo/real label, in/out stock; standard Woo direct-add loop имеет explicit demo action; CRUD/render проверен | I2-S3/S7 `PASS / PROVISIONAL`; business meaning `BLOCKED` |
| Product detail technical baseline | SCR-009 partial | Woo hooks/filters, no template override | WC product + demo marker | provenance, technical SKU, unconfirmed availability, demo action, description labels; related suppressed for demo; unmarked isolation E2E | I2-S3/S4/S7/S8 `PASS / PROVISIONAL`; full PDP `BLOCKED` |
| VIN entry block | UI-SCR002-016 | `front-page.php` | no persistence | partial input + exact DEC-017/018 status/focus, no submit; exact `#vin-request[tabindex=-1]` receives internal-nav Enter focus without joining Tab order | I2-S47/S62 renderer/navigation `PASS / TECHNICAL`; SCR-004/domain `BLOCKED` |
| B2B banner | UI-SCR002-017 | `front-page.php` | editable copy | info + exact DEC-016 status/focus only | I2-S47 renderer `PASS / TECHNICAL`; DG-009/domain `BLOCKED` |
| Pickup/delivery block | UI-SCR002-018 | `front-page.php` | editable copy, no tariff | illustrative map/status | SCR-011/012 later; `BLOCKED` |
| Footer | SCR-002 and full pages | `footer.php` | menus/contact settings | fallback menus/contact modal | общий; `TESTING` |
| Contact dialog | SCR-001/UI-SCR001-003/004/006 | `header.php`, `footer.php`, `main.js` | contact settings | opener semantics; keyboard close; Escape/outside-rect pointer + child-content boundary; visible phone/email renderer relation; opener focus restore | общий; I2-S45/S49 `PASS / TECHNICAL` renderer partial; channel business acceptance `TESTING` |
| Status dialog | DG-safe placeholder | `footer.php`, `main.js` | own-key local message allowlist only | vehicle/VIN/B2B/delivery exact explanations; close/Escape/outside-rect pointer focus round-trip; unknown/inherited keys fail closed | I2-S43/S47/S49 `PASS / TECHNICAL`; не считать business UI |
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

