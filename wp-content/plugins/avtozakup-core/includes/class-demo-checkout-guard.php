<?php
/**
 * Prevents demo data from creating apparently real orders.
 *
 * @package AvtozakupCore
 */

declare(strict_types=1);

namespace Avtozakup\Core;

use WP_Error;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Demo_Checkout_Guard {
	private const PRODUCT_META_KEY = '_avtozakup_demo';

	public function register_hooks(): void {
		add_action( 'woocommerce_before_cart', array( $this, 'render_notice' ) );
		add_action( 'woocommerce_before_checkout_form', array( $this, 'render_notice' ) );
		add_action( 'woocommerce_after_checkout_validation', array( $this, 'validate_classic_checkout' ), 10, 2 );
		add_filter( 'woocommerce_order_button_html', array( $this, 'filter_order_button_html' ) );
		add_filter( 'render_block', array( $this, 'filter_commerce_block' ), 10, 2 );
		add_filter( 'rest_pre_dispatch', array( $this, 'block_store_api_checkout' ), 10, 3 );
	}

	public function is_demo_environment(): bool {
		if ( defined( 'AVTOZAKUP_DEMO_MODE' ) ) {
			$default = (bool) AVTOZAKUP_DEMO_MODE;
		} else {
			$default = in_array( wp_get_environment_type(), array( 'local', 'development' ), true );
		}

		/**
		 * Filter whether this site is a non-transactional demo environment.
		 *
		 * Production operators should prefer the AVTOZAKUP_DEMO_MODE constant so
		 * the state cannot be changed from the database or an admin request.
		 *
		 * @param bool $default Inferred demo state.
		 */
		return (bool) apply_filters( 'avtozakup_is_demo_environment', $default );
	}

	public function should_block_checkout(): bool {
		return $this->is_demo_environment() || $this->cart_contains_demo_product();
	}

	public function render_notice(): void {
		if ( ! $this->should_block_checkout() || ! function_exists( 'wc_print_notice' ) ) {
			return;
		}

		wc_print_notice( $this->message(), 'notice' );
	}

	/**
	 * @param array<string, mixed> $data   Submitted checkout data.
	 * @param WP_Error             $errors Validation errors.
	 */
	public function validate_classic_checkout( array $data, WP_Error $errors ): void {
		unset( $data );

		if ( $this->should_block_checkout() ) {
			$errors->add( 'avtozakup_demo_checkout_disabled', $this->message() );
		}
	}

	public function filter_order_button_html( string $html ): string {
		if ( ! $this->should_block_checkout() ) {
			return $html;
		}

		return sprintf(
			'<button type="button" class="button alt" disabled aria-disabled="true">%s</button>',
			esc_html__( 'Оформление заказа временно недоступно', 'avtozakup-core' )
		);
	}

	/**
	 * @param string               $block_content Rendered block HTML.
	 * @param array<string, mixed> $block         Parsed block.
	 */
	public function filter_commerce_block( string $block_content, array $block ): string {
		if (
			! in_array( $block['blockName'] ?? '', array( 'woocommerce/cart', 'woocommerce/checkout' ), true )
			|| ! $this->should_block_checkout()
		) {
			return $block_content;
		}

		$notice = sprintf(
			'<div class="woocommerce-info avtozakup-demo-notice" role="status">%s</div>',
			esc_html( $this->message() )
		);

		return $notice . $block_content;
	}

	/**
	 * Block direct Store API checkout POSTs as well as the visual checkout.
	 *
	 * @param mixed           $result  Existing pre-dispatch result.
	 * @param mixed           $server  REST server (unused).
	 * @param WP_REST_Request $request REST request.
	 * @return mixed
	 */
	public function block_store_api_checkout( $result, $server, WP_REST_Request $request ) {
		unset( $server );

		if ( null !== $result || 'POST' !== strtoupper( $request->get_method() ) ) {
			return $result;
		}

		if ( ! preg_match( '#^/wc/store/v[0-9]+/checkout(?:/|$)#', $request->get_route() ) ) {
			return $result;
		}

		if ( ! $this->should_block_checkout() ) {
			return $result;
		}

		return new WP_Error(
			'avtozakup_demo_checkout_disabled',
			$this->message(),
			array( 'status' => 403 )
		);
	}

	private function cart_contains_demo_product(): bool {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return false;
		}

		foreach ( WC()->cart->get_cart() as $cart_item ) {
			$product_id = absint( $cart_item['product_id'] ?? 0 );
			$variation_id = absint( $cart_item['variation_id'] ?? 0 );

			if ( '1' === get_post_meta( $product_id, self::PRODUCT_META_KEY, true ) ) {
				return true;
			}

			if ( $variation_id > 0 && '1' === get_post_meta( $variation_id, self::PRODUCT_META_KEY, true ) ) {
				return true;
			}
		}

		return false;
	}

	private function message(): string {
		return __( 'Онлайн-оформление заказа временно недоступно.', 'avtozakup-core' );
	}
}

