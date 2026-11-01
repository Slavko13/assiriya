<?php
/** Theme bootstrap. @package Avtozakup */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'AVTOZAKUP_THEME_VERSION', '0.4.0' );
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

function avtozakup_render_loop_demo_provenance(): void {
	global $product;
	if ( ! $product instanceof WC_Product ) {
		return;
	}
	$provenance = avtozakup_demo_product_provenance( $product );
	if ( null === $provenance ) {
		return;
	}
	printf(
		'<div class="az-demo-provenance az-demo-provenance--loop" data-demo-provenance="product">%s</div>',
		esc_html( $provenance['loop'] )
	);
}

function avtozakup_render_single_demo_provenance(): void {
	global $product;
	if ( ! $product instanceof WC_Product ) {
		return;
	}
	$provenance = avtozakup_demo_product_provenance( $product );
	if ( null === $provenance ) {
		return;
	}
	?>
	<div class="az-demo-provenance az-demo-provenance--single" data-demo-provenance="product" role="note">
		<strong><?php echo esc_html( $provenance['single'] ); ?></strong>
		<?php if ( '' !== $provenance['source'] ) : ?>
			<span class="az-demo-provenance__source"><?php echo esc_html( $provenance['source'] ); ?></span>
		<?php endif; ?>
	</div>
	<?php
}

function avtozakup_is_current_demo_product_page( WC_Product $product ): bool {
	return function_exists( 'is_product' )
		&& is_product()
		&& get_queried_object_id() === $product->get_id()
		&& null !== avtozakup_demo_product_provenance( $product );
}

function avtozakup_render_demo_product_meta(): void {
	global $product;
	if ( ! $product instanceof WC_Product ) {
		return;
	}

	$technical_sku = avtozakup_demo_technical_sku( $product );
	if ( null === $technical_sku ) {
		woocommerce_template_single_meta();
		return;
	}

	$category_ids   = $product->get_category_ids();
	$category_links = wc_get_product_category_list( $product->get_id(), ', ' );
	?>
	<div class="product_meta az-demo-product-meta" data-demo-product-meta="product">
		<span class="sku_wrapper">
			<?php esc_html_e( 'Технический демо-SKU:', 'avtozakup' ); ?>
			<span class="sku" data-demo-technical-sku><?php echo esc_html( $technical_sku ); ?></span>
		</span>
		<span class="az-demo-product-meta__note"><?php esc_html_e( 'Внутренний идентификатор демо-записи; не OEM и не артикул производителя.', 'avtozakup' ); ?></span>
		<?php if ( '' !== $category_links ) : ?>
			<span class="posted_in">
				<?php echo esc_html( 1 === count( $category_ids ) ? 'Категория:' : 'Категории:' ); ?>
				<?php echo wp_kses_post( $category_links ); ?>
			</span>
		<?php endif; ?>
	</div>
	<?php
}

function avtozakup_configure_demo_product_page(): void {
	if ( ! function_exists( 'is_product' ) || ! is_product() || ! function_exists( 'wc_get_product' ) ) {
		return;
	}

	$product = wc_get_product( get_queried_object_id() );
	if ( ! $product instanceof WC_Product || null === avtozakup_demo_product_provenance( $product ) ) {
		return;
	}

	remove_action( 'woocommerce_after_single_product_summary', 'woocommerce_output_related_products', 20 );
	if ( null !== avtozakup_demo_technical_sku( $product ) ) {
		remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_meta', 40 );
		add_action( 'woocommerce_single_product_summary', 'avtozakup_render_demo_product_meta', 40 );
	}
}

function avtozakup_demo_product_availability_text( string $availability, WC_Product $product ): string {
	if ( ! avtozakup_is_current_demo_product_page( $product ) ) {
		return $availability;
	}

	return 'Демо-наличие не подтверждено внешними системами';
}

function avtozakup_demo_single_add_to_cart_text( string $text, WC_Product $product ): string {
	if ( ! avtozakup_is_current_demo_product_page( $product ) ) {
		return $text;
	}

	return 'Добавить в демо-корзину';
}

add_action( 'woocommerce_after_shop_loop_item', 'avtozakup_render_loop_demo_provenance', 7 );
add_action( 'woocommerce_single_product_summary', 'avtozakup_render_single_demo_provenance', 11 );
add_action( 'wp', 'avtozakup_configure_demo_product_page' );
add_filter( 'woocommerce_get_availability_text', 'avtozakup_demo_product_availability_text', 10, 2 );
add_filter( 'woocommerce_product_single_add_to_cart_text', 'avtozakup_demo_single_add_to_cart_text', 10, 2 );

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

