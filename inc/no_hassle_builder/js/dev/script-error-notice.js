/* globals nhbParams, errorNoticeParams */

window.nhbEncounteredErrors = 0;
window.onerror = function() {
	window.nhbEncounteredErrors++;
};

(function() {
	setTimeout( function() {
		if ( ! nhbParams.is_admin_bar_showing ) {
			if ( ! localStorage.getItem( 'nhb-adminbar-notice' ) ) {
				window.alert( errorNoticeParams.labels.toolbar_notice );
				localStorage.setItem( 'nhb-adminbar-notice', '1' );
			}
			return;
		}
		if ( window.nhbEncounteredErrors ) {
			if ( ! document.querySelector( '#wp-admin-bar-gambit_builder_edit' ) || ! document.querySelector( '#wp-admin-bar-gambit_builder_edit' ).classList.contains( 'ct-ignition__button--edit' ) ) {
				if ( ! localStorage.getItem( 'nhb-conflict-notice' ) ) {
					window.alert( errorNoticeParams.labels.error_notice );
					localStorage.setItem( 'nhb-conflict-notice', '1' );
				}
				return;
			}
		}
	}, 2000 );
})();
