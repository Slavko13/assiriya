<?php
/**
 * Product catalog/search integration boundary.
 *
 * @package AvtozakupCore
 */

declare(strict_types=1);

namespace Avtozakup\Core\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface ProductCatalogAdapterInterface {
	/**
	 * Search normalized product identities, not supplier offers.
	 *
	 * @param string               $query   User query.
	 * @param array<string, mixed> $filters Validated filters.
	 * @return array<string, mixed>
	 */
	public function search( string $query, array $filters = array() ): array;
}

