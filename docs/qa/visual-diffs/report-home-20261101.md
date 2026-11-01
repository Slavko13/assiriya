# Visual QA — Homepage — 2026-11-01

**Экран:** Paper SCR-002 / главная «АВТОЗАКУП»  
**Статус:** `STRUCTURALLY_CLOSE / NOT_PIXEL_PERFECT`  
**Mobile:** `PROVISIONAL / DESIGN_REVIEW_REQUIRED`

## Артефакты

| Артефакт | Назначение | Размер |
|---|---|---:|
| `paper-home-desktop-1440.png` | Paper reference | 1440 × 3376 |
| `homepage-desktop-chrome-1440.png` | фактический desktop | 1440 × 3347 |
| `homepage-mobile-chrome-390.png` | фактический mobile | 390 px viewport |
| `homepage-mobile-chrome-360.png` | фактический mobile | 360 px viewport |

Разница полной высоты desktop: −29 px относительно Paper. Это измерение не является подтверждением pixel-perfect совпадения.

## Результат сравнения

Порядок и состав основных секций, контейнерная структура, header/footer, каталог, две товарные подборки, VIN, B2B и получение заказа визуально близки к Paper. Страница сохраняет целостную дизайн-систему, однако pixel-perfect соответствие не достигнуто и не заявляется.

| Область | Paper | Фактический результат | Оценка | Статус |
|---|---|---|---|---|
| Полная высота desktop | 3376 px | 3347 px | minor, −29 px | известное отличие |
| Hero product composition | композиция из трёх флаконов | один флакон | заметное контентное отличие | требует утверждённого asset |
| Товарные блоки | контент Paper | демонстрационные WooCommerce products/content | ожидаемое MVP-отличие | принято для demo |
| Коммерческие подписи | макет без полного demo-контекста | явные demo labels | осознанное safety-отличие | принято для demo |
| MAHLE / LUZAR | продуктовые изображения | placeholder | недоступны исходные asset URLs | открыто до получения assets |
| Mobile | утверждённого макета нет | адаптация 390/360 без horizontal overflow | нельзя считать утверждённым дизайном | `DESIGN_REVIEW_REQUIRED` |

## Автоматические проверки

Финальный Playwright-прогон: **13 tests: 11 passed, 2 intentional skipped, 0 failed**.

Проверены:

- desktop 1440;
- mobile 390 и 360;
- обязательные секции и WooCommerce product cards;
- отсутствие горизонтального overflow;
- browser console/page errors и axe serious/critical;
- AJAX add-to-cart;
- header cart count, cart page и classic checkout guard;
- WordPress admin save + restore без сохранения тестового изменения;
- WooCommerce category/product create/edit → homepage → cleanup;
- keyboard Tab, видимый focus ring и skip-link target;
- WooCommerce Store API guard для демонстрационного checkout.

Отдельные smoke-проверки `/`, `/wp-json/` и Store API — `PASS`.

## Вывод

Главная пригодна как локальный Homepage MVP и структурно близка к Paper. Desktop требует дальнейшей визуальной доводки и исходных assets для pixel-perfect уровня. Mobile остаётся временной технической адаптацией до появления и утверждения макета.

Проверки выполнены локально на `http://localhost:8086/`. Серверного доступа и реального deployment не было; инфраструктурный статус проекта — `NOT_DEPLOYED`. Текущий HTTP/IP profile предназначен только для demo. Публичная административная панель допустима только через VPN, SSH tunnel либо HTTPS с доверенным сертификатом.
