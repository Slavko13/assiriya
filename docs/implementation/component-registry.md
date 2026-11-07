# Реестр компонентов

**Источник дизайна:** Paper SCR-001/SCR-002 и `J:\vlad322\docs\01_paper_audit`.  
**Статус:** компоненты Итерации 1 реализованы и локально проверены; Paper comparison сохранён, mobile/окончательный baseline имеют `DESIGN_REVIEW_REQUIRED`.

| Компонент | Источник Paper / UI | Код | Данные | Состояния в Итерации 1 | Переиспользование / статус |
|---|---|---|---|---|---|
| Site header / topbar | SCR-002, UI-001—009 | `header.php`, `main.css`, `main.js` | Settings, WC URLs/cart | nav click/Enter/Space/Escape/name; exact breakpoint reset/re-entry; inside/outside click plus internal VIN pointer/Enter dismissal with preserved fragment and guarded non-pointer target-focus handoff; dialog ancestry/contact retained; город/search targets частичны | общий для всех страниц; I2-S42/S46/S48/S49/S52/S56/S59/S62 nav/dialog `PASS / TECHNICAL`, overall `TESTING` |
| Skip link / primary landmark | direct Paper control mapping отсутствует | `header.php`, four theme main templates, `main.css` | none | first Tab on homepage at `1440/390/360` gives visible fully-in-viewport `:focus-visible` link and exact main transfer; desktop front/page/Woo renderer-family evidence retained | I2-S54/S61 `PASS / TECHNICAL`; generic index runtime, other mobile routes, SR/AT/browser/full WCAG open |
| Logo | SCR-002 | `header.php` | WP custom logo/fallback | link/fallback | общий; `TESTING` |
| City selector | UI-SCR002-001 | `header.php`, status dialog | нет delivery source | честный blocked state | общий; `BLOCKED` |
| Catalog CTA/menu | UI-SCR002-002/012; SCR-005 | `header.php`, `front-page.php`, `helpers.php`, native WP menu/taxonomy/page objects, Woo archive hook | curated `product_cat`, project pages | configured shop → category; primary oils/maintenance/business destinations resolve same-origin native objects; `Смотреть масла →` opens exact oils archive; fallback links are runtime URLs rather than stored absolute hosts | общий; I2-S1/S81 `PASS / PROVISIONAL` |
| Product search | UI-SCR002-003—005 | `header.php`, named Woo hooks | generic WC/WP product search | multi/one-result cards/PDP + provisional escaped no-results; exact product scope keeps the results page; field contract/DG/index/ranking отсутствуют, ordering control hidden | общий; I2-S5/S6/S10/S13 `PASS / PROVISIONAL`, overall `BLOCKED` |
| Header account/cart actions | UI-SCR002-006/007 | `header.php`, `functions.php`, homepage `added_to_cart` handler, resolved Woo Cart Store subscription | WC page URLs/session/cart fragments/Cart Store | canonical entry links; a successful homepage simple-product add morphs the original action to `Перейти в корзину`, removes add transport state and native sibling link, sends no second POST and server-renders the cart-link state after reload; repeated/mutated cart paths retain exact counts, current Cart Block plus synchronizes `1→2`, and final-row remove synchronizes exact `0` / `Корзина 0`; reload/history continuity remains covered on `1440/390/360` | общий; Iteration 1 и I2-S30/S35/S55/S57/S58/S63/S67/S68/S70/S72/S73/S81 renderer/session `PASS / TECHNICAL`; live announcement, arbitrary product types/mutation/history/restart/cookie policy, units-vs-lines/business correctness, auth/commerce remain open |
| Guest My Account renderer | FR-AUTH-002/003; direct Paper login mapping отсутствует | Woo core renderer plus scoped `page.php` shell, exact Woo text filter and `main.css`; no Woo template override | guest base-login and reset-form renderer only | branded Russian split/stacked base-login shell; `52px` fields/toggle/CTA; exact form wiring and six-stop order retained; password/remember pointer+keyboard states; lost-password Tab/Enter → exact GET plus reset action/input/marker/nonce/referer/submit wiring and exact-action no-POST; local identifier↔submit focus edge retained | I2-S30/S33/S41/S44/S50/S51/S53/S60/S64/S69 `PASS / TECHNICAL`; I2-S74 `PASS / PROVISIONAL / DESIGN_REVIEW_REQUIRED`; successful/failed auth, recovery submit/security/session, authenticated pages, AT/browser/full WCAG/IAM remain open |
| Vehicle picker | UI-SCR002-008—011 | `front-page.php` | будущий Fitment adapter | controls disabled + exact DEC-004 status dialog/focus | I2-S47 renderer `PASS / TECHNICAL`; будущие SCR-003/008/domain `BLOCKED` |
| Hero/promo | SCR-002 | `front-page.php`, Settings API | editable copy/media | normal + image fallback via defaults | homepage; `TESTING` |
| Benefits row | SCR-002 | `front-page.php` | static presentation copy | normal | reusable card pattern; `TESTING` |
| Category card/grid | UI-SCR002-012; SCR-005 | shared `helpers.php`, homepage/shop hook, Settings select | curated Woo term IDs | exactly 8 selected identities/order/URLs; admin options show `name (#ID)`; legacy terms excluded; link name = visible term name | I2-S1/S14/S15/S16 `PASS / PROVISIONAL`; master taxonomy TBD |
| Catalog archive controls | SCR-005/006/007; PBL-010/012 partial | named Woo hooks in `functions.php` | Woo loop total | canonical shop/search/category use localized scope-specific totals; unsupported ordering UI is absent on all three supported listing routes while the underlying Woo query/order remains unchanged | I2-S9/S78 `PASS / PROVISIONAL`; approved ranking/sort/query rules and final design remain open |
| Woo breadcrumb | SCR-005/006/009; PBL-010/011/012 partial | named Woo breadcrumb filters | configured shop URL + exact product-search request | «Главная», «Каталог товаров», product-search label; category/product/page crumbs preserved | I2-S12 `PASS / PROVISIONAL`; full i18n/SEO/design open |
| Product card/row | SCR-002/006/007; UI-SCR002-013—015, UI-SCR006-005—007, UI-SCR007-003/004 | `helpers.php`, `front-page.php`, named Woo loop hooks/filters and route/home-scoped `main.css`; no `content-product.php` override | native WC product, internal ownership marker, homepage selected IDs and four presentation fields | shared shop/category/strict-product-search card and custom homepage card keep native thumbnail/title/permalink/price/type-specific action; project-owned records expose customer-facing brand/article without public provenance/internal seeded SKU, while unmarked records retain only available `pa_brand`/exact native SKU; homepage adds no fake stock/ETA/favorite/filter semantics, uses five desktop cards and a contained provisional mobile snap rail, while listings retain `4/3/2/1`; actions are at least `48px`; related/upsell and mixed-search loops excluded | I2-S3/S7/S78/S79/S81 `PASS / PROVISIONAL / DESIGN_REVIEW_REQUIRED`; stock/ETA/offers/fitment/favorites/filter/ranking/commercial meaning, Paper mobile/pixel-perfect/full WCAG/production acceptance remain `BLOCKED` |
| Product detail / purchase shell | SCR-009, UI-SCR009-001/002/008/009/010 partial | named Woo hooks/filters + scoped `main.css`, no template override | native WC product + internal ownership marker | native H1/gallery/price/descriptions/stock/quantity/form; customer-facing brand/article and category only for project-owned fixture, no public provenance/internal seeded SKU; neutral availability/action copy; responsive desktop columns and provisional mobile reflow; unmarked admin-owned isolation E2E; form grid limited to simple products | I2-S3/S4/S7/S8/S77/S81 `PASS / PROVISIONAL / DESIGN_REVIEW_REQUIRED`; offers/variants/fitment/analogs/reviews/commercial state and full PDP remain `BLOCKED` |
| Cart order review / empty state | SCR-010; UI-SCR010-004/005/009—012 | cart branch in `page.php`, current Blocks CSS, self-authored `empty-cart.svg`, unaccepted classic fallback, scoped label observer and resolved official Woo Cart Store subscription in `main.js` | current Woo cart session/Store; no copied product/price/stock state | Russian order-review intro without decorative eyebrow; responsive product/totals; neutral notice states that online checkout is temporarily unavailable without presenting a demo-site label; native plus `1→2` keeps header synchronized; exact final-row remove settles Store at zero and reveals one localized branded empty card with decorative cart medallion, opaque focus ring/canonical catalog CTA and no unapproved recommendations; no-overflow/axe/runtime + 6 cart screenshots | I2-S71/S73/S75/S81 `PASS / PROVISIONAL / DESIGN_REVIEW_REQUIRED`; I2-S72 `PASS / TECHNICAL`; classic renderer, undo/minus/multi-row/mixed offers/ETA/city/delivery/commercial validation and production checkout remain open |
| VIN entry block | UI-SCR002-016 | `front-page.php` | no persistence | meaningful H2/copy without decorative pre-heading; partial input + exact DEC-017/018 status/focus, no submit; exact `#vin-request[tabindex=-1]` receives internal-nav Enter focus without joining Tab order | I2-S47/S62 renderer/navigation and I2-S76 presentation `PASS / TECHNICAL`; SCR-004/domain `BLOCKED` |
| B2B banner | UI-SCR002-017 | `front-page.php` | editable copy | meaningful H2/copy/action without eyebrow; exact DEC-016 status/focus only | I2-S47 renderer and I2-S76 presentation `PASS / TECHNICAL`; DG-009/domain `BLOCKED` |
| Pickup/delivery block | UI-SCR002-018 | `front-page.php` | editable copy, no tariff | illustrative map/status | SCR-011/012 later; `BLOCKED` |
| Footer | SCR-002 and full pages | `footer.php`, `helpers.php` | menus/contact settings, native taxonomy/page URLs | customer-facing fallback links resolve real same-origin category/business destinations; contact modal retained; no hard-coded internal absolute host | общий; I2-S81 routing `PASS / TECHNICAL`, overall `TESTING` |
| Contact dialog | SCR-001/UI-SCR001-003/004/006 | `header.php`, `footer.php`, `helpers.php`, `main.css`, `main.js` | `contact_phone`, `contact_email` Settings | labelled/described meaningful dialog without decorative pre-heading; up to two nonempty renderable settings-backed icon rows with neutral intro, wrapping and `>=64px` targets; explicit empty config yields no links and honest copy; no unsupported hours/admin instruction; opener semantics, keyboard close, Escape/outside-rect pointer + child-content boundary and opener focus restore retained | общий; I2-S45/S49/S76/S80 `PASS / TECHNICAL / PROVISIONAL` renderer/presentation partial; channel validity/availability, Telegram/MAX/callback, CRM/SLA and production acceptance `TESTING` |
| Status dialog | DG-safe placeholder | `footer.php`, `main.js` | own-key local message allowlist only | labelled meaningful H2 without eyebrow; vehicle/VIN/B2B/delivery exact explanations; collision-safe close reserve verified by `1440/390/360` PNG; close/Escape/outside-rect pointer focus round-trip; unknown/inherited keys fail closed | I2-S43/S47/S49/S76 `PASS / TECHNICAL`; не считать business UI |
| Button/icon/input primitives | повторяются во всех SCR | `helpers.php`, `main.css` | presentation | default/disabled + keyboard skip-link/focus ring проверены | common library; Iteration 1 `PASS`, полный state set развивается |

