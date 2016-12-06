<?php
/**
 * ALL Shortcodes used by No Hassle Builder.
 * This can spun off into another plugin so that nhb can be turned off and the shortcodes
 * can be retained.
 *
 * @since 2.11
 *
 * @package No Hassle Builder
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

if ( ! class_exists( 'nhbShortcodes' ) ) {

	/**
	 * This is where all the shortcode functionality happens.
	 */
	class nhbShortcodes {

		/**
		 * Shortcodes to hide from the frontend.
		 *
		 * @var array
		 */
		private $shortcodes_to_hide = array(
			'nhb_widget',
			'nhb_sidebar',
		);


		/**
		 * A unique incremental identifier for widget shortcodes.
		 *
		 * @var int
		 */
		public $widget_ids = 1;


		/**
		 * Hook into the frontend.
		 */
		function __construct() {
			add_shortcode( 'nhb_widget', array( $this, 'widget' ) );
			add_shortcode( 'nhb_sidebar', array( $this, 'sidebar' ) );
			add_filter( 'nhb_shortcodes_to_hide_in_picker', array( $this, 'hide_shortcodes_from_picker' ) );
		}


		/**
		 * Remove nhb internal shortcodes from the shortcode picker modal & other processes.
		 *
		 * @since 2.18
		 *
		 * @param array $shortcodes The list of shortcodes.
		 *
		 * @return array The modified list of shortcodes.
		 */
		public function hide_shortcodes_from_picker( $shortcodes ) {
			return array_merge( $shortcodes, $this->shortcodes_to_hide );
		}


		/**
		 * Widget shortcode.
		 *
		 * @since 2.11
		 *
		 * @param array  $atts Shortcode parameters.
		 * @param string $content Shortcode wrapped content.
		 *
		 * @return string The rendered widget
		 */
		public function widget( $atts, $content = '' ) {
			if ( empty( $atts['widget'] ) ) {
				$atts['widget'] = 'WP_Widget_Text';
			}

			$widget_slug = $atts['widget'];
			unset( $atts['widget'] );

			// Check if the widget exists. Widgets slugs are the class names in PHP.
			if ( ! class_exists( $widget_slug ) ) {
				return '';
			}

			ob_start();
			the_widget( $widget_slug, $atts, array(
				'widget_id' => 'nhb_widget_' . $this->widget_ids++,
			) );
			return ob_get_clean();
		}


		/**
		 * Sidebar shortcode.
		 *
		 * @since 2.12
		 *
		 * @param array  $atts Shortcode parameters.
		 * @param string $content Shortcode wrapped content.
		 *
		 * @return string The rendered sidebar
		 */
		public function sidebar( $atts, $content = '' ) {
			$atts = shortcode_atts( array(
				'id' => '',
			), $atts, 'nhb_sidebar' );

			if ( empty( $atts['id'] ) ) {
				return '';
			}

			if ( is_active_sidebar( $atts['id'] ) ) {
				ob_start();
				dynamic_sidebar( $atts['id'] );
				return ob_get_clean();
			}

			return '';
		}
	}
}

new nhbShortcodes();
