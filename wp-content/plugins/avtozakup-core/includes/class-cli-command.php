<?php
/**
 * WP-CLI entry point.
 *
 * @package AvtozakupCore
 */

declare(strict_types=1);

namespace Avtozakup\Core;

use Throwable;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class CLI_Command {
	public static function register(): void {
		if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
			return;
		}

		\WP_CLI::add_command( 'avtozakup seed-demo', array( new self(), 'seed_demo' ) );
	}

	/**
	 * Creates or refreshes explicitly marked demo content.
	 *
	 * Existing unmarked pages, products, categories, menus and settings are
	 * preserved. Repeating the command updates the same marked entities.
	 *
	 * ## OPTIONS
	 *
	 * [--force]
	 * : Allow demo pages/menu/selections to replace currently configured ones.
	 *
	 * ## EXAMPLES
	 *
	 *     wp avtozakup seed-demo
	 *     wp avtozakup seed-demo --force
	 *
	 * @param array<int, string>    $args       Positional arguments.
	 * @param array<string, mixed> $assoc_args Named arguments.
	 */
	public function seed_demo( array $args, array $assoc_args ): void {
		unset( $args );
		$force = \WP_CLI\Utils\get_flag_value( $assoc_args, 'force', false );

		try {
			$manifest = ( new Demo_Seeder() )->seed( (bool) $force );
		} catch ( Throwable $throwable ) {
			\WP_CLI::error( $throwable->getMessage() );
			return;
		}

		\WP_CLI::log( sprintf( 'Categories: %d', count( $manifest['categories'] ) ) );
		\WP_CLI::log( sprintf( 'Products: %d', count( $manifest['products'] ) ) );
		\WP_CLI::log( sprintf( 'Attachments: %d', count( $manifest['attachments'] ) ) );
		\WP_CLI::log( sprintf( 'Demo pages: %d', count( $manifest['demo_pages'] ) ) );
		\WP_CLI::log( sprintf( 'WooCommerce page references: %d', count( $manifest['woocommerce_pages'] ) ) );
		\WP_CLI::log( sprintf( 'Menu ID: %d', $manifest['menu_id'] ) );

		if ( ! $manifest['theme']['available'] ) {
			\WP_CLI::warning( 'Theme "avtozakup" was not found; demo content was created without activating it.' );
		} elseif ( $manifest['theme']['activated'] ) {
			\WP_CLI::log( 'Theme "avtozakup" activated.' );
		}

		\WP_CLI::success( 'Avtozakup demo data is ready. Re-running this command is safe.' );
	}
}

