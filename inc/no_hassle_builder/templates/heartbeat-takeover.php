<?php
/**
 * Template file for the editing takeover modal. This is shown when you are
 * editing with nhb, then someone has taken over the editing privileges.
 *
 * @package No Hassle Builder
 */

?>
<script type="text/html" id="tmpl-nhb-heartbeat-takeover">
	<div class="nhb-notification-dialog-background"></div>
	<div class="nhb-notification-dialog">
		<div class="post-locked-message">
			<div class="post-locked-avatar">
				<img alt="" src="{{ data.avatar }}" srcset="{{ data.avatar2x }} 2x" class="avatar avatar-64 photo" height="64" width="64">
			</div>
			<p class="currently-editing wp-tab-first" tabindex="0">
				<?php printf( esc_html( '%s has taken over and is currently editing.', NO_HASSLE_BUILDER ), '{{ data.author_name }}' ); ?>
				<br>
				<?php esc_html_e( 'Your latest changes were saved as a revision.', NO_HASSLE_BUILDER ) ?>
			</p>
			<p>
				<a class="button button-primary wp-tab-last nhb-post-takeover-refresh" href="#"><?php esc_html_e( 'Refresh This Page', NO_HASSLE_BUILDER ) ?></a>
			</p>
		</div>
	</div>
</script>
