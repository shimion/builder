<?php
/**
 * Compatibility stuff for various plugins.
 *
 * @package No Hassle Builder
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

if ( ! class_exists( 'nhbCompatibility' ) ) {

	/**
	 * Compatibility class.
	 */
	class nhbCompatibility {


		/**
		 * Hook into WordPress.
		 *
		 * @since 2.7
		 *
		 * @return void
		 */
		function __construct() {
			add_filter( 'nhb_load_editor', array( $this, 'yellow_pencil' ) );
		}


		/**
		 * Compatibility for Yellow Pencil. Turn off nhb when YP editor is on.
		 *
		 * @since 2.7
		 *
		 * @param bool $load true if we should continue loading nhb.
		 *
		 * @return	boolean True if we should continue loading nhb.
		 */
		public function yellow_pencil( $load ) {
			if ( ! is_admin() && ! empty( $_GET['yellow_pencil_frame'] ) ) { // Input var okay.
				return false;
			}
			return $load;
		}
	}
}
