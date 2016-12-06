<?php
/**
 * Learn more about premium modal.
 *
 * @package Page Builder Sandwich
 */

?>
<script type="text/html" id="tmpl-pbs-learn-premium">
	<div class="pbs-learn-premium">
		<div class="pbs-tour-close"></div>
		<h2><?php printf( esc_html__( 'Do More With Page Builder Sandwich %sPremium%s', PAGE_BUILDER_SANDWICH ), '<strong>', '</strong>' ) ?></h2>
		<p><?php esc_html_e( 'Get more awesome features to make your website stunning! Here\'s a preview of what you\'ll get:', PAGE_BUILDER_SANDWICH ) ?></p>
		<div class="pbs-learn-carousel">
			<div class="pbs-learn-slides">
				<div class="pbs-learn-slide" data-state="active" style="background-image: url(<?php echo esc_url( plugins_url( 'page_builder_sandwich/images/learn-premium-slide-1.jpg', PBS_FILE ) ) ?>)">
					<h3><?php esc_html_e( '40+ Beautiful Templates', PAGE_BUILDER_SANDWICH ) ?></h3>
					<p><?php esc_html_e( 'Small Pre-Designed Templates That You Can Mix and Match.', PAGE_BUILDER_SANDWICH ) ?></p>
				</div>
				<div class="pbs-learn-slide" style="background-image: url(<?php echo esc_url( plugins_url( 'page_builder_sandwich/images/learn-premium-slide-2.jpg', PBS_FILE ) ) ?>)">
					<h3><?php esc_html_e( 'Premium Elements', PAGE_BUILDER_SANDWICH ) ?></h3>
					<p><?php esc_html_e( 'Buttons, Ghost Buttons, Carousels, Newsletters, Toggle, More Icons, Icon Bullets, and Plenty More.', PAGE_BUILDER_SANDWICH ) ?></p>
				</div>
				<div class="pbs-learn-slide" style="background-image: url(<?php echo esc_url( plugins_url( 'page_builder_sandwich/images/learn-premium-slide-3.jpg', PBS_FILE ) ) ?>)">
					<h3><?php esc_html_e( 'More Styling Options', PAGE_BUILDER_SANDWICH ) ?></h3>
					<p><?php esc_html_e( 'Sweet Animations, Fancy Shadows, Background Patterns, Tab Styles, and Plenty More.', PAGE_BUILDER_SANDWICH ) ?></p>
				</div>
				<div class="pbs-learn-slide" style="background-image: url(<?php echo esc_url( plugins_url( 'page_builder_sandwich/images/learn-premium-slide-4.jpg', PBS_FILE ) ) ?>)">
					<h3><?php esc_html_e( 'Advanced Shortcode Controls', PAGE_BUILDER_SANDWICH ) ?></h3>
					<p><?php esc_html_e( 'Access Color Pickers, Number Sliders, Image Pickers, Boolean Toggles, and More for 600+ Mapped Shortcodes.', PAGE_BUILDER_SANDWICH ) ?></p>
				</div>
				<div class="pbs-learn-slide" style="background-image: url(<?php echo esc_url( plugins_url( 'page_builder_sandwich/images/learn-premium-slide-5.jpg', PBS_FILE ) ) ?>)">
					<h3><?php esc_html_e( 'Premium E-Mail Support', PAGE_BUILDER_SANDWICH ) ?></h3>
					<p><?php esc_html_e( 'Got a Problem? Contact Us From Within the Plugin and We\'ll Help You Out!', PAGE_BUILDER_SANDWICH ) ?></p>
				</div>
			</div>
			<div class="pbs-learn-indicators">
				<label data-state="active">
					<input class="pbs-learn-indicator" name="pbs-learn-indicator" data-slide="1" checked type="radio" />
				</label>
				<label>
					<input class="pbs-learn-indicator" name="pbs-learn-indicator" data-slide="2" type="radio" />
				</label>
				<label>
					<input class="pbs-learn-indicator" name="pbs-learn-indicator" data-slide="3" type="radio" />
				</label>
				<label>
					<input class="pbs-learn-indicator" name="pbs-learn-indicator" data-slide="4" type="radio" />
				</label>
				<label>
					<input class="pbs-learn-indicator" name="pbs-learn-indicator" data-slide="5" type="radio" />
				</label>
			</div>
		</div>
		<p class="pbs-learn-buy-button">
			<a href='<?php echo esc_url( admin_url( '/admin.php?page=page-builder-sandwich-pricing' ) ) ?>' target="_buy"><?php esc_html_e( 'Buy Now, starts at $39', PAGE_BUILDER_SANDWICH ) ?></a>
			<a href='http://demo.pagebuildersandwich.com/' class="pbs-trial-button" target="_buy"><?php esc_html_e( 'Try A Live Demo', PAGE_BUILDER_SANDWICH ) ?></a>
		</p>
	</div>
</script>
