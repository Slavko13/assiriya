=== Автозакуп Core ===
Contributors: avtozakup
Tags: woocommerce, homepage, demo-data
Requires at least: 7.1
Tested up to: 7.1
Requires PHP: 8.3
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Настройки главной страницы и безопасный демонстрационный контур магазина «Автозакуп».

== Description ==

Плагин отвечает за:

* страницу «Автозакуп → Главная» на штатном Settings API;
* редактируемые тексты, ссылки, контакты и изображения;
* выбор нескольких категорий и двух подборок товаров WooCommerce;
* публичный API `avtozakup_get_homepage_settings()` для темы;
* идемпотентную команду `wp avtozakup seed-demo`;
* безопасную блокировку checkout в demo-окружении и для отмеченных demo-товаров;
* интерфейсы адаптеров для будущих каталога, остатков, применяемости, поставщиков и VIN workflow.

Плагин не реализует реальные резервы, оплату, подбор по VIN, B2B-верификацию или интеграции поставщиков.

== Installation ==

1. Установите и активируйте WooCommerce 11.2 или новее.
2. Активируйте «Автозакуп Core».
3. При необходимости выполните `wp avtozakup seed-demo`.
4. Отредактируйте главную в «Автозакуп → Главная».

== WP-CLI ==

`wp avtozakup seed-demo`

Создаёт или обновляет только сущности с метками `_avtozakup_demo=1` и стабильным `_avtozakup_demo_key`. Команда создаёт 8 категорий, 10 товаров, служебные страницы и меню, выбирает demo-сущности в настройках и активирует тему `avtozakup`, если она установлена.

`wp avtozakup seed-demo --force`

Дополнительно назначает demo-страницы, меню и подборки вместо текущей конфигурации. Содержимое без demo-метки команда не изменяет.

Если локальные изображения присутствуют в теме `avtozakup/assets/images`, seeder импортирует их в медиатеку через WordPress Media API. MAHLE CU 2939 намеренно остаётся с placeholder, как в макете.

== Demo checkout guard ==

Checkout блокируется, если:

* `AVTOZAKUP_DEMO_MODE` равно `true`;
* `wp_get_environment_type()` возвращает `local` или `development`; или
* в корзине находится товар с `_avtozakup_demo=1`.

Состояние окружения можно интеграционно переопределить фильтром `avtozakup_is_demo_environment`. Для production рекомендуется задавать константу явно в конфигурации.

Блокировка действует для классического checkout и WooCommerce Store API. Она не имитирует успешный заказ или оплату.

== Security ==

Настройки доступны только пользователям с `manage_options`. Сохранение выполняется через Settings API с его capability check и nonce. Все поля санитизируются, IDs проверяются по типу сущности, media picker принимает изображения.

== Uninstall ==

При удалении плагина удаляются его options, но demo-контент сохраняется. Для явного удаления только маркированных demo-сущностей перед uninstall задайте `AVTOZAKUP_REMOVE_DEMO_DATA_ON_UNINSTALL=true`.

== Changelog ==

= 0.1.0 =
* Homepage settings, media uploader and WooCommerce selections.
* Idempotent demo seeder and theme/menu/page setup.
* Demo checkout guard and integration adapter contracts.

