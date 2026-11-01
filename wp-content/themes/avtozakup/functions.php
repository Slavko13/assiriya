<?php
/** Theme bootstrap. @package Avtozakup */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'AVTOZAKUP_THEME_VERSION', '0.2.0' );
define( 'AVTOZAKUP_THEME_DIR', get_template_directory() );
define( 'AVTOZAKUP_THEME_URI', get_template_directory_uri() );

require_once AVTOZAKUP_THEME_DIR . '/inc/helpers.php';

add_action(
	'after_setup_theme',
	static function (): void {
		load_theme_textdomain( 'avtozakup', AVTOZAKUP_THEME_DIR . '/languages' );
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'custom-logo', array( 'height' => 64, 'width' => 392, 'flex-height' => true, 'flex-width' => true ) );
		add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
		add_theme_support( 'align-wide' );
		add_theme_support( 'responsive-embeds' );
		add_theme_support( 'woocommerce' );
		add_theme_support( 'wc-product-gallery-lightbox' );
		add_theme_support( 'wc-product-gallery-slider' );
		register_nav_menus(
			array(
				'primary' => __( 'Основная навигация', 'avtozakup' ),
				'footer_buyers' => __( 'Подвал — покупателям', 'avtozakup' ),
				'footer_business' => __( 'Подвал — автосервисам', 'avtozakup' ),
				'footer_info' => __( 'Подвал — информация', 'avtozakup' ),
			)
		);
	}
);

add_action(
	'wp_enqueue_scripts',
	static function (): void {
		wp_enqueue_style( 'avtozakup-main', AVTOZAKUP_THEME_URI . '/assets/css/main.css', array(), AVTOZAKUP_THEME_VERSION );
		wp_enqueue_script( 'avtozakup-main', AVTOZAKUP_THEME_URI . '/assets/js/main.js', array(), AVTOZAKUP_THEME_VERSION, true );
		if ( class_exists( 'WooCommerce' ) ) {
			wp_enqueue_script( 'wc-add-to-cart' );
		}
	}
);

add_filter(
	'script_loader_tag',
	static function ( string $tag, string $handle ): string {
		return 'avtozakup-main' === $handle ? str_replace( ' src=', ' defer src=', $tag ) : $tag;
	},
	10,
	2
);

add_filter(
	'body_class',
	static function ( array $classes ): array {
		$classes[] = 'az-site';
		if ( is_front_page() ) {
			$classes[] = 'az-home';
		}
		return $classes;
	}
);

add_filter( 'woocommerce_enqueue_styles', '__return_empty_array' );

add_action(
	'woocommerce_before_shop_loop',
	static function (): void {
		if ( ! function_exists( 'is_shop' ) || ! is_shop() ) {
			return;
		}

		$categories = avtozakup_catalog_categories();
		?>
		<section class="az-shop-categories" aria-labelledby="az-shop-categories-title">
			<div class="az-section__heading">
				<h2 id="az-shop-categories-title"><?php esc_html_e( 'Каталог автозапчастей', 'avtozakup' ); ?></h2>
			</div>
			<div class="az-category-grid">
				<?php foreach ( $categories as $index => $category ) : ?>
					<?php avtozakup_category_card( $category, (int) $index ); ?>
				<?php endforeach; ?>
				<?php if ( ! $categories ) : ?>
					<p class="az-empty-state"><?php esc_html_e( 'Опубликованные категории пока отсутствуют.', 'avtozakup' ); ?></p>
				<?php endif; ?>
			</div>
		</section>
		<?php
	},
	5
);

