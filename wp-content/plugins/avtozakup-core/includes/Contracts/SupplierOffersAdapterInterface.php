<?php
/**
 * Supplier offer integration boundary.
 *
 * @package AvtozakupCore
 */

declare(strict_types=1);

namespace Avtozakup\Core\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface SupplierOffersAdapterInterface {
	/**
	 * Return normalized offers with source and freshness metadata.
	 *
	 * Implementations must not select a default offer or create procurement.
	 *
	 * @param int                  $product_id WooCommerce product ID.
	 * @param array<string, mixed> $context    Request context.
	 * @return array<int, array<string, mixed>>
	 */
	public function get_offers( int $product_id, array $context = array() ): array;
}

