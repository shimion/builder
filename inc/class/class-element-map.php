<?php
/**
 * Map Element class.
 *
 * @package No Hassle Builder
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

if ( ! class_exists( 'nhbElementMap' ) ) {

	/**
	 * This is where all the map element functionality happens.
	 */
	class nhbElementMap {


		/**
		 * Google Maps API Key for nhb.
		 */
		const GOOGLE_API_KEY = 'AIzaSyD5oMOq3XPDiMv3Cn4ZDPloR3G2o0t1dU0';


		/**
		 * Hook into WordPress.
		 */
		function __construct() {
			add_action( 'nhb_enqueue_element_scripts_map', array( $this, 'add_map_script' ) );
			add_filter( 'script_loader_tag', array( $this, 'enqueue_deferred_map_script' ), 10, 3 );
			add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_editor' ) );
		}


		/**
		 * Add the scripts needed by the map element.
		 * Also adjusts the URL to serve specific languages (not regions) as specified in the
		 * Google Maps API Docs.
		 *
		 * @see https://developers.google.com/maps/documentation/javascript/localization#Language
		 *
		 * Google Maps supported languages:
		 * @see https://developers.google.com/maps/faq#languagesupport
		 *
		 * WordPress supported locales:
		 * @see https://make.wordpress.org/polyglots/teams/
		 *
		 * @since 2.16
		 *
		 * @return void
		 */
		public function add_map_script() {
			$js_dir = defined( 'WP_DEBUG' ) && WP_DEBUG ? 'dev' : 'min';
			$js_suffix = defined( 'WP_DEBUG' ) && WP_DEBUG ? '' : '-min';

			$google_map_url = 'https://maps.googleapis.com/maps/api/js?key=%s&callback=initnhbMaps';

			$locale = get_locale();

			// China locales should be served in China.
			// @see https://developers.google.com/maps/documentation/javascript/localization#Language.
			if ( 'zh_CN' === $locale ) {
				$google_map_url = 'https://maps.google.cn/maps/api/js?region=cn&key=%s&callback=initnhbMaps';
			}

			// Add the API Key.
			$google_map_url = sprintf( $google_map_url, self::GOOGLE_API_KEY );

			// Add the language.
			$language = $locale;

			// Some languages for GMaps are locales. These are listed in https://developers.google.com/maps/faq#languagesupport.
			$special_locales = array( 'en_AU', 'en_GB', 'pt_BR', 'pt_PT', 'zh_CN', 'zh_TW' );
			if ( in_array( $language, $special_locales, true ) ) {
				$language = str_replace( '_', '-', $language );
			} else if ( stripos( $language, '_' ) !== false ) {
				$language = substr( $language, 0, stripos( $language, '_' ) );
			}
			$google_map_url .= '&language=' . $language;

			// Enqueue the scripts.
			wp_enqueue_script( 'nhb-element-map', plugins_url( 'no_hassle_builder/js/' . $js_dir . '/frontend-map' . $js_suffix . '.js', dirname(__FILE__) ), array(), VERSION_NO_HASSLE_BUILDER, true );
			wp_enqueue_script( 'nhb-element-map-lib', $google_map_url, array( 'nhb-element-map' ), VERSION_NO_HASSLE_BUILDER, true );
		}


		/**
		 * Adds defer and async attributes to the nhb-element-map script.
		 *
		 * @since 2.16
		 *
		 * @param string $tag The <script> tag for the enqueued script.
		 * @param string $handle The script's registered handle.
		 * @param string $src The script's source URL.
		 *
		 * @return The <script> tag that will be printed out.
		 */
		public function enqueue_deferred_map_script( $tag, $handle, $src ) {
		    if ( in_array( $handle, array( 'nhb-element-map-lib', 'nhb-element-map' ), true ) ) {
				// @codingStandardsIgnoreLine
		        return '<script type=\'text/javascript\' src=\'' . $src . '\' defer></script>' . "\n";
		    }

		    return $tag;
		}


		/**
		 * Includes frontend scripts needed for editors.
		 *
		 * @since 2.16
		 *
		 * @return void
		 */
		public function enqueue_editor() {
			if ( ! NoHassleBuilder::is_editable_by_user() ) {
				return;
			}

			$this->add_map_script();
		}
	}
}

new nhbElementMap();
