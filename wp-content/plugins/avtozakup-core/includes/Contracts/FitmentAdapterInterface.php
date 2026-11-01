<?php
/**
 * Vehicle fitment integration boundary.
 *
 * @package AvtozakupCore
 */

declare(strict_types=1);

namespace Avtozakup\Core\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface FitmentAdapterInterface {
	/**
	 * Check fitment without turning an unknown result into a positive match.
	 *
	 * @param int                  $product_id WooCommerce product ID.
	 * @param array<string, mixed> $vehicle    Normalized vehicle context.
	 * @return array<string, mixed> Normalized status and source metadata.
	 */
	public function check_fitment( int $product_id, array $vehicle ): array;
}

