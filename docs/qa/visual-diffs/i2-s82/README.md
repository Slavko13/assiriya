# I2-S82 — SCR-009 / SCR-010 visual evidence

## Source and scope

- Paper file: `Автозап фулл`, current page `Page 1`.
- Desktop references: SCR-009 `1440×2502`, SCR-010 `1440×1489`.
- The exported references are immutable inputs for this slice. `before-*` files capture the last accepted I2-S81 implementation.
- Desktop `1440` is the design-fidelity target. `390` and `360` are safe provisional reflows because Paper contains no approved mobile frames.

## Evidence inventory

| Surface | Paper | Before | After | Side by side | Overlay |
|---|---|---|---|---|---|
| Product desktop 1440 | `paper-scr-009-desktop-1440.png` | `before-product-desktop-1440.png` | `after-product-desktop-chrome-1440.png` | `side-by-side-product-desktop-1440.png` | `overlay-product-desktop-1440.png` |
| Product mobile 390 | none | `before-product-mobile-390.png` | `after-product-mobile-chrome-390.png` | n/a | n/a |
| Product mobile 360 | none | `before-product-mobile-360.png` | `after-product-mobile-chrome-360.png` | n/a | n/a |
| Cart desktop 1440 | `paper-scr-010-desktop-1440.png` | `before-cart-desktop-1440.png` | `after-cart-desktop-chrome-1440.png` | `side-by-side-cart-desktop-1440.png` | `overlay-cart-desktop-1440.png` |
| Cart mobile 390 | none | `before-cart-mobile-390.png` | `after-cart-mobile-chrome-390.png` | n/a | n/a |
| Cart mobile 360 | none | `before-cart-mobile-360.png` | `after-cart-mobile-chrome-360.png` | n/a | n/a |

Desktop comparisons preserve both captures at their native `1440px` width. Side-by-side canvases place Paper on the left and the implementation on the right at `1:1`; overlays place the implementation at 50% opacity over the top-aligned Paper reference without stretching either capture.

## Discrepancy and disposition matrix

| Area | Paper contract | I2-S81 state | I2-S82 disposition |
|---|---|---|---|
| PDP header | breadcrumb, H1, brand/article/status actions | H1 plus brand/article only | align hierarchy and spacing; no inert favorite action |
| PDP primary grid | `392 / 413 / 423`, gaps `24` | `600 / 423`, gap `48` | restore three-column Paper geometry on marked records |
| PDP gallery | `392×427`, `88×85` thumbnails | oversized gallery | use bounded Paper geometry and a visible zoom affordance while retaining the native Woo gallery/lightbox; do not invent thumbnails for one real image |
| PDP characteristics | structured characteristics and package choice | absent | render the authoritative Woo name plus marked brand/article; omit package and specifications that are not structured product data |
| PDP purchase card | source, stock, price, quantity, native add action | price, neutral availability, quantity, add action | retain the native Woo price, availability, quantity and add form; do not invent a source or ranking label |
| PDP applicability | VIN/compatibility support strip | absent | real link to the existing VIN page; no compatibility claim |
| PDP offers | supplier comparison rows and actions | absent | render one semantic price/availability summary from the current Woo product only; no fake supplier, ordering, delivery term or secondary purchase action |
| PDP details | tabs, specifications, description, analogue and reviews | description tab only | expose confirmed marked fields and honest empty/support states; retain Woo description ownership |
| Cart heading | breadcrumb, H1/count, continue-shopping | oversized dark hero/steps | replace with compact Paper hierarchy and real catalog link |
| Cart columns | `860 / 396`, gap `24` | approximate `1.75fr / .75fr`, gap `26` | use exact desktop columns |
| Cart rows | bordered individual rows, `148px` image, native quantity/remove, source/ETA context | one shared panel; basic Woo row | restyle live Cart Block rows and retain native quantity/remove/price data; omit source and ETA claims that have no contract |
| Cart selection/favorites | row/select-all/favorite controls | absent | intentionally omitted until a real selection/favorites contract exists |
| Cart mixed ETA | notice for two distinct fulfillment times | absent | intentionally omitted: no promised dates, grouping or split-shipment rule exists |
| Cart city | city chooser | absent | intentionally omitted while `DEC-011/012` remain open; the UI makes no city or fulfillment promise |
| Cart summary | item totals, delivery status, total, native checkout | native totals and checkout | preserve live Cart Store totals and the native checkout entrypoint while retaining the explicit checkout-unavailable guard |
| Cart VIN help | compatibility help with VIN link | absent | add a real link to the existing VIN page |

## Intentional deviations from Paper

1. Decorative mini-heading `Ваш заказ` is not rendered, following the accepted I2-S75/I2-S76 product rule.
2. Public `демо`, `макет`, seed/provenance and similar implementation labels are not rendered, following I2-S81.
3. The Paper header count is not copied; the live Woo Cart Store count is authoritative.
4. The Paper supplier ordering, stock values, delivery dates and city selection are not treated as business rules while `DEC-002/005/006/008—012/019/020` remain open.
5. Selection, favorites and supplier-offer purchase actions are not presented as working controls without their backend contracts.
6. Mobile layouts are `PROVISIONAL / DESIGN_REVIEW_REQUIRED` and are evaluated for safe hierarchy, tap targets, overflow and accessibility rather than Paper pixel parity.

## Acceptance evidence

- Final current screenshots exist for desktop `1440`, mobile `390` and mobile `360`; the four desktop comparison artifacts above were generated at native scale and their dimensions were verified.
- Targeted implementation runs completed: new PDP/cart flow `6 passed` across all three public projects; existing cart+catalog regression `18 passed`; combined cart+new PDP/cart regression `15 passed`; isolated admin unmarked/partial-marker guard `1 passed`.
- The executable flow covers native Woo price equality, keyboard focus visibility, quantity `2`, add/reload/reopen, two distinct rows, total recalculation, one-row removal from a multi-row cart with persistence, last-row empty-cart behavior through the existing suite, and real catalog/checkout-link navigation boundaries.
- PHP/JS syntax, diff and config/documentation preflight `11/11` pass. Initial independent visual review found no critical overlap, clipping or document overflow; its tap-target and zoom findings were fixed. Code/test findings on unit counts, unresolved skeleton state, unsupported fulfillment copy, internal DOM/SKU markers, offer semantics, hard-coded specifications and fail-closed isolation were fixed and retested.
- Final `npm run test:e2e`: `67` tests = `65 passed`, `2 intentional skipped`, `0 failed`; post-suite inventory is `10` published products / `0` temporary products / `0` temporary categories / `0` temporary shop managers. Final independent visual review reports no blockers on `1440/390/360`. The slice is `DONE / PROVISIONAL / DESIGN_REVIEW_REQUIRED`, not Paper mobile/pixel-perfect or production-commerce acceptance.
