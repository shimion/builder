<?php
/**
 * Display a welcome admin page.
 *
 * @since 3.2
 *
 * @package No Hassle Builder
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

if ( ! class_exists( 'nhbAdminWelcome' ) ) {

	/**
	 * This is where all the admin page creation happens.
	 */
	class nhbAdminWelcome {

		/**
		 * Hook into WordPress.
		 */
		function __construct() {
			add_action( 'admin_menu', array( $this, 'create_admin_menu' ) );
			add_action( 'activated_plugin', array( $this, 'redirect_to_welcome_page' ) );
		}


		/**
		 * Creates the nhb admin menu item.
		 *
		 * @since 3.2
		 */
		public function create_admin_menu() {
			add_menu_page(
				esc_html__( 'No Hassle Builder', NO_HASSLE_BUILDER ), // Page title.
				esc_html__( 'nhb', NO_HASSLE_BUILDER ), // Menu title.
				'manage_options', // Permissions.
				'no-hassle-builder', // Slug.
				array( $this, 'create_admin_page' ) // Page creation function.
			);

			add_submenu_page(
				'no-hassle-builder', // Parent slug.
				esc_html__( 'No Hassle Builder', NO_HASSLE_BUILDER ), // Page title.
				esc_html__( 'Home', NO_HASSLE_BUILDER ), // Menu title.
				'manage_options', // Permissions.
				'no-hassle-builder', // Slug.
				array( $this, 'create_admin_page' ) // Page creation function.
			);
		}


		/**
		 * Creates the contents of the welcome admin page.
		 *
		 * @since 3.2
		 */
		public function create_admin_page() {
			?>
			<div class="wrap about-wrap">
				<img class="nhb-logo" src="<?php echo esc_url( plugins_url( 'no_hassle_builder/images/nhb-logo.png', __FILE__ ) ) ?>"/>
				<h1><?php esc_html_e( 'Welcome to No Hassle Builder', NO_HASSLE_BUILDER ) ?> v<?php esc_html_e( VERSION_NO_HASSLE_BUILDER ) ?></h1>
				<p class="nhb-subheading"><?php esc_html_e( 'Creating Stunning Webpages Is Now as Easy as Making a Sandwich', NO_HASSLE_BUILDER ) ?></p>
				<p class="nhb-notice"><a class="button button-primary" href="<?php echo esc_url( admin_url( 'edit.php?post_type=page' ) ) ?>"><?php esc_html_e( 'View Pages', NO_HASSLE_BUILDER ) ?></a> <?php esc_html_e( 'To start, go to your list of pages and click on the "Edit with No Hassle Builder" link below each page entry.', NO_HASSLE_BUILDER ) ?></p>
				<div class="welcome-panel">
					<div class="nhb-whats-new-wrapper">
						<h2><?php esc_html_e( "What's New", NO_HASSLE_BUILDER ) ?></h2>
						<div class="nhb-whats-new">
							<div>
								<h3>Edit Post Titles</h3>
								<p>Now you can change page and post titles when editing. Just click on your title and type away.</p>
							</div>
							<div>
								<h3>Carousel Fade</h3>
								<p>There are a few new options available in carousels: fade sliding animation and animation speed. (Premium)</p>
							</div>
							<div>
								<h3>Autosave</h3>
								<p>Never lose your work again! Your changes are saved every 15 minutes.</p>
							</div>
							<div>
								<h3>Post Locking</h3>
								<p>Other users will know that you're building your page, and you can also take over other posts being edited by others.</p>
							</div>
							<div>
								<h3>Toggle Element</h3>
								<p>We just added a new toggle element, use this to create FAQ pages. (Premium)</p>
							</div>
							<div>
								<h3>Animations</h3>
								<p>Each element can now have animations on them that play when you scroll. (Premium)</p>
							</div>
							<div>
								<h3>Shadows</h3>
								<p>Add subtle, yet cool shadows on your images, rows and columns. (Premium)</p>
							</div>
							<div>
								<h3>Tab Styles</h3>
								<p>You can now style your tabs to match your page design. (Premium)</p>
							</div>
						</div>
					</div>
					<div class="nhb-tour-wrapper">
						<h2><?php esc_html_e( 'Watch the Tour', NO_HASSLE_BUILDER ) ?></h2>
						<div class="nhb-tour">
							<iframe src="https://www.youtube.com/embed/dSU2l1Vhp50?rel=0&showinfo=0&autohide=1&controls=0" width="800" height="450" frameborder="0" allowfullscreen="1"></iframe>
						</div>
					</div>
				</div>
			</div>
			<?php
		}


		/**
		 * Redirect to our welcome page after activation.
		 *
		 * @since 3.2
		 *
		 * @param string $plugin The path to the plugin that was activated.
		 */
		public function redirect_to_welcome_page( $plugin ) {
			if ( plugin_basename( nhb_FILE ) === $plugin ) {
				wp_redirect( esc_url( admin_url( 'admin.php?page=no-hassle-builder' ) ) );
				die();
			}
		}
	}
}

new nhbAdminWelcome();
