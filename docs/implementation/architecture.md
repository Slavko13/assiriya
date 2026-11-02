# Архитектура WordPress/WooCommerce

**Статус:** технический baseline Итерации 1, локальный контур проверен; серверный статус `NOT_DEPLOYED`.  
**Версии контейнеров:** WordPress 7.1.4 / PHP 8.3, WooCommerce 11.2.1, MariaDB 11.4.13, Caddy 2.10.2, cloudflared 2026.10.7 для временного preview.

## Границы

```text
Browser
  → Caddy (production HTTP edge, admin CIDR restriction)
    OR Cloudflare Quick Tunnel → project Caddy (preview, owner-approved public WP login)
    → WordPress + WooCommerce
      → theme/avtozakup          presentation, responsive UI
      → plugin/avtozakup-core    settings, demo safety, adapter contracts
        → future adapters        ERP/WMS, suppliers, catalog, CRM, PSP, delivery…
      → MariaDB                  isolated internal network + named volume
```

- `compose.yaml` задаёт базовые сервисы `db`, `wordpress`, `wpcli`, внутреннюю DB network и именованные volumes.
- `compose.dev.yaml` публикует только локальный WordPress port и только в dev использует bind mounts исходников темы и плагина.
- `compose.prod.yaml` добавляет Caddy; WordPress только `expose`, MariaDB наружу не публикуется.
- `compose.quick-tunnel.yaml` добавляет project-owned Caddy и outbound-only `cloudflared`; host ports отсутствуют, foreign Caddy/network не используются.
- Production-код темы и плагина встраивается в WordPress image при build, после чего entrypoint синхронизирует его в рабочее дерево контейнера. Production не зависит от bind mounts Git checkout.
- WordPress core хранится в volume; uploads и DB имеют отдельные volumes и образуют единую пару для backup/restore.
- Settings API хранит только presentation content. Категории/товары редактируются штатным WooCommerce.
- `Demo_Checkout_Guard` обязан блокировать создание заказа для демо-позиций и Store API checkout.

## Модули приложения

| Модуль | Ответственность | Не должен делать |
|---|---|---|
| Theme `avtozakup` | SCR-002, шаблоны, CSS/JS, семантика, WC presentation helpers | определять master data, резерв, цену, B2B или VIN workflow |
| Plugin `avtozakup-core` | настройки главной, demo seeding/guard, интеграционные interfaces | выдавать demo за production или хранить внешние секреты в options |
| WooCommerce | demo products/categories/cart и будущие extension points | подменять SupplierOffer/Reservation/Fulfillment одним полем без mapping |
| Bootstrap | идемпотентная установка WP/WC/theme/plugin/pages | сбрасывать существующих пользователей/данные |
| Deploy scripts | config validation, парный DB+uploads backup, ff-only update, build/start/bootstrap/smoke | удалять volumes или автоматически менять чужие сайты |

## Интеграционные карточки

Все контуры имеют статус `BLOCKED / NOT_IMPLEMENTED` до контракта и решения. Таймауты и число retry — TBD; повтор создания допускается только с тем же idempotency key и после проверки неизвестного результата.

