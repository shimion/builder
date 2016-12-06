<?php
/**
 * Template file for the pre-designed section picker modal popup.
 *
 * @package No Hassle Builder
 */

?>
<script type="text/html" id="tmpl-nhb-predesigned-frame">
	<div class="media-frame-title">
		<h1></h1>
		<label>
			<input type="search" placeholder="<?php echo esc_attr( sprintf( __( 'Search for %s', NO_HASSLE_BUILDER ), __( 'Pre-Designed Sections', NO_HASSLE_BUILDER ) ) ) ?>" class="search"/>
		</label>
	</div>
	<div class="media-frame-content nhb-search-list-frame">
		<div class="nhb-search-list">
			<div class="nhb-no-results"><?php esc_html_e( 'No matches found', NO_HASSLE_BUILDER ) ?></div>
		</div>
		<?php
		?>
	</div>
	<div class="media-frame-toolbar">
		<div class="media-toolbar">
			<div class="media-toolbar-secondary">
			</div>
			<div class="media-toolbar-primary search-form">
				<button type="button" class="button button-primary media-button button-large"><?php esc_html_e( 'Insert Design', NO_HASSLE_BUILDER ) ?></button>
			</div>
		</div>
	</div>
</script>
