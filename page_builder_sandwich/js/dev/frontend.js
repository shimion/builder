/**
 * IE 10 & IE 11 doesn't support SVG.innerHTML. This polyfill adds it.
 *
 * @see https://github.com/phaistonian/SVGInnerHTML
 */

/* jshint ignore:start */
(function (view) {

if ( ( !! window.MSInputMethodContext && !! document.documentMode ) ||
	 ( navigator.appVersion.indexOf( 'MSIE 10' ) !== -1 ) ) {
	var
	    constructors    = ['SVGSVGElement', 'SVGGElement']
	    , dummy         = document.createElement('dummy');

	if (!constructors[0] in view) {
	    return false;
	}

	if (Object.defineProperty) {

	    var innerHTMLPropDesc = {

	        get : function () {

	            dummy.innerHTML = '';

	            Array.prototype.slice.call(this.childNodes)
	            .forEach(function (node, index) {
	                dummy.appendChild(node.cloneNode(true));
	            });

	            return dummy.innerHTML;
	        },

	        set : function (content) {
	            var
	                self        = this
	                , parent    = this
	                , allNodes  = Array.prototype.slice.call(self.childNodes)

	                , fn        = function (to, node) {
	                    if (node.nodeType !== 1) {
	                        return false;
	                    }

	                    var newNode = document.createElementNS('http://www.w3.org/2000/svg', node.nodeName);

	                    Array.prototype.slice.call(node.attributes)
	                    .forEach(function (attribute) {
	                        newNode.setAttribute(attribute.name, attribute.value);
	                    });

	                    if (node.nodeName === 'TEXT') {
	                        newNode.textContent = node.innerHTML;
	                    }

	                    to.appendChild(newNode);

	                    if (node.childNodes.length) {

	                        Array.prototype.slice.call(node.childNodes)
	                        .forEach(function (node, index) {
	                            fn(newNode, node);
	                        });

	                    }
	                };

	            // /> to </tag>
	            content = content.replace(/<(\w+)([^<]+?)\/>/, '<$1$2></$1>');

	            // Remove existing nodes
	            allNodes.forEach(function (node, index) {
	                node.parentNode.removeChild(node);
	            });


	            dummy.innerHTML = content;

	            Array.prototype.slice.call(dummy.childNodes)
	            .forEach(function (node) {
	                fn(self, node);
	            });

	        }
	        , enumerable        : true
	        , configurable      : true
	    };

	    try {
	        constructors.forEach(function (constructor, index) {
	            Object.defineProperty(window[constructor].prototype, 'innerHTML', innerHTMLPropDesc);
	        });
	    } catch (ex) {
	        // TODO: Do something meaningful here
	    }

	} else if (Object['prototype'].__defineGetter__) {

	    constructors.forEach(function (constructor, index) {
	        window[constructor].prototype.__defineSetter__('innerHTML', innerHTMLPropDesc.set);
	        window[constructor].prototype.__defineGetter__('innerHTML', innerHTMLPropDesc.get);
	    });

	}
}

} (window));
/* jshint ignore:end */

/**
 * Custom events cause errors in in IE 11. This polyfill fixes it.
 *
 * @see http://stackoverflow.com/a/31783177/174172
 */
(function () {

	function CustomEvent ( event, params ) {
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		var evt = document.createEvent( 'CustomEvent' );
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		return evt;
	}

	// Only do this for IE11 & IE10
	if ( ( !! window.MSInputMethodContext && !! document.documentMode ) ||
		 ( navigator.appVersion.indexOf( 'MSIE 10' ) !== -1 ) ) {

		CustomEvent.prototype = window.Event.prototype;

		window.CustomEvent = CustomEvent;
	}
})();


window.pbsIsRTL = function() {
	var html = document.querySelector('html');
	return html.getAttribute( 'dir' ) === 'rtl';
};

window._pbsFixRowWidth = function( element ) {

	var dataWidth = element.getAttribute('data-width');

	// Nested rows cannot be full width
	if ( element.parentNode.classList.contains('pbs-col') ) {
		window._pbsRowReset( element );
	} else if ( typeof dataWidth === 'undefined' || ! dataWidth ) {
		window._pbsRowReset( element );
	} else if ( dataWidth === 'full-width' ) {
		window._pbsFullWidthRow( element );
	} else {
		window._pbsFullWidthRow( element, true );
	}

	clearTimeout( window._pbsFixRowWidthsResizeTrigger );
	window._pbsFixRowWidthsResizeTrigger = setTimeout( function() {
		window._pbsFixRowWidthsResizeNoReTrigger = true;
		window.dispatchEvent( new CustomEvent( 'resize' ) );
	}, 1 );
};


window._pbsRowReset = function( element ) {
	element.style.width = '';
	element.style.position = '';
	element.style.maxWidth = '';
	if ( ! window.pbsIsRTL() ) {
		element.style.left = '';
	} else {
		element.style.right = '';
	}
	element.style.webkitTransform = '';
	element.style.mozTransform = '';
	element.style.msTransform = '';
	element.style.transform = '';
	// element.style.marginLeft = '';
	// element.style.marginRight = '';
	// element.style.paddingLeft = '';
	// element.style.paddingRight = '';
};

