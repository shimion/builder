/* globals initPBSMaps, google, PBSEditor */

if ( ! window.PBSEditor ) {
	window.PBSEditor = {};
}


/**
 * Converts a hex color to its RGB components.
 *
 * @see http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 */
window.PBSEditor.hexToRgb = function( hex ) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};


/**
 * Converts an RGB color to HSL.
 *
 * @see http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 */
window.PBSEditor.rgbToHsl = function( r, g, b ) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if ( max === min ) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h, s: s, l: l };
};


// All initialized maps are placed here for cleanup reference.
var pbsMapsInitialized = [];

initPBSMaps = function( mapElem, successCallback, failCallback ) { // jshint ignore:line

	// Cleanup all other previously initialized maps.
	var cleanup = function() {
		for ( var i = pbsMapsInitialized.length - 1; i >= 0; i-- ) {
			var elem = pbsMapsInitialized[ i ].getDiv();
			while ( elem.parentNode && elem.parentNode.tagName !== 'BODY' ) {
				elem = elem.parentNode;
			}
			if ( ! elem.parentNode ) {
				if ( pbsMapsInitialized[ i ].marker ) {
					pbsMapsInitialized[ i ].marker.setMap( null );
					delete( pbsMapsInitialized[ i ].marker );
				}
				delete( pbsMapsInitialized[ i ] );
				pbsMapsInitialized.splice( i, 1 );
			}
		}
	};

	var geocoder;
	var initMap = function( mapElem, successCallback, failCallback ) {

		// Do some cleanup first.
		cleanup();

		var center = mapElem.getAttribute( 'data-center' ) || '37.09024, -95.712891';
		center = center.trim();

		var latLonMatch = center.match( /^([-+]?\d{1,2}([.]\d+)?)\s*,?\s*([-+]?\d{1,3}([.]\d+)?)$/ );
		if ( latLonMatch ) {
			mapElem.setAttribute( 'data-lat', latLonMatch[1] );
			mapElem.setAttribute( 'data-lng', latLonMatch[3] );
			center = { lat: parseFloat( latLonMatch[1] ), lng: parseFloat( latLonMatch[3] ) };
			_initMap( mapElem, center );
			if ( successCallback ) {
				successCallback();
			}

		} else {
			geocoder.geocode( { 'address': center }, function( results, status ) {
			    if ( status === google.maps.GeocoderStatus.OK ) {
					mapElem.setAttribute( 'data-lat', results[0].geometry.location.lat() );
					mapElem.setAttribute( 'data-lng', results[0].geometry.location.lng() );
					var center = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() };
					_initMap( mapElem, center );
					if ( successCallback ) {
						successCallback();
					}
			    } else if ( failCallback ) {
					failCallback();
			    }
			  });
		}
	};

	var _initMap = function( mapElem, center ) {
		var zoom = mapElem.getAttribute( 'data-zoom' ) || 3;
		var disableUI = mapElem.getAttribute( 'data-disable-ui' ) === '1';
		var color = mapElem.getAttribute( 'data-color' ) || false;
		var customColor = mapElem.getAttribute( 'data-custom' ) || '';
		var marker = mapElem.getAttribute( 'data-marker' ) === '1';
		var markerImage = mapElem.getAttribute( 'data-marker-image' ) || '';

		zoom = parseInt( zoom, 10 );

		var args = {
			center: center,
			zoom: zoom,
			disableDefaultUI: disableUI
		};

		// If styled, add a new style label.
		if ( customColor || color ) {
			// args.mapTypeControlOptions = {
			// 	mapTypeIds: [ google.maps.MapTypeId.ROADMAP, 'styled', google.maps.MapTypeId.SATELLITE ]
		    // };
		}

		// Create the map.
		var map = new google.maps.Map( mapElem, args );
		pbsMapsInitialized.push( map );
		mapElem.map = map;
	};

	if ( typeof google === 'undefined' ) {
		return;
	}
	geocoder = new google.maps.Geocoder();

	if ( typeof mapElem !== 'undefined' ) {
		initMap( mapElem, successCallback, failCallback );
		return;
	}

	var maps = document.querySelectorAll( '[data-ce-tag="map"]' );
	Array.prototype.forEach.call( maps, function(el) {
		initMap( el, successCallback, failCallback );
	} );
};


/**
 * Re-centers the map to its settings.
 */
window.pbsMapsReCenter = function( mapElem ) {
	if ( typeof google !== 'undefined' ) {
		if ( mapElem && mapElem.nodeType ) {
			var lat = parseFloat( mapElem.getAttribute( 'data-lat' ) );
			var lng = parseFloat( mapElem.getAttribute( 'data-lng' ) );
			if ( ! isNaN( lat ) ) {
				google.maps.event.trigger( mapElem.map, 'resize' );
				mapElem.map.setCenter( { lat: lat, lng: lng } );
			}
			return;
		}
		for ( var i = 0; i < pbsMapsInitialized.length; i++ ) {
			window.pbsMapsReCenter( pbsMapsInitialized[ i ].getDiv() );
		}
	}
};


/**
 * Re-center the map on window resize.
 */
window.addEventListener( 'DOMContentLoaded', function() {
	window.addEventListener( 'resize', window.pbsMapsReCenter );
} );



/**
 * Make maps work inside tabs.
 */
 window.addEventListener( 'DOMContentLoaded', function() {
 	document.onclick = function( event ) {
		var el = event.target;
		if ( el.parentNode && el.parentNode.classList && el.parentNode.classList.contains( 'pbs-tab-tabs' ) ) {
			var input = el.parentNode.parentNode.querySelector( '[id="' + el.getAttribute( 'for' ) + '"]' );
			if ( ! input ) {
				return;
			}
			var panel = el.parentNode.parentNode.querySelector( '[data-panel="' + input.getAttribute( 'data-tab' ) + '"]' );
			if ( ! panel ) {
				return;
			}
			var maps = panel.querySelectorAll( '[data-ce-tag="map"]' );
			Array.prototype.forEach.call( maps, function( el ) {
				setTimeout( function() {
					window.pbsMapsReCenter( el );
				}, 1 );
			} );
		}
 	};
 } );
