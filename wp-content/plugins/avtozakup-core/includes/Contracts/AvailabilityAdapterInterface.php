<?php
/**
 * Inventory/availability integration boundary.
 *
 * @package AvtozakupCore
 */

declare(strict_types=1);

namespace Avtozakup\Core\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface AvailabilityAdapterInterface {
	/**
	 * Return a normalized, source-attributed availability snapshot.
	 *
	 * Implementations must not imply a reservation or guaranteed stock.
	 *
	 * @param int                  $product_id WooCommerce product ID.
	 * @param array<string, mixed> $context    Request context.
	 * @return array<string, mixed>
	 */
	public function get_availability( int $product_id, array $context = array() ): array;
}