| ID | Назначение и направление | Контракт / авторизация | Ошибки, retry, idempotency | Проверка | Блокирующие решения |
|---|---|---|---|---|---|
| INT-ERP-001 | товары, цены, остатки, резерв, заказы, документы ↔ ERP/WMS | API/queue/file TBD; service credential/allowlist TBD | versioning, staging import, atomic reserve, reconciliation | contract, duplicate, stale, race, recovery | DEC-001/002/008/009/012 |
| INT-SUP-001 | offers → сайт; purchase/status/cancel ↔ supplier | профиль на поставщика; API/file/auth/limits TBD | quarantine mapping, freshness, timeout, partial/reject, stable external key | fixtures, stale source, partial batch, unknown outcome | DEC-003/005/006/007 |
| INT-PAY-001 | create/status/webhook/refund ↔ PSP | hosted/tokenized API; signed webhook/replay protection | duplicate/out-of-order callbacks, UNKNOWN + reconciliation | success/fail/pending/duplicate/refund | DEC-010/013/015; PCI scope |
| INT-DLV-001 | points/tariff/shipment/tracking ↔ carrier | API key/OAuth TBD; versioned status map | no zero-price fallback, polling/webhook retry, shipment idempotency | unavailable zone, timeout, multi-fulfillment | DEC-001/012/014 |
| INT-CRM-001 | customers, VIN, B2B, returns/status ↔ CRM | object/field ownership and auth TBD | prevent update echo; source/version/correlation | duplicate VIN, conflict, unavailable CRM | DEC-002/016/017/018 |
| INT-NOT-001 | business events → SMS/email/messenger; delivery status ← | provider API; template/version/consent TBD | async outbox, dedupe, backoff/DLQ; never rollback order | provider fail/retry/dedupe/privacy | DEC-017/018/020 |
| INT-ANA-001 | client/server events → analytics | event schema/consent/cookie mode TBD | best effort; dedupe client/server; never block purchase | schema, consent, PII scan, outage | DEC-018/020 |
| INT-CAT-001 | brand/OEM/cross/vehicle/fitment/images → catalog/index | API/file and license TBD | versioned full load, conflict provenance, partial import quarantine | golden dataset, conflict, license/source | DEC-003/004 |
| INT-IDP-001 | login/contact verification/session ↔ optional IdP | OIDC/OAuth/local decision TBD; MFA/session policy | neutral recovery, replay/session expiry; subject mapping | auth/recovery/IDOR/MFA | DEC-011/016/018/020 |
| INT-FISC-001 | sale/refund receipt ↔ fiscal provider/OFD if needed | direct or through PSP/ERP TBD; signed contract | idempotent receipt/correction, reconciliation, UNKNOWN | duplicate, correction, refund, outage | DEC-013/015; legal scope |

Для каждого контура до кода обязательны: владелец обеих сторон, schema/version, master каждого поля, sandbox, auth/secret rotation, time semantics, timeout/retry, error taxonomy, idempotency, observability, runbook и acceptance fixtures.

## Безопасность и эксплуатация

- `DISALLOW_FILE_EDIT`; секреты только в untracked env; DB network internal; `no-new-privileges`.
- Caddy ограничивает `/wp-admin` и `/wp-login.php` по `ADMIN_ALLOWED_CIDR`; `admin-ajax.php` оставлен доступным.
- Quick Tunnel Caddy передаёт public admin routes штатной WordPress-аутентификации и `X-Forwarded-Proto: https`; это owner-approved demo exception со случайным mode-600 credential, не production security baseline.
- Изолированный security drill подтвердил public `200`, внешний admin `403`, trusted admin `200` и header `nosniff`; удалённая CIDR-проверка выполняется только после server inventory.
- Production Caddy profile — HTTP/IP demo с `auto_https off`; это не подтверждает `NFR-SEC-003`. Для production admin требуется VPN, SSH tunnel либо согласованный trusted edge; Quick Tunnel public login остаётся отдельным временным demo-исключением.
- Backup и restore обрабатывают согласованную пару DB + uploads; restore требует явный `--confirm` и предварительный safety backup.
- Изолированное локальное restore drill выполнено со статусом `PASS`: восстановление не затрагивало другие Compose-проекты.
- Smoke-проверки `/`, `/wp-json/` и WooCommerce Store API выполнены со статусом `PASS`.
- Target и origin известны, а Quick Tunnel package локально проверен, но server run отсутствует: reverse proxy, порты, два существующих сайта и реальные resources не проверялись; статус остаётся `NOT_DEPLOYED`.

## Архитектурные ограничения до DEC

WooCommerce может быть витриной и техническим хранилищем демо, но не назначается master товара/остатка/заказа. Нельзя моделировать Product, SupplierOffer, StockBalance, Reservation, OrderLine, Fulfillment, Payment и Return одним WC product/order status.

