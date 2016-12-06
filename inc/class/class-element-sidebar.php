<?php
/**
 * Sidebar Element class.
 *
 * @package No Hassle Builder
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

if ( ! class_exists( 'nhbElementSidebar' ) ) {

	/**
	 * This is where all the sidebar element functionality happens.
	 */
	class nhbElementSidebar {

		/**
		 * Hook into WordPress.
		 */
		function __construct() {
			add_filter( 'nhb_localize_scripts', array( $this, 'add_sidebar_list' ) );
		}


		/**
		 * Add the list of available sidebars for JS.
		 *
		 * @since 2.12
		 *
		 * @param array $params Localization parameters.
		 *
		 * @return array The modified parameters.
		 */
		public function add_sidebar_list( $params ) {
			$params['sidebar_list'] = array(
				'' => __( '— Select Sidebar —', NO_HASSLE_BUILDER ),
			);

			foreach ( $GLOBALS['wp_registered_sidebars'] as $sidebar ) {
				$params['sidebar_list'][ $sidebar['id'] ] = $sidebar['name'];
			}

			$params['sidebar_label_id'] = sprintf( __( 'These are the existing sidebars/widget area in your site. %sManage widgets%s', NO_HASSLE_BUILDER ), '<a href="' . esc_url( admin_url( 'widgets.php' ) ) . '" target="_blank">', '</a>' );

			return $params;
		}
	}
}

new nhbElementSidebar();
