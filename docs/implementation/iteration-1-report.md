# Итоговый отчёт — Итерация 1

**Итерация:** 1 — Homepage MVP + WordPress + Docker + Git Deployment  
**Дата:** 2026-11-01  
**Результат:** `READY_FOR_DEPLOYMENT`; сервер `NOT_DEPLOYED`.

## Что можно открыть и проверить

- сайт: `http://localhost:8086/`;
- админка: `http://localhost:8086/wp-admin/`;
- редактируемая главная, 8 WooCommerce-категорий и 10 demo-товаров;
- AJAX cart → badge → cart page → заблокированный classic checkout;
- HTML-отчёт: `playwright-report/index.html`;
- desktop/mobile screenshots и Paper comparison: `docs/qa/visual-diffs/`.

## Реализованные требования

Технический baseline покрывает применимую часть `FR-CAT-001/002`, `FR-CART-001`, `FR-AUTH-002`, `NFR-UX-001—003`, UI `SCR-002` и частичные безопасные представления будущих `FR-CAT-004`, `FR-SRCH-004`, `FR-VIN-001/002`, `FR-B2B-001`, `FR-DLV-001/002`. Реализованы только подтверждённые presentation/CMS/Docker части; fitment, offers, VIN submit, B2B onboarding, реальный checkout, payment и delivery не имитируются.

Подробная связь с BR/BRULE/UC/PBL/TC: `requirements-map.md` и `acceptance-status.md`.

## Backlog

- `PBL-010/011/019/036/037/039/040`: создан и проверен технический baseline; более широкий business acceptance остаётся `TESTING` или DEC-зависимым.
- `PBL-006/007/012—017/029/031` и commerce/integration scope последующих итераций остаются `BLOCKED` согласно исходной аналитике.
- Все 41 задачи исходного backlog сохранены в плане последующих итераций; закрытие не подменяется наличием demo UI.

## Компоненты

Созданы переиспользуемые header/topbar, navigation, hero, controls, benefit/category/product cards, product rows, VIN/B2B/pickup informational blocks, dialogs и footer. Полный реестр, варианты и ограничения: `component-registry.md`.

## Дизайн

- Paper reference: `1440 × 3376`;
- actual desktop: `1440 × 3347`;
- actual mobile: `390` и `360` px;
- структура, порядок секций и общий визуальный язык близки к SCR-002;
- результат не заявляется pixel-perfect;
- известные отличия: один флакон вместо трёх, demo products/copy/labels, placeholders MAHLE/LUZAR;
- mobile: `PROVISIONAL / DESIGN_REVIEW_REQUIRED`.

Полный отчёт: `../qa/visual-diffs/report-home-20261101.md`.

## Тесты

Финальный Playwright: **13 tests — 11 passed, 2 intentional skipped, 0 failed**. Два skip — viewport-дубли Store API guard; desktop guard выполнен.

Проверены desktop `1440`, mobile `390/360`, обязательные секции, Woo IDs, no-overflow, axe serious/critical, browser errors, keyboard focus/skip link, AJAX cart/count/cart page, classic и Store API checkout guards, admin login, Settings save/home/restore и Woo category/product CRUD с cleanup.

Дополнительно: dev/prod Compose config/build/up, runtime versions, repeated seed, restart persistence, smoke `/`, `/wp-json/`, Store API, Caddy CIDR/header drill, paired DB+uploads backup и isolated restore drill — `PASS`.

## Инфраструктура

- WordPress `7.1.4`, WooCommerce `11.2.1`, PHP `8.3.36`, MariaDB `11.4.13`;
- dev bind mounts; production theme/plugin embedded into image and synced by entrypoint;
- isolated project/networks/volumes; DB не публикуется;
- Caddy HTTP/IP demo edge, admin CIDR restriction, security headers;
- paired MariaDB + uploads backup/restore;
- clean/ff-only Git deployment с lock, pre-backup и smoke.

## Открытые решения и ограничения

`DEC-001…DEC-020` остаются `OPEN`. Demo price/stock/ETA не являются офертой. Реальные search/OEM/fitment/suppliers/VIN/B2B/order/payment/delivery/returns не активированы. HTTP profile допустим только для контролируемой демонстрации; публичной админке нужны VPN/SSH tunnel либо доверенный HTTPS edge.

Server inventory, два существующих сайта, порты и remote Git не проверялись из-за отсутствия доступа. Поэтому статус строго `NOT_DEPLOYED`; существующие сайты не изменялись.

## Команды

Локальный запуск:

```powershell
.\scripts\start.ps1
```

Credentials читаются из untracked `.env` (`WP_ADMIN_USER`, `WP_ADMIN_PASSWORD`) и не публикуются.

Production preparation/deploy:

```bash
cp .env.production.example .env.prod
docker compose --env-file .env.prod -f compose.yaml -f compose.prod.yaml config --quiet
ENV_FILE=/opt/avtozakup/.env.prod ./scripts/deploy.sh
```

Команды выполняются на сервере только после read-only inventory и настройки реальных secrets, `PUBLIC_URL`, `ADMIN_ALLOWED_CIDR`, свободного порта и Git origin.

## Следующая итерация

Ближайший кандидат — catalog/search/PDP по `PBL-002/006/011—017`. Gate: решения `DEC-002—006`, дизайн `DG-001/018` и контракты `INT-CAT/ERP/SUP`. До их появления независимая работа ограничивается схемами, fixtures и безопасными адаптерными границами без фиктивной production-логики.
