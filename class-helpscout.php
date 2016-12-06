<?php
/**
 * Quick access docs for the frontend.
 *
 * @package Page Builder Sandwich
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

if ( ! class_exists( 'PBSHelpScout' ) ) {

	/**
	 * This is where all the docs functionality happens.
	 */
	class PBSHelpScout {

		/**
		 * Hook into the frontend.
		 */
		function __construct() {
			add_action( 'wp_footer', array( $this, 'add_helpscout_beacon' ) );
		}


		/**
		 * Add the HelpScout Beacon. The JS code that opens the beacon is at script.js.
		 *
		 * @see script.js
		 */
		public function add_helpscout_beacon() {
			if ( ! PageBuilderSandwich::is_editable_by_user() ) {
				return;
			}
			?>
			<script>
			/* jshint ignore:start */
			!function(e,o,n){window.HSCW=o,window.HS=n,n.beacon=n.beacon||{};var t=n.beacon;t.userConfig={},t.readyQueue=[],t.config=function(e){this.userConfig=e},t.ready=function(e){this.readyQueue.push(e)},o.config={docs:{enabled:!0,baseUrl:"//pagebuildersandwich.helpscoutdocs.com/"},contact:{enabled:!1,formId:"76563112-df73-11e5-a329-0ee2467769ff"}};var r=e.getElementsByTagName("script")[0],c=e.createElement("script");c.type="text/javascript",c.async=!0,c.src="https://djtflbt20bdde.cloudfront.net/",r.parentNode.insertBefore(c,r)}(document,window.HSCW||{},window.HS||{});
			HS.beacon.config({ topArticles: true, modal: true, zIndex: 9999999 });
			/* jshint ignore:end */
			</script>
			<?php
		}
	}
}

new PBSHelpScout();
