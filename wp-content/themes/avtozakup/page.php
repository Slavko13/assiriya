<?php
/** Page template. @package Avtozakup */
get_header();
$az_is_cart_page = function_exists( 'is_cart' ) && is_cart();
?>
<main id="primary" class="az-content az-container" tabindex="-1">
	<?php while ( have_posts() ) : the_post(); ?>
		<article <?php post_class( $az_is_cart_page ? 'az-entry az-cart-page' : 'az-entry' ); ?>>
			<?php if ( $az_is_cart_page ) : ?>
				<header class="az-cart-intro">
					<div class="az-cart-intro__copy">
						<p class="az-cart-intro__eyebrow"><?php esc_html_e( 'Ваш заказ', 'avtozakup' ); ?></p>
						<h1><?php esc_html_e( 'Корзина', 'avtozakup' ); ?></h1>
						<p><?php esc_html_e( 'Проверьте выбранные товары и количество перед переходом к оформлению.', 'avtozakup' ); ?></p>
					</div>
					<ol class="az-cart-steps" aria-label="<?php esc_attr_e( 'Этапы оформления заказа', 'avtozakup' ); ?>">
						<li class="is-current" aria-current="step"><span>1</span><strong><?php esc_html_e( 'Корзина', 'avtozakup' ); ?></strong></li>
						<li><span>2</span><strong><?php esc_html_e( 'Оформление', 'avtozakup' ); ?></strong></li>
					</ol>
				</header>
			<?php else : ?>
				<h1><?php the_title(); ?></h1>
			<?php endif; ?>
			<?php the_content(); ?>
		</article>
	<?php endwhile; ?>
</main>
<?php get_footer(); ?>

