<?php
/** Site footer. @package Avtozakup */
$az_settings = avtozakup_home_settings();
$az_contact_phone = trim( (string) $az_settings['contact_phone'] );
$az_contact_phone_href = (string) preg_replace( '/[^+\d]/', '', $az_contact_phone );
$az_contact_email = trim( (string) $az_settings['contact_email'] );
$az_contact_email_href = is_email( $az_contact_email ) ? $az_contact_email : '';
$az_has_contact_phone = '' !== $az_contact_phone && 1 === preg_match( '/\d/', $az_contact_phone_href );
$az_contact_method_count = (int) $az_has_contact_phone + (int) ( '' !== $az_contact_email_href );
?>
<footer class="az-footer">
	<div class="az-container az-footer__grid">
		<div class="az-footer__brand">
			<a class="az-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>"><span>АВТО</span><strong>ЗАКУП</strong></a>
			<p><?php esc_html_e( 'Интернет-магазин автозапчастей', 'avtozakup' ); ?></p>
			<p><?php esc_html_e( 'Подбор и заказ деталей для автомобиля', 'avtozakup' ); ?></p>
		</div>
		<nav aria-label="<?php esc_attr_e( 'Покупателям', 'avtozakup' ); ?>">
			<h2><?php esc_html_e( 'Покупателям', 'avtozakup' ); ?></h2>
			<?php wp_nav_menu( array( 'theme_location' => 'footer_buyers', 'container' => false, 'fallback_cb' => 'avtozakup_footer_buyers_fallback', 'depth' => 1 ) ); ?>
		</nav>
		<nav aria-label="<?php esc_attr_e( 'Автосервисам', 'avtozakup' ); ?>">
			<h2><?php esc_html_e( 'Автосервисам', 'avtozakup' ); ?></h2>
			<?php wp_nav_menu( array( 'theme_location' => 'footer_business', 'container' => false, 'fallback_cb' => 'avtozakup_footer_business_fallback', 'depth' => 1 ) ); ?>
		</nav>
		<nav aria-label="<?php esc_attr_e( 'Информация', 'avtozakup' ); ?>">
			<h2><?php esc_html_e( 'Информация', 'avtozakup' ); ?></h2>
			<?php wp_nav_menu( array( 'theme_location' => 'footer_info', 'container' => false, 'fallback_cb' => 'avtozakup_footer_info_fallback', 'depth' => 1 ) ); ?>
		</nav>
	</div>
	<div class="az-container az-footer__bottom">
		<span>© <?php echo esc_html( wp_date( 'Y' ) ); ?> <?php esc_html_e( 'АВТОЗАКУП', 'avtozakup' ); ?></span>
		<div><a href="<?php echo esc_url( home_url( '/offer/' ) ); ?>"><?php esc_html_e( 'Публичная оферта', 'avtozakup' ); ?></a><a href="<?php echo esc_url( get_privacy_policy_url() ?: home_url( '/privacy/' ) ); ?>"><?php esc_html_e( 'Персональные данные', 'avtozakup' ); ?></a></div>
	</div>
</footer>

<dialog class="az-dialog az-dialog--contact" data-contact-dialog aria-labelledby="az-contact-title" aria-describedby="az-contact-intro">
	<form method="dialog">
		<button class="az-dialog__close" value="close" aria-label="<?php esc_attr_e( 'Закрыть', 'avtozakup' ); ?>">×</button>
		<h2 id="az-contact-title"><?php esc_html_e( 'Связаться с нами', 'avtozakup' ); ?></h2>
		<p id="az-contact-intro" class="az-dialog__intro" data-contact-intro><?php echo esc_html( $az_contact_method_count > 0 ? __( 'Выберите удобный способ связи.', 'avtozakup' ) : __( 'Контакты пока не настроены.', 'avtozakup' ) ); ?></p>
		<div class="az-dialog__contacts">
			<?php if ( $az_has_contact_phone ) : ?>
			<a class="az-dialog__contact" data-contact-method="phone" href="tel:<?php echo esc_attr( $az_contact_phone_href ); ?>">
				<span class="az-dialog__contact-icon"><?php echo avtozakup_icon( 'phone' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
				<span class="az-dialog__contact-copy"><span data-contact-label><?php esc_html_e( 'Телефон', 'avtozakup' ); ?></span><strong data-contact-value><?php echo esc_html( $az_contact_phone ); ?></strong></span>
				<?php echo avtozakup_icon( 'arrow', 'az-dialog__contact-arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</a>
			<?php endif; ?>
			<?php if ( '' !== $az_contact_email_href ) : ?>
			<a class="az-dialog__contact" data-contact-method="email" href="mailto:<?php echo esc_attr( $az_contact_email_href ); ?>">
				<span class="az-dialog__contact-icon"><?php echo avtozakup_icon( 'mail' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
				<span class="az-dialog__contact-copy"><span data-contact-label><?php esc_html_e( 'Электронная почта', 'avtozakup' ); ?></span><strong data-contact-value><?php echo esc_html( $az_contact_email ); ?></strong></span>
				<?php echo avtozakup_icon( 'arrow', 'az-dialog__contact-arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</a>
			<?php endif; ?>
		</div>
	</form>
</dialog>

<dialog class="az-dialog" data-status-dialog-modal aria-labelledby="az-status-title">
	<form method="dialog">
		<button class="az-dialog__close" value="close" aria-label="<?php esc_attr_e( 'Закрыть', 'avtozakup' ); ?>">×</button>
		<h2 id="az-status-title"><?php esc_html_e( 'Функция временно недоступна', 'avtozakup' ); ?></h2>
		<p data-status-copy><?php esc_html_e( 'Пожалуйста, воспользуйтесь каталогом или свяжитесь с нами.', 'avtozakup' ); ?></p>
		<button class="az-button" value="close"><?php esc_html_e( 'Понятно', 'avtozakup' ); ?></button>
	</form>
</dialog>
<?php wp_footer(); ?>
</body>
</html>

