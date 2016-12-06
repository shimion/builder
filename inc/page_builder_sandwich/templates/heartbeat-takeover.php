<?php
/**
 * Template file for the editing takeover modal. This is shown when you are
 * editing with PBS, then someone has taken over the editing privileges.
 *
 * @package Page Builder Sandwich
 */

?>
<script type="text/html" id="tmpl-pbs-heartbeat-takeover">
	<div class="pbs-notification-dialog-background"></div>
	<div class="pbs-notification-dialog">
		<div class="post-locked-message">
			<div class="post-locked-avatar">
				<img alt="" src="{{ data.avatar }}" srcset="{{ data.avatar2x }} 2x" class="avatar avatar-64 photo" height="64" width="64">
			</div>
			<p class="currently-editing wp-tab-first" tabindex="0">
				<?php printf( esc_html( '%s has taken over and is currently editing.', PAGE_BUILDER_SANDWICH ), '{{ data.author_name }}' ); ?>
				<br>
				<?php esc_html_e( 'Your latest changes were saved as a revision.', PAGE_BUILDER_SANDWICH ) ?>
			</p>
			<p>
				<a class="button button-primary wp-tab-last pbs-post-takeover-refresh" href="#"><?php esc_html_e( 'Refresh This Page', PAGE_BUILDER_SANDWICH ) ?></a>
			</p>
		</div>
	</div>
</script>
