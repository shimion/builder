<?php
/**
 * Template file for the font picker modal popup.
 *
 * @package No Hassle Builder
 */

global $nhb_fs;
?>
<script type="text/html" id="tmpl-nhb-icon-frame">
	<div class="media-frame-title">
		<h1></h1>
		<label>
			<input type="search" placeholder="<?php echo esc_attr( sprintf( __( 'Search for %s', NO_HASSLE_BUILDER ), __( 'Icon', NO_HASSLE_BUILDER ) ) ) ?>" id="nhb-icon-search-input" class="search"/>
		</label>
	</div>
	<div class="media-frame-content nhb-search-list-frame">
		<div class="nhb-icon-display nhb-search-list">
			<div class="nhb-no-results"><?php _e( 'No matches found', NO_HASSLE_BUILDER ) ?></div>
		</div>
	</div>
	<div class="media-frame-toolbar">
		<div class="media-toolbar">
			<div class="media-toolbar-secondary">
				<?php if ( nhb_IS_LITE || ! $nhb_fs->can_use_premium_code() ) { ?>
					<p>
						<?php printf( __( 'Only %sDashicons%s are available. %sUpgrading to Premium%s will unlock more icons, bullet & button icons and the ability to upload your own.', NO_HASSLE_BUILDER ),
							'<a href="https://developer.wordpress.org/resource/dashicons/">',
							'</a>',
							'<a href="https://pagebuildersandwich.com/compare?utm_source=lite-plugin&utm_medium=icon-picker&utm_campaign=Page%20Builder%20Sandwich">',
							'</a>'
						) ?>
					</p>
				<?php } else { ?>
					<p>
						<?php printf( __( 'You can upload your own icons by dropping an SVG file anywhere to upload it. You can find more info in the %sdocs%s', NO_HASSLE_BUILDER ),
							'<a href="http://docs.pagebuildersandwich.com/article/62-how-to-upload-your-own-icons">',
							'</a>'
						) ?>
					</p>
				<?php } ?>
			</div>
			<div class="media-toolbar-primary search-form">
				<button type="button" class="button button-primary media-button button-large">Use Selected Icon</button>
			</div>
		</div>
	</div>
</script>
