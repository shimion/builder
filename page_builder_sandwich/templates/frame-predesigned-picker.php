<?php
/**
 * Template file for the pre-designed section picker modal popup.
 *
 * @package Page Builder Sandwich
 */

?>
<script type="text/html" id="tmpl-pbs-predesigned-frame">
	<div class="media-frame-title">
		<h1></h1>
		<label>
			<input type="search" placeholder="<?php echo esc_attr( sprintf( __( 'Search for %s', PAGE_BUILDER_SANDWICH ), __( 'Pre-Designed Sections', PAGE_BUILDER_SANDWICH ) ) ) ?>" class="search"/>
		</label>
	</div>
	<div class="media-frame-content pbs-search-list-frame">
		<div class="pbs-search-list">
			<div class="pbs-no-results"><?php esc_html_e( 'No matches found', PAGE_BUILDER_SANDWICH ) ?></div>
		</div>
		<?php
		?>
	</div>
	<div class="media-frame-toolbar">
		<div class="media-toolbar">
			<div class="media-toolbar-secondary">
			</div>
			<div class="media-toolbar-primary search-form">
				<button type="button" class="button button-primary media-button button-large"><?php esc_html_e( 'Insert Design', PAGE_BUILDER_SANDWICH ) ?></button>
			</div>
		</div>
	</div>
</script>
