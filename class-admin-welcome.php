<?php
/**
 * Display a welcome admin page.
 *
 * @since 3.2
 *
 * @package Page Builder Sandwich
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

if ( ! class_exists( 'PBSAdminWelcome' ) ) {

	/**
	 * This is where all the admin page creation happens.
	 */
	class PBSAdminWelcome {

		/**
		 * Hook into WordPress.
		 */
		function __construct() {
			add_action( 'admin_menu', array( $this, 'create_admin_menu' ) );
			add_action( 'activated_plugin', array( $this, 'redirect_to_welcome_page' ) );
		}


		/**
		 * Creates the PBS admin menu item.
		 *
		 * @since 3.2
		 */
		public function create_admin_menu() {
			add_menu_page(
				esc_html__( 'Page Builder Sandwich', PAGE_BUILDER_SANDWICH ), // Page title.
				esc_html__( 'PBSandwich', PAGE_BUILDER_SANDWICH ), // Menu title.
				'manage_options', // Permissions.
				'page-builder-sandwich', // Slug.
				array( $this, 'create_admin_page' ) // Page creation function.
			);

			add_submenu_page(
				'page-builder-sandwich', // Parent slug.
				esc_html__( 'Page Builder Sandwich', PAGE_BUILDER_SANDWICH ), // Page title.
				esc_html__( 'Home', PAGE_BUILDER_SANDWICH ), // Menu title.
				'manage_options', // Permissions.
				'page-builder-sandwich', // Slug.
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
				<img class="pbs-logo" src="<?php echo esc_url( plugins_url( 'page_builder_sandwich/images/pbs-logo.png', __FILE__ ) ) ?>"/>
				<h1><?php esc_html_e( 'Welcome to Page Builder Sandwich', PAGE_BUILDER_SANDWICH ) ?> v<?php esc_html_e( VERSION_PAGE_BUILDER_SANDWICH ) ?></h1>
				<p class="pbs-subheading"><?php esc_html_e( 'Creating Stunning Webpages Is Now as Easy as Making a Sandwich', PAGE_BUILDER_SANDWICH ) ?></p>
				<p class="pbs-notice"><a class="button button-primary" href="<?php echo esc_url( admin_url( 'edit.php?post_type=page' ) ) ?>"><?php esc_html_e( 'View Pages', PAGE_BUILDER_SANDWICH ) ?></a> <?php esc_html_e( 'To start, go to your list of pages and click on the "Edit with Page Builder Sandwich" link below each page entry.', PAGE_BUILDER_SANDWICH ) ?></p>
				<div class="welcome-panel">
					<div class="pbs-whats-new-wrapper">
						<h2><?php esc_html_e( "What's New", PAGE_BUILDER_SANDWICH ) ?></h2>
						<div class="pbs-whats-new">
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
					<div class="pbs-tour-wrapper">
						<h2><?php esc_html_e( 'Watch the Tour', PAGE_BUILDER_SANDWICH ) ?></h2>
						<div class="pbs-tour">
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
			if ( plugin_basename( PBS_FILE ) === $plugin ) {
				wp_redirect( esc_url( admin_url( 'admin.php?page=page-builder-sandwich' ) ) );
				die();
			}
		}
	}
}

new PBSAdminWelcome();
