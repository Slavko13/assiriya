# Развёртывание

**Текущий серверный статус:** `NOT_DEPLOYED`.  
Серверный доступ не предоставлен. Два существующих сайта, занятые порты, reverse proxy и ресурсы целевого сервера фактически не проверялись. Локальные проверки не меняют статус на `DEPLOYED`.

## Локальный запуск

1. Скопировать `.env.example` в untracked `.env` и заменить все `change-me-*`.
2. Проверить итоговую конфигурацию:

```powershell
docker compose --env-file .env -f compose.yaml -f compose.dev.yaml config --quiet
```

3. Запустить изолированный stack:

```powershell
docker compose --env-file .env -f compose.yaml -f compose.dev.yaml up -d --build --wait
```

4. Выполнить идемпотентную установку:

```powershell
docker compose --env-file .env -f compose.yaml -f compose.dev.yaml run --rm --entrypoint sh wpcli /workspace/scripts/bootstrap-wordpress.sh
```

Проверенные локальные адреса: сайт `http://localhost:8086/`, админка `http://localhost:8086/wp-admin/`. Порт задаётся локальным `.env`. Начальные имя/пароль берутся из локального `.env`; их нельзя добавлять в отчёт или Git. Bootstrap не сбрасывает пароль уже установленного администратора.

В dev исходники темы и плагина подключаются bind mounts для немедленного отражения изменений. В production тема и плагин встраиваются в image, а container entrypoint синхронизирует версию из image в рабочее дерево. Production deployment не должен зависеть от bind mounts checkout.

## Persistence

Данные находятся в `avtozakup_db_data`, WordPress files — `avtozakup_wordpress_data`, uploads — `avtozakup_uploads_data`. Для проверки использовать `restart`, а не удаление volumes. Команда `down -v` запрещена для штатной остановки.

Операционная резервная копия является парой: дамп MariaDB + архив uploads с общим timestamp-идентификатором. Восстановление выполняется только согласованной парой, чтобы записи БД не ссылались на отсутствующие медиафайлы. Изолированное локальное restore drill завершено со статусом `PASS`.

## Production preflight

До первого `up` на сервере сохранить read-only inventory:

- `docker compose ls`, `docker ps --all`, networks и volumes;
- открытые TCP-порты и владельцев 80/443/планируемого `CADDY_HTTP_PORT`;
- конфигурацию существующего reverse proxy;
- URL и health двух существующих сайтов;
- свободное место, backup directory и права;
- текущий Git remote/branch/commit.

Не останавливать, не переименовывать и не подключать к сетям существующие containers. Project name, networks, volumes и выбранный host port должны быть уникальны.

## Production config

1. Создать untracked `.env.prod` из `.env.production.example`.
2. Задать реальный `PUBLIC_URL`, свободный `CADDY_HTTP_PORT`, trusted `ADMIN_ALLOWED_CIDR`, длинные разные пароли и absolute безопасный `BACKUP_DIR`.
3. Удалить все placeholder values; `deploy.sh` отклонит их.
4. Проверить:

```bash
docker compose --env-file .env.prod -f compose.yaml -f compose.prod.yaml config --quiet
```

Caddy profile предназначен только для контролируемого HTTP/IP demo-доступа и ограничивает admin по CIDR. Для публичной административной панели обязателен VPN, SSH tunnel либо согласованный HTTPS/TLS edge с доверенным сертификатом; `auto_https off` не выполняет `NFR-SEC-003`.

## Git deployment

На сервере должен быть clean checkout на `DEPLOY_BRANCH` и настроенный origin. Запуск:

```bash
ENV_FILE=/absolute/path/to/.env.prod ./scripts/deploy.sh
```

Последовательность: validate → optional pre-backup → fetch/pull `--ff-only` → build/up/wait → bootstrap → smoke. Ошибка кода возвращает предыдущий commit; автоматический DB rollback по умолчанию выключен, потому что он разрушителен и может потерять новые данные.

## Backup и restore

Парный backup DB + uploads:

```bash
ENV_FILE=/absolute/path/to/.env.prod ./scripts/backup.sh
```

Restore выполняется только из проверенного backup set и с явным подтверждением:

```bash
ENV_FILE=/absolute/path/to/.env.prod ./scripts/restore.sh /absolute/path/to/avtozakup-TIMESTAMP.sql.gz --confirm
```

Restore согласованно возвращает DB и uploads, поэтому сначала делает парный safety backup и останавливает только WordPress этого Compose-проекта. Изолированное restore drill — `PASS`; перед production restore всё равно требуется отдельное операционное подтверждение.

## Проверка после deployment

- Compose services healthy;
- `/` и `/wp-json/` не перенаправляются на localhost/internal host;
- разрешённый IP открывает admin, посторонний получает 403;
- главная, категории, товар, cart и demo checkout guard работают;
- DB persistence после restart;
- два существующих сайта имеют те же URL, containers, networks и health;
- commit, URL, время, backup path и результаты smoke сохранены в отчёте.

Только после этих фактов статус может стать `DEPLOYED`.

## Подтверждённые локальные проверки 2026-11-01

- smoke `/` — `PASS`;
- smoke `/wp-json/` — `PASS`;
- WooCommerce Store API smoke/guard — `PASS`;
- WooCommerce storefront visibility (`coming_soon=no`, `store_pages_only=no`), cart page и classic checkout guard — `PASS`;
- isolated Caddy security drill — `PASS`: homepage `200`, external admin `403`, trusted admin `200`, `X-Content-Type-Options: nosniff`;
- paired DB+uploads backup/restore — `PASS`;
- isolated restore drill — `PASS`;
- Playwright: 13 tests, 11 passed, 2 intentional skipped, 0 failed; desktop 1440, mobile 390/360, admin save+restore, Woo CRUD, keyboard/focus, AJAX cart/count/page и classic/Store API guards.

Эти результаты относятся к локальному адресу `http://localhost:8086/`. Реального server deployment не было: `NOT_DEPLOYED`.