## I2-S83 — full-Paper component inventory

Проверка всех `SCR-001—013` подтверждает базовый reuse-контур:

- общий `header`/navigation/search/cart и общий `footer` используются на полноценных theme/Woo routes;
- contact/status dialogs переиспользуют одну keyboard/focus модель;
- category card, Woo listing card, PDP native controls и Cart Block не должны копироваться в screen-specific markup;
- button/input/focus primitives остаются общими.

Отсутствующие reusable primitives, обязательные для I2-S84—S90:

| Primitive | Нужен для | Текущее состояние |
|---|---|---|
| Field wrapper + label/hint/error/validation | SCR-003/004/011 | `MISSING`; поля сейчас собираются разрозненно |
| Notification/loading/empty/error/success state | SCR-003—013 | `PARTIAL`; отдельные dialogs, 404, cart empty и checkout placeholders не образуют единую систему |
| Filter/sidebar + pagination + view toggle | SCR-005/006/007/008 | `MISSING` |
| Order summary + delivery/payment method | SCR-010/011/012 | `MISSING`; Woo state сохраняется authoritative |
| Vehicle context + fitment badge | SCR-003/008/009 | `MISSING` |
| FAQ accordion | SCR-012/013 | `MISSING` |

Duplication risks зафиксированы до реализации: homepage custom cards и Woo loop cards имеют две presentation paths; Woo breadcrumbs и вручную собранный cart breadcrumb расходятся; empty/error/loading и form-field states фрагментированы. Следующие срезы должны расширять существующие primitives или сначала создавать общий primitive, а не копировать screen markup.

