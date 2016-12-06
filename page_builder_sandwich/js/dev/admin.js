/* globals pbsParams, tinymce */

jQuery(document).ready(function($) {
	'use strict';
	
	if ( typeof pbsParams === 'undefined' ) {
		return;
	}
	if ( typeof pbsParams.is_editing === 'undefined' ) {
		return;
	}

	var originalContent = '';
	var hasAutosave = false;
	if ( typeof wp !== 'undefined' && typeof wp.autosave !== 'undefined' && typeof wp.autosave.getCompareString !== 'undefined' ) {
		originalContent = wp.autosave.getCompareString();
		hasAutosave = true;
	}

	var isDirty = function() {
		if ( ! hasAutosave ) {
			return true;
		}
		if ( tinymce && tinymce.activeEditor ) {
			if ( tinymce.activeEditor.isDirty() ) {
				return true;
			} else if ( originalContent !== wp.autosave.getCompareString() ) {
				return true;
			} else if ( ! tinymce.activeEditor.isHidden() ) {
				return tinymce.activeEditor.isDirty();
			}
		}
		return originalContent !== wp.autosave.getCompareString();
	};

	$('body').on( 'click', '#pbs-admin-edit-with-pbs', function(ev) {
		ev.preventDefault();

		// Prompt PBS to open when the page loads.
		if ( localStorage ) {
			localStorage.setItem( 'pbs-open-' + pbsParams.post_id, '1' );
		}

		if ( isDirty() ) {
			$('#preview-action a').trigger('click');
		} else {
			window.location.href = pbsParams.meta_permalink;
		}

		return false;
	});

});

