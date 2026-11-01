<?php
/**
 * Plugin Name:       Автозакуп Core
 * Plugin URI:        https://example.invalid/avtozakup
 * Description:       Настройки главной страницы, демонстрационные данные и границы будущих интеграций магазина «Автозакуп».
 * Version:           0.1.0
 * Requires at least: 7.1
 * Requires PHP:      8.3
 * WC requires at least: 11.2
 * WC tested up to:   11.2
 * Author:            Автозакуп
 * Text Domain:       avtozakup-core
 * Domain Path:       /languages
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'AVTOZAKUP_CORE_VERSION', '0.1.0' );
define( 'AVTOZAKUP_CORE_FILE', __FILE__ );
define( 'AVTOZAKUP_CORE_PATH', plugin_dir_path( __FILE__ ) );
define( 'AVTOZAKUP_CORE_URL', plugin_dir_url( __FILE__ ) );

require_once AVTOZAKUP_CORE_PATH . 'includes/Contracts/AvailabilityAdapterInterface.php';
require_once AVTOZAKUP_CORE_PATH . 'includes/Contracts/FitmentAdapterInterface.php';
require_once AVTOZAKUP_CORE_PATH . 'includes/Contracts/ProductCatalogAdapterInterface.php';
require_once AVTOZAKUP_CORE_PATH . 'includes/Contracts/SupplierOffersAdapterInterface.php';
require_once AVTOZAKUP_CORE_PATH . 'includes/Contracts/VinRequestAdapterInterface.php';
require_once AVTOZAKUP_CORE_PATH . 'includes/class-settings.php';
require_once AVTOZAKUP_CORE_PATH . 'includes/class-demo-checkout-guard.php';
require_once AVTOZAKUP_CORE_PATH . 'includes/class-demo-seeder.php';
require_once AVTOZAKUP_CORE_PATH . 'includes/class-cli-command.php';
require_once AVTOZAKUP_CORE_PATH . 'includes/class-plugin.php';

register_activation_hook( __FILE__, array( Avtozakup\Core\Plugin::class, 'activate' ) );

add_action(
	'plugins_loaded',
	static function (): void {
		Avtozakup\Core\Plugin::instance()->boot();
	}
);

/**
 * Public theme-facing accessor for homepage settings.
 *
 * @return array<string, mixed>
 */
function avtozakup_get_homepage_settings(): array {
	return Avtozakup\Core\Settings::get();
}

