<?php
/**
 * Compatibility stuff for various plugins.
 *
 * @package Page Builder Sandwich
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

if ( ! class_exists( 'PBSCompatibility' ) ) {

	/**
	 * Compatibility class.
	 */
	class PBSCompatibility {


		/**
		 * Hook into WordPress.
		 *
		 * @since 2.7
		 *
		 * @return void
		 */
		function __construct() {
			add_filter( 'pbs_load_editor', array( $this, 'yellow_pencil' ) );
		}


		/**
		 * Compatibility for Yellow Pencil. Turn off PBS when YP editor is on.
		 *
		 * @since 2.7
		 *
		 * @param bool $load true if we should continue loading PBS.
		 *
		 * @return	boolean True if we should continue loading PBS.
		 */
		public function yellow_pencil( $load ) {
			if ( ! is_admin() && ! empty( $_GET['yellow_pencil_frame'] ) ) { // Input var okay.
				return false;
			}
			return $load;
		}
	}
}
