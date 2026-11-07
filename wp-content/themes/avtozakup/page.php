<?php
/** Page template. @package Avtozakup */
get_header();
$az_is_cart_page = function_exists( 'is_cart' ) && is_cart();
$az_is_guest_login_page = function_exists( 'avtozakup_is_guest_login_page' ) && avtozakup_is_guest_login_page();
$az_main_class = 'az-content az-container';
$az_entry_class = 'az-entry';
$az_cart_count = 0;
$az_cart_count_word = __( 'товаров', 'avtozakup' );
if ( $az_is_cart_page ) {
	$az_entry_class .= ' az-cart-page';
	$az_cart_count = function_exists( 'WC' ) && WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
	$az_cart_count_last_two = $az_cart_count % 100;
	$az_cart_count_last = $az_cart_count % 10;
	if ( $az_cart_count_last_two < 11 || $az_cart_count_last_two > 14 ) {
		if ( 1 === $az_cart_count_last ) {
			$az_cart_count_word = __( 'товар', 'avtozakup' );
		} elseif ( $az_cart_count_last >= 2 && $az_cart_count_last <= 4 ) {
			$az_cart_count_word = __( 'товара', 'avtozakup' );
		}
	}
} elseif ( $az_is_guest_login_page ) {
	$az_main_class .= ' az-account-login-main';
	$az_entry_class .= ' az-account-login-page';
}
?>
<main id="primary" class="<?php echo esc_attr( $az_main_class ); ?>" tabindex="-1">
	<?php while ( have_posts() ) : the_post(); ?>
		<article <?php post_class( $az_entry_class ); ?><?php echo $az_is_cart_page ? ' data-cart-page' : ''; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?php if ( $az_is_cart_page ) : ?>
				<header class="az-cart-intro">
					<nav class="az-cart-breadcrumbs" aria-label="<?php esc_attr_e( 'Хлебные крошки', 'avtozakup' ); ?>">
						<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Главная', 'avtozakup' ); ?></a>
						<span aria-hidden="true">›</span>
						<span aria-current="page"><?php esc_html_e( 'Корзина', 'avtozakup' ); ?></span>
					</nav>
					<div class="az-cart-intro__row">
						<div class="az-cart-intro__copy">
							<div class="az-cart-intro__title">
								<h1 data-cart-heading><?php esc_html_e( 'Корзина', 'avtozakup' ); ?></h1>
								<span class="az-cart-count-label" data-cart-count-label aria-live="polite"><?php echo esc_html( absint( $az_cart_count ) . ' ' . $az_cart_count_word ); ?></span>
							</div>
						<p
							data-cart-intro-copy
							data-filled-copy="<?php esc_attr_e( 'Проверьте товары и количество перед продолжением.', 'avtozakup' ); ?>"
							data-empty-copy="<?php esc_attr_e( 'Добавьте нужные запчасти — выбранные позиции появятся здесь.', 'avtozakup' ); ?>"
						><?php esc_html_e( 'Проверьте товары и количество перед продолжением.', 'avtozakup' ); ?></p>
						</div>
						<a class="az-cart-continue" data-cart-continue href="<?php echo esc_url( avtozakup_wc_page_url( 'shop' ) ); ?>">
							<span aria-hidden="true">←</span>
							<?php esc_html_e( 'Продолжить покупки', 'avtozakup' ); ?>
						</a>
					</div>
				</header>
			<?php elseif ( $az_is_guest_login_page ) : ?>
				<header class="az-account-login-intro">
					<h1><?php esc_html_e( 'Личный кабинет', 'avtozakup' ); ?></h1>
					<p><?php esc_html_e( 'Введите email или логин и пароль, чтобы продолжить.', 'avtozakup' ); ?></p>
				</header>
			<?php else : ?>
				<h1><?php the_title(); ?></h1>
			<?php endif; ?>
			<?php if ( $az_is_cart_page ) : ?>
				<div class="az-cart-body" data-cart-body>
					<?php the_content(); ?>
				</div>
				<section class="az-cart-support" data-cart-support<?php echo $az_cart_count > 0 ? '' : ' hidden'; ?>>
					<div class="az-cart-vin-help">
						<span class="az-cart-vin-help__icon"><?php echo avtozakup_icon( 'shield' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
						<div>
							<h2><?php esc_html_e( 'Сомневаетесь, что детали подойдут?', 'avtozakup' ); ?></h2>
							<p><?php esc_html_e( 'Отправьте данные автомобиля для проверки применяемости.', 'avtozakup' ); ?></p>
						</div>
						<a href="<?php echo esc_url( avtozakup_seeded_page_url( 'vin', 'vin-request' ) ); ?>"><?php esc_html_e( 'Подбор по VIN', 'avtozakup' ); ?> <span aria-hidden="true">→</span></a>
					</div>
				</section>
				<aside class="az-cart-assurance" data-cart-assurance<?php echo $az_cart_count > 0 ? '' : ' hidden'; ?> aria-label="<?php esc_attr_e( 'Информация перед покупкой', 'avtozakup' ); ?>">
					<div>
						<?php echo avtozakup_icon( 'box' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						<h2><?php esc_html_e( 'Сроки и наличие', 'avtozakup' ); ?></h2>
						<p><?php esc_html_e( 'Уточняйте наличие и сроки получения перед покупкой.', 'avtozakup' ); ?></p>
					</div>
					<div>
						<?php echo avtozakup_icon( 'shield' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						<h2><?php esc_html_e( 'Гарантия и возврат', 'avtozakup' ); ?></h2>
						<p><?php esc_html_e( 'Уточняйте условия гарантии и возврата перед покупкой.', 'avtozakup' ); ?></p>
					</div>
				</aside>
			<?php else : ?>
				<?php the_content(); ?>
			<?php endif; ?>
		</article>
	<?php endwhile; ?>
</main>
<?php get_footer(); ?>

