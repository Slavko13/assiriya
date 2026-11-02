<?php
/** WooCommerce shell. @package Avtozakup */
get_header();
?>
<main id="primary" class="az-content az-shop az-container" tabindex="-1">
	<?php if ( function_exists( 'woocommerce_breadcrumb' ) ) : ?>
		<?php woocommerce_breadcrumb(); ?>
	<?php endif; ?>
	<?php woocommerce_content(); ?>
</main>
<?php get_footer(); ?>

