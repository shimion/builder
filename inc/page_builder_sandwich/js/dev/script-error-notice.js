/* globals pbsParams, errorNoticeParams */

window.pbsEncounteredErrors = 0;
window.onerror = function() {
	window.pbsEncounteredErrors++;
};

(function() {
	setTimeout( function() {
		if ( ! pbsParams.is_admin_bar_showing ) {
			if ( ! localStorage.getItem( 'pbs-adminbar-notice' ) ) {
				window.alert( errorNoticeParams.labels.toolbar_notice );
				localStorage.setItem( 'pbs-adminbar-notice', '1' );
			}
			return;
		}
		if ( window.pbsEncounteredErrors ) {
			if ( ! document.querySelector( '#wp-admin-bar-gambit_builder_edit' ) || ! document.querySelector( '#wp-admin-bar-gambit_builder_edit' ).classList.contains( 'ct-ignition__button--edit' ) ) {
				if ( ! localStorage.getItem( 'pbs-conflict-notice' ) ) {
					window.alert( errorNoticeParams.labels.error_notice );
					localStorage.setItem( 'pbs-conflict-notice', '1' );
				}
				return;
			}
		}
	}, 2000 );
})();