Полная route/component/status карта: [`frontend-route-matrix.md`](frontend-route-matrix.md). I2-S83 не меняет production component code и не объявляет ни один SCR визуально завершённым.

## Визуальные основы

- Desktop baseline SCR-002: `1440 × 3376`.
- Mobile-макетов нет. Адаптация на 360 px является **provisional** по `DG-017`, `DEC-019`, `DEC-020`.
- Семантика из Paper: синий — primary action; зелёный — собственный склад/наличие; янтарный — поставщик/под заказ.
- Основной шрифт — Inter; Paper также содержит Arial и Golos Text. Формальные tokens отсутствуют, поэтому значения темы считаются техническим baseline до утверждения.
- Декоративные mini-heading/eyebrow/overline-подписи над основными заголовками запрещены; с I2-S76 они отсутствуют в текущем public theme frontend. Иерархию строят содержательные H1–H3 и основной текст. С I2-S81 внутренние ownership/provenance/seed labels не выводятся публично; product brands, status badges, field/navigation labels и функциональные metadata по-прежнему не относятся к запрету на декоративные заголовки. Правило зафиксировано владельцем 2026-11-06 и внесено в `AGENTS.md`.
- Базовый keyboard focus/disabled state проверен; полный набор hover/error/loading/empty/partial/stale остаётся `DG-018`.

## Assets

Локальные изображения темы находятся в `wp-content/themes/avtozakup/assets/images`. Их наличие не подтверждает лицензию внешнего каталога или окончательное соответствие Paper. Перед production для каждого asset фиксируются источник, лицензия, alt/декоративность и оптимизированный размер.

## Правило изменения

Новый повторяемый блок сначала добавляется сюда с variants/states и источником требования. Нельзя копировать product card/header/footer в отдельные несовместимые реализации.

