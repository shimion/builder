<?php
/**
 * Learn more about premium modal.
 *
 * @package No Hassle Builder
 */

?>
<script type="text/html" id="tmpl-nhb-learn-premium">
	<div class="nhb-learn-premium">
		<div class="nhb-tour-close"></div>
		<h2><?php printf( esc_html__( 'Do More With No Hassle Builder %sPremium%s', NO_HASSLE_BUILDER ), '<strong>', '</strong>' ) ?></h2>
		<p><?php esc_html_e( 'Get more awesome features to make your website stunning! Here\'s a preview of what you\'ll get:', NO_HASSLE_BUILDER ) ?></p>
		<div class="nhb-learn-carousel">
			<div class="nhb-learn-slides">
				<div class="nhb-learn-slide" data-state="active" style="background-image: url(<?php echo esc_url( plugins_url( 'no_hassle_builder/images/learn-premium-slide-1.jpg', nhb_FILE ) ) ?>)">
					<h3><?php esc_html_e( '40+ Beautiful Templates', NO_HASSLE_BUILDER ) ?></h3>
					<p><?php esc_html_e( 'Small Pre-Designed Templates That You Can Mix and Match.', NO_HASSLE_BUILDER ) ?></p>
				</div>
				<div class="nhb-learn-slide" style="background-image: url(<?php echo esc_url( plugins_url( 'no_hassle_builder/images/learn-premium-slide-2.jpg', nhb_FILE ) ) ?>)">
					<h3><?php esc_html_e( 'Premium Elements', NO_HASSLE_BUILDER ) ?></h3>
					<p><?php esc_html_e( 'Buttons, Ghost Buttons, Carousels, Newsletters, Toggle, More Icons, Icon Bullets, and Plenty More.', NO_HASSLE_BUILDER ) ?></p>
				</div>
				<div class="nhb-learn-slide" style="background-image: url(<?php echo esc_url( plugins_url( 'no_hassle_builder/images/learn-premium-slide-3.jpg', nhb_FILE ) ) ?>)">
					<h3><?php esc_html_e( 'More Styling Options', NO_HASSLE_BUILDER ) ?></h3>
					<p><?php esc_html_e( 'Sweet Animations, Fancy Shadows, Background Patterns, Tab Styles, and Plenty More.', NO_HASSLE_BUILDER ) ?></p>
				</div>
				<div class="nhb-learn-slide" style="background-image: url(<?php echo esc_url( plugins_url( 'no_hassle_builder/images/learn-premium-slide-4.jpg', nhb_FILE ) ) ?>)">
					<h3><?php esc_html_e( 'Advanced Shortcode Controls', NO_HASSLE_BUILDER ) ?></h3>
					<p><?php esc_html_e( 'Access Color Pickers, Number Sliders, Image Pickers, Boolean Toggles, and More for 600+ Mapped Shortcodes.', NO_HASSLE_BUILDER ) ?></p>
				</div>
				<div class="nhb-learn-slide" style="background-image: url(<?php echo esc_url( plugins_url( 'no_hassle_builder/images/learn-premium-slide-5.jpg', nhb_FILE ) ) ?>)">
					<h3><?php esc_html_e( 'Premium E-Mail Support', NO_HASSLE_BUILDER ) ?></h3>
					<p><?php esc_html_e( 'Got a Problem? Contact Us From Within the Plugin and We\'ll Help You Out!', NO_HASSLE_BUILDER ) ?></p>
				</div>
			</div>
			<div class="nhb-learn-indicators">
				<label data-state="active">
					<input class="nhb-learn-indicator" name="nhb-learn-indicator" data-slide="1" checked type="radio" />
				</label>
				<label>
					<input class="nhb-learn-indicator" name="nhb-learn-indicator" data-slide="2" type="radio" />
				</label>
				<label>
					<input class="nhb-learn-indicator" name="nhb-learn-indicator" data-slide="3" type="radio" />
				</label>
				<label>
					<input class="nhb-learn-indicator" name="nhb-learn-indicator" data-slide="4" type="radio" />
				</label>
				<label>
					<input class="nhb-learn-indicator" name="nhb-learn-indicator" data-slide="5" type="radio" />
				</label>
			</div>
		</div>
		<p class="nhb-learn-buy-button">
			<a href='<?php echo esc_url( admin_url( '/admin.php?page=no-hassle-builder-pricing' ) ) ?>' target="_buy"><?php esc_html_e( 'Buy Now, starts at $39', NO_HASSLE_BUILDER ) ?></a>
			<a href='http://demo.pagebuildersandwich.com/' class="nhb-trial-button" target="_buy"><?php esc_html_e( 'Try A Live Demo', NO_HASSLE_BUILDER ) ?></a>
		</p>
	</div>
</script>
