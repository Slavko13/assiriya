<?php
/** Page template. @package Avtozakup */
get_header();
$az_is_cart_page = function_exists( 'is_cart' ) && is_cart();
$az_is_guest_login_page = function_exists( 'avtozakup_is_guest_login_page' ) && avtozakup_is_guest_login_page();
$az_main_class = 'az-content az-container';
$az_entry_class = 'az-entry';
if ( $az_is_cart_page ) {
	$az_entry_class .= ' az-cart-page';
} elseif ( $az_is_guest_login_page ) {
	$az_main_class .= ' az-account-login-main';
	$az_entry_class .= ' az-account-login-page';
}
?>
<main id="primary" class="<?php echo esc_attr( $az_main_class ); ?>" tabindex="-1">
	<?php while ( have_posts() ) : the_post(); ?>
		<article <?php post_class( $az_entry_class ); ?>>
			<?php if ( $az_is_cart_page ) : ?>
				<header class="az-cart-intro">
					<div class="az-cart-intro__copy">
						<p class="az-cart-intro__eyebrow"><?php esc_html_e( 'Ваш заказ', 'avtozakup' ); ?></p>
						<h1><?php esc_html_e( 'Корзина', 'avtozakup' ); ?></h1>
						<p
							data-cart-intro-copy
							data-filled-copy="<?php esc_attr_e( 'Проверьте выбранные товары и количество перед переходом к оформлению.', 'avtozakup' ); ?>"
							data-empty-copy="<?php esc_attr_e( 'Добавьте нужные запчасти — выбранные позиции появятся здесь.', 'avtozakup' ); ?>"
						><?php esc_html_e( 'Проверьте выбранные товары и количество перед переходом к оформлению.', 'avtozakup' ); ?></p>
					</div>
					<ol class="az-cart-steps" aria-label="<?php esc_attr_e( 'Этапы оформления заказа', 'avtozakup' ); ?>">
						<li class="is-current" aria-current="step"><span>1</span><strong><?php esc_html_e( 'Корзина', 'avtozakup' ); ?></strong></li>
						<li><span>2</span><strong><?php esc_html_e( 'Оформление', 'avtozakup' ); ?></strong></li>
					</ol>
				</header>
			<?php elseif ( $az_is_guest_login_page ) : ?>
				<header class="az-account-login-intro">
					<h1><?php esc_html_e( 'Личный кабинет', 'avtozakup' ); ?></h1>
					<p><?php esc_html_e( 'Введите email или логин и пароль, чтобы продолжить.', 'avtozakup' ); ?></p>
				</header>
			<?php else : ?>
				<h1><?php the_title(); ?></h1>
			<?php endif; ?>
			<?php the_content(); ?>
		</article>
	<?php endwhile; ?>
</main>
<?php get_footer(); ?>