window._pbsFullWidthRow = function( element, fitToContentWidth ) {

	var origWebkitTransform = element.style.webkitTransform;
	var origMozTransform = element.style.mozTransform;
	var origMSTransform = element.style.msTransform;
	var origTransform = element.style.transform;

    // Reset changed parameters for contentWidth so that width recalculation on resize will work
	element.style.width = 'auto';
	element.style.position = 'relative';
	element.style.maxWidth = 'none';
	element.style.webkitTransform = '';
	element.style.mozTransform = '';
	element.style.msTransform = '';
	element.style.transform = '';
	element.style.marginLeft = '0px';
	element.style.marginRight = '0px';

	if ( typeof fitToContentWidth !== 'undefined' && fitToContentWidth ) {
		element.style.paddingLeft = '';
		element.style.paddingRight = '';
	}

	// Make sure our parent won't hide our content
	element.parentNode.style.overflowX = 'visible';

	// Reset the left parameter
	if ( ! window.pbsIsRTL() ) {
		element.style.left = '0px';
	} else {
		element.style.right = '0px';
	}

	// Assign the new full-width styles
	var bodyWidth = document.body.clientWidth;
	var rect = element.getBoundingClientRect();
	var bodyRect = document.body.getBoundingClientRect();

	element.style.width = bodyWidth + 'px';
	element.style.position = 'relative';
	// element.style.maxWidth = document.documentElement.clientWidth + 'px';
	element.style.maxWidth = bodyWidth + 'px';
	if ( ! window.pbsIsRTL() ) {
		element.style.left = ( -rect.left + bodyRect.left ) + 'px';
	} else {
		element.style.right = ( rect.right - bodyRect.right ) + 'px';
	}
	element.style.webkitTransform = origWebkitTransform;
	element.style.mozTransform = origMozTransform;
	element.style.msTransform = origMSTransform;
	element.style.transform = origTransform;

	if ( typeof fitToContentWidth === 'undefined' ) {
		return;
	}
	if ( ! fitToContentWidth ) {
		return;
	}

	// Calculate the required left/right padding to ensure that the content width is being followed
	var actualWidth = rect.width, paddingLeft, paddingRight;

	if ( ! window.pbsIsRTL() ) {
		paddingLeft = rect.left - bodyRect.left;
		paddingRight = bodyWidth - actualWidth - rect.left + bodyRect.left;
	} else {
		paddingLeft = bodyWidth - actualWidth + rect.right - bodyRect.right;
		paddingRight = - rect.right + bodyRect.right;
	}

	// If the width is too large, don't pad
	if ( actualWidth > bodyWidth ) {
		paddingLeft = 0;
		paddingRight = 0;
	}

	element.style.paddingLeft = paddingLeft + 'px';
	element.style.paddingRight = paddingRight + 'px';
};

window.pbsFixRowWidths = function() {
	var fullRows = document.querySelectorAll('.pbs-row[data-width]');
	Array.prototype.forEach.call(fullRows, function(el){
		window._pbsFixRowWidth( el );
	});
};

window.addEventListener('resize', function() {
	if ( window._pbsFixRowWidthsResizeNoReTrigger ) {
		delete window._pbsFixRowWidthsResizeNoReTrigger;
		return;
	}
	window.pbsFixRowWidths();
});
window.pbsFixRowWidths();


window.addEventListener( 'DOMContentLoaded', function() {

	setTimeout(function() {
		window.pbsFixRowWidths();
	}, 1 );

});

/* globals hljs */

(function() {

	window.pbsInitAllPretext = function() {

		if ( typeof hljs === 'undefined' ) {
			return;
		}
		var codes = document.querySelectorAll( '.pbs-main-wrapper pre' );
		Array.prototype.forEach.call( codes, function( el ) {
			hljs.highlightBlock( el );
		} );
	};

	// Initialize on start up.
	window.addEventListener( 'DOMContentLoaded', window.pbsInitAllPretext );
})();


window.pbsTabsRefreshActiveTab = function( tabsElement ) {
	var radio = tabsElement.querySelector( '.pbs-tab-state:checked' );
	var id = radio.getAttribute( 'id' );
	var tabs = tabsElement.querySelector( '.pbs-tab-tabs ' );
	if ( tabs ) {
		var activeTab = tabs.querySelector( '.pbs-tab-active' );
		if ( activeTab ) {
			activeTab.classList.remove( 'pbs-tab-active' );
		}
		activeTab = tabs.querySelector( '[for="' + id + '"]' );
		if ( activeTab ) {
			activeTab.classList.add( 'pbs-tab-active' );
		}
	}
};

( function() {

	// Initialize
	window.addEventListener( 'DOMContentLoaded', function() {

		document.addEventListener( 'change', function( ev ) {
			if ( ev.target ) {
				if ( ev.target.classList.contains( 'pbs-tab-state' ) ) {
					window.pbsTabsRefreshActiveTab( ev.target.parentNode );
				}
			}
		} );

	} );

	// On first load, the first tab is active.
	document.addEventListener( 'DOMContentLoaded', function() {
		var elements = document.querySelectorAll( '[data-ce-tag="tabs"]' );
		Array.prototype.forEach.call( elements, function( el ) {
			el = el.querySelector( '[data-ce-tag="tab"]' );
			if ( el ) {
				el.classList.add( 'pbs-tab-active' );
			}
		} );
	} );

} )();



