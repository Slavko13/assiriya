<?php
/**
 * Plugin bootstrap.
 *
 * @package AvtozakupCore
 */

declare(strict_types=1);

namespace Avtozakup\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Plugin {
	private static ?self $instance = null;
	private bool $booted = false;

	private function __construct() {}

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public static function activate(): void {
		add_option( Settings::OPTION_NAME, Settings::defaults(), '', false );
	}

	public function boot(): void {
		if ( $this->booted ) {
			return;
		}
		$this->booted = true;

		load_plugin_textdomain( 'avtozakup-core', false, dirname( plugin_basename( AVTOZAKUP_CORE_FILE ) ) . '/languages' );

		( new Settings() )->register_hooks();
		( new Demo_Checkout_Guard() )->register_hooks();
		CLI_Command::register();

		if ( is_admin() && ! class_exists( 'WooCommerce' ) ) {
			add_action( 'admin_notices', array( $this, 'render_woocommerce_notice' ) );
		}
	}

	public function render_woocommerce_notice(): void {
		if ( ! current_user_can( 'activate_plugins' ) ) {
			return;
		}
		?>
		<div class="notice notice-warning">
			<p><?php echo esc_html__( 'Автозакуп Core активен, но WooCommerce не найден. Настройки контента доступны, а товары и demo seeder — нет.', 'avtozakup-core' ); ?></p>
		</div>
		<?php
	}
}

