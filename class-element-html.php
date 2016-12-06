<?php
/**
 * Html Element class.
 *
 * @package Page Builder Sandwich
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

if ( ! class_exists( 'PBSElementHtml' ) ) {

	/**
	 * This is where all the html element functionality happens.
	 */
	class PBSElementHtml {

		/**
		 * Hook into WordPress.
		 */
		function __construct() {
			add_action( 'wp_footer', array( $this, 'add_html_frame_template' ) );
			add_filter( 'the_content', array( $this, 'fix_escaped_script_ampersands' ), 999 );
		}


		/**
		 * Add the widget picker frame.
		 *
		 * @since 2.12
		 */
		public function add_html_frame_template() {
			if ( ! PageBuilderSandwich::is_editable_by_user() ) {
				return;
			}

			include 'page_builder_sandwich/templates/frame-html-editor.php';
		}


		/**
		 * Ampersands inside <script> tags get escaped into special characters, undo that.
		 * This is safe to do with all script tags inside the content.
		 *
		 * @since 2.16
		 *
		 * @param string $content The post content.
		 *
		 * @return string The modified content.
		 */
		public function fix_escaped_script_ampersands( $content ) {
			return preg_replace_callback( '#(<script[^>]*>)(.*?)(</script>)#si', array( $this, 'replace_escaped_amps' ), $content );
		}


		/**
		 * Converts all &#038; from a string into an ampersand sign. To be used
		 * in conjunction with preg_replace_callback.
		 *
		 * @since 2.16
		 *
		 * @param array $matches The matching terms in preg_replace_callback.
		 *
		 * @return string The adjusted/replaced string.
		 */
		public function replace_escaped_amps( $matches ) {
			$content = $matches[2];
			$content = preg_replace( '/&#038;/', '&', $content );
			return $matches[1] . $content . $matches[3];
		}
	}
}

new PBSElementHtml();
