<?php
/**
 * Template file for the font picker modal popup.
 *
 * @package Page Builder Sandwich
 */

global $pbs_fs;
?>
<script type="text/html" id="tmpl-pbs-icon-frame">
	<div class="media-frame-title">
		<h1></h1>
		<label>
			<input type="search" placeholder="<?php echo esc_attr( sprintf( __( 'Search for %s', PAGE_BUILDER_SANDWICH ), __( 'Icon', PAGE_BUILDER_SANDWICH ) ) ) ?>" id="pbs-icon-search-input" class="search"/>
		</label>
	</div>
	<div class="media-frame-content pbs-search-list-frame">
		<div class="pbs-icon-display pbs-search-list">
			<div class="pbs-no-results"><?php _e( 'No matches found', PAGE_BUILDER_SANDWICH ) ?></div>
		</div>
	</div>
	<div class="media-frame-toolbar">
		<div class="media-toolbar">
			<div class="media-toolbar-secondary">
				<?php if ( PBS_IS_LITE || ! $pbs_fs->can_use_premium_code() ) { ?>
					<p>
						<?php printf( __( 'Only %sDashicons%s are available. %sUpgrading to Premium%s will unlock more icons, bullet & button icons and the ability to upload your own.', PAGE_BUILDER_SANDWICH ),
							'<a href="https://developer.wordpress.org/resource/dashicons/">',
							'</a>',
							'<a href="https://pagebuildersandwich.com/compare?utm_source=lite-plugin&utm_medium=icon-picker&utm_campaign=Page%20Builder%20Sandwich">',
							'</a>'
						) ?>
					</p>
				<?php } else { ?>
					<p>
						<?php printf( __( 'You can upload your own icons by dropping an SVG file anywhere to upload it. You can find more info in the %sdocs%s', PAGE_BUILDER_SANDWICH ),
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
