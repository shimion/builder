/* globals ContentTools, ContentEdit, ContentSelect, pbsParams, PBSEditor, HS */

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
 * IE doesn't support constructor.name. This polyfill adds it.
 *
 * @see http://matt.scharley.me/2012/03/monkey-patch-name-ie.html
 */
 
if (Function.prototype.name === undefined && Object.defineProperty !== undefined) {
    Object.defineProperty(Function.prototype, 'name', {
        get: function() {
            var funcNameRegex = /function\s([^(]{1,})\(/;
            var results = (funcNameRegex).exec((this).toString());
            return (results && results.length > 1) ? results[1].trim() : '';
        },
        set: function() {}
    });
}

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


ContentEdit.INDENT = '';
ContentEdit.DEFAULT_MAX_ELEMENT_WIDTH = 2000;
ContentTools.HIGHLIGHT_HOLD_DURATION = 999999;

/* exported PBS */
var PBS = {};

window.addEventListener( 'DOMContentLoaded', function() {
    var editor;
	if ( ! document.querySelector( '[data-name="main-content"]' ) ) {
		return;
	}

	// Auto-start PBS if the localStorage key is set.
	var starterInterval;
	if ( localStorage ) {
		if ( localStorage.getItem( 'pbs-open-' + pbsParams.post_id ) ) {
			localStorage.removeItem( 'pbs-open-' + pbsParams.post_id );
			starterInterval = setInterval( function() {
				if ( document.querySelector( '.ct-widget--active' ) ) {
					document.querySelector('.ct-ignition__button--edit').dispatchEvent( new CustomEvent( 'click' ) );
					clearInterval( starterInterval );
				}
			}, 200);
		}
	}

	// Auto-start PBS if there is a hash.
	if ( window.location.hash ) {
		if ( window.location.hash.indexOf( '#pbs-edit' ) === 0 ) {
			starterInterval = setInterval( function() {
				if ( document.querySelector( '.ct-widget--active' ) ) {
					document.querySelector('.ct-ignition__button--edit').dispatchEvent( new CustomEvent( 'click' ) );
					clearInterval( starterInterval );
				}
			}, 200);
		}
	}

	editor = ContentTools.EditorApp.get();
	window._contentToolsShim( editor );
	editor.init('*[data-editable]', 'data-name');

	// Longer interval time to save on processing intensity.
	editor.bind('start', function() {
		clearInterval( editor._toolbox._updateToolsTimeout );
		editor._toolbox._updateToolsTimeout = setInterval( editor._toolbox._updateTools, 300 );
	} );

	// Help buttons.
	document.addEventListener( 'click', function(ev) {
		if ( ev.target.getAttribute( 'id' ) === 'pbs-help-docs' && typeof HS !== 'undefined' && typeof HS.beacon !== 'undefined' && HS.beacon.open !== 'undefined' ) {
			if ( HS.beacon.open ) {
				HS.beacon.open();
			} else {
				window.open( 'http://docs.pagebuildersandwich.com/', '_blank' );
			}
		} else if ( ev.target.getAttribute( 'id' ) === 'pbs-help-docs' ) {
			window.open( 'http://docs.pagebuildersandwich.com/', '_blank' );
		// } else if ( ev.target.getAttribute( 'id' ) === 'pbs-help-replay-tour' ) {
			// window.pbsPlayTour();
		}
	});

	// Docs button
	document.querySelector( '#wp-admin-bar-pbs_help_docs' ).addEventListener( 'click', function(ev) {
		if ( typeof HS !== 'undefined' && typeof HS.beacon !== 'undefined' && HS.beacon.open !== 'undefined' ) {
			if ( HS.beacon.open ) {
				HS.beacon.open();
			} else {
				window.open( 'http://docs.pagebuildersandwich.com/', '_blank' );
			}
		} else {
			window.open( 'http://docs.pagebuildersandwich.com/', '_blank' );
		}
		ev.preventDefault();
		return false;
	});

	/**
	 * Remove the inspector scrollbar when a modal is visible. We are only
	 * going to use the Media Manager modal, so just check that one.
	 */
	editor.bind('start', function() {
		editor._toolboxScrollCheckInterval = setInterval( function() {
			var elements = document.querySelectorAll('.media-modal-backdrop');
			var hasModal = false;
			if ( elements ) {
				Array.prototype.forEach.call( elements, function( el ) {
					if ( el.offsetWidth !== 0 || el.offsetHeight !== 0 ) {
						hasModal = true;
					}
				});
			}
			var toolbox = document.querySelector('.ct-toolbox');
			if ( toolbox ) {
				if ( toolbox.style['overflow-y'] !== ( hasModal ? 'hidden' : '') ) {
					toolbox.style['overflow-y'] = hasModal ? 'hidden' : '';
				}
			}
		}, 300 );
	} );
	editor.bind('stop', function() {
		clearInterval( editor._toolboxScrollCheckInterval );
	} );


	/**
	 * Editor admin bar buttons become hovered when turning on PBS. This stops
	 * it by turning pointer-events to none temporarily after PBS starts.
	 */
	editor.bind('start', function() {
		var adminBar = document.querySelector( '#wpadminbar' );
		if ( adminBar ) {
			adminBar.style['pointer-events'] = 'none';
			setTimeout( function() {
				adminBar.style['pointer-events'] = '';
			}, 100 );
		}
	} );
	editor.bind('stop', function() {
		var adminBar = document.querySelector( '#wpadminbar' );
		if ( adminBar ) {
			adminBar.style['pointer-events'] = '';
		}
	} );


	/**
	 * Save contents handler.
	 */
	editor.bind('save', function (regions) {
	    var name, payload, xhr, xhrTracking;

	    // Set the editor as busy while we save our changes
	    this.busy(true);

	    // Collect the contents of each region into a FormData instance
	    payload = new FormData();
	    for (name in regions) {
	        if (regions.hasOwnProperty(name)) {
				var html = regions[name];

				html = wp.hooks.applyFilters( 'pbs.save', html );

	            payload.append(name, html);
	        }
	    }
		payload.append( 'action', 'gambit_builder_save_content' );
		payload.append( 'save_nonce', pbsParams.nonce );
		payload.append( 'post_id', pbsParams.post_id );

		// Change the post status.
		// This is filled up by the other save buttons in _content-tools-UI.js
		if ( pbsParams.new_post_status ) {
			payload.append( 'post_status', pbsParams.new_post_status );
			pbsParams.new_post_status = undefined;
		}

		// If there are pseudo element styles that need to be saved, include those.
		var styles = '';
		if ( document.querySelector( 'style#pbs-style' ) ) {
			styles = document.querySelector( 'style#pbs-style' ).innerHTML;
		}
		payload.append( 'style', styles );

		wp.hooks.doAction( 'pbs.save.payload', payload );

	    xhr = new XMLHttpRequest();

		xhr.onload = function() {
			editor.busy( false );
			if (xhr.status >= 200 && xhr.status < 400) {
				// Success.

				// If we're not in the permalink, direct to the permalink so that
				// if the user presses on refresh, they will see the new content.
				if ( xhr.responseText.match( /(http|https):\/\// ) ) {
					var currentHref = window.location.href.replace( /#\.*$/, '' );
					if ( xhr.responseText !== currentHref ) {
						window.location.href = xhr.responseText;
					}
				}
				new ContentTools.FlashUI( 'ok' );
			} else {
				// We reached our target server, but it returned an error
				new ContentTools.FlashUI( 'no' );
			}
		};

	    xhr.open( 'POST', pbsParams.ajax_url );
	    xhr.send( payload );

		// Allow others to do something after saving.
		wp.hooks.doAction( 'pbs.save.payload.post', payload );
	});


	/****************************************************************
	 * Debounced shift key listener to display all column outlines.
	 ****************************************************************/
	var _isShiftDown = false;
	var _showColumnOutlines = _.debounce(function() {
		if ( _isShiftDown ) {
			document.querySelector('html').classList.add('pbs-show-outlines');
		}
	}, 800);
	var showColumnOutlines = function(e) {
		if ( e.shiftKey ) {
			_isShiftDown = true;
			_showColumnOutlines();
		}
	};
	var hideColumnOutlines = function(e) {
		if ( e.which === 16 ) {
			_isShiftDown = false;
			document.querySelector('html').classList.remove('pbs-show-outlines');
		}
	};


	editor.bind('start', function() {
		document.querySelector('html').classList.add('pbs-editing');
		document.querySelector('html').classList.add('theme-' + pbsParams.theme_name);

		try {
			this.regions()['main-content'].children[0].focus();
		} catch (e) {}
		this.domRegions()[0].classList.add('pbs-editing');

		// Disable highlighting
		this._handleHighlightOn = function() {};
		this._handleHighlightOff = function() {};

		// Trigger a resize event when transitioning with the inspector.
		// window._pbsBodyTransitionIntervalNum = 0;
		// clearInterval( window._pbsBodyTransitionInterval );
		// window._pbsBodyTransitionInterval = setInterval(function() {
		// 	window._pbsBodyTransitionIntervalNum++;
		// 	window.dispatchEvent( new CustomEvent( 'resize' ) );
		// 	if ( window._pbsBodyTransitionIntervalNum >= 30 ) {
		// 		clearInterval( window._pbsBodyTransitionInterval );
		// 	}
		// }, 16);

		// Add outline highlight listeners.
		document.addEventListener('keydown', showColumnOutlines);
		document.addEventListener('keyup', hideColumnOutlines);
	});


	editor.bind('stop', function() {
		this.domRegions()[0].classList.remove('pbs-editing');
		document.querySelector('html').classList.remove('pbs-editing');
		document.querySelector('html').classList.remove('theme-' + pbsParams.theme_name);

		// Trigger a resize event when transitioning with the inspector.
		window._pbsBodyTransitionIntervalNum = 0;
		clearInterval( window._pbsBodyTransitionInterval );
		window._pbsBodyTransitionInterval = setInterval(function() {
			window._pbsBodyTransitionIntervalNum++;
			window.dispatchEvent( new CustomEvent( 'resize' ) );
			if ( window._pbsBodyTransitionIntervalNum >= 30 ) {
				clearInterval( window._pbsBodyTransitionInterval );
			}
		}, 16);

		// Remove outline highlight listeners.
		document.removeEventListener('keydown', showColumnOutlines);
		document.removeEventListener('keyup', hideColumnOutlines);
	});

	ContentEdit.Root.get().bind( 'focus', function( element ) {
		document.body.setAttribute( 'data-pbs-focused', element.constructor.name );
	} );

	ContentEdit.Root.get().bind( 'blur', function() {
		document.body.removeAttribute( 'data-pbs-focused' );
	} );


	/**
	 * Add a special class to ignore all pointer events of all elements
	 * before our content editor. So that we can do stuff above the fold
	 * without headings/menus getting in our way.
	 */
	editor.bind('start', function() {
		var element = document.querySelector( '.pbs-main-wrapper' );

		while ( element && element.tagName !== 'body' ) {
			var curElement = element;
			while ( curElement.previousSibling ) {

				if ( curElement.previousSibling.nodeType !== 1 ) {
					curElement = curElement.previousSibling;
					continue;
				}

				// If this contains the title (it's editable), don't add this.
				if ( curElement.previousSibling.querySelector( '.pbs-title-editor' ) ) {
					curElement = curElement.previousSibling;
					continue;
				}

				if ( curElement.previousSibling.classList ) {
					curElement.previousSibling.classList.add( 'pbs-ignore-while-editing' );
				}
				curElement = curElement.previousSibling;
		    }
			element = element.parentNode;
		}
	} );

	// Remove the ignore all pointer-events class when done.
	editor.bind( 'stop', function() {
		var elements = document.querySelectorAll( '.pbs-ignore-while-editing' );
		if ( elements ) {
			Array.prototype.forEach.call( elements, function( el ) {
				el.classList.remove( 'pbs-ignore-while-editing' );
			});
		}
	} );

	// Before clicking the save button, make all our manual modifications permanent.
	document.body.addEventListener('mousedown', function(e) {
		if ( e.target.classList.contains( 'ct-ignition__button--confirm') || ( e.target.parentNode && e.target.parentNode.classList.contains( 'ct-ignition__button--confirm' ) ) ) {
			window.PBSEditor.updateModifiedContent();
		}
	});


	// If clicked outside of the editable area, select the closest element.
	document.body.addEventListener('mousedown', function(e) {
		var editorArea = document.querySelector('[data-name="main-content"]');

		var isInEditorArea = editorArea.contains( e.target );
		var isEditorArea = editorArea === e.target;

		// This element is right before the body element. We check this so that we don't interfere with modals.
		var editorSemiRoot = editorArea;
		while ( editorSemiRoot.parentNode.tagName.toLowerCase() !== 'body' ) {
			editorSemiRoot = editorSemiRoot.parentNode;
		}
		var isInEditorSemiRoot = editorSemiRoot.contains( e.target );

		// If clicked on a WP modal, ignore that event.
		if ( window.pbsSelectorMatches( e.target, '.wp-core-ui *' ) ) {
			return;
		}

		// Check if the one being clicked is the page title, we will allow it to be edited.
		var isInTitle = window.pbsSelectorMatches( e.target, '.pbs-title-editor, .pbs-title-editor *' );

		// Only do this when we are editing.
		if ( editorArea.classList.contains( 'pbs-editing' ) && isInEditorSemiRoot && ! isEditorArea && ! isInEditorArea && ! isInTitle ) {
			var rect = editorArea.getBoundingClientRect();
			var mainRegion = ContentTools.EditorApp.get().regions()['main-content'];

			// Check the location of the click then select the topmost or bottommost element.
			var elem;
			var isTop = true;
			var scrollY = window.scrollY || window.pageYOffset;
			if ( e.pageY > scrollY + rect.top + rect.height / 2 ) {
				isTop = false;
				elem = mainRegion.children[ mainRegion.children.length - 1 ];
			} else {
				elem = mainRegion.children[0];
			}

			// Check if we need to create a new text element.
			if ( 'Text' !== elem.constructor.name ) {
				var p = new ContentEdit.Text('p', {}, '');
				if ( isTop ) {
					elem.parent().attach( p, 0 );
				} else {
					elem.parent().attach( p, elem.parent().children.indexOf( elem ) + 1 );
				}
				elem = p;
			}

			// Put the cursor on the element
			var index = 0;
			if ( ! isTop ) {
				if ( elem.content ) {
					index = elem.content.length();
				}
			}
			e.preventDefault();
			elem.focus();

	        var selection = new ContentSelect.Range( index, index );
	        selection.select( elem._domElement );

			return;
		}
	});

	wp.hooks.doAction( 'pbs.init' );
});



ContentEdit.DRAG_HOLD_DURATION = 400;

ContentEdit.Root.get().bind('drag', function () {
	document.querySelector('[data-name="main-content"]').classList.add('dragging');
});

ContentEdit.Root.get().bind('drop', function () {
	document.querySelector('[data-name="main-content"]').classList.remove('dragging');

	// After a drop, adjust row widths
	if ( window.pbsFixRowWidths ) {
		window.pbsFixRowWidths();
	}
});

// From http://davidwalsh.name/element-matches-selector
window.pbsSelectorMatches = function(el, selector) {
	var p = Element.prototype;
	var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s) {
		return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
	};
	if ( el.nodeType !== 1 && el.parentNode ) {
		el = el.parentNode;
	}
	if ( el.nodeType !== 1 ) {
		return false;
	}
	return f.call(el, selector);
};


window.cssToStyleObject = function( cssString ) {
	var regex = /([\w-]*)\s*:\s*([^;]*)/g;
	var match, properties={};
	while ( match = regex.exec( cssString ) ) {
		properties[match[1]] = match[2];
	}
	return properties;
};
window.cssToStyleString = function( cssObject ) {
	var s = '';
	for ( var i in cssObject ) {
		if ( cssObject.hasOwnProperty( i ) ) {
			s += i + ':' + cssObject[ i ] + ';';
		}
	}
	return s;
};


/****************************************************************
 * Bring back the blank on mouse move in ContentTools. Since we
 * are using nested elements, the change breaks our containers.
 ****************************************************************/
ContentEdit.Element.prototype._onMouseMove = function() {};


/****************************************************************
 * These functions are used across the other included scripts.
 ****************************************************************/
/* exported __slice, __indexOf, __extends, __bind */
var __slice = [].slice;
var __indexOf = [].indexOf || function(item) {
	for ( var i = 0, l = this.length; i < l; i++ ) {
		if (i in this && this[i] === item) {
			return i;
		}
	}
	return -1;
};
var __hasProp = {}.hasOwnProperty;
var __extends = function(child, parent) {
	for (var key in parent) {
		if (__hasProp.call(parent, key)) {
			child[key] = parent[key];
		}
	}
	function ctor() { this.constructor = child; }
	ctor.prototype = parent.prototype;
	child.prototype = new ctor();
	child.__super__ = parent.prototype;
	return child;
};
var __bind = function(fn, me){
	return function(){
		return fn.apply(me, arguments);
	};
};


// Use this syntax to include other Javascript files, included files must start with "_"
/* globals ContentTools, ContentEdit, HTMLString, ContentSelect */

/**
 * We need to perform some functions with ContentTools that shouldn't necessarily be part
 * of ContentTools itself since they are outside its scope. We add them in here
 */

window.PBSEditor = {};


window.PBSEditor.getToolUI = function( name ) {
	if ( ContentTools.EditorApp.get()._toolboxBar._toolUIs[ name ] ) {
		return ContentTools.EditorApp.get()._toolboxBar._toolUIs[ name ];
	}
	if ( ContentTools.EditorApp.get()._toolboxElements._toolUIs[ name ] ) {
		return ContentTools.EditorApp.get()._toolboxElements._toolUIs[ name ];
	}
	return ContentTools.EditorApp.get()._toolbox._toolUIs[ name ];
};


/**
 * Add a new property _ceElement to all domElement that reference a ContentEdit Element
 */
ContentEdit.Root.get().bind('mount', function (element) {
    // Map the element to it's DOM element
    element.domElement()._ceElement = element;
});


/**
 * Remove the yellow highlight in CT that highlights the whole editing area.
 */
ContentTools.EditorApp.get().highlightRegions = function() {};


/**
 * Updates the whole Editor's content if something in the DOM was manually changed.
 */
window.PBSEditor.updateModifiedContent = function() {

	// Go through all the editable regions of CT
	var regions = ContentTools.EditorApp.get().regions();
	for ( var i in regions ) {
		if ( regions.hasOwnProperty( i ) ) {
			// Go through all the children / Element Nodes
			window.PBSEditor.updateModifiedContentRecursive( regions[ i ] );
		}
	}
};


/**
 * Updates the element's content status recursively
 */
window.PBSEditor.updateModifiedContentRecursive = function( element ) {

	var children = element.children;
	if ( children ) {
		for ( var k = 0; k < children.length; k++ ) {

			// Check if the html CT thinks it has matches the actual html in the Dom.
			var ctElement = children[ k ];

			if ( typeof ctElement.content !== 'undefined' && ctElement.content.html() !== ctElement._domElement.innerHTML ) {

				// Update the Element's content
				window.PBSEditor.updateElementContent( ctElement, ctElement._domElement.innerHTML );
			}

			window.PBSEditor.updateModifiedContentRecursive( ctElement );
		}
	}
};


/**
 * Updates an Element object's content into newContent.
 */
window.PBSEditor.updateElementContent = function( element, newContent ) {
	if ( element.constructor.name === 'Shortcode' ) {
		return;
	}

	// Retain preserve whitespace, or else some elements (e.g. preformatted) will lose line breaks.
	element.content = new HTMLString.String( newContent, element.content.preserveWhitespace() ).trim();
	element.updateInnerHTML();
	element.taint();
};


/**
 * Returns true if currently editing.
 */
window.PBSEditor.isEditing = function() {
	var editorArea = document.querySelector('[data-name="main-content"]');
	if ( ! editorArea ) {
		return false;
	}
	return editorArea.classList.contains( 'pbs-editing' );
};


/**
 * Gets the unique ID of an element if it exists. Null if there is none.
 * Mostly used for adding pseudo element styles using addPseudoElementStyles
 */
window.PBSEditor.getUniqueClassName = function( domElement ) {
	if ( domElement.getAttribute( 'class' ) ) {
		var classes = domElement.getAttribute( 'class' );
		var matches = classes.match( /pbsguid-\w+/ );
		if ( matches ) {
			return matches[0];
		}
	}
	return null;
};


/**
 * Removes the unique ID of an element if it has one.
 * Mostly used for adding pseudo element styles using addPseudoElementStyles
 */
window.PBSEditor.removeUniqueClassName = function( domElement ) {
	if ( domElement.getAttribute( 'class' ) ) {
		var classes = domElement.getAttribute( 'class' );
		var matches = classes.match( /pbsguid-\w+/ );
		if ( matches ) {
			domElement.classList.remove( matches[0] );
			return true;
		}
	}
	return false;
};


/**
 * Generates a unique ID.
 * Mostly used for adding pseudo element styles using addPseudoElementStyles
 */
window.PBSEditor.generateUniqueClassName = function() {
	var name;
	do {
		name = 'pbsguid-' + window.PBSEditor.generateHash();
	} while ( document.querySelector( '.' + name ) );
	return name;
};


/**
 * Generates a unique hash.
 * Used for identifying unique stuff.
 */
window.PBSEditor.generateHash = function() {
	return Math.floor( ( 1 + Math.random() ) * 0x100000000 ).toString(36).substring(1);
};


/**
 * Adds raw pseudo element styles directly into the style tag dedicated to pseudo element styles.
 * Similar to window.PBSEditor.addPseudoElementStyles, except that this doesn't
 * perform any duplication checks and just directly adds the styles.
 * @param string styles The styles to add.
 * @return string The added styles.
 */
window.PBSEditor.addPseudoElementStylesRaw = function( styles ) {

	// Create style tag if it doesn't exist yet.
	var styleTag = document.querySelector( 'style#pbs-style' );
	if ( ! styleTag ) {
		styleTag = document.createElement( 'style' );
		styleTag.setAttribute( 'id', 'pbs-style' );
		document.body.appendChild( styleTag );
	}
	var currentStyles = styleTag.innerHTML + styles;

	// Taint the whole editor.
	var mainRegion = ContentTools.EditorApp.get().regions()['main-content'];
	if ( typeof mainRegion._debouncedTaint === 'undefined' ) {
		mainRegion._debouncedTaint = _.debounce( function() {
			this.taint();
		}.bind( mainRegion ), 400 );
	}
	mainRegion._debouncedTaint();

	// Save the new styles.
	styleTag.innerHTML = currentStyles;
	return styles;
};

/**
 * Adds a pseudo element style. Adds the style tag used by PBS if it doesn't exist yet.
 * @param string selector The full selector (with the pseudo element) to add
 * @param object styles An object containing the style-name & style-value pairs to add
 * @return string The added style string.
 */
window.PBSEditor.addPseudoElementStyles = function( selector, styles ) {

	// Clean up first.
	var selectorStillExists = window.PBSEditor.removePseudoElementStyles( selector, Object.keys( styles ) );

	// Create style tag if it doesn't exist yet.
	var styleTag = document.querySelector( 'style#pbs-style' );
	if ( ! styleTag ) {
		styleTag = document.createElement( 'style' );
		styleTag.setAttribute( 'id', 'pbs-style' );
		document.body.appendChild( styleTag );
	}
	var currentStyles = styleTag.innerHTML;

	// Create a string of styles.
	var styleString = '';
	for ( var styleName in styles ) {
		if ( styles.hasOwnProperty( styleName ) ) {
			var value = styles[ styleName ];
			if ( value.trim ) {
				value = value.trim();
			}
			if ( value ) {
				styleString += styleName + ': ' + value + ';';
			}
		}
	}

	// Add the style.
	var escapedSelector = selector.replace( /\./g, '\\.' );
	if ( selectorStillExists ) {
		var re = new RegExp( '(' + escapedSelector + '\\s*\\{)', 'gm' );
		currentStyles = currentStyles.replace( re, '$1' + styleString );
	} else {
		currentStyles += selector + ' {' + styleString + '}';
	}

	// Taint the whole editor.
	var mainRegion = ContentTools.EditorApp.get().regions()['main-content'];
	if ( typeof mainRegion._debouncedTaint === 'undefined' ) {
		mainRegion._debouncedTaint = _.debounce( function() {
			this.taint();
		}.bind( mainRegion ), 400 );
	}
	mainRegion._debouncedTaint();

	// Save the new styles.
	styleTag.innerHTML = currentStyles;
	return styleString;
};


/**
 * Gets a pseudo element style.
 * @param string selector The full selector (with the pseudo element) to get
 * @param string style The name of the style to get
 * @return string The existing style, null if none was found.
 */
window.PBSEditor.getPseudoElementStyles = function( selector, style ) {

	// Create style tag if it doesn't exist yet.
	var styleTag = document.querySelector( 'style#pbs-style' );
	if ( ! styleTag ) {
		return null;
	}
	var currentStyles = styleTag.innerHTML;
	var selectorPattern = selector.replace( /\./g, '\\.' );

	var re = new RegExp( selectorPattern + '\\s*\\{([\\s\\S]*?)\\}', 'm' );
	var matches = currentStyles.match( re );
	if ( ! matches ) {
		return null;
	}
	var stylesMatch = matches[1].replace( /;$/, '' ).split( ';' );
	for ( var k = 0; k < stylesMatch.length; k++ ) {
		var styleMatch = stylesMatch[ k ].match( new RegExp( '^' + style + '\\s*:([\\s\\S]*$)' ) );
		if ( styleMatch ) {
			var value = styleMatch[1].trim();
			if ( value ) {
				value = value.replace( /\s*!important/, '' );
			}
			return value;
		}
	}
	return null;
};


/**
 * Removes a set of pseudo element styles. Also cleans up the style tag,
 * and also removes it if no longer needed.
 * @param string selector The full selector (with the pseudo element) to get
 * @param string|array styles A style name or a list of style names to remove.
 * @return boolean False if the guid used in the selector is no longer used. True if the guid is still used.
 */
window.PBSEditor.removePseudoElementStyles = function( selector, styles ) {

	if ( typeof styles === 'string' ) {
		styles = [ styles ];
	}
	var styleTag = document.querySelector( 'style#pbs-style' );
	if ( ! styleTag ) {
		return false;
	}
	var selectorPattern = selector.replace( /\./g, '\\.' );

	// Remove the style from the style tag.
	var re, stylesMatch;
	var currentStyles = styleTag.innerHTML;

	for ( var i = 0; i < styles.length; i++ ) {
		var styleName = styles[ i ];
		re = new RegExp( selectorPattern + '\\s*\\{([\\s\\S]*?)\\}', 'm' );
		var matches = currentStyles.match( re );
		if ( matches ) {
			stylesMatch = matches[1].replace( /;$/, '' ).split( ';' );
			for ( var k = 0; k < stylesMatch.length; k++ ) {
				if ( stylesMatch[ k ].match( new RegExp( '^' + styleName + '\\s*:' ) ) ) {
					stylesMatch.splice( k, 1 );
					break;
				}
			}
			stylesMatch = stylesMatch.join( ';' );
			currentStyles = currentStyles.replace( matches[0], '' );
			currentStyles += selector + ' {' + stylesMatch + '}';
		}
	}

	// Remove empty styles/selectors.
	currentStyles = currentStyles.replace( /(^|[^\}])+\{[\s]*\}/gm, '' ).trim();

	// If no more styles, remove the style tag.
	if ( ! currentStyles ) {
		styleTag.parentNode.removeChild( styleTag );
		return false;
	} else {
		styleTag.innerHTML = currentStyles;
	}

	// If return true if the guid selector is still being used. False if it isn't used anymore.
	re = new RegExp( selectorPattern + '\\s*\\{', 'gm' );
	return !! styleTag.innerHTML.match( re );
};

/**
 * Converts an SVG element into a URL string that can be added as a CSS background-image rule.
 * @param DOM Object svgElement The SVG dom element.
 * @return string The converted URL() string that can be added as a CSS background-image rule.
 */
window.PBSEditor.convertSVGToBackgroundImage = function( svgElement ) {
	// We always need this for SVG to work.
	svgElement.setAttribute( 'xmlns', 'http://www.w3.org/2000/svg' );
	var svgString = svgElement.outerHTML;
	// Convert all " to '.
	svgString = svgString.replace( /"/g, '\'' );
	// Convert all < to %3C
	svgString = svgString.replace( /</g, '%3C' );
	// Convert all > to %3E
	svgString = svgString.replace( />/g, '%3E' );
	// Convert all & to %26
	svgString = svgString.replace( /&/g, '%26' );
	// Convert all # to %23
	svgString = svgString.replace( /#/g, '%23' );
	// Remove all line breaks
	svgString = svgString.replace( /\n/g, '' );
	// Wrap in url("")
	// Prefix with data:image/svg+xml,
	svgString = 'url("data:image/svg+xml,' + svgString + '")';
	return svgString;
};



window.PBSEditor.isCtrlDown = false;
window.PBSEditor.isShiftDown = false;
window.addEventListener( 'DOMContentLoaded', function() {
	document.addEventListener( 'keydown', function( ev ) {
		if ( ev.ctrlKey || ev.metaKey ) {
			window.PBSEditor.isCtrlDown = true;
		}
		if ( ev.shiftKey ) {
			window.PBSEditor.isShiftDown = true;
		}
	} );
	document.addEventListener( 'keyup', function( ev ) {
		if ( ! ev.ctrlKey && ! ev.metaKey ) {
			window.PBSEditor.isCtrlDown = false;
		}
		if ( ! ev.shiftKey ) {
			window.PBSEditor.isShiftDown = false;
		}
	} );
});



/**
 * ContentTools does not support left & right placements ONLY, it always
 * includes the center. This adjusts things to ignore the center placement
 * only if left & right are given.
 */
( function() {
	var _Root = ContentEdit.Root.get();
	var proxied = _Root._getDropPlacement;
	_Root._getDropPlacement = function( x, y ) {
		if ( ! this._dropTarget ) {
			return null;
		}

		var placements = this._dropTarget.constructor.placements;
		if ( placements.indexOf( 'center' ) === -1 && placements.indexOf( 'left' ) !== -1 && placements.indexOf( 'right' ) !== -1 ) {

			var rect = this._dropTarget.domElement().getBoundingClientRect(), _ref, vert, horz;
	        _ref = [ x - rect.left, y - rect.top ], x = _ref[0], y = _ref[1];

			horz = 'center';
			if ( x < rect.width / 2 ) {
				horz = 'left';
			} else {
				horz = 'right';
			}

	        vert = 'above';
	        if ( y > rect.height / 2 ) {
	          vert = 'below';
	        }

			return [ vert, horz ];
		}

		return proxied.call( this, x, y );
	};
} )();


/**
 * When the return key is pressed at the beginning of a paragraph (with contents),
 * create a new paragraph before it.
 */
( function() {
	var proxied = ContentEdit.Text.prototype._keyReturn;
	ContentEdit.Text.prototype._keyReturn = function( ev ) {
		var element, selection, tail, tip;
		ev.preventDefault();
		if ( this.content.isWhitespace() ) {
			return proxied.call( this, ev );
		}
		ContentSelect.Range.query( this._domElement );
		selection = ContentSelect.Range.query( this._domElement );
		tip = this.content.substring( 0, selection.get()[0] );
		tail = this.content.substring( selection.get()[1] );
		if ( ! ev.shiftKey && ! tip.length() ) {
			element = new ContentEdit.Text( 'p', {}, '' );
			this.parent().attach( element, this.parent().children.indexOf( this ) );
			element.focus();
			return;
		}
		return proxied.call( this, ev );
	};
} )();


/**
 * Disallow links to work when editing.
 */
window.addEventListener( 'DOMContentLoaded', function() {
	document.body.addEventListener( 'click', function( ev ) {
		if ( window.PBSEditor.isEditing() ) {
			if ( ev.target.tagName === 'A') {
				if ( window.pbsSelectorMatches( ev.target, '.pbs-main-wrapper *' ) ) {
					ev.preventDefault();
				}
			}
		}
	} );
} );

/* globals ContentEdit */

/**
 * Style function
 * Gets or sets a CSS style
 */
ContentEdit.Element.prototype.style = function(name, value) {
	var style;

	if ( typeof value === 'undefined' ) {
		if ( ! this._domElement ) {
			return null;
		}
		style = this._domElement.style[ name ];
		if ( ! style ) {
			style = window.getComputedStyle( this._domElement );
			return style[ name ];
		}
		return style;
	}

	if ( ! this._domElement ) {
		return value;
	}

	// Don't do anything if the value remains the same.
	if ( this._domElement.style[ name ] === value ) {
		return value;
	}

	this._domElement.style[ name ] = value;
	style = this._domElement.getAttribute('style');
	if ( style === null ) {
        this._attributes.style = '';
        if ( this.isMounted() ) {
			this._domElement.removeAttribute('style');
        }
		if ( typeof this.debouncedTaint === 'undefined' ) {
			this.debouncedTaint = _.debounce( function() {
				this.taint();
			}.bind(this), 400 );
		}
		return this.debouncedTaint();
	}
	return this.attr( 'style', style );
};


/**
 * Gets the default styling for the element.
 */
ContentEdit.Element.prototype.defaultStyle = function(name) {
	// Get the original state of the style attribute.
	var origStyleAttribute = this._domElement.getAttribute('style');

	// Reset the style.
	this._domElement.style[ name ] = '';

	// Get the style value.
	var defaultStyle = window.getComputedStyle( this._domElement );

	if ( typeof defaultStyle[ name ] !== 'undefined' ) {
		defaultStyle = defaultStyle[ name ];
	} else {
		defaultStyle = 0;
	}

	// Bring back the default style attribute.
	if ( origStyleAttribute ) {
		this._domElement.setAttribute( 'style', origStyleAttribute );
	} else {
		this._domElement.removeAttribute( 'style' );
	}

	return defaultStyle;
};


/**
 * Override attr so that changes trigger a debounced taint to fix the history/undo.
 */
ContentEdit.Element.prototype.attr = function(name, value) {
	name = name.toLowerCase();
	if (value === void 0) {
		return this._attributes[name];
	}

	if ( this._attributes[name] === value ) {
		return;
	}

	this._attributes[name] = value;
	if (this.isMounted() && name.toLowerCase() !== 'class' ) {
		if ( value !== '' ) {
			this._domElement.setAttribute(name, value);
		} else {
			this._domElement.removeAttribute( name );
		}
	}

	// Do the debounce taint.
	if ( typeof this.debouncedTaint === 'undefined' ) {
		this.debouncedTaint = _.debounce( function() {
			this.taint();
		}.bind(this), 400 );
	}

	ContentEdit.Root.get().trigger('debounced_taint', this);

	return this.debouncedTaint();
};


/**
 * Removes all CSS classes of the element.
 */
ContentEdit.Element.prototype.removeAllCSSClasses = function() {
	if ( this._domElement && this._domElement.classList ) {
		for ( var i = this._domElement.classList.length - 1; i >= 0; i-- ) {
			this.removeCSSClass( this._domElement.classList.item( i ) );
		}
	}
};

/* globals ContentTools, ContentEdit */

/**
 * Some necessary functions in ContentTools aren't implemented yet.
 * We'll implement it on our own first until they arrive
 */

window._contentToolsShim = function( editor ) {
	editor.start = function () {
	    ContentTools.EditorApp.getCls().prototype.start.call(this);
	    editor.trigger('start');
	};

	editor.stop = function () {
	    ContentTools.EditorApp.getCls().prototype.stop.call(this);
	    editor.trigger('stop');
	};

};

(function() {
	var proxied = ContentEdit.Element.prototype._addCSSClass;
    ContentEdit.Element.prototype._addCSSClass = function(className) {
		if ( className === 'ce-element--over' ) {
			ContentEdit.Root.get().trigger('over', this);
		}
		return proxied.call( this, className );
	};
})();

(function() {
	var proxied = ContentEdit.Element.prototype._removeCSSClass;
    ContentEdit.Element.prototype._removeCSSClass = function(className) {
		if ( className === 'ce-element--over' ) {
			ContentEdit.Root.get().trigger('out', this);
		}
		return proxied.call( this, className );
	};
})();


/**
 * Fires pbs.ct.ready when the edit button becomes available.
 */
window.addEventListener( 'DOMContentLoaded', function() {
	if ( ! document.querySelector( '[data-name="main-content"]' ) ) {
		return;
	}

	// Auto-start PBS if the localStorage key is set.
	var starterInterval = setInterval( function() {
		if ( document.querySelector( '.ct-widget--active' ) ) {
			wp.hooks.doAction( 'pbs.ct.ready' );
			clearInterval( starterInterval );
		}
	}, 200);
});

/* globals ContentTools, pbsParams */

/**
 * Override the CT editor to use the buttons we placed in the WP admin bar.
 */
ContentTools.IgnitionUI.prototype.mount = function() {

	// Use the admin bar buttons instead of creating the default ones
	this._domElement = document.querySelector('#wpadminbar');
	this._domEdit = document.querySelector('#wp-admin-bar-gambit_builder_edit');
	this._domEdit.classList.add( 'ct-ignition__button--edit' );
	this._domConfirm = document.querySelector('#wp-admin-bar-gambit_builder_save');
	this._domConfirm.classList.add( 'ct-ignition__button--confirm' );
	this._domCancel = document.querySelector('#wp-admin-bar-gambit_builder_cancel');
	this._domCancel.classList.add( 'ct-ignition__button--cancel' );
	this._domBusy = document.querySelector('#wp-admin-bar-gambit_builder_busy');
	this._domBusy.classList.add( 'ct-ignition__button--busy' );
    var ret = this._addDOMEventListeners();

	// The scroll changes when you click edit, don't change the scroll position.
	this._domEdit.addEventListener('mousedown', function() {
		this.prevScrollY = window.scrollY || window.pageYOffset;
	});
	this._domEdit.addEventListener('click', function() {
		window.scrollTo( 0, this.prevScrollY );
	});

	// Save & change post status buttons.
	document.querySelector( '#wp-admin-bar-gambit_builder_save_options #pbs-save-publish' ).addEventListener( 'click', function(ev) {
		ev.preventDefault();
		pbsParams.new_post_status = 'publish';
		this._domConfirm.click();
		document.querySelector('#pbs-save-button').setAttribute( 'data-current-post-type', 'publish' );
		this._domConfirm.querySelector('.ab-item').childNodes[1].nodeValue = pbsParams.labels.save_and_update;
	}.bind(this));
	document.querySelector( '#wp-admin-bar-gambit_builder_save_options #pbs-save-draft' ).addEventListener( 'click', function(ev) {
		ev.preventDefault();
		pbsParams.new_post_status = 'draft';
		this._domConfirm.click();
		document.querySelector('#pbs-save-button').setAttribute( 'data-current-post-type', 'draft' );
		this._domConfirm.querySelector('.ab-item').childNodes[1].nodeValue = pbsParams.labels.save_as_draft;
	}.bind(this));
	document.querySelector( '#wp-admin-bar-gambit_builder_save_options #pbs-save-pending' ).addEventListener( 'click', function(ev) {
		ev.preventDefault();
		pbsParams.new_post_status = 'pending';
		this._domConfirm.click();
		document.querySelector('#pbs-save-button').setAttribute( 'data-current-post-type', 'pending' );
		this._domConfirm.querySelector('.ab-item').childNodes[1].nodeValue = pbsParams.labels.save_as_pending;
	}.bind(this));

	wp.hooks.doAction( 'pbs.ct.mounted' );

	return ret;
};

/* globals ContentTools */

(function() {
	var proxied = ContentTools.History.prototype.undo;
	ContentTools.History.prototype.undo = function() {
		var ret = proxied.call( this );
		wp.hooks.doAction( 'pbs.undo' );
		return ret;

	};
})();

(function() {
	var proxied = ContentTools.History.prototype.redo;
	ContentTools.History.prototype.redo = function() {

		var ret = proxied.call( this );
		wp.hooks.doAction( 'pbs.redo' );
		return ret;

	};
})();

/* globals ContentEdit */


/**
 * Also use the bounding client rect for determining the current size.
 * This is a fallback, for cases where the width & height attributes
 * are not present. Or else the SHIFT+CTRL/CMD+CLICK action on resizables
 * will not work.
 */
( function() {
	var proxied = ContentEdit.ResizableElement.prototype.size;
    ContentEdit.ResizableElement.prototype.size = function( newSize ) {
		var height, width, rect;
		if ( ! newSize && this._domElement ) {
			rect = this._domElement.getBoundingClientRect();
			width = parseInt( rect.width || 1, 10 );
			height = parseInt( rect.height || 1, 10 );
			return [ width, height ];
		}
		return proxied.call( this, newSize );
    };
} )();


/**
 * When clicking on a resizable element while holding down SHIFT + CTRL/CMD
 * will reset the size to their defaults.
 */
( function() {
	var proxied = ContentEdit.ResizableElement.prototype._onMouseDown;
	ContentEdit.ResizableElement.prototype._onMouseDown = function(ev) {
		var corner = this._getResizeCorner( ev.clientX, ev.clientY );

		if ( corner ) {
			if ( window.PBSEditor.isCtrlDown && window.PBSEditor.isShiftDown ) {
				this.style( 'width', 'auto' );
				this.style( 'height', 'auto' );
				this.attr( 'height', '' );
				this.attr( 'width', '' );
			}
		}

		proxied.call( this, ev );
	};
} )();



/**
 * Allow `*` droppers.
 */
( function() {
   var proxied = ContentEdit.Element.prototype.drop;
   ContentEdit.Element.prototype.drop = function( element, placement ) {
		var root = ContentEdit.Root.get();
		if ( element && typeof element.type !== 'undefined' ) {
			if ( ! this.constructor.droppers[ element.type() ] && ! element.constructor.droppers[ this.type() ] && element.constructor.droppers['*'] ) {
				element._removeCSSClass( 'ce-element--drop' );
				element._removeCSSClass( 'ce-element--drop-' + placement[0] );
				element._removeCSSClass( 'ce-element--drop-' + placement[1] );
				element.constructor.droppers['*']( this, element, placement );
				root.trigger( 'drop', this, element, placement );
				return;
			}
		}
		return proxied.call( this, element, placement );
	};
} )();
( function() {
   var proxied = ContentEdit.Element.prototype._onOver;
    ContentEdit.Element.prototype._onOver = function(ev) {
		var ret = proxied.call( this, ev );
		if ( ! ret ) {

	        var root = ContentEdit.Root.get();
	        var dragging = root.dragging();
	        if ( ! dragging ) {
				return;
	        }
	        if ( dragging === this ) {
				return;
	        }
	        if ( root._dropTarget ) {
				return;
	        }
	        if ( this.constructor.droppers['*'] ) {
				this._addCSSClass( 'ce-element--drop' );
				return root._dropTarget = this;
	        }
		}
		return ret;
    };
} )();

// @see https://gist.github.com/bfintal/63527d3f9dd85e0b15d6

/* globals PBSEditor */

PBSEditor.Frame = wp.media.view.Frame.extend({
	className: 'pbs-icon-modal',
	template:  wp.template( 'pbs-icon-frame' ),

	events: {
		'click .media-toolbar-primary button': '_primaryClicked'
	},

	initialize: function() {
		wp.media.view.Frame.prototype.initialize.apply( this, arguments );

		_.defaults( this.options, {
			title: 'My Modal', // Default title of the modal.
			button: 'My Button', // Default submit button of the modal.
			modal: true
		});

		// Initialize modal container view.
		if ( this.options.modal ) {
			this.modal = new wp.media.view.Modal({
				controller: this
			});

			this.modal.content( this );

			this.modal.on( 'open', _.bind( function () {
				this._onOpen();
			}, this ) );

			this.modal.on( 'close', _.bind( function() {
				this._onClose();
			}, this ) );
		}
	},

	open: function( args ) {
		if ( ! args ) {
			args = {};
		}

		// Combine the default options and the arguments given.
		this.options = _.defaults( args, this.options );

		if ( args.content ) {
			this.modal.content( args.content( this ) );
		}
		this.modal.open();
		this.modal.el.children[0].classList.add( 'pbs-modal-frame' );
		if ( this.className ) {
			this.modal.el.children[0].classList.add( this.className );
		}

		if ( this.modal.el.querySelector( '.media-frame-title h1' ) ) {
			this.modal.el.querySelector( '.media-frame-title h1' ).textContent = this.options.title;
		}
		if ( this.modal.el.querySelector( '.media-toolbar-primary button' ) ) {
			this.modal.el.querySelector( '.media-toolbar-primary button' ).textContent = this.options.button;
		}

		this.modal.el.children[0].classList.add( 'pbs-frame-hide' );
		setTimeout( function() {
			this.modal.el.children[0].classList.remove( 'pbs-frame-hide' );
		}.bind(this), 50 );
	},

	close: function() {
		this.modal.close();
	},

	_primaryClicked: function() {
		this.modal.close();
		if ( this.options.successCallback ) {
			this.options.successCallback( this );
		}
		// Do stuff when the submit button is clicked.
	},

	_onOpen: function() {
		if ( this.options.openCallback ) {
			this.options.openCallback( this );
		}
		// Do stuff when modal opens.
	},

	_onClose: function() {
		if ( this.options.closeCallback ) {
			this.options.closeCallback( this );
		}
		// Do stuff when modal closes.
	}
});

/* globals PBSEditor */

PBSEditor.SearchFrame = PBSEditor.Frame.extend({
	className: 'pbs-icon-modal',
	template:  wp.template( 'pbs-icon-frame' ),

	events: {
		'click .media-toolbar-primary button': '_primaryClicked'
	},

	_onOpen: function() {

		PBSEditor.Frame.prototype._onOpen.apply( this );
		setTimeout( function() {
			var searchInput = this.modal.el.querySelector( 'input[type="search"]' );
			searchInput.focus();
			searchInput.select();
		}.bind( this ), 1 );
		if ( ! this.selected ) {
			this.modal.el.querySelector( '.media-toolbar-primary button' ).setAttribute( 'disabled', 'disabled' );
		}
		this.modal.el.querySelector( '.pbs-no-results' ).style.display = '';

	},
	_onClose: function() {
		this.modal.el.querySelector( 'input[type="search"]' ).focus();
	},
	searchKeyup: function( ev ) {
		clearTimeout( this._searchTimeout );
		this._searchTimeout = setTimeout( function() {
			this.doSearch(ev);
		}.bind( this ), 400 );
	},
	reset: function() {
		this.selected = null;
		this.model.el.querySelector( '.pbs-no-results' ).style.display = '';
		this.modal.el.querySelector( '.media-toolbar-primary button' ).setAttribute( 'disabled', 'disabled' );
	},
	doSearch: function( ev ) {
		var keyword = ev.target.value.trim().toLowerCase();
		var shortcodes = this.modal.el.querySelectorAll( '.pbs-search-list > *' );
		var hasResult = false;
		Array.prototype.forEach.call( shortcodes, function(el) {
			if ( keyword === '' || el.textContent.trim().toLowerCase().indexOf( keyword ) !== -1 ) {
				el.style.display = '';
				hasResult = true;
			} else {
				el.style.display = 'none';
			}
		} );
		this.modal.el.querySelector( '.pbs-no-results' ).style.display = hasResult ? '' : 'flex';
	},
	select: function( ev ) {
		var target = ev.target;
		while ( ! target.parentNode.classList.contains( 'pbs-search-list' ) ) {
			target = target.parentNode;
		}
		this.selected = target;
		if ( this.modal.el.querySelector( '.pbs-selected' ) ) {
			this.modal.el.querySelector( '.pbs-selected' ).classList.remove( 'pbs-selected' );
		}
		target.classList.add( 'pbs-selected' );

		this.modal.el.querySelector( '.media-toolbar-primary button' ).removeAttribute( 'disabled' );

		// Double clicking on an item selects it.
		if ( this._justClicked === target ) {
			this._primaryClicked();
		}
		this._justClicked = target;
		clearTimeout( this._justClickedTimeout );
		this._justClickedTimeout = setTimeout( function() {
			this._justClicked = false;
		}.bind( this ), 300 );
	}
});

/**
 * The Icon picker modal popup.
 *
 * Call by using: PBSEditor.iconFrame.open(). Additional arguments may be given.
 */

/* globals pbsParams, PBSEditor */

PBSEditor._IconFrame = PBSEditor.Frame.extend({
	className: 'pbs-icon-modal',
	template:  wp.template( 'pbs-icon-frame' ),

	events: {
		'click .media-toolbar-primary button': '_primaryClicked',
		'keyup [type="search"]': 'searchKeyup',
		'click .pbs-icon-display [data-name]': 'selectIcon'
	},
	_onOpen: function() {
		PBSEditor.Frame.prototype._onOpen.apply( this );
		setTimeout( function() {
			var searchInput = this.modal.el.querySelector( 'input[type="search"]' );
			if ( searchInput.value === '' ) {
				searchInput.value = 'dashicons';
				this.searchKeyup( { target: searchInput } );
			}
			searchInput.focus();
			searchInput.select();
		}.bind( this ), 1 );
		if ( ! this.selected ) {
			this.modal.el.querySelector( '.media-toolbar-primary button' ).setAttribute( 'disabled', 'disabled' );
		}
	},
	_onClose: function() {
		this.modal.el.querySelector( 'input[type="search"]' ).focus();
	},
	searchKeyup: function( ev ) {
		clearTimeout( this._searchTimeout );
		this._searchTimeout = setTimeout( function() {
			this.doSearch(ev);
		}.bind( this ), 400 );
	},
	reset: function() {
		this._searchResults = [];
		this.modal.el.querySelector( '.pbs-no-results' ).style.display = '';
		while ( this.modal.el.querySelector( '.pbs-search-list > *:not(.pbs-no-results)' ) ) {
			var item = this.modal.el.querySelector( '.pbs-search-list > *:not(.pbs-no-results)' );
			item.parentNode.removeChild( item );
		}
		this._prevKeyword = '';
		this.selected = null;
		this._currentGroup = null;
		this.modal.el.querySelector( '.media-toolbar-primary button' ).setAttribute( 'disabled', 'disabled' );
	},
	doSearch: function( ev ) {
		var keyword = ev.target.value.trim();

		if ( ! keyword ) {
			return;
		}
		if ( this._prevKeyword === keyword ) {
			return;
		}
		this.reset();
		this._prevKeyword = keyword;

		// Remember searches.
		if ( typeof pbsParams.icon_searches === 'undefined' ) {
			pbsParams.icon_searches = [];
		}
		if ( typeof ev.keyCode !== 'undefined' ) {
			pbsParams.icon_searches.push( keyword );
		}

		var request = new XMLHttpRequest();
		request.open( 'POST', pbsParams.ajax_url, true );
		request.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8' );
		request.onload = function() {
			if (request.status >= 200 && request.status < 400) {
				if ( request.responseText ) {
					var response = JSON.parse( request.responseText );

					if ( typeof response.length !== 'undefined' || response.length === 0 ) {
						this.displayNoResults();
						return;
					}
					this._searchResults = response;

					this.displayResults();
					return;
				}
				this.displayNoResults();
			}
		}.bind( this );
		request.send( 'action=pbs_icon_search&nonce=' + pbsParams.nonce + '&s=' + keyword );
	},
	displayNoResults: function() {
		this.modal.el.querySelector( '.pbs-no-results' ).style.display = 'flex';
		// var item = document.createElement( 'div' );
		// item.classList.add( 'pbs-no-results' );
		// item.innerHTML = 'No matches found';
		// this.modal.el.querySelector( '.pbs-icon-display' ).appendChild( item );
	},
	displayResults: function() {
		var keys = Object.keys( this._searchResults ), groupLabel;

		if ( ! keys.length ) {
			return;
		}

		var key = keys[0];
		var result = this._searchResults[ Object.keys( this._searchResults )[0] ];
		delete this._searchResults[ key ];

		// Create the list of groups if it doesn't exist yet.
		if ( typeof this.groups === 'undefined' ) {
			this.groups = {};
			for ( groupLabel in pbsParams.icon_groups ) {
				if ( pbsParams.icon_groups.hasOwnProperty( groupLabel ) ) {
					this.groups[ groupLabel ] = new RegExp( pbsParams.icon_groups[ groupLabel ], 'i' );
				}
			}
		}

		// Create the group label if it doesn't exist yet.
		var currGroup = '';
		for ( groupLabel in this.groups ) {
			if ( this.groups.hasOwnProperty( groupLabel ) ) {
				var groupRegex = this.groups[ groupLabel ];
				if ( key.match( groupRegex ) ) {
					currGroup = groupLabel;
					break;
				}
			}
		}
		if ( this._currentGroup !== currGroup ) {
			var item = document.createElement( 'h4' );
			item.innerHTML = groupLabel;
			item.classList.add( 'pbs-icon-group-title' );
			this.modal.el.querySelector( '.pbs-icon-display' ).appendChild( item );
			this._currentGroup = currGroup;
		}

		// Create the icon.
		var icon = document.createElement( 'div' );
		icon.innerHTML = result;
		icon.setAttribute( 'data-name', key );
		this.modal.el.querySelector( '.pbs-icon-display' ).appendChild( icon );

		if ( keys.length > 1 ) {
			setTimeout( function() {
				this.displayResults();
			}.bind( this ), 5 );
		}

		this.modal.el.querySelector( '.pbs-no-results' ).style.display = '';
	},
	selectIcon: function( ev ) {
		var target = ev.target;
		while ( ! target.getAttribute( 'data-name' ) ) {
			target = target.parentNode;
		}
		this.selected = target;
		if ( this.modal.el.querySelector( '.pbs-icon-display .pbs-selected' ) ) {
			this.modal.el.querySelector( '.pbs-icon-display .pbs-selected' ).classList.remove( 'pbs-selected' );
		}
		target.classList.add( 'pbs-selected' );

		this.modal.el.querySelector( '.media-toolbar-primary button' ).removeAttribute( 'disabled' );

		// Double clicking on an icon selects it.
		if ( this._justClicked === target ) {
			this._primaryClicked();
		}
		this._justClicked = target;
		clearTimeout( this._justClickedTimeout );
		this._justClickedTimeout = setTimeout( function() {
			this._justClicked = false;
		}.bind( this ), 300 );
	}
});

window.addEventListener( 'DOMContentLoaded', function() {
	PBSEditor.iconFrame = new PBSEditor._IconFrame();
});

wp.hooks.addAction( 'pbs.save.payload', function( payload ) {
	if ( typeof pbsParams.icon_searches !== 'undefined' ) {
		payload.append( 'icon_searches', pbsParams.icon_searches );
	}
} );

/**
 * The Icon picker modal popup.
 *
 * Call by using: PBSEditor.widgetFrame.open(). Additional arguments may be given.
 */

/* globals PBSEditor */

PBSEditor._WidgetFrame = PBSEditor.SearchFrame.extend({
	className: 'pbs-widget-modal',
	template:  wp.template( 'pbs-widget-frame' ),

	events: {
		'click .media-toolbar-primary button': '_primaryClicked',
		'keyup [type="search"]': 'searchKeyup',
		'click [data-widget-slug]': 'select'
	}
});

window.addEventListener( 'DOMContentLoaded', function() {
	PBSEditor.widgetFrame = new PBSEditor._WidgetFrame();
});

/**
 * The shortcode picker modal popup.
 *
 * Call by using: PBSEditor.shortcodeFrame.open(). Additional arguments may be given.
 */

/* globals PBSEditor, pbsParams, PBSInspectorOptions */

PBSEditor._ShortcodeFrame = PBSEditor.SearchFrame.extend({
	className: 'pbs-shortcode-modal',
	template:  wp.template( 'pbs-shortcode-frame' ),

	events: {
		'click .media-toolbar-primary button': '_primaryClicked',
		'keyup [type="search"]': 'searchKeyup',
		'click [data-shortcode-tag]': 'select',
		'click .pbs-refresh-mappings': 'refreshShortcodeMappings'
	},
	_onOpen: function() {
		PBSEditor.SearchFrame.prototype._onOpen.apply( this );
		this.initShortcodeList();
	},
	initShortcodeList: function() {
		var shortcodeArea = this.modal.el.querySelector( '.pbs-search-list' ), map;
		if ( ! shortcodeArea.querySelector( '*:not(.pbs-no-results)' ) ) {
			var allShortcodes = [], sc, tag;

			// Gather all shortcodes.
			for ( var i = 0; i < pbsParams.shortcodes.length; i++ ) {
				tag = pbsParams.shortcodes[ i ];

				// Allow shortcodes to be hidden from the shortcode picker.
				if ( typeof pbsParams.shortcodes_to_hide !== 'undefined' && -1 !== pbsParams.shortcodes_to_hide.indexOf( tag ) ) {
					continue;
				}

				sc = {
					'tag': tag,
					'name': tag.replace( /[\-_]/g, ' ' ),
					'desc': '',
					'owner': '',
					'ownerslug': '',
					'image': '',
					'isMapped': false
				};
				if ( pbsParams.shortcode_mappings[ tag ] ) {
					map = pbsParams.shortcode_mappings[ tag ];
					if ( map.is_hidden === '1' ) {
						continue;
					}
					sc.desc = map.description;
					sc.owner = map.owner;
					sc.ownerslug = map['owner-slug'];
					sc.image = 'http://ps.w.org/' + sc.ownerslug + '/assets/icon-128x128.png), url(http://ps.w.org/' + sc.ownerslug + '/assets/icon.svg), url(' + pbsParams.plugin_url + 'page_builder_sandwich/assets/element-icons/shortcode_single.svg';

					// If theme shortcode, use the theme's screenshot as the icon.
					if ( map.owner === pbsParams.theme ) {
						sc.image = pbsParams.stylesheet_directory_uri + 'screenshot.png';
					}

					sc.isMapped = true;
					if ( map.name ) {
						sc.name = map.name;
					}
				}
				if ( PBSInspectorOptions.Shortcode[ pbsParams.shortcodes[ i ] ] ) {
					map = PBSInspectorOptions.Shortcode[ pbsParams.shortcodes[ i ] ];
					if ( map.is_hidden === '1' ) {
						continue;
					}
					if ( map.label ) {
						sc.name = map.label;
					}
					if ( map.name ) {
						sc.name = map.name;
					}
					if ( map.desc ) {
						sc.desc = map.desc;
					}
					if ( map.owner ) {
						sc.owner = map.owner;
					}
					if ( map.image ) {
						sc.image = map.image;
					}
					sc.isMapped = true;
				}

				allShortcodes.push( sc );
			}

			// Sort.
			allShortcodes.sort( function( a, b ) {
			    var x = a.name.toLowerCase();
			    var y = b.name.toLowerCase();
			    var ret = x < y ? -1 : x > y ? 1 : 0;
				var xMap = a.isMapped;
				var yMap = b.isMapped;
				return xMap === yMap ? ret : xMap ? -1 : 1;
			} );

			// Display.
			for ( tag in allShortcodes ) {
				if ( allShortcodes.hasOwnProperty( tag ) ) {
					sc = allShortcodes[ tag ];

					var div = document.createElement( 'DIV' );
					div.setAttribute( 'data-shortcode-tag', sc.tag );
					var title = document.createElement( 'H4' );
					title.innerHTML = sc.name;
					div.appendChild( title );
					if ( sc.desc ) {
						var desc = document.createElement( 'P' );
						desc.innerHTML = sc.desc;
						div.appendChild( desc );
					}
					var owner = document.createElement( 'P' );
					owner.classList.add( 'pbs-shortcode-owner' );
					owner.innerHTML = sc.owner + ' [' + sc.tag + ']';
					div.appendChild( owner );
					if ( sc.isMapped ) {
						var preview = document.createElement( 'DIV' );
						preview.classList.add( 'pbs-shortcode-owner-image' );
						if ( sc.image ) {
							preview.setAttribute( 'style', 'background-image: url(' + sc.image + ')' );
						}
						div.appendChild( preview );
						div.classList.add( 'pbs-has-owner-image' );
					}
					shortcodeArea.appendChild( div );
				}
			}
		}
	},
	refreshShortcodeMappings: function(ev) {
		ev.preventDefault();

		if ( this._isUpdatingShortcodes ) {
			return;
		}
		this._isUpdatingShortcodes = true;

		this.modal.$el.addClass( 'pbs-busy' );

	   	var payload = new FormData();
	   	payload.append( 'action', 'pbs_update_shortcode_mappings' );
	   	payload.append( 'nonce', pbsParams.nonce );

	   	var xhr = new XMLHttpRequest();

	   	xhr.onload = function() {
			this.modal.$el.removeClass( 'pbs-busy' );
	   		if ( xhr.status >= 200 && xhr.status < 400 ) {
				this._isUpdatingShortcodes = null;
				var response = JSON.parse( xhr.responseText );
				if ( response ) {

					// Remove current mappings.
					for ( var shortcode in pbsParams.shortcode_mappings ) {
						if ( pbsParams.shortcode_mappings.hasOwnProperty( shortcode ) ) {
							window.pbsRemoveInspector( shortcode );
						}
					}

					// Add the mappings into the correct place.
					pbsParams.shortcode_mappings = response;

					// Remove all the shortcodes.
					var shortcodeArea = this.modal.el.querySelector( '.pbs-search-list' );
					var noResults = shortcodeArea.querySelector( '.pbs-no-results' );
					noResults.parentNode.removeChild( noResults );
					while ( shortcodeArea.firstChild ) {
						shortcodeArea.removeChild( shortcodeArea.firstChild );
					}
					shortcodeArea.appendChild( noResults );

					// Re-initialize the shortcode list.
					this.initShortcodeList();
				}
	   		}
	   	}.bind( this );

		// There was a connection error of some sort.
		xhr.onerror = function() {
			this.modal.$el.removeClass( 'pbs-busy' );
			this._isUpdatingShortcodes = null;
		};

	   	xhr.open( 'POST', pbsParams.ajax_url );
	   	xhr.send( payload );

		return false;
	}
});

window.addEventListener( 'DOMContentLoaded', function() {
	PBSEditor.shortcodeFrame = new PBSEditor._ShortcodeFrame();
});

/**
 * The Icon picker modal popup.
 *
 * Call by using: PBSEditor.widgetFrame.open(). Additional arguments may be given.
 */

/* globals PBSEditor */

PBSEditor._PredesignedFrame = PBSEditor.SearchFrame.extend({
	className: 'pbs-predesigned-modal',
	template:  wp.template( 'pbs-predesigned-frame' ),

	events: {
		'click .media-toolbar-primary button': '_primaryClicked',
		'keyup [type="search"]': 'searchKeyup',
		'click [data-template]': 'select'
	},

	_onOpen: function() {
		PBSEditor.SearchFrame.prototype._onOpen.apply( this );
		this.initList();
	},

	initList: function() {
		if ( this.modal.el.querySelector( '.pbs-search-list > *:not(.pbs-no-results)' ) ) {
			return;
		}

		var container = this.modal.el.querySelector( '.pbs-search-list' );
		var designElements = document.querySelectorAll( '[data-design-element-template]' );
		Array.prototype.forEach.call( designElements, function( el ) {
			var templateID = el.getAttribute( 'id' );
			var name = el.getAttribute( 'data-name' );
			var description = el.getAttribute( 'data-description' );
			var image = el.getAttribute( 'data-image' );
			var elem;

			var button = document.createElement( 'DIV' );
			button.setAttribute( 'data-template', templateID );
			button.setAttribute( 'data-root-only', el.getAttribute( 'data-root-only' ) );

			if ( image ) {
				elem = document.createElement( 'img' );
				elem.setAttribute( 'src', image );
				elem.setAttribute( 'alt', name ? name : templateID );
				button.appendChild( elem );
			}

			if ( name ) {
				elem = document.createElement( 'h4' );
				elem.innerHTML = name;
				button.appendChild( elem );
			}

			if ( description ) {
				elem = document.createElement( 'p' );
				elem.classList.add( 'description' );
				elem.innerHTML = description;
				button.appendChild( elem );
			}

			container.appendChild( button );
		} );
	}
});

window.addEventListener( 'DOMContentLoaded', function() {
	PBSEditor.predesignedFrame = new PBSEditor._PredesignedFrame();
});

/**
 * The HTML editor modal popup.
 *
 * Call by using: PBSEditor.htmlFrame.open(). Additional arguments may be given.
 */

/* globals PBSEditor */

PBSEditor._HtmlFrame = PBSEditor.Frame.extend({
	className: 'pbs-html-modal',
	template:  wp.template( 'pbs-html-frame' ),

	events: {
		'click .media-toolbar-primary button': '_primaryClicked',
		'keydown textarea': 'tabHandler'
	},
	_onOpen: function() {
		PBSEditor.Frame.prototype._onOpen.apply( this );
		setTimeout( function() {
			var input = this.modal.el.querySelector( 'textarea' );
			input.focus();
			if ( input.value === '' ) {
				input.value = '<div>\n\t<p>Sample HTML</p>\n</div>';
				input.select();
			}
		}.bind( this ), 1 );
	},
	_onClose: function() {
		this.modal.el.querySelector( 'textarea' ).focus();
	},
	tabHandler: function(e) {
		if ( e.keyCode === 9 ) {
			// Get caret position/selection.
            var val = e.target.value,
                start = e.target.selectionStart,
                end = e.target.selectionEnd;

            // Set textarea value to: text before caret + tab + text after caret.
            e.target.value = val.substring(0, start) + '\t' + val.substring(end);

            // Put caret at right position again.
            e.target.selectionStart = e.target.selectionEnd = start + 1;

            // Prevent the focus lose
			e.preventDefault();
            return false;
		}
	},
	getHtml: function() {
		var html = this.modal.el.querySelector( 'textarea' ).value.trim();

		// This fixes malformed HTML.
		var dummy = document.createElement( 'div' );
	    dummy.innerHTML = html;
	    return dummy.innerHTML.replace( /\s{2,}/g, ' ' );
	},
	setHtml: function( html ) {
		html = html.trim();
		// Beautify.
		html = this.formatXml( html ).trim();
		this.modal.el.querySelector( 'textarea' ).value = html;
	},
	// @see https://gist.github.com/kurtsson/3f1c8efc0ccd549c9e31
	formatXml: function(xml) {
		var formatted = '';
	    var reg = /(>)(<)(\/*)/g;
	    xml = xml.toString().replace(reg, '$1\r\n$2$3');
	    var pad = 0;
	    var nodes = xml.split('\r\n');
	    for(var n in nodes) {
	      var node = nodes[n];
	      var indent = 0;
	      if (node.match(/.+<\/\w[^>]*>$/)) {
	        indent = 0;
	      } else if (node.match(/^<\/\w/)) {
	        if (pad !== 0) {
	          pad -= 1;
	        }
	      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
	        indent = 1;
	      } else {
	        indent = 0;
	      }

	      var padding = '';
	      for (var i = 0; i < pad; i++) {
	        padding += '  ';
	      }

	      formatted += padding + node + '\r\n';
	      pad += indent;
	    }
	    return formatted;
	}
});

window.addEventListener( 'DOMContentLoaded', function() {
	PBSEditor.htmlFrame = new PBSEditor._HtmlFrame();
});

/**
 * The admin settings modal popup.
 *
 * Call by using: PBSEditor.adminFrame.open(). Additional arguments may be given.
 */

/* globals PBSEditor */

PBSEditor._AdminFrame = PBSEditor.Frame.extend({
	className: 'pbs-admin-modal',
	template:  wp.template( 'pbs-admin-frame' ),

	events: {},

	_onOpen: function() {
		PBSEditor.Frame.prototype._onOpen.apply( this );

		// Set a session storage value so we can know (from the admin-side)
		// that we are inside a pbs iframe.
		sessionStorage.setItem( 'pbs_in_admin_iframe', 1 );

		setTimeout( function() {
			this.modal.el.classList.add( 'pbs-busy' );
			var iframe = this.modal.el.querySelector( 'iframe' );
			iframe.onload = function() {
				this.modal.el.classList.remove( 'pbs-busy' );
			}.bind( this );
			iframe.setAttribute( 'src', this.options.url );
		}.bind( this ), 1 );
	},
	_onClose: function() {

		// Reset the session storage value for the pbs iframe.
		sessionStorage.removeItem( 'pbs_in_admin_iframe' );

		this.modal.el.querySelector( 'iframe' ).setAttribute( 'src', '' );

		PBSEditor.Frame.prototype._onClose.apply( this );
	}
});

window.addEventListener( 'DOMContentLoaded', function() {
	PBSEditor.adminFrame = new PBSEditor._AdminFrame();
});

/* globals ContentTools, ContentEdit, PBSEditor */

PBSEditor.Overlays = [];

PBSEditor.Overlay = (function() {

	function Overlay() {
		this.showOnTaint = true;
		this._domElement = null;
		this._active = false;
		this._shown = false;
		this._isMounted = false;
		this._classname = '';

		PBSEditor.Overlays.push( this );

		wp.hooks.addAction( 'pbs.element.over', function( element ) {

			// Don't show overlays when dragging.
			if ( ContentEdit.Root.get().dragging() ) {
				return;
			}

			// After some time, hide the overlay if it wasn't used.
			clearTimeout( this._hideTimeout );
			this._hideTimeout = setTimeout( function() {
				if ( ! this._shown ) {
					this._hide();
				}
				this._shown = false;
			}.bind(this), 10 );

			// Check the element stack if this element canApply, or if not,
			// if any of its parent are.
			var couldApply = this.canApply( element );
			while ( element !== null && element.constructor.name !== 'Region' && ! couldApply ) {
				element = element.parent();
				couldApply = this.canApply( element );
			}

			if ( couldApply ) {
				this.element = this.applyTo( element );
				this._shown = true;
				this._show( this.element );
			}
		}.bind( this ) );

		ContentEdit.Root.get().bind( 'unmount', function( element ) {
			if ( element === this.element ) {
				this._hide();
			}
		}.bind( this ) );

		ContentEdit.Root.get().bind('drag', function() {
			this._hide();
		}.bind(this));
		ContentEdit.Root.get().bind('drop', function() {
			this._hide();
		}.bind(this));

		document.addEventListener( 'mouseover', function( ev ) {
			if ( ! this._isMounted ) {
				return;
			}
			if ( ! Overlay.active ) {
				if ( window.pbsSelectorMatches( ev.target, '[data-name="main-content"], [data-name="main-content"] *, .pbs-quick-action-overlay, .pbs-quick-action-overlay *, .pbs-toolbar, .pbs-toolbar *' ) ) {
					return;
				}
				this._hide();
			}
		}.bind(this));

		ContentEdit.Root.get().bind('taint', function( element ) {
			if ( this.showOnTaint && this.element === element ) {
				this._show( element );
			}
		}.bind(this) );
		ContentEdit.Root.get().bind('debounced_taint', function( element ) {
			if ( this.showOnTaint && this.element === element ) {
				this._show( element );
			}
		}.bind(this) );

		var editor = ContentTools.EditorApp.get();
		editor.bind('start', function() {
			this._domElement = this.createElement();
			this.mount();
		}.bind(this) );
		editor.bind('stop', function() {
			this.unmount();
		}.bind(this) );
	}

	Overlay.prototype.mount = function() {
		this._domElement.classList.add( 'pbs-quick-action-overlay' );
		this._domElement.classList.add( 'pbs-overlay-' + this.constructor.name.toLowerCase() );
		if ( this._classname ) {
			this._domElement.classList.add( this._classname );
		}
		document.body.appendChild( this._domElement );
		this.addEventHandlers();
		this._isMounted = true;
	};

	Overlay.prototype.unmount = function() {
		this.removeEventHandlers();
		document.body.removeChild( this._domElement );
		this._isMounted = false;
	};

	Overlay.prototype.addEventHandlers = function() {
		this._mousedownBound = this._mousedown.bind( this );
		this._mousemoveBound = this._mousemove.bind( this );
		this._mouseupBound = this._mouseup.bind( this );
		this._mouseenterBound = this._mouseenter.bind( this );
		this._mouseleaveBound = this._mouseleave.bind( this );

		this._domElement.addEventListener( 'mousedown', this._mousedownBound );
		this._domElement.addEventListener( 'mouseenter', this._mouseenterBound );
		this._domElement.addEventListener( 'mouseleave', this._mouseleaveBound );
		document.addEventListener( 'mousemove', this._mousemoveBound );
		document.addEventListener( 'mouseup', this._mouseupBound );
	};

	Overlay.prototype.removeEventHandlers = function() {
		this._domElement.removeEventListener( 'mousedown', this._mousedownBound );
		this._domElement.removeEventListener( 'mouseenter', this._mouseenterBound );
		this._domElement.removeEventListener( 'mouseleave', this._mouseleaveBound );
		document.removeEventListener( 'mousemove', this._mousemoveBound );
		document.removeEventListener( 'mouseup', this._mouseupBound );
	};

	Overlay.prototype._mousedown = function(ev) {
		if ( ! this.canApply() ) {
			this._active = false;
			return;
		}
		this._active = true;
		this.startX = parseInt( ev.screenX, 10 );
		this.startY = parseInt( ev.screenY, 10 );
		this.deltaX = 0;
		this.deltaY = 0;
		Overlay.active = true;
		this._domElement.classList.add( 'pbs-active' );
		document.body.classList.add( 'pbs-overlay-is-active' );
		document.body.classList.add( 'pbs-overlay-' + this.constructor.name.toLowerCase() );
		this.onClick( ev );
		this.onMoveStart( ev );
	};

	Overlay.prototype._mousemove = function(ev) {
		if ( ! this._active ) {
			return;
		}

		this.deltaX = parseInt( ev.screenX, 10 ) - this.startX;
		this.deltaY = parseInt( ev.screenY, 10 ) - this.startY;

		ev.preventDefault();
		ev.stopPropagation();

		this.onMove( ev );

		// Update the other overlays.
		Overlay.hideOtherOverlays( this );
	};

	Overlay.hideOtherOverlays = function( callingOverlay ) {
		Array.prototype.forEach.call( PBSEditor.Overlays, function( overlay ) {
			if ( overlay !== callingOverlay ) {
				overlay._hide();
			}
		} );
	};

	Overlay.prototype._mouseup = function() {
		this._active = false;
		Overlay.active = false;
		this._domElement.classList.remove( 'pbs-active' );
		document.body.classList.remove( 'pbs-overlay-is-active' );
		document.body.classList.remove( 'pbs-overlay-active-' + this.constructor.name.toLowerCase() );
	};

	Overlay.prototype._mouseenter = function( ev ) {
		this._domElement.classList.add( 'pbs-over' );
		document.body.classList.add( 'pbs-overlay-hovered' );
		document.body.classList.add( 'pbs-overlay-hovered-' + this.constructor.name.toLowerCase() );
		this.onEnter( ev );
	};

	Overlay.prototype._mouseleave = function() {
		this._domElement.classList.remove( 'pbs-over' );
		document.body.classList.remove( 'pbs-overlay-hovered' );
		document.body.classList.remove( 'pbs-overlay-hovered-' + this.constructor.name.toLowerCase() );
		this.onLeave();
	};

	Overlay.prototype._show = function( element ) {
		var root = ContentEdit.Root.get();
		// if ( element._domElement && ! root.dragging() ) {
		if ( ! root.dragging() && element ) {
			this._domElement.style.display = 'block';
			this.show( element );

			// clearInterval( this._showInterval );
			// this._showInterval = setInterval( function( element ) {
				// this.show( element );
			// }.bind( this, element ), 16 );
		}
	};

	Overlay.prototype._hide = function() {
		// clearInterval( this._showInterval );
		if ( this._domElement ) {
			this._domElement.style.display = 'none';
		}
		this.hide();
	};

	Overlay.active = false;
	Overlay.prevOverElement = null;

	Overlay.prototype.canApply = function() {
		return ! Overlay.active;
	};

	// Override these.
	Overlay.prototype.createElement = function() {};
	Overlay.prototype.onMoveStart = function() {};
	Overlay.prototype.onMove = function() {};
	Overlay.prototype.onClick = function() {};
	Overlay.prototype.show = function( element ) {}; // jshint ignore:line
	Overlay.prototype.hide = function() {};
	Overlay.prototype.onEnter = function() {};
	Overlay.prototype.onLeave = function() {};
	Overlay.prototype.applyTo = function( element ) { return element; };

	return Overlay;
})();

/**
 * Prevent mouse events when an overlay is active.
 */
(function() {
	var proxied = ContentEdit.Element.prototype._onMouseDown;
    ContentEdit.Element.prototype._onMouseDown = function(ev) {
		if ( PBSEditor.Overlay.active ) {
			return;
		}
		return proxied.call( this, ev );
	};
})();
(function() {
	var proxied = ContentEdit.Element.prototype._onMouseMove;
    ContentEdit.Element.prototype._onMouseMove = function(ev) {
		if ( PBSEditor.Overlay.active ) {
			return;
		}
		ContentEdit.Root.get().trigger( 'mousemove', this );
		return proxied.call( this, ev );
	};
})();
(function() {
	var proxied = ContentEdit.Element.prototype._onMouseOver;
    ContentEdit.Element.prototype._onMouseOver = function(ev) {
		if ( PBSEditor.Overlay.active ) {
			return;
		}
		return proxied.call( this, ev );
	};
})();
(function() {
	var proxied = ContentEdit.Element.prototype._onMouseOut;
    ContentEdit.Element.prototype._onMouseOut = function(ev) {
		if ( PBSEditor.Overlay.active ) {
			return;
		}
		return proxied.call( this, ev );
	};
})();
(function() {
	var proxied = ContentEdit.Element.prototype._onMouseUp;
    ContentEdit.Element.prototype._onMouseUp = function(ev) {
		if ( PBSEditor.Overlay.active ) {
			return;
		}
		return proxied.call( this, ev );
	};
})();



/**
 * Instead of using CT's mouse events, just create out own one.
 */
( function() {
	var currentOverElement = null;
	var currentTarget = null;
	var pbsOverElement = _.throttle( function( target ) {
		if ( currentTarget === target ) {
			wp.hooks.doAction( 'pbs.element.over', currentOverElement );
			return;
		}
		if ( ! target._ceElement ) {
			wp.hooks.doAction( 'pbs.nonelement.over', target );
			while ( ! target._ceElement ) {
				target = target.parentNode;
				if ( ! target || target.tagName === 'BODY' ) {
					return;
				}
			}
			if ( target._ceElement.constructor.name === 'Region' ) {
				return;
			}
		}
		if ( PBSEditor.Overlay.active ) {
			return;
		}
		currentTarget = target;
		currentOverElement = target._ceElement;
		wp.hooks.doAction( 'pbs.element.over', target._ceElement );
	}, 30 );
	var mouseListener = function( ev ) {
		pbsOverElement( ev.target );
	};
	ContentTools.EditorApp.get().bind( 'start', function () {
		window.addEventListener( 'mousemove', mouseListener );
		window.addEventListener( 'mouseover', mouseListener );
	} );
	ContentTools.EditorApp.get().bind( 'stop', function () {
		window.removeEventListener( 'mousemove', mouseListener );
		window.removeEventListener( 'mouseover', mouseListener );
	} );
} )();

/* globals ContentTools, ContentEdit, PBSEditor, __extends */

PBSEditor.OverlayControls = ( function( _super ) {
	__extends( OverlayControls, _super );

	function OverlayControls( controls ) {
		OverlayControls.__super__.constructor.call(this);
		this.showOnTaint = false;

		if ( typeof controls === 'undefined' ) {
			controls = [];
		}
		this.controls = controls;
		// [
			// {
				// name: 'margin-top',
				// onClick: function( overlay, element ) {},
				// refresh: function( overlay, element, styles, rect ) {},
				// onMoveStart: function( overlay, element, styles ) {},
				// onMove: function( overlay, element, deltaX, deltaY ) {}
			// }
		// ];

		ContentEdit.Root.get().bind( 'taint', function() {
			this.updatePosition( this.element );
		}.bind( this ) );
		ContentEdit.Root.get().bind( 'focus', function() {
			this._hide();
		}.bind( this ) );
		document.addEventListener( 'mousedown', function( ev ) {
			var focused = ContentEdit.Root.get().focused();
			if ( focused ) {
				if ( focused._domElement === ev.target ) {
					this._hide();
				}
			}
		}.bind( this ) );
		ContentEdit.Root.get().bind( 'focus', function() {
			this._hide();
		}.bind( this ) );
		document.addEventListener( 'keydown', function( ev ) {
			if ( [ 40, 37, 39, 38, 9, 8, 46, 13, 16, 91, 18 ].indexOf( ev.keyCode ) === -1 ) {
				this._hide();
			}
		}.bind( this ) );
		window.addEventListener( 'resize', function() {
			this._hide();
		}.bind( this ) );
	}

	OverlayControls.prototype.createElement = function() {
		var element = document.createElement( 'DIV' );

		if ( ! this.controls.length ) {
			return element;
		}

		var wrapper = document.createElement( 'DIV' );
		wrapper.classList.add( 'pbs-overlay-wrapper' );
		element.appendChild( wrapper );

		for ( var i = 0; i < this.controls.length; i++ ) {
			var control = document.createElement( 'DIV' );
			control.classList.add( 'pbs-overlay-' + this.controls[ i ].name );
			control.control = this.controls[ i ];
			this.controls[ i ]._domElement = control;
			control.addEventListener( 'mouseenter', function( overlay ) {
				overlay._domElement.classList.add( 'pbs-over-' + this.control.name );
				this.control._domElement.classList.add( 'pbs-control-over' );
			}.bind( control, this ) );
			control.addEventListener( 'mouseleave', function( overlay ) {
				overlay._domElement.classList.add( 'pbs-over-' + this.control.name );
				this.control._domElement.classList.remove( 'pbs-control-over' );
			}.bind( control, this ) );
			wrapper.appendChild( control );
		}

		this._locationDragging = null;
		return element;
	};

	OverlayControls.prototype.canApply = function( element ) {
		if ( ! OverlayControls.__super__.canApply.call(this, element) ) {
			return false;
		}
		if ( ! element ) {
			element = this.element;
		}
		if ( ! element ) {
			return false;
		}
		return true;
	};

	OverlayControls.prototype.updatePosition = function( element ) {

		// This can be called when the element was deleted.
		if ( ! element || ! element._domElement ) {
			return;
		}

		var styles = getComputedStyle( element._domElement );
		var rect = element._domElement.getBoundingClientRect();
		var toolbar = getComputedStyle( document.querySelector( '.pbs-toolbox-bar' ) );
		var toolbarHeight = parseInt( toolbar.height, 10 );
		var scrollY = window.scrollY || window.pageYOffset;

		this._domElement.style.top = ( rect.top + scrollY - toolbarHeight ) + 'px';
		this._domElement.style.height = rect.height + 'px';
		this._domElement.style.left = ( rect.left ) + 'px';
		this._domElement.style.width = ( rect.width ) + 'px';

		for ( var i = 0; i < this.controls.length; i++ ) {
			if ( this.controls[ i ].refresh ) {
				this.controls[ i ].refresh( this, element, styles, rect );
			}
		}
	};

	OverlayControls.prototype._hide = function() {
		if ( this._domElement && this._domElement.getAttribute( 'class' ).indexOf( 'pbs-active-' ) !== -1 ) {
			return;
		}
		return OverlayControls.__super__._hide.call( this );
	};

	OverlayControls.prototype.hide = function() {
		if ( ! this._domElement ) {
			return;
		}

		this._domElement.classList.remove( 'pbs-overlay-show' );

		clearInterval( this._updatePositionTimeout );

		for ( var i = 0; i < this.controls.length; i++ ) {
			this._domElement.classList.remove( 'pbs-active-' + this.controls[ i ].name );
		}
	};

	OverlayControls.prototype.show = function( element ) {

		if ( ! element ) {
			return;
		}

		if ( this._domElement.classList.contains( 'pbs-overlay-show' ) ) {
			if ( this._prevElement ) {
				if ( this._prevElement === element ) {
					return;
				}
			}
			this._prevElement = element;
		}

		this.updatePosition( element );

		clearInterval( this._updatePositionTimeout );
		this._updatePositionTimeout = setInterval( function() {
			this.updatePosition( this.element );
		}.bind( this ), 60 );

		this._domElement.classList.add( 'pbs-overlay-show' );

		for ( var i = 0; i < this.controls.length; i++ ) {
			this._domElement.classList.remove( 'pbs-active-' + this.controls[ i ].name );
			this._domElement.classList.remove( 'pbs-over-' + this.controls[ i ].name );
			this.controls[ i ]._domElement.classList.remove( 'pbs-control-active' );
			this.controls[ i ]._domElement.classList.remove( 'pbs-control-over' );
		}
	};

	OverlayControls.prototype.onMoveStart = function( ev ) {
		var styles = getComputedStyle( this.element._domElement );
		var rect = this.element._domElement.getBoundingClientRect();

		for ( var i = 0; i < this.controls.length; i++ ) {
			if ( this._locationDragging === this.controls[ i ].name ) {
				if ( this.controls[ i ].onMoveStart ) {
					this.controls[ i ].onMoveStart( this, this.element, styles, rect, ev );
				}
			}
		}
	};

	OverlayControls.prototype.onMove = function( ev ) {
		for ( var i = 0; i < this.controls.length; i++ ) {
			if ( this._locationDragging === this.controls[ i ].name ) {
				if ( this.controls[ i ].onMove ) {
					this.controls[ i ].onMove( this, this.element, this.deltaX, this.deltaY, ev );
				}
				break;
			}
		}

		// Update the position of the overlay.
		this.updatePosition( this.element );
	};

	OverlayControls.prototype.onClick = function( ev ) {
		this._locationDragging = null;

		for ( var i = 0; i < this.controls.length; i++ ) {
			this._domElement.classList.remove( 'pbs-active-' + this.controls[ i ].name );

			if ( this.controls[ i ].onClick ) {
				this.controls[ i ].onClick( this, this.element );
			}
		}

		for ( i = 0; i < this.controls.length; i++ ) {
			if ( ev.target === this.controls[ i ]._domElement ) {
				this._locationDragging = this.controls[ i ].name;
				this._domElement.classList.add( 'pbs-active-' + this.controls[ i ].name );
				this._domElement.classList.add( 'pbs-active' );
				this.controls[ i ]._domElement.classList.add( 'pbs-control-active' );
				break;
			}
		}

		this.updatePosition( this.element );

	};

	OverlayControls.prototype._mouseup = function( ev ) {
		var ret = OverlayControls.__super__._mouseup.call( this, ev );

		for ( var i = 0; i < this.controls.length; i++ ) {
			this._domElement.classList.remove( 'pbs-active-' + this.controls[ i ].name );
			this.controls[ i ]._domElement.classList.remove( 'pbs-control-active' );

			if ( this._locationDragging === this.controls[ i ].name ) {
				if ( this.controls[ i ].onMoveStop ) {
					this.controls[ i ].onMoveStop( this, this.element, ev );
				}
			}
		}

		this._locationDragging = null;

		return ret;
	};

	OverlayControls.prototype.applyTo = function( element ) {

		// Since this is run on EVERY element that's on the "over stack",
		// only show this on the first ROW encountered.
		if ( this._alreadyShown2 ) {
			return this.element;
		}
		this._alreadyShown2 = true;
		setTimeout( function() {
			this._alreadyShown2 = false;
		}.bind( this ) );

		return element;
	};

	return OverlayControls;

})(PBSEditor.Overlay);

/* globals PBSEditor, __extends, pbsParams */

PBSEditor.OverlayElement = ( function( _super ) {
	__extends( OverlayElement, _super );

	function OverlayElement() {

		var controls = [
			{
				name: 'resize-bottom-left',
				refresh: function( overlay, element, styles, rect ) {

					this._domElement.style.display = 'none';
					if ( element.constructor.name === 'Image' ) {
						this._domElement.style.display = '';
					} else if ( element.constructor.name === 'Icon' ) {
						this._domElement.style.display = '';
					}

					if ( rect.height < 150 || rect.width < 150 ) {
						var side = rect.height;
						if ( rect.height > rect.width ) {
							side = rect.width;
						}
						side = side * 0.3;
						this._domElement.style.width = side + 'px';
						this._domElement.style.height = side + 'px';
					} else {
						this._domElement.style.width = '';
						this._domElement.style.height = '';
					}
				},
				onMoveStart: function( overlay, element, styles, rect ) {
					this._initWidth = rect.width;
					this._initHeight = rect.height;
					this._aspectRatio = rect.width / rect.height;

					var toolbar = getComputedStyle( document.querySelector( '.pbs-toolbox-bar' ) );
					var toolbarHeight = parseInt( toolbar.height, 10 );
					var scrollY = window.scrollY || window.pageYOffset;
					this._toolbarHeight = toolbarHeight;

					this._domElement.style.top =
					this._overlaySize = document.createElement( 'DIV' );
					this._overlaySize.classList.add( 'pbs-size-indicator' );
					this._overlaySize.innerHTML = rect.width + ' &times; ' + parseInt( rect.height, 10 ) + ' px';
					this._overlaySize.style.top = ( rect.top + scrollY - this._toolbarHeight ) + 'px';
					this._overlaySize.style.left = rect.right + 'px';
					document.body.appendChild( this._overlaySize );
				},
				onMove: function( overlay, element, deltaX ) {
					var width = - deltaX + this._initWidth;

					if ( window.PBSEditor.isShiftDown ) {
						var remainder = width % 10;
						width -= remainder;
					}
					width = parseInt( width, 10 );

					var height = 1 / this._aspectRatio * width;
					element.style( 'height', height + 'px' );
					element.style( 'width', width + 'px' );

					if ( element.constructor.name === 'Image' ) {
						element.attr( 'width', width );
						element.attr( 'height', height );
					}

					var rect = element._domElement.getBoundingClientRect();
					var scrollY = window.scrollY || window.pageYOffset;
					this._overlaySize.style.top = ( rect.top + scrollY - this._toolbarHeight ) + 'px';
					this._overlaySize.style.left = rect.right + 'px';
					this._overlaySize.innerHTML = width + ' &times; ' + parseInt( height, 10 ) + ' px';
				},
				onMoveStop: function( overlay, element ) {
					document.body.removeChild( this._overlaySize );
					if ( element.constructor.name === 'Image' ) {
						element.style( 'height', 'auto' );
					}
				}
			},
			{
				name: 'resize-top-left',
				refresh: function( overlay, element, styles, rect ) {

					this._domElement.style.display = 'none';
					if ( element.constructor.name === 'Image' ) {
						this._domElement.style.display = '';
					} else if ( element.constructor.name === 'Icon' ) {
						this._domElement.style.display = '';
					}

					if ( rect.height < 150 || rect.width < 150 ) {
						var side = rect.height;
						if ( rect.height > rect.width ) {
							side = rect.width;
						}
						side = side * 0.3;
						this._domElement.style.width = side + 'px';
						this._domElement.style.height = side + 'px';
					} else {
						this._domElement.style.width = '';
						this._domElement.style.height = '';
					}
				},
				onMoveStart: function( overlay, element, styles, rect ) {
					this._initWidth = rect.width;
					this._initHeight = rect.height;
					this._aspectRatio = rect.width / rect.height;

					var toolbar = getComputedStyle( document.querySelector( '.pbs-toolbox-bar' ) );
					var toolbarHeight = parseInt( toolbar.height, 10 );
					var scrollY = window.scrollY || window.pageYOffset;
					this._toolbarHeight = toolbarHeight;

					// this._domElement.style.top =
					this._overlaySize = document.createElement( 'DIV' );
					this._overlaySize.classList.add( 'pbs-size-indicator' );
					this._overlaySize.innerHTML = rect.width + ' &times; ' + parseInt( rect.height, 10 ) + ' px';
					this._overlaySize.style.top = ( rect.top + scrollY - this._toolbarHeight ) + 'px';
					this._overlaySize.style.left = rect.right + 'px';
					document.body.appendChild( this._overlaySize );
				},
				onMove: function( overlay, element, deltaX ) {
					var width = - deltaX + this._initWidth;

					if ( window.PBSEditor.isShiftDown ) {
						var remainder = width % 10;
						width -= remainder;
					}
					width = parseInt( width, 10 );

					var height = 1 / this._aspectRatio * width;
					element.style( 'height', height + 'px' );
					element.style( 'width', width + 'px' );

					if ( element.constructor.name === 'Image' ) {
						element.attr( 'width', width );
						element.attr( 'height', height );
					}

					var rect = element._domElement.getBoundingClientRect();
					var scrollY = window.scrollY || window.pageYOffset;
					this._overlaySize.style.top = ( rect.top + scrollY - this._toolbarHeight ) + 'px';
					this._overlaySize.style.left = rect.right + 'px';
					this._overlaySize.innerHTML = width + ' &times; ' + parseInt( height, 10 ) + ' px';
				},
				onMoveStop: function( overlay, element ) {
					document.body.removeChild( this._overlaySize );
					if ( element.constructor.name === 'Image' ) {
						element.style( 'height', 'auto' );
					}
				}
			},
			{
				name: 'resize-top-right',
				refresh: function( overlay, element, styles, rect ) {

					this._domElement.style.display = 'none';
					if ( element.constructor.name === 'Image' ) {
						this._domElement.style.display = '';
					} else if ( element.constructor.name === 'Icon' ) {
						this._domElement.style.display = '';
					}

					if ( rect.height < 150 || rect.width < 150 ) {
						var side = rect.height;
						if ( rect.height > rect.width ) {
							side = rect.width;
						}
						side = side * 0.3;
						this._domElement.style.width = side + 'px';
						this._domElement.style.height = side + 'px';
					} else {
						this._domElement.style.width = '';
						this._domElement.style.height = '';
					}
				},
				onMoveStart: function( overlay, element, styles, rect ) {
					this._initWidth = rect.width;
					this._initHeight = rect.height;
					this._aspectRatio = rect.width / rect.height;

					var toolbar = getComputedStyle( document.querySelector( '.pbs-toolbox-bar' ) );
					var toolbarHeight = parseInt( toolbar.height, 10 );
					var scrollY = window.scrollY || window.pageYOffset;
					this._toolbarHeight = toolbarHeight;

					this._domElement.style.top =
					this._overlaySize = document.createElement( 'DIV' );
					this._overlaySize.classList.add( 'pbs-size-indicator' );
					this._overlaySize.innerHTML = rect.width + ' &times; ' + parseInt( rect.height, 10 ) + ' px';
					this._overlaySize.style.top = ( rect.top + scrollY - this._toolbarHeight ) + 'px';
					this._overlaySize.style.left = rect.right + 'px';
					document.body.appendChild( this._overlaySize );
				},
				onMove: function( overlay, element, deltaX ) {
					var width = deltaX + this._initWidth;

					if ( window.PBSEditor.isShiftDown ) {
						var remainder = width % 10;
						width -= remainder;
					}
					width = parseInt( width, 10 );

					var height = 1 / this._aspectRatio * width;
					element.style( 'height', height + 'px' );
					element.style( 'width', width + 'px' );

					if ( element.constructor.name === 'Image' ) {
						element.attr( 'width', width );
						element.attr( 'height', height );
					}

					var rect = element._domElement.getBoundingClientRect();
					var scrollY = window.scrollY || window.pageYOffset;
					this._overlaySize.style.top = ( rect.top + scrollY - this._toolbarHeight ) + 'px';
					this._overlaySize.style.left = rect.right + 'px';
					this._overlaySize.innerHTML = width + ' &times; ' + parseInt( height, 10 ) + ' px';
				},
				onMoveStop: function( overlay, element ) {
					document.body.removeChild( this._overlaySize );
					if ( element.constructor.name === 'Image' ) {
						element.style( 'height', 'auto' );
					}
				}
			},
			{
				name: 'resize-bottom-right',
				refresh: function( overlay, element, styles, rect ) {

					this._domElement.style.display = 'none';
					if ( element.constructor.name === 'Image' ) {
						this._domElement.style.display = '';
					} else if ( element.constructor.name === 'Icon' ) {
						this._domElement.style.display = '';
					}

					if ( rect.height < 150 || rect.width < 150 ) {
						var side = rect.height;
						if ( rect.height > rect.width ) {
							side = rect.width;
						}
						side = side * 0.3;
						this._domElement.style.width = side + 'px';
						this._domElement.style.height = side + 'px';
					} else {
						this._domElement.style.width = '';
						this._domElement.style.height = '';
					}
				},
				onMoveStart: function( overlay, element, styles, rect ) {
					this._initWidth = rect.width;
					this._initHeight = rect.height;
					this._aspectRatio = rect.width / rect.height;

					var toolbar = getComputedStyle( document.querySelector( '.pbs-toolbox-bar' ) );
					var toolbarHeight = parseInt( toolbar.height, 10 );
					var scrollY = window.scrollY || window.pageYOffset;
					this._toolbarHeight = toolbarHeight;

					this._domElement.style.top =
					this._overlaySize = document.createElement( 'DIV' );
					this._overlaySize.classList.add( 'pbs-size-indicator' );
					this._overlaySize.innerHTML = rect.width + ' &times; ' + parseInt( rect.height, 10 ) + ' px';
					this._overlaySize.style.top = ( rect.top + scrollY - this._toolbarHeight ) + 'px';
					this._overlaySize.style.left = rect.right + 'px';
					document.body.appendChild( this._overlaySize );
				},
				onMove: function( overlay, element, deltaX ) {
					var width = deltaX + this._initWidth;

					if ( window.PBSEditor.isShiftDown ) {
						var remainder = width % 10;
						width -= remainder;
					}
					width = parseInt( width, 10 );

					var height = 1 / this._aspectRatio * width;
					element.style( 'height', height + 'px' );
					element.style( 'width', width + 'px' );

					if ( element.constructor.name === 'Image' ) {
						element.attr( 'width', width );
						element.attr( 'height', height );
					}

					var rect = element._domElement.getBoundingClientRect();
					var scrollY = window.scrollY || window.pageYOffset;
					this._overlaySize.style.top = ( rect.top + scrollY - this._toolbarHeight ) + 'px';
					this._overlaySize.style.left = rect.right + 'px';
					this._overlaySize.innerHTML = width + ' &times; ' + parseInt( height, 10 ) + ' px';
				},
				onMoveStop: function( overlay, element ) {
					document.body.removeChild( this._overlaySize );
					if ( element.constructor.name === 'Image' ) {
						element.style( 'height', 'auto' );
					}
				}
			},
			{
				name: 'resize-bottom',
				refresh: function( overlay, element, styles, rect ) {

					this._domElement.style.display = 'none';
					if ( element.constructor.name === 'Map' ) {
						this._domElement.style.display = '';
					}

					if ( rect.height < 150 || rect.width < 150 ) {
						var side = rect.height;
						if ( rect.height > rect.width ) {
							side = rect.width;
						}
						side = side * 0.3;
						this._domElement.style.width = side + 'px';
						this._domElement.style.height = side + 'px';
					} else {
						this._domElement.style.width = '';
						this._domElement.style.height = '';
					}
				},
				onMoveStart: function( overlay, element, styles, rect ) {
					this._initWidth = rect.width;
					this._initHeight = rect.height;

					var toolbar = getComputedStyle( document.querySelector( '.pbs-toolbox-bar' ) );
					var toolbarHeight = parseInt( toolbar.height, 10 );
					var scrollY = window.scrollY || window.pageYOffset;
					this._toolbarHeight = toolbarHeight;

					this._domElement.style.top =
					this._overlaySize = document.createElement( 'DIV' );
					this._overlaySize.classList.add( 'pbs-size-indicator' );
					this._overlaySize.innerHTML = rect.height + ' px';
					this._overlaySize.style.top = ( rect.top + scrollY - this._toolbarHeight ) + 'px';
					this._overlaySize.style.left = rect.right + 'px';
					document.body.appendChild( this._overlaySize );
				},
				onMove: function( overlay, element, deltaX, deltaY ) {
					var height = deltaY + this._initHeight;

					if ( window.PBSEditor.isShiftDown ) {
						var remainder = height % 10;
						height -= remainder;
					}
					height = parseInt( height, 10 );

					element.style( 'height', height + 'px' );

					var rect = element._domElement.getBoundingClientRect();
					var scrollY = window.scrollY || window.pageYOffset;
					this._overlaySize.style.top = ( rect.top + scrollY - this._toolbarHeight ) + 'px';
					this._overlaySize.style.left = rect.right + 'px';
					this._overlaySize.innerHTML = rect.height + ' px';
				},
				onMoveStop: function( overlay, element ) {
					document.body.removeChild( this._overlaySize );
					if ( element.constructor.name === 'Image' ) {
						element.style( 'height', 'auto' );
					}
				}
			},
			{
				name: 'margin-top',
				refresh: function( overlay, element, styles, rect ) {
					this._domElement.style.display = '';
					if ( element.constructor.name === 'Shortcode' ) {
						this._domElement.style.display = 'none';
					}
					if ( element.constructor.name === 'Title' ) {
						this._domElement.style.display = 'none';
					}

					if ( rect.width > 100 ) {
						this._domElement.setAttribute( 'data-label', pbsParams.labels.margin + ': ' + styles.marginTop );
					} else {
						this._domElement.setAttribute( 'data-label', styles.marginTop );
					}

					if ( parseInt( styles.marginTop, 10 ) < 0 ) {
						this._domElement.style.height = '0px';
					} else {
						this._domElement.style.height = styles.marginTop;
					}

					this._domElement.setAttribute( 'data-value', 'margin-' + styles.marginTop );
				},
				onMoveStart: function( overlay, element, styles ) {
					this._initValue = parseInt( styles.marginTop, 10 );
				},
				onMove: function( overlay, element, deltaX, deltaY ) {
					var margin = deltaY + this._initValue;

					if ( window.PBSEditor.isShiftDown ) {
						var remainder = margin % 10;
						margin -= remainder;
					}

					element.style( 'margin-top', margin + 'px' );
				}
			},
			{
				name: 'margin-bottom',
				refresh: function( overlay, element, styles, rect ) {
					this._domElement.style.display = '';
					if ( element.constructor.name === 'Shortcode' ) {
						this._domElement.style.display = 'none';
					}
					if ( element.constructor.name === 'Title' ) {
						this._domElement.style.display = 'none';
					}

					if ( rect.width > 100 ) {
						this._domElement.setAttribute( 'data-label', pbsParams.labels.margin + ': ' + styles.marginBottom );
					} else {
						this._domElement.setAttribute( 'data-label', styles.marginBottom );
					}

					if ( parseInt( styles.marginBottom, 10 ) < 0 ) {
						this._domElement.style.height = '0px';
					} else {
						this._domElement.style.height = styles.marginBottom;
					}

					this._domElement.setAttribute( 'data-value', 'margin-' + styles.marginBottom );
				},
				onMoveStart: function( overlay, element, styles ) {
					this._initValue = parseInt( styles.marginBottom, 10 );
				},
				onMove: function( overlay, element, deltaX, deltaY ) {
					var margin = deltaY + this._initValue;

					if ( window.PBSEditor.isShiftDown ) {
						var remainder = margin % 10;
						margin -= remainder;
					}

					element.style( 'margin-bottom', margin + 'px' );
				}
			}
		];

		OverlayElement.__super__.constructor.call( this, controls );
		this.showOnTaint = false;
	}

	OverlayElement.prototype.canApply = function( element ) {
		if ( ! OverlayElement.__super__.canApply.call(this, element) ) {
			return false;
		}
		if ( ! element ) {
			element = this.element;
		}
		if ( element.constructor.name === 'Static' ) {
			return false;
		}
		// Highlight the whole list.
		if ( [ 'ListItem', 'ListItemText' ].indexOf( element.constructor.name ) !== -1 ) {
			return false;
		}
		// Nothing for tabs, but yes for the tabs container.
		if ( [ 'Tab', 'TabPanelContainer' ].indexOf( element.constructor.name ) !== -1 ) {
			return false;
		}
		// Nothing for table contents.
		if ( [ 'TableRow', 'TableSection' ].indexOf( element.constructor.name ) !== -1 ) {
			return false;
		}
		if ( [ 'Carousel' ].indexOf( element.constructor.name ) !== -1 ) {
			return false;
		}
		if ( [ 'Div', 'DivRow', 'DivCol', 'Region' ].indexOf( element.constructor.name ) !== -1 ) {
			return false;
		}
		return true;
	};

	return OverlayElement;

} )( PBSEditor.OverlayControls );

/* globals PBSEditor, __extends, pbsParams */


PBSEditor.OverlayColumn = ( function( _super ) {
	__extends( OverlayColumn, _super );

	function OverlayColumn() {

		var controls = [
			{
				name: 'padding-top',
				refresh: function( overlay, element, styles ) {

					this._domElement.setAttribute( 'data-label', pbsParams.labels.padding + ': ' + styles.paddingTop );
					this._domElement.style.height = styles.paddingTop;
					this._domElement.setAttribute( 'data-value', 'padding-' + styles.paddingTop );
				},
				onMoveStart: function( overlay, element, styles ) {
					this._initValue = parseInt( styles.paddingTop, 10 );
				},
				onMove: function( overlay, element, deltaX, deltaY ) {

					var padding = deltaY + this._initValue;
					if ( padding < 0 ) {
						padding = 0;
					}

					if ( window.PBSEditor.isShiftDown ) {
						var remainder = padding % 10;
						padding -= remainder;
					}

					element.style( 'padding-top', padding + 'px' );
				}
			},
			{
				name: 'padding-bottom',
				refresh: function( overlay, element, styles ) {

					this._domElement.setAttribute( 'data-label', pbsParams.labels.padding + ': ' + styles.paddingBottom );
					this._domElement.style.height = styles.paddingBottom;
					this._domElement.setAttribute( 'data-value', 'padding-' + styles.paddingBottom );
				},
				onMoveStart: function( overlay, element, styles ) {
					this._initValue = parseInt( styles.paddingBottom, 10 );
				},
				onMove: function( overlay, element, deltaX, deltaY ) {

					var padding = deltaY + this._initValue;
					if ( padding < 0 ) {
						padding = 0;
					}

					if ( window.PBSEditor.isShiftDown ) {
						var remainder = padding % 10;
						padding -= remainder;
					}

					element.style( 'padding-bottom', padding + 'px' );
				}
			},
			{
				name: 'padding-left',
				refresh: function( overlay, element, styles, rect ) {

					if ( parseInt( rect.height, 10 ) > 100 ) {
						this._domElement.setAttribute( 'data-label', pbsParams.labels.padding + ': ' + styles.paddingLeft );
					} else {
						this._domElement.setAttribute( 'data-label', styles.paddingLeft );
					}
					this._domElement.style.width = styles.paddingLeft;
					this._domElement.setAttribute( 'data-value', 'padding-' + styles.paddingLeft );
				},
				onMoveStart: function( overlay, element, styles ) {
					this._initValue = parseInt( styles.paddingLeft, 10 );
				},
				onMove: function( overlay, element, deltaX ) {

					var padding = deltaX + this._initValue;
					if ( padding < 0 ) {
						padding = 0;
					}

					if ( window.PBSEditor.isShiftDown ) {
						var remainder = padding % 10;
						padding -= remainder;
					}

					element.style( 'padding-left', padding + 'px' );
				}
			},
			{
				name: 'padding-right',
				refresh: function( overlay, element, styles, rect ) {

					if ( parseInt( rect.height, 10 ) > 100 ) {
						this._domElement.setAttribute( 'data-label', pbsParams.labels.padding + ': ' + styles.paddingRight );
					} else {
						this._domElement.setAttribute( 'data-label', styles.paddingRight );
					}

					this._domElement.style.width = styles.paddingRight;
					this._domElement.setAttribute( 'data-value', 'padding-' + styles.paddingRight );
				},
				onMoveStart: function( overlay, element, styles ) {
					this._initValue = parseInt( styles.paddingRight, 10 );
				},
				onMove: function( overlay, element, deltaX ) {

					var padding = - deltaX + this._initValue;
					if ( padding < 0 ) {
						padding = 0;
					}

					if ( window.PBSEditor.isShiftDown ) {
						var remainder = padding % 10;
						padding -= remainder;
					}

					element.style( 'padding-right', padding + 'px' );
				}
			}
		];

		OverlayColumn.__super__.constructor.call( this, controls );
		this.showOnTaint = false;
	}

	OverlayColumn.prototype.canApply = function( element ) {
		if ( ! OverlayColumn.__super__.canApply.call(this, element) ) {
			return false;
		}
		if ( ! element ) {
			element = this.element;
		}
		if ( ! element ) {
			return false;
		}
		if ( element.constructor.name === 'DivCol' ) {
			return true;
		}
		var parent = element.parent();
		while ( parent && parent.constructor.name !== 'Region' ) {
			if ( parent.constructor.name === 'DivCol' ) {
				return true;
			}
			parent = parent.parent();
		}
		if ( element ) {
			if ( element.constructor.name === 'DivCol' ) {
				return true;
			}
		}
		return false;
	};


	OverlayColumn.prototype.show = function( element ) {

		if ( ! element ) {
			return;
		}
		
		if ( element.constructor.name !== 'DivCol' ) {
			element = element.parent();
			while ( element && element.constructor.name !== 'Region' ) {
				if ( element.constructor.name === 'DivCol' ) {
					break;
				}
				element = element.parent();
			}
			if ( ! element || element.constructor.name === 'Region' ) {
				this._hide();
				return;
			}
			this.element = element;
		}

		// Since this is run on EVERY element that's on the "over stack",
		// only show this on the first ROW encountered.
		if ( this._alreadyShown ) {
			return;
		}
		this._alreadyShown = true;
		setTimeout( function() {
			this._alreadyShown = false;
		}.bind( this ) );

		return OverlayColumn.__super__.show.call( this, this.element );
	};

	OverlayColumn.prototype.applyTo = function( element ) {

		// Since this is run on EVERY element that's on the "over stack",
		// only show this on the first ROW encountered.
		if ( this._alreadyShown2 ) {
			return this.element;
		}
		this._alreadyShown2 = true;
		setTimeout( function() {
			this._alreadyShown2 = false;
		}.bind( this ) );

		if ( ! element ) {
			return element;
		}
		if ( element.constructor.name !== 'DivCol' ) {
			element = element.parent();
			while ( element && element.constructor.name !== 'Region' ) {
				if ( element.constructor.name === 'DivCol' ) {
					return element;
				}
				element = element.parent();
			}
		}

		return element;
	};

	return OverlayColumn;

} )( PBSEditor.OverlayControls );

/* globals PBSEditor, ContentEdit, __extends, pbsParams */

PBSEditor.OverlayRow = (function(_super) {
	__extends(OverlayRow, _super);

	OverlayRow.showOnTaint = false;

	function OverlayRow() {
		OverlayRow.__super__.constructor.call(this);
		this.showOnTaint = false;

		ContentEdit.Root.get().bind( 'focus', function() {
			this._hide();
		}.bind( this ) );
		document.addEventListener( 'mousedown', function( ev ) {
			var focused = ContentEdit.Root.get().focused();
			if ( focused ) {
				if ( focused._domElement === ev.target ) {
					this._hide();
				}
			}
		}.bind( this ) );
		ContentEdit.Root.get().bind( 'focus', function() {
			this._hide();
		}.bind( this ) );
		document.addEventListener( 'keydown', function( ev ) {
			if ( [ 40, 37, 39, 38, 9, 8, 46, 13, 16, 91, 18 ].indexOf( ev.keyCode ) === -1 ) {
				this._hide();
			}
		}.bind( this ) );
		window.addEventListener( 'resize', function() {
			this._hide();
		}.bind( this ) );
	}

	OverlayRow.prototype.createElement = function() {
		var element = document.createElement( 'DIV' );
		// var label = document.createElement( 'DIV' );
		// element.appendChild( label );

		this._topMargin = document.createElement( 'DIV' );
		this._topMargin.classList.add( 'pbs-overlay-margin-top' );
		this._topMargin.addEventListener( 'mouseenter', function() {
			this._domElement.classList.add( 'pbs-over-margin-top' );
		}.bind( this ) );
		this._topMargin.addEventListener( 'mouseleave', function() {
			this._domElement.classList.remove( 'pbs-over-margin-top' );
		}.bind( this ) );
		element.appendChild( this._topMargin );

		this._bottomMargin = document.createElement( 'DIV' );
		this._bottomMargin.classList.add( 'pbs-overlay-margin-bottom' );
		this._bottomMargin.addEventListener( 'mouseenter', function() {
			this._domElement.classList.add( 'pbs-over-margin-bottom' );
		}.bind( this ) );
		this._bottomMargin.addEventListener( 'mouseleave', function() {
			this._domElement.classList.remove( 'pbs-over-margin-bottom' );
		}.bind( this ) );
		element.appendChild( this._bottomMargin );

		this._columnWidths = [];
		this._columnLabels = [];

		return element;
	};

	OverlayRow.prototype.canApply = function( element ) {
		// return true;
		if ( ! OverlayRow.__super__.canApply.call(this, element) ) {
			return false;
		}
		if ( ! element ) {
			element = this.element;
		}
		if ( ! element ) {
			return false;
		}
		if ( element.constructor.name === 'DivRow' ) {
			return true;
		}
		var parent = element.parent();
		element = null;
		while ( parent && parent.constructor.name !== 'Region' ) {
			if ( parent.constructor.name === 'DivRow' ) {
				element = parent;
				break;
			}
			parent = parent.parent();
		}
		if ( element ) {
			if ( element.parent() ) {
				if ( element.parent().constructor.name === 'Div' ) {
					return false;
				}
			}
			if ( element.constructor.name === 'DivRow' ) {
				return true;
			}
		}
		return false;
	};

	OverlayRow.prototype.updatePosition = function( element ) {
		var rect = element._domElement.getBoundingClientRect();
		var toolbar = getComputedStyle( document.querySelector( '.pbs-toolbox-bar' ) );
		var toolbarHeight = parseInt( toolbar.height, 10 );
		var scrollY = window.scrollY || window.pageYOffset;

		this._domElement.style.top = ( rect.top + scrollY - toolbarHeight ) + 'px';
		this._domElement.style.height = rect.height + 'px';
		this._domElement.style.left = ( rect.left ) + 'px';
		this._domElement.style.width = ( rect.width ) + 'px';
	};

	OverlayRow.prototype.hide = function() {
		OverlayRow.__super__.hide.call( this );

		clearInterval( this._updatePositionTimeout );
	};

	OverlayRow.prototype.show = function( element ) {

		if ( ! element ) {
			return;
		}

		if ( element.constructor.name !== 'DivRow' ) {
			element = element.parent();
			while ( element && element.constructor.name !== 'Region' ) {
				if ( element.constructor.name === 'DivRow' ) {
					break;
				}
				element = element.parent();
			}
			if ( ! element || element.constructor.name === 'Region' ) {
				this._hide();
				return;
			}
			this.element = element;
		}

		// Since this is run on EVERY element that's on the "over stack",
		// only show this on the first ROW encountered.
		if ( this._alreadyShown ) {
			return;
		}
		this._alreadyShown = true;
		setTimeout( function() {
			this._alreadyShown = false;
		}.bind( this ) );

		element = this.element;

		clearInterval( this._updatePositionTimeout );
		this._updatePositionTimeout = setInterval( function() {
			this.updatePosition( this.element );
		}.bind( this ), 60 );

		this._topMargin.style.display = '';
		this._bottomMargin.style.display = '';
		if ( element.parent().constructor.name === 'Div' ) {
			this._topMargin.style.display = 'none';
			this._bottomMargin.style.display = 'none';
		} else if ( element.parent().constructor.name === 'TabPanelContainer' ) {
			this._topMargin.style.display = 'none';
			this._bottomMargin.style.display = 'none';
		}

		var styles = getComputedStyle( element._domElement );
		var rect = element._domElement.getBoundingClientRect();

		this._domElement.classList.remove( 'pbs-active-margin-top' );
		this._domElement.classList.remove( 'pbs-active-margin-bottom' );

		this.updatePosition( element );

		this._topMargin.setAttribute( 'data-label', pbsParams.labels.margin + ': ' + styles.marginTop );
		this._topMargin.style.height = styles.marginTop;
		this._topMargin.setAttribute( 'data-value', 'margin-' + styles.marginTop );

		this._bottomMargin.setAttribute( 'data-label', pbsParams.labels.margin + ': ' + styles.marginBottom );
		this._bottomMargin.style.height = styles.marginBottom;
		this._bottomMargin.setAttribute( 'data-value', 'margin-' + styles.marginBottom );

		var i, totalWidth = 0, totalWidthNoMargin = 0, margin, columnRect;
		for ( i = this._columnWidths.length - 1; i >= 0; i-- ) {
			this._columnWidths[ i ].parentNode.removeChild( this._columnWidths[ i ] );
		}
		for ( i = this._columnLabels.length - 1; i >= 0; i-- ) {
			this._columnLabels[ i ].parentNode.removeChild( this._columnLabels[ i ] );
		}
		this._columnWidths = [];
		this._columnLabels = [];

		var rowLeftPadding = parseInt( element.style( 'padding-left' ), 10 );

		for ( i = 0; i < element.children.length - 1; i++ ) {
			var o = document.createElement( 'DIV' );
			o.classList.add( 'pbs-overlay-column-width-' + i );
			o.classList.add( 'pbs-overlay-column-width' );
			o._index = i;
			o._this = this;
			if ( rect.height > 100 ) {
				o.setAttribute( 'data-label', pbsParams.labels.column_width );
			} else {
				o.setAttribute( 'data-label', pbsParams.labels.width );
			}

			o.addEventListener( 'mouseenter', function() {
				this._this._domElement.classList.add( 'pbs-over-column-width-' + this._index );
				this._this._domElement.classList.add( 'pbs-overlay-column-width' );
			} );
			o.addEventListener( 'mouseleave', function() {
				this._this._domElement.classList.remove( 'pbs-over-column-width-' + this._index );
				this._this._domElement.classList.remove( 'pbs-overlay-column-width' );
			} );

			columnRect = element.children[ i ]._domElement.getBoundingClientRect();

			totalWidth += columnRect.width;
			totalWidthNoMargin += columnRect.width;

			// The left row padding can affect the location of the columns.
			o.style.left = ( rowLeftPadding + totalWidth ) + 'px';

			if ( element.children[ i ]._domElement.style.marginRight ) {
				margin = parseInt( element.children[ i ]._domElement.style.marginRight, 10 );
				totalWidth += margin;
				o.style.width = margin + 'px';
				o.style.marginLeft = '0px';
			}

			this._domElement.appendChild( o );
			this._columnWidths.push( o );
		}
		if ( element.children.length ) {
			columnRect = element.children[ element.children.length - 1 ]._domElement.getBoundingClientRect();
			totalWidthNoMargin += columnRect.width;
		}

		totalWidth = 0;
		for ( i = 0; i < element.children.length; i++ ) {
			columnRect = element.children[ i ]._domElement.getBoundingClientRect();

			var label = document.createElement( 'DIV' );
			label.classList.add( 'pbs-overlay-column-label' );
			label.innerHTML = ( columnRect.width / totalWidthNoMargin * 100 ).toFixed( 1 ) + '%';


			// The left row padding can affect the location of the columns.
			if ( ! i ) {
				label.style.left = totalWidth + 'px';
			} else {
				label.style.left = ( rowLeftPadding + totalWidth ) + 'px';
			}

			totalWidth += columnRect.width;
			if ( element.children[ i ]._domElement.style.marginRight ) {
				totalWidth += parseInt( element.children[ i ]._domElement.style.marginRight, 10 );
			}

			this._domElement.appendChild( label );
			this._columnLabels.push( label );
		}
	};

	OverlayRow.prototype.onMoveStart = function() {
		var styles = getComputedStyle( this.element._domElement );
		this.marginTopInitialValue = parseInt( styles.marginTop, 10 );
		this.marginBottomInitialValue = parseInt( styles.marginBottom, 10 );
		this.columnWidthInitialValues = [];
		for ( var i = 0; i < this.element.children.length; i++ ) {
			var rect = this.element.children[ i ]._domElement.getBoundingClientRect();
			this.columnWidthInitialValues.push( rect.width );
		}
	};

	OverlayRow.prototype.onMove = function() {
		var margin, remainder, rect, totalWidth, totalWidthNoMargin, i;

		rect = this.element._domElement.getBoundingClientRect();

		if ( this._locationDragging === 'margin-top' ) {
			margin = this.deltaY + this.marginTopInitialValue;
			if ( window.PBSEditor.isShiftDown ) {
				remainder = margin % 10;
				margin -= remainder;
			}
			this.element.style( 'margin-top', margin + 'px' );

			this._topMargin.setAttribute( 'data-label', pbsParams.labels.margin + ': ' + margin + 'px' );
			this._topMargin.style.height = margin + 'px';
			this._topMargin.setAttribute( 'data-value', 'margin-' + margin + 'px' );

		} else if ( this._locationDragging === 'margin-bottom' ) {

			margin = this.deltaY + this.marginBottomInitialValue;
			if ( window.PBSEditor.isShiftDown ) {
				remainder = margin % 10;
				margin -= remainder;
			}
			this.element.style( 'margin-bottom', margin + 'px' );

			// var rect = this.element._domElement.getBoundingClientRect();
			if ( rect.width > 100 ) {
				this._bottomMargin.setAttribute( 'data-label', pbsParams.labels.margin + ': ' + margin + 'px' );
			} else {
				this._bottomMargin.setAttribute( 'data-label', margin + 'px' );
			}
			this._bottomMargin.style.height = margin + 'px';
			this._bottomMargin.setAttribute( 'data-value', 'margin-' + margin + 'px' );

		} else if ( this._locationDragging.indexOf( 'column-' ) === 0 ) {
			var width = this.deltaX + this.columnWidthInitialValues[ this._columnDragging ];
			if ( window.PBSEditor.isShiftDown ) {
				remainder = width % 10;
				width -= remainder;
			}
			var change = this.columnWidthInitialValues[ this._columnDragging ] - width;
			totalWidth = 0;
			totalWidthNoMargin = 0;
			for ( i = 0; i < this.element.children.length; i++ ) {
				var colRect = this.element.children[ i ]._domElement.getBoundingClientRect();
				totalWidth += colRect.width;
				totalWidthNoMargin += colRect.width;
				if ( i < this.element.children.length - 1 ) {
					this._columnWidths[ i ].style.left = totalWidth + 'px';
					if ( this.element.children[ i ]._domElement.style.marginRight ) {
						totalWidth += parseInt( this.element.children[ i ]._domElement.style.marginRight, 10 );
					}
				}
			}
			this.element._domElement.classList.add( 'pbs-overlay-changing-cols' );
			for ( i = 0; i < this.element.children.length; i++ ) {

				// We previously used flex-grow, don't use it anymore.
				this.element.children[ i ].style( 'flex-grow', '' );

				if ( i === this._columnDragging ) {
					this.element.children[ i ].style( 'flex-basis', ( width / totalWidthNoMargin * 100 ) + '%' );
				} else if ( i === this._columnDragging + 1 ) {
					this.element.children[ i ].style( 'flex-basis', ( ( this.columnWidthInitialValues[ i ] + change ) / totalWidthNoMargin * 100 ) + '%' );
				} else {
					this.element.children[ i ].style( 'flex-basis', ( this.columnWidthInitialValues[ i ] / totalWidthNoMargin * 100 ) + '%' );
				}
			}
		}

		rect = this.element._domElement.getBoundingClientRect();
		var toolbar = getComputedStyle( document.querySelector( '.pbs-toolbox-bar' ) );
		var toolbarHeight = parseInt( toolbar.height, 10 );
		var scrollY = window.scrollY || window.pageYOffset;

		this._domElement.style.top = ( rect.top + scrollY - toolbarHeight ) + 'px';
		this._domElement.style.height = rect.height + 'px';
		this._domElement.style.left = ( rect.left ) + 'px';
		this._domElement.style.width = ( rect.width ) + 'px';

		// Adjust the column width labels.
		var columnRect, rowLeftPadding = parseInt( this.element.style( 'padding-left' ), 10 );
		totalWidthNoMargin = 0;
		totalWidth = 0;
		for ( i = 0; i < this.element.children.length; i++ ) {
			columnRect = this.element.children[ i ]._domElement.getBoundingClientRect();
			totalWidthNoMargin += columnRect.width;
		}
		for ( i = 0; i < this.element.children.length; i++ ) {
			columnRect = this.element.children[ i ]._domElement.getBoundingClientRect();

			this._columnLabels[ i ].classList.add( 'pbs-overlay-column-label' );
			this._columnLabels[ i ].innerHTML = ( columnRect.width / totalWidthNoMargin * 100 ).toFixed( 1 ) + '%';

			if ( ! i ) {
				this._columnLabels[ i ].style.left = totalWidth + 'px';
			} else {
				this._columnLabels[ i ].style.left = rowLeftPadding + totalWidth + 'px';
			}

			totalWidth += columnRect.width;
			if ( this.element.children[ i ]._domElement.style.marginRight ) {
				totalWidth += parseInt( this.element.children[ i ]._domElement.style.marginRight, 10 );
			}
		}
	};

	OverlayRow.prototype.applyTo = function( element ) {

		// Since this is run on EVERY element that's on the "over stack",
		// only show this on the first ROW encountered.
		if ( this._alreadyShown2 ) {
			return this.element;
		}
		this._alreadyShown2 = true;
		setTimeout( function() {
			this._alreadyShown2 = false;
		}.bind( this ) );

		if ( ! element ) {
			return element;
		}

		if ( element.constructor.name !== 'DivRow' ) {
			element = element.parent();
			while ( element && element.constructor.name !== 'Region' ) {
				if ( element.constructor.name === 'DivRow' ) {
					return element;
				}
				element = element.parent();
			}
		}
		return element;
	};


	OverlayRow.prototype._mouseup = function() {
		OverlayRow.__super__._mouseup.call( this );
		if ( this.element && this.element._domElement ) {
			this.element._domElement.classList.remove( 'pbs-overlay-changing-cols' );
		}
		this._domElement.classList.remove( 'pbs-active-overlay-column' );
	};

	OverlayRow.prototype.onClick = function( ev ) {
		var i;
		this._locationDragging = null;
		this._domElement.classList.remove( 'pbs-active-overlay-column' );
		if ( ev.target === this._topMargin ) {
			this._locationDragging = 'margin-top';
		} else if ( ev.target === this._bottomMargin ) {
			this._locationDragging = 'margin-bottom';
		} else {
			for ( i = 0; i < this._columnWidths.length; i++ ) {
				if ( ev.target === this._columnWidths[ i ] ) {
					this._locationDragging = 'column-' + this._columnWidths[ i ]._index;
					this._columnDragging = this._columnWidths[ i ]._index;
					this._domElement.classList.add( 'pbs-active-overlay-column' );
					break;
				}
			}
		}
		this._domElement.classList.remove( 'pbs-active-margin-top' );
		this._domElement.classList.remove( 'pbs-active-margin-bottom' );
		for ( i = 0; i < 10; i++ ) {
			this._domElement.classList.remove( 'pbs-active-column-' + i );
		}
		if ( this._locationDragging ) {
			this._domElement.classList.add( 'pbs-active-' + this._locationDragging );
		}
	};

	return OverlayRow;

})(PBSEditor.Overlay);

/* globals ContentEdit, pbsParams, ContentTools */

/**
 * This changes the drop behavior to use overlays to represent the droppable
 * location instead of adding a pseudo element.
 */

( function() {

	// Triggered when finding out whether to drop above or below an element.
   	var _Root = ContentEdit.Root.get();
   	var proxiedGetDropPlacement = _Root._getDropPlacement;
	_Root._getDropPlacement = function( x, y ) {
		var placement = proxiedGetDropPlacement.call( this, x, y );

		if ( placement ) {

			// Don't allow left/right dropping anymore.
			placement[1] = 'center';

			showDropIndicator( placement );
		}
		return placement;
	};

	// Triggered when dragging is cancelled.
   	var proxiedCancelDragging = _Root.cancelDragging;
	_Root.cancelDragging = function() {
		if ( this._dragging ) {
			hideDropIndicator();
		}
		return proxiedCancelDragging.call( this );
	};

	// Triggered when dragging is stopped.
   	var proxiedOnStopDragging = _Root._onStopDragging;
	_Root._onStopDragging = function( ev ) {
		return proxiedOnStopDragging.call( this, ev );
	};

	// Triggered on mouseout when dragging.
	var proxiedOnMouseOut = ContentEdit.Element.prototype._onMouseOut;
	ContentEdit.Element.prototype._onMouseOut = function( ev ) {
		var ret = proxiedOnMouseOut.call( this, ev );
		var root = ContentEdit.Root.get();
		if ( root.dragging() ) {
			hideDropIndicator();
		}
		return ret;
	};


	// Triggered when hovering over an element. Cancel overlay when
	// hovered over the dragged element.
	var proxiedOnMouseOver = ContentEdit.Element.prototype._onMouseOver;
	ContentEdit.Element.prototype._onMouseOver = function( ev ) {
		var ret = proxiedOnMouseOver.call( this, ev );
		var root = ContentEdit.Root.get();
		if ( root.dragging() === this ) {
			hideDropIndicator();
			ev.stopPropagation();
			ev.preventDefault();
		}
		return ret;
	};

	// Triggered after a successful drop.
	var proxiedDrop = ContentEdit.Element.prototype.drop;
	ContentEdit.Element.prototype.drop = function( element, placement ) {
		var ret = proxiedDrop.call( this, element, placement );
		if ( element ) {
			hideDropIndicator();
		}
		return ret;
	};

	var indicatorTimeout = null;
	var dropIndicator = null;
	var prevDropTarget = null;
	var prevDropPlacement = null;
	var showDropIndicator = function( placement ) {

		var root = ContentEdit.Root.get();

		if ( ! dropIndicator ) {
			dropIndicator = document.createElement( 'DIV' );
			dropIndicator.classList.add( 'pbs-drop-indicator' );
			dropIndicator.appendChild( document.createElement( 'SPAN' ) );
			dropIndicator.appendChild( document.createElement( 'SPAN' ) );
		}

		var dropTargetDom = root._dropTarget._domElement;

		if ( prevDropTarget === dropTargetDom && prevDropPlacement === placement[0] ) {
			return;
		}

		prevDropTarget = dropTargetDom;
		prevDropPlacement = placement[0];

		clearTimeout( indicatorTimeout );

		dropIndicator.firstChild.innerHTML = pbsParams.labels.move_above_s.replace(  /%s/, root._dropTarget.typeName() );
		dropIndicator.firstChild.nextSibling.innerHTML = pbsParams.labels.move_below_s.replace(  /%s/, root._dropTarget.typeName() );

		var styles = getComputedStyle( root._dropTarget._domElement );
		var rect = root._dropTarget._domElement.getBoundingClientRect();
		var toolbar = getComputedStyle( document.querySelector( '.pbs-toolbox-bar' ) );
		var toolbarHeight = parseInt( toolbar.height, 10 );
		var scrollY = window.scrollY || window.pageYOffset;

		dropIndicator.classList.remove( 'pbs-drop-indicator-small' );
		if ( rect.height + parseInt( styles.marginTop, 10 ) + parseInt( styles.marginBottom, 10 ) < 60 ) {
			dropIndicator.classList.add( 'pbs-drop-indicator-small' );
		}

		// Add the classes for the drop indicator (whether to show up or down).
		dropIndicator.classList.remove( 'pbs-drop-indicator-above' );
		dropIndicator.classList.remove( 'pbs-drop-indicator-below' );
		dropIndicator.classList.add( 'pbs-drop-indicator-' + placement[0] );

		// If we're dropping on an empty paragraph inside a column, then that means we're
		// dropping it inside the column, change the labels to make it appropriate.
		if ( dropTargetDom.tagName === 'P' && dropTargetDom.parentNode.tagName === 'DIV' ) {
			if ( dropTargetDom.parentNode.classList && dropTargetDom.classList ) {
				if ( dropTargetDom.parentNode.classList.contains( 'pbs-col' ) && dropTargetDom.classList.contains( 'ce-element--empty' ) ) {
					dropIndicator.firstChild.innerHTML = pbsParams.labels.move_inside_column;
					dropIndicator.firstChild.nextSibling.innerHTML = pbsParams.labels.move_inside_column;
					dropIndicator.classList.remove( 'pbs-drop-indicator-above' );
					dropIndicator.classList.add( 'pbs-drop-indicator-below' );
				}
			}
		}

		// Only include the top margin if it's positive, or else it will
		// screw up the overlay height & positioning. This makes it tolerable.
		var marginTop = 0;
		if ( parseInt( styles.marginTop, 10 ) > 0 ) {
			marginTop = parseInt( styles.marginTop, 10 );
		}

		dropIndicator.style.top = ( rect.top + scrollY - toolbarHeight - 32 - marginTop ) + 'px';
		dropIndicator.style.left = rect.left + 'px';
		dropIndicator.style.width = rect.width + 'px';
		dropIndicator.style.height = ( rect.height + marginTop + parseInt( styles.marginBottom, 10 ) ) + 'px';
		setTimeout( function() {
			if ( dropIndicator ) {
				dropIndicator.classList.add( 'pbs-drop-indicator-show' );
			}
		}, 10 );
		document.body.appendChild( dropIndicator );
	};

	var hideDropIndicator = function() {
		prevDropTarget = null;
		prevDropPlacement = null;

		clearTimeout( indicatorTimeout );
		indicatorTimeout = setTimeout( function() {
			if ( dropIndicator ) {
				document.body.removeChild( dropIndicator );
				dropIndicator = null;
			}
		}, 10 );
	};


	/**
	 * Introduce a cool dragging animation.
	 */
	var proxiedStartDragging = _Root.startDragging;
	_Root.startDragging = function( element, x, y ) {
		var ret = proxiedStartDragging.call( this, element, x, y );
		if ( ! this._dragging ) {
			return;
        }
		setTimeout( function() {
			if ( this._draggingDOMElement ) {
				this._draggingDOMElement.classList.add( 'pbs-drag-helper-show' );
			}
		}.bind( this ), 10 );
		return ret;
	};


	/**
	 * Dragging elements while not over any element doesn't show the dragging
	 * indicator. This handles dragging outside existing elements.
	 */
	var pbsOverElement = _.throttle( function( ev ) {

		// Only do this when dragging.
		var root = ContentEdit.Root.get();
		if ( ! root.dragging() ) {
			return;
		}

		// Don't do this inside containers.
		if ( window.pbsSelectorMatches( ev.target, '.ct-widget, .ct-widget *' ) ) {
			hideDropIndicator();
			root._dropTarget = null;
			return;
		}

		var elements = document.querySelectorAll( '.pbs-main-wrapper > .ce-element, .pbs-main-wrapper > [data-ce-tag]' );

		var pointerX = ev.pageX;
		var pointerY = ev.pageY;
		var closestDistance = 999999999;
		var closestElement = null;
		var placement = [ 'above', 'center' ];
		var doExit = false;

		Array.prototype.forEach.call( elements, function( el ) {
			if ( ! el._ceElement ) {
				return;
			}

			if ( el._ceElement === root.dragging() ) {
				return;
			}
			// window.
			if ( window.pbsSelectorMatches( el, '.ce-element *, [data-ce-tag] *' ) ) {
				doExit = true;
				return;
			}

			var rect = el.getBoundingClientRect();
			var scrollY = window.scrollY || window.pageYOffset;

			var top = rect.top + scrollY;
			var bottom = top + rect.height;
			var left = rect.left;
			var right = left + rect.width;

			var elemX, elemY;

			// Find closest Y point to the pointer.
			if ( pointerY <= top ) {
				elemY = top;
			} else if ( pointerY >= bottom ) {
				elemY = bottom;
			} else {
				elemY = pointerY;
			}

			// Find closest X point to the pointer.
			if ( pointerX <= left ) {
				elemX = left;
			} else if ( pointerX >= right ) {
				elemX = right;
			} else {
				elemX = pointerX;
			}

			// Compute distance.
			var dist = Math.pow( pointerX - elemX, 2 ) + Math.pow( pointerY - elemY, 2 );

			// If inside an element, don't do anything.
			if ( dist === 0 ) {
				doExit = true;
				return;
			}

			// Find the nearest element.
			if ( dist < closestDistance ) {
				closestDistance = dist;
				closestElement = el._ceElement;
				placement[0] = pointerY <= top + rect.height / 2 ? 'above' : 'below';
			}
		} );

		if ( doExit ) {
			return;
		}

		// Show the drop indicator on the closest element.
		if ( closestElement ) {
			root._dropTarget = closestElement;
			showDropIndicator( placement );
		}
	}, 30 );
	var mouseListener = function( ev ) {
		pbsOverElement( ev );
	};
	ContentTools.EditorApp.get().bind( 'start', function () {
		window.addEventListener( 'mousemove', mouseListener );
		window.addEventListener( 'mouseover', mouseListener );
	} );
	ContentTools.EditorApp.get().bind( 'stop', function () {
		window.removeEventListener( 'mousemove', mouseListener );
		window.removeEventListener( 'mouseover', mouseListener );
	} );
} )();

/* globals ContentTools, ContentEdit, PBSEditor */

window.addEventListener( 'DOMContentLoaded', function() {

	var origTitles = [];

	// Titles SHOULD be h1, but also try h2, h3, h4.
	var findInThese = [ 'h1', 'h2', 'h3', 'h4', '' ];
	var titleMarkers = null;
	for ( var i = 0; i < findInThese.length; i++ ) {
		if ( document.querySelectorAll( findInThese[ i ] + ' [data-pbs-title-marker-post-id]' ).length ) {
			titleMarkers = document.querySelectorAll( findInThese[ i ] + ' [data-pbs-title-marker-post-id]' );
		}
	}

	if ( ! titleMarkers ) {
		titleMarkers = document.querySelectorAll( '[data-pbs-title-marker-post-id]' );
	}

	// Change the structure from an HTML marker, into a class name marker.
	var titles = [];
	Array.prototype.forEach.call( titleMarkers, function( marker ) {

		var titleElement = marker.parentNode;
		var postID = marker.getAttribute( 'data-pbs-title-marker-post-id' );

		titleElement.classList.add( 'pbs-title-editor' );
		titleElement.getAttribute( 'pbs-post-id', postID );

		titles.push( titleElement );
	});

	// Remove all markers because we don't need them anymore.
	titleMarkers = document.querySelectorAll( '[data-pbs-title-marker-post-id]' );
	Array.prototype.forEach.call( titleMarkers, function( marker ) {
		marker.parentNode.removeChild( marker );
	} );

	if ( ! titles.length ) {
		return;
	}

	var editor = ContentTools.EditorApp.get();

	PBSEditor.Title = ( function() {

		function Title( domElement ) {
			this._domElement = domElement;
		}

		Title.prototype.mount = function() {
			this._domElement.setAttribute( 'contenteditable', 'true' );

			this._onPasteBound = Title.prototype._onPaste.bind( this );
			this._domElement.addEventListener( 'paste', this._onPasteBound );

			this._onKeyDownBound = Title.prototype._onKeyDown.bind( this );
			this._domElement.addEventListener( 'keydown', this._onKeyDownBound );

			this._onFocusBound = Title.prototype._onFocus.bind( this );
			this._domElement.addEventListener( 'focus', this._onFocusBound );

			this._onBlurBound = Title.prototype._onBlur.bind( this );
			this._domElement.addEventListener( 'blur', this._onBlurBound );

			this._onMouseEnterBound = Title.prototype._onMouseEnter.bind( this );
			this._domElement.addEventListener( 'mouseenter', this._onMouseEnterBound );

			this._onMouseLeaveBound = Title.prototype._onMouseLeave.bind( this );
			this._domElement.addEventListener( 'mouseleave', this._onMouseLeaveBound );
		};

		Title.prototype.unmount = function() {
			this._domElement.removeEventListener( 'paste', this._onKeyDownBound );
			this._domElement.removeEventListener( 'keydown', this._onKeyDownBound );
			this._domElement.removeEventListener( 'focus', this._onFocusBound );
			this._domElement.removeEventListener( 'blur', this._onBlurBound );
			this._domElement.removeEventListener( 'mouseenter', this._onMouseEnterBound );
			this._domElement.removeEventListener( 'mouseleave', this._onMouseLeaveBound );

			this._domElement.removeAttribute( 'contenteditable' );

			this._domElement.classList.remove( 'ce-element--focused' );
		};

		Title.prototype._onKeyDown = function( ev ) {
			if ( ev.ctrlKey || ev.metaKey ) {
				// R, I, B
				if ( [ 82, 73, 66 ].indexOf( ev.keyCode ) !== -1 ) {
					ev.preventDefault();
				}
				// Z (Undo should only work with the title only when focused)
				if ( [ 90 ].indexOf( ev.keyCode ) !== -1 ) {
					ev.stopPropagation();
				}
			}
		};

		// Turn all pastes into plain text for the title.
		// @see http://stackoverflow.com/questions/12027137/javascript-trick-for-paste-as-plain-text-in-execcommand
		Title.prototype._onPaste = function( ev ) {
			ev.preventDefault();
		    var text = '';
		    if ( ev.clipboardData || ev.originalEvent.clipboardData ) {
				text = ( ev.originalEvent || ev ).clipboardData.getData( 'text/plain' );
		    } else if ( window.clipboardData ) {
				text = window.clipboardData.getData( 'Text' );
		    }
		    if ( document.queryCommandSupported( 'insertText' ) ) {
				document.execCommand( 'insertText', false, text );
		    } else {
				document.execCommand( 'paste', false, text );
		    }
		};

		Title.prototype._onFocus = function() {
			var root = ContentEdit.Root.get();
			if ( root.focused() ) {
				root.focused().blur();
			}
			this._domElement.classList.add( 'ce-element--focused' );
			PBSEditor.Overlay.hideOtherOverlays( null );
		};

		Title.prototype._onBlur = function() {
			this._domElement.classList.remove( 'ce-element--focused' );
		};

		Title.prototype._onMouseEnter = function() {
			wp.hooks.doAction( 'pbs.element.over', this );
		};

		Title.prototype._onMouseLeave = function() {
		};

		Title.prototype.parent = function() {
			return null;
		};

		return Title;
	} )();


	for ( i = 0; i < titles.length; i++ ) {
		titles[ i ] = new PBSEditor.Title( titles[ i ] );
	}

	editor.bind( 'start', function() {
		origTitles = [];
		for ( var i = 0; i < titles.length; i++ ) {
			titles[ i ].mount();
			origTitles.push( titles[ i ]._domElement.textContent );
		}
	} );
	editor.bind( 'stop', function() {
		for ( var i = 0; i < titles.length; i++ ) {
			titles[ i ].unmount();
		}
	} );

	wp.hooks.addAction( 'pbs.save.payload', function( payload ) {
		for ( var i = titles.length - 1; i >= 0; i-- ) {
			if ( origTitles[ i ] !== titles[ i ]._domElement.textContent ) {
				payload.append( 'title', titles[ i ]._domElement.textContent );
				break;
			}
		}
	} );
} );

/* globals PBSEditor, __extends */

PBSEditor.Toolbar = ( function( _super ) {
	__extends( Toolbar, _super );

	function Toolbar( elementName, tools ) {
		Toolbar.__super__.constructor.call( this );
		this.tools = tools;
		this.elementName = elementName;
	}

	Toolbar.prototype.createElement = function() {
		var element = document.createElement( 'DIV' );
		element.classList.add( 'pbs-overlay-toolbar' );
		element.classList.add( 'pbs-toolbar-' + this.elementName.toLowerCase().replace( /[^\w\d]/, '-' ) );

		var buttonContainer = document.createElement( 'DIV' );
		buttonContainer.classList.add( 'pbs-toolbar-wrapper' );
		element.appendChild( buttonContainer );
		this._buttonContainer = buttonContainer;

		var tool;
		for ( var i = 0; i < this.tools.length; i++ ) {
			tool = document.createElement( 'DIV' );
			tool.classList.add( 'pbs-toolbar-tool' );

			if ( this.tools[ i ].label ) {
				tool.classList.add( 'pbs-toolbar-label' );
				tool.innerHTML = this.tools[ i ].label;
				buttonContainer.appendChild( tool );
				continue;
			}

			tool.classList.add( 'pbs-toolbar-tool-' + this.tools[ i ].id );
			if ( this.tools[ i ].tooltip ) {
				tool.setAttribute( 'data-tooltip', this.tools[ i ].tooltip );
			}
			tool.toolbar = this;
			tool.tool = this.tools[ i ];
			tool.addEventListener( 'click', function( ev ) {
				if ( this.tool.onClick ) {
					this.tool.onClick( tool.toolbar.element, this, ev );
					tool.toolbar.updatePosition( tool.toolbar.element );
				}
			}.bind( tool ) );
			tool.addEventListener( 'mousedown', function( ev ) {
				if ( this.tool.onMouseDown ) {
					this.tool.onMouseDown( tool.toolbar.element, this, ev );
					tool.toolbar.updatePosition( tool.toolbar.element );
				}
			}.bind( tool ) );
			tool.addEventListener( 'mouseenter', function( ev ) {
				if ( this.tool.onEnter ) {
					this.tool.onEnter( tool.toolbar.element, tool.toolbar, ev );
					tool.toolbar.updatePosition( tool.toolbar.element );
				}
			}.bind( tool ) );
			buttonContainer.appendChild( tool );
		}

		return element;
	};

	Toolbar.prototype.canApply = function( element ) {
		if ( ! Toolbar.__super__.canApply.call(this, element) ) {
			return false;
		}
		if ( ! element ) {
			element = this.element;
		}
		if ( ! element ) {
			return false;
		}

		if ( element.constructor.name === this.elementName ) {

			// Dynamic labels. Used for labels that change depending on what's selected.
			for ( var i = 0; i < this.tools.length; i++ ) {
				if ( typeof this.tools[ i ].label === 'function' ) {
					this._domElement.children[0].children[ i ].innerHTML = this.tools[ i ].label( element );
				}

				this._domElement.children[0].children[ i ].classList.remove( 'pbs-toolbar-tool-hide' );
				if ( typeof this.tools[ i ].display === 'function' ) {
					if ( ! this.tools[ i ].display( element ) ) {
						this._domElement.children[0].children[ i ].classList.add( 'pbs-toolbar-tool-hide' );
					}
				}
			}

			return true;
		}
		return false;
	};

	Toolbar.prototype._updateFirstLastButtons = function() {
		var button = this._buttonContainer.querySelector( '.pbs-toolbar-button-first' );
		if ( button ) {
			button.classList.remove( 'pbs-toolbar-button-first' );
		}
		button = this._buttonContainer.querySelector( '.pbs-toolbar-button-last' );
		if ( button ) {
			button.classList.remove( 'pbs-toolbar-button-last' );
		}

		for ( var i = 0; i < this._buttonContainer.children.length; i++ ) {
			if ( this._buttonContainer.children[ i ].offsetWidth !== 0 ) {
				this._buttonContainer.children[ i ].classList.add( 'pbs-toolbar-button-first' );
				break;
			}
		}
		for ( i = this._buttonContainer.children.length - 1; i >= 0; i-- ) {
			if ( this._buttonContainer.children[ i ].offsetWidth !== 0 ) {
				this._buttonContainer.children[ i ].classList.add( 'pbs-toolbar-button-last' );
				break;
			}
		}
	};

	Toolbar.prototype.show = function( element ) {
		Toolbar.__super__.show.call( this, element );
		this._updateFirstLastButtons();
	};

	Toolbar.prototype._mouseenter = function( ev ) {
		Toolbar.__super__._mouseenter.call( this, ev );
		this._updateFirstLastButtons();
	};

	return Toolbar;

} )( PBSEditor.OverlayControls );

/* globals ContentTools, PBSEditor, __extends, pbsParams */

PBSEditor.ToolbarElement = ( function( _super ) {
	__extends( ToolbarElement, _super );

	var toolbars = [];

	toolbars.push(
		{
			id: 'move',
			tooltip: pbsParams.labels.move,
			display: function( element ) {
				return ! element.content.isWhitespace();
			},
			onMouseDown: function( element, toolbar, ev ) {
				ev.stopPropagation();
				element.drag( ev.pageX, ev.pageY );
			}
		}
	);

	toolbars.push(
		{
			id: 'remove',
			tooltip: pbsParams.labels['delete'],
			onClick: function( element ) {
				element.parent().detach( element );
			}
		}
	);

	function ToolbarElement() {

		ToolbarElement.__super__.constructor.call( this,
			'Text',
			toolbars
		);
	}

	return ToolbarElement;

} )( PBSEditor.Toolbar );

/* globals PBSEditor, __extends, ContentTools, pbsParams */

PBSEditor.ToolbarImage = ( function( _super ) {
	__extends( ToolbarImage, _super );


	var toolbars = [];

	toolbars.push(
		{
			id: 'align-left',
			tooltip: pbsParams.labels.align_left,
			onClick: function( element ) {
				element.removeCSSClass( 'alignleft' );
				element.removeCSSClass( 'alignright' );
				element.removeCSSClass( 'aligncenter' );
				element.removeCSSClass( 'alignnone' );
				element.addCSSClass( 'alignleft' );
			}
		},
		{
			id: 'align-center',
			tooltip: pbsParams.labels.align_center,
			onClick: function( element ) {
				element.removeCSSClass( 'alignleft' );
				element.removeCSSClass( 'alignright' );
				element.removeCSSClass( 'aligncenter' );
				element.removeCSSClass( 'alignnone' );
				element.addCSSClass( 'aligncenter' );
			}
		},
		{
			id: 'align-right',
			tooltip: pbsParams.labels.align_right,
			onClick: function( element ) {
				element.removeCSSClass( 'alignleft' );
				element.removeCSSClass( 'alignright' );
				element.removeCSSClass( 'aligncenter' );
				element.removeCSSClass( 'alignnone' );
				element.addCSSClass( 'alignright' );
			}
		},
		{
			id: 'edit',
			tooltip: pbsParams.labels.edit,
			onClick: function( element ) {
				element.openMediaManager();
			}
		},
		{
			id: 'remove',
			tooltip: pbsParams.labels['delete'],
			onClick: function( element ) {
				element.parent().detach( element );
			}
		}
	);

	function ToolbarImage() {

		ToolbarImage.__super__.constructor.call( this,
			'Image',
			toolbars
		);
	}

	return ToolbarImage;

} )( PBSEditor.Toolbar );

/* globals PBSEditor, ContentTools, __extends, pbsParams */

PBSEditor.ToolbarNewsletter = ( function( _super ) {
	__extends( ToolbarNewsletter, _super );

	function ToolbarNewsletter() {

		ToolbarNewsletter.__super__.constructor.call( this,
			'Newsletter',
			[
				{
					label: pbsParams.labels.newsletter
				},
				{
					id: 'move',
					tooltip: pbsParams.labels.move,
					onMouseDown: function( element, toolbar, ev ) {
						ev.stopPropagation();
						element.drag( ev.pageX, ev.pageY );
					}
				},
				{
					id: 'settings',
					tooltip: pbsParams.labels.properties,
					onClick: function( element ) {
						ContentTools.EditorApp.get()._toolboxProperties.inspect( element );
					}
				},
				{
					id: 'remove',
					tooltip: pbsParams.labels['delete'],
					onClick: function( element ) {
						element.parent().detach( element );
					}
				}
			]
		);
	}

	return ToolbarNewsletter;

} )( PBSEditor.Toolbar );

/* globals PBSEditor, __extends, pbsParams */

PBSEditor.ToolbarHtml = ( function( _super ) {
	__extends( ToolbarHtml, _super );

	function ToolbarHtml() {

		ToolbarHtml.__super__.constructor.call( this,
			'Html',
			[
				{
					label: pbsParams.labels.html
				},
				{
					id: 'edit',
					tooltip: pbsParams.labels.edit,
					onClick: function( element ) {
						element.openEditor();
					}
				},
				{
					id: 'remove',
					tooltip: pbsParams.labels['delete'],
					onClick: function( element ) {
						element.parent().detach( element );
					}
				}
			]
		);
	}

	return ToolbarHtml;

} )( PBSEditor.Toolbar );

/* globals PBSEditor, __extends, pbsParams */

PBSEditor.ToolbarIframe = ( function( _super ) {
	__extends( ToolbarIframe, _super );

	function ToolbarIframe() {

		ToolbarIframe.__super__.constructor.call( this,
			'IFrame',
			[
				{
					label: pbsParams.labels.iframe
				},
				{
					id: 'edit',
					tooltip: pbsParams.labels.edit,
					onClick: function( element ) {
						element._onDoubleClick();
					}
				},
				{
					id: 'remove',
					tooltip: pbsParams.labels['delete'],
					onClick: function( element ) {
						element.parent().detach( element );
					}
				}
			]
		);
	}

	return ToolbarIframe;

} )( PBSEditor.Toolbar );

/* globals PBSEditor, __extends, pbsParams */

PBSEditor.ToolbarEmbed = ( function( _super ) {
	__extends( ToolbarEmbed, _super );

	function ToolbarEmbed() {

		ToolbarEmbed.__super__.constructor.call( this,
			'Embed',
			[
				{
					label: pbsParams.labels.embedded_url
				},
				{
					id: 'edit',
					tooltip: pbsParams.labels.edit,
					onClick: function( element ) {
						element._onDoubleClick();
					}
				},
				{
					id: 'remove',
					tooltip: pbsParams.labels['delete'],
					onClick: function( element ) {
						element.parent().detach( element );
					}
				}
			]
		);
	}

	return ToolbarEmbed;

} )( PBSEditor.Toolbar );

/* globals PBSEditor, __extends, ContentTools, pbsParams */

PBSEditor.ToolbarMap = ( function( _super ) {
	__extends( ToolbarMap, _super );

	function ToolbarMap() {

		ToolbarMap.__super__.constructor.call( this,
			'Map',
			[
				{
					label: pbsParams.labels.map
				},
				{
					id: 'settings',
					tooltip: pbsParams.labels.properties,
					onClick: function( element ) {
						ContentTools.EditorApp.get()._toolboxProperties.inspect( element );
					}
				},
				{
					id: 'remove',
					tooltip: pbsParams.labels['delete'],
					onClick: function( element ) {
						element.parent().detach( element );
					}
				}
			]
		);
	}

	return ToolbarMap;

} )( PBSEditor.Toolbar );

/* globals PBSEditor, __extends, ContentTools, pbsParams */

PBSEditor.ToolbarIcon = ( function( _super ) {
	__extends( ToolbarIcon, _super );

	function ToolbarIcon() {

		ToolbarIcon.__super__.constructor.call( this,
			'Icon',
			[
				{
					label: pbsParams.labels.icon
				},
				{
					id: 'settings',
					tooltip: pbsParams.labels.properties,
					onClick: function( element ) {
						ContentTools.EditorApp.get()._toolboxProperties.inspect( element );
					}
				},
				{
					id: 'edit',
					tooltip: 'Edit',
					onClick: function( element ) {
						element._onDoubleClick();
					}
				},
				{
					id: 'clone',
					tooltip: pbsParams.labels.clone,
					onClick: function( element ) {
						element.clone();
					}
				},
				{
					id: 'remove',
					tooltip: pbsParams.labels['delete'],
					onClick: function( element ) {
						element.parent().detach( element );
					}
				}
			]
		);
	}

	ToolbarIcon.prototype.canApply = function( element ) {
		var ret = ToolbarIcon.__super__.canApply.call( this, element );
		if ( ret ) {
			this._domElement.classList.remove( 'pbs-small-toolbar' );
			var rect = this._domElement.getBoundingClientRect();
			if ( rect.width < 130 ) {
				this._domElement.classList.add( 'pbs-small-toolbar' );
			}
		}
		return ret;
	};

	return ToolbarIcon;

} )( PBSEditor.Toolbar );

/* globals PBSEditor, PBSInspectorOptions, __extends, ContentTools, pbsParams */

PBSEditor.ToolbarShortcode = ( function( _super ) {
	__extends( ToolbarShortcode, _super );

	function ToolbarShortcode() {

		ToolbarShortcode.__super__.constructor.call( this,
			'Shortcode',
			[
				{
					label: function( element ) {
						var label = wp.hooks.applyFilters( 'pbs.toolbar.shortcode.label', element.sc_base );

						// Use the label of the shortcode if it is provided.
						if ( PBSInspectorOptions.Shortcode[ element.sc_base ] ) {
							if ( PBSInspectorOptions.Shortcode[ element.sc_base ].label ) {
								label = wp.hooks.applyFilters( 'pbs.toolbar.shortcode.label', PBSInspectorOptions.Shortcode[ element.sc_base ].label );
							}
						}

						return label;
					}
				},
				{
					id: 'settings',
					tooltip: pbsParams.labels.properties,
					onClick: function( element ) {
						ContentTools.EditorApp.get()._toolboxProperties.inspect( element );
					}
				},
				{
					id: 'edit',
					tooltip: pbsParams.labels.edit,
					onClick: function( element ) {
						element.convertToText();
					}
				},
				{
					id: 'clone',
					tooltip: pbsParams.labels.clone,
					onClick: function( element ) {
						element.clone();
					}
				},
				{
					id: 'remove',
					tooltip: pbsParams.labels['delete'],
					onClick: function( element ) {
						element.parent().detach( element );
					}
				}
			]
		);
	}

	return ToolbarShortcode;

} )( PBSEditor.Toolbar );

/* globals PBSEditor, __extends, ContentTools, pbsParams */

PBSEditor.ToolbarList = ( function( _super ) {
	__extends( ToolbarList, _super );

	function ToolbarList() {

		ToolbarList.__super__.constructor.call( this,
			'List',
			[
				{
					label: pbsParams.labels.list
				},
				{
					id: 'move',
					tooltip: pbsParams.labels.move,
					onMouseDown: function( element, toolbar, ev ) {
						ev.stopPropagation();
						element.drag( ev.pageX, ev.pageY );
					}
				},
				{
					id: 'settings',
					tooltip: pbsParams.labels.properties,
					onClick: function( element ) {
						ContentTools.EditorApp.get()._toolboxProperties.inspect( element );
					}
				},
				{
					id: 'remove',
					tooltip: pbsParams.labels['delete'],
					onClick: function( element ) {
						element.parent().detach( element );
					}
				}
			]
		);
	}

	return ToolbarList;

} )( PBSEditor.Toolbar );

/* globals PBSEditor, __extends, ContentTools, pbsParams, ContentEdit */

PBSEditor.ToolbarRow = ( function( _super ) {
	__extends( ToolbarRow, _super );

	function ToolbarRow() {

		this._alreadyShown = false;
		ToolbarRow.__super__.constructor.call( this,
			'DivRow',
			[

				/**
				 * Carousel Settings.
				 */
				{
					'class': 'pbs-toolbar-yellow',
					display: function( element ) {
						// Only show when inside a carousel.
						if ( element.parent() ) {
							return element.parent()._domElement.classList.contains( 'glide__slide' );
						}
					},
					label: function() {
						return pbsParams.labels.carousel;
					}
				},
				{
					id: 'move',
					tooltip: pbsParams.labels.move_carousel,
					'class': 'pbs-toolbar-yellow',
					display: function( element ) {
						// Only show when inside a carousel.
						return element.parent()._domElement.classList.contains( 'glide__slide' );
					},
					onMouseDown: function( element, toolbar, ev ) {
						ev.stopPropagation();
						var o = element.parent().parent().parent().parent();
						o.drag( ev.pageX, ev.pageY );
					}
				},
				{
					id: 'settings',
					tooltip: pbsParams.labels.properties,
					'class': 'pbs-toolbar-yellow',
					display: function( element ) {
						// Only show when inside a carousel.
						return element.parent()._domElement.classList.contains( 'glide__slide' );
					},
					onClick: function( element ) {
						var o = element.parent().parent().parent().parent();
						ContentTools.EditorApp.get()._toolboxProperties.inspect( o );
					}
				},
				{
					id: 'minus',
					tooltip: pbsParams.labels.remove_slide,
					'class': 'pbs-toolbar-yellow',
					display: function( element ) {
						// Only show when inside a carousel and when we have more than 1 slide.
						if ( element.parent()._domElement.classList.contains( 'glide__slide' ) ) {
							var o = element.parent().parent().parent().parent();
							return o.numSlides() > 1;
						}
						return false;
					},
					onClick: function( element ) {
						var o = element.parent().parent().parent().parent();
						o.removeSlide( o.activeSlide() );
					}
				},
				{
					id: 'add',
					tooltip: pbsParams.labels.add_slide,
					'class': 'pbs-toolbar-yellow',
					display: function( element ) {
						// Only show when inside a carousel.
						return element.parent()._domElement.classList.contains( 'glide__slide' );
					},
					onClick: function( element ) {
						var o = element.parent().parent().parent().parent();
						o.addSlide();
					}
				},
				{
					id: 'clone',
					tooltip: pbsParams.labels.clone_slide,
					'class': 'pbs-toolbar-yellow',
					display: function( element ) {
						// Only show when inside a carousel.
						return element.parent()._domElement.classList.contains( 'glide__slide' );
					},
					onClick: function( element ) {
						var o = element.parent().parent().parent().parent();
						o.cloneSlide( o.activeSlide() );
					}
				},
				{
					id: 'remove',
					tooltip: pbsParams.labels.delete_carousel,
					'class': 'pbs-toolbar-yellow',
					display: function( element ) {
						// Only show when inside a carousel.
						return element.parent()._domElement.classList.contains( 'glide__slide' );
					},
					onClick: function( element ) {
						var o = element.parent().parent().parent().parent();
						o.parent().detach( o );
					}
				},




				{
					label: pbsParams.labels.row
				},
				{
					id: 'move',
					tooltip: pbsParams.labels.move,
					display: function( element ) {
						// Hide when the row is inside a carousel.
						if ( element.parent()._domElement.classList.contains( 'glide__slide' ) ) {
							return false;
						}
						// Hide when the row is inside tabs.
						if ( element.parent().constructor.name === 'TabPanelContainer' ) {
							return false;
						}
						// Hide when the row is inside a toggle.
						if ( element.parent().constructor.name === 'Toggle' ) {
							return false;
						}
						return true;
					},
					onMouseDown: function( element, toolbar, ev ) {
						ev.stopPropagation();
						element.drag( ev.pageX, ev.pageY );
					}
				},
				{
					id: 'settings',
					tooltip: pbsParams.labels.properties,
					onClick: function( element ) {
						ContentTools.EditorApp.get()._toolboxProperties.inspect( element );
					}
				},
				{
					id: 'add',
					tooltip: pbsParams.labels.add_column,
					onClick: function( element ) {
						var overElement = element._domElement.querySelector( '.ce-element--over' );
						if ( overElement ) {
							overElement.classList.remove('ce-element--over');
						}
						var root = ContentEdit.Root.get();
						var index = element.children.length + 1;
						var col;
						if ( root.focused() ) {
							col = root.focused();
							while ( col.constructor.name !== 'Region' && col.constructor.name !== 'DivRow' ) {
								if ( col.constructor.name === 'DivCol' ) {
									index = element.children.indexOf( col ) + 1;
									break;
								}
								col = col.parent();
							}
						}
						col = element.addNewColumn( index );
					}
				},
				{
					id: 'clone',
					tooltip: pbsParams.labels.clone_row,
					display: function( element ) {
						// Hide when the row is inside a carousel.
						if ( element.parent()._domElement.classList.contains( 'glide__slide' ) ) {
							return false;
						}
						// Hide when the row is inside tabs.
						if ( element.parent().constructor.name === 'TabPanelContainer' ) {
							return false;
						}
						// Hide when the row is inside a toggle.
						if ( element.parent().constructor.name === 'Toggle' ) {
							return false;
						}
						return true;
					},
					onClick: function( element ) {
						var newRow = element.clone();
						window._pbsFixRowWidth( newRow._domElement );
					}
				},
				{
					id: 'remove',
					tooltip: pbsParams.labels['delete'],
					display: function( element ) {
						// Hide when the row is inside a carousel.
						if ( element.parent()._domElement.classList.contains( 'glide__slide' ) ) {
							return false;
						}
						// Hide when the row is inside tabs.
						if ( element.parent().constructor.name === 'TabPanelContainer' ) {
							return false;
						}
						// Hide when the row is inside a toggle.
						if ( element.parent().constructor.name === 'Toggle' ) {
							return false;
						}
						return true;
					},
					onClick: function( element ) {
						element.parent().detach( element );
					}
				}
			]
		);
	}

	ToolbarRow.prototype.canApply = function( element ) {
		if ( ToolbarRow.__super__.show.call( this, this.element ) ) {
			return true;
		}

		if ( typeof element === 'undefined' ) {
			element = this.element;
		}
		if ( ! element ) {
			return false;
		}
		if ( element.constructor.name === 'DivRow' ) {
			return true;
		}

		// Since this is run on EVERY element that's on the "over stack",
		// only show this on the first ROW encountered.
		if ( this._alreadyShown ) {
			return true;
		}
		// this._alreadyShown = true;
		setTimeout( function() {
			this._alreadyShown = false;
		}.bind( this ), 10 );

		if ( element.constructor.name !== 'DivRow' ) {
			element = element.parent();
			while ( element && element.constructor.name !== 'Region' ) {
				if ( element.constructor.name === 'DivRow' ) {
					break;
				}
				element = element.parent();
			}
			if ( ! element || element.constructor.name === 'Region' ) {
				this._hide();
				return;
			}
			this.element = element;
			this._alreadyShown = true;
			return true;
		}

		if ( element ) {
			if ( element.parent() ) {
				if ( element.parent().constructor.name === 'Div' ) {
					return false;
				}
			}
		}
/*
		var parent = element.parent();
		element = null;
		while ( parent && parent.constructor.name !== 'Region' ) {
			if ( parent.constructor.name === 'DivRow' ) {
				element = parent;
				break;
			}
			parent = parent.parent();
		}
		if ( element ) {
			if ( element.parent() ) {
				if ( element.parent().constructor.name === 'Div' ) {
					return false;
				}
			}
		}
		*/
		return false;
	};

	ToolbarRow.prototype.applyTo = function( element ) {

		if ( element.constructor.name !== 'DivRow' ) {
			element = element.parent();
			while ( element && element.constructor.name !== 'Region' ) {
				if ( element.constructor.name === 'DivRow' ) {
					break;
				}
				element = element.parent();
			}
		} else {
			// this.element = element;
		}

		if ( element.constructor.name === 'Region' ) {
			return null;
		}

		// Since this is run on EVERY element that's on the "over stack",
		// only show this on the first ROW encountered.
		if ( this._alreadyShown2 ) {
			return this.element;
		}
		this._alreadyShown2 = true;
		setTimeout( function() {
			this._alreadyShown2 = false;
		}.bind( this ) );

		// Dynamic labels. Used for labels that change depending on what's selected.
		for ( var i = 0; i < this.tools.length; i++ ) {

			if ( this.tools[ i ]['class'] ) {
				this._domElement.children[0].children[ i ].classList.add( this.tools[ i ]['class'] );
			}

			if ( typeof this.tools[ i ].label === 'function' ) {
				this._domElement.children[0].children[ i ].innerHTML = this.tools[ i ].label( element );
			}

			if ( typeof this.tools[ i ].tooltip === 'function' ) {
				this._domElement.children[0].children[ i ].setAttribute( 'data-tooltip', this.tools[ i ].tooltip( element ) );
			}

			this._domElement.children[0].children[ i ].classList.remove( 'pbs-toolbar-tool-hide' );
			if ( typeof this.tools[ i ].display === 'function' ) {
				if ( ! this.tools[ i ].display( element ) ) {
					this._domElement.children[0].children[ i ].classList.add( 'pbs-toolbar-tool-hide' );
				}
			}
		}

		return element;
	};

	return ToolbarRow;

} )( PBSEditor.Toolbar );

/* globals PBSEditor, __extends, ContentTools, pbsParams */

PBSEditor.ToolbarColumn = ( function( _super ) {
	__extends( ToolbarColumn, _super );

	function ToolbarColumn() {

		this._alreadyShown2 = false;
		ToolbarColumn.__super__.constructor.call( this,
			'DivCol',
			[
				{
					label: pbsParams.labels.column
				},
				{
					id: 'settings',
					tooltip: pbsParams.labels.properties,
					onClick: function( element ) {
						ContentTools.EditorApp.get()._toolboxProperties.inspect( element );
					}
				},
				{
					id: 'clone',
					tooltip: pbsParams.labels.clone,
					onClick: function( element ) {
						element._domElement.classList.remove('ce-element--over');
						var col = element.clone();
						col.focus();
						col._domElement.classList.add('ce-element--over');
					}
				},
				{
					id: 'remove',
					tooltip: pbsParams.labels['delete'],
					display: function( element ) {

						if ( element.parent() && element.parent().parent() ) {

							// If the row is inside a carousel, don't show the delete button
							// if we only have 1 column left so as not to have the row deleted.
							if ( element.parent().parent()._domElement.classList.contains( 'glide__slide' ) ) {
								return element.parent().children.length > 1;
							}

							// If the row is inside tabs, don't show the delete button
							// if we only have 1 column left so as not to have the row deleted.
							if ( element.parent().parent().constructor.name === 'TabPanelContainer' ) {
								return element.parent().children.length > 1;
							}

							// If the row is inside a toggle, don't show the delete button
							// if we only have 1 column left so as not to have the row deleted.
							if ( element.parent().parent().constructor.name === 'Toggle' ) {
								return element.parent().children.length > 1;
							}
						}

						return true;
					},
					onClick: function( element ) {
						element.parent().detach( element );
					}
				}
			]
		);
	}

	ToolbarColumn.prototype.canApply = function( element ) {

		if ( ToolbarColumn.__super__.show.call( this, this.element ) ) {
			return true;
		}

		if ( typeof element === 'undefined' ) {
			element = this.element;
		}
		if ( ! element ) {
			return false;
		}
		if ( element.constructor.name === 'DivCol' ) {
			return true;
		}

		// Since this is run on EVERY element that's on the "over stack",
		// only show this on the first ROW encountered.
		if ( this._alreadyShown ) {
			return true;
		}
		// this._alreadyShown = true;
		setTimeout( function() {
			this._alreadyShown = false;
		}.bind( this ) );

		if ( element.constructor.name !== 'DivCol' ) {
			element = element.parent();
			while ( element && element.constructor.name !== 'Region' ) {
				if ( element.constructor.name === 'DivCol' ) {
					break;
				}
				element = element.parent();
			}
			if ( ! element || element.constructor.name === 'Region' ) {
				this._hide();
				return;
			}
			this.element = element;
			this._alreadyShown = true;
			return true;
		}

		return false;
	};

	ToolbarColumn.prototype.applyTo = function( element ) {

		if ( element.constructor.name !== 'DivCol' ) {
			element = element.parent();
			while ( element && element.constructor.name !== 'Region' ) {
				if ( element.constructor.name === 'DivCol' ) {
					break;
				}
				element = element.parent();
			}
		} else {
			// this.element = element;
		}

		// Since this is run on EVERY element that's on the "over stack",
		// only show this on the first ROW encountered.
		if ( this._alreadyShown2 ) {
			return this.element;
		}
		this._alreadyShown2 = true;
		setTimeout( function() {
			this._alreadyShown2 = false;
		}.bind( this ) );

		// Dynamic labels. Used for labels that change depending on what's selected.
		for ( var i = 0; i < this.tools.length; i++ ) {
			this._domElement.children[0].children[ i ].classList.remove( 'pbs-toolbar-tool-hide' );
			if ( typeof this.tools[ i ].display === 'function' ) {
				if ( ! this.tools[ i ].display( element ) ) {
					this._domElement.children[0].children[ i ].classList.add( 'pbs-toolbar-tool-hide' );
				}
			}
		}

		return element;
	};


	ToolbarColumn.prototype.show = function( element ) {
		ToolbarColumn.__super__.show.call( this, element );
		this.checkToolbarSize( element );
	};


	ToolbarColumn.prototype.checkToolbarSize = function( element ) {

		var colToolbar = document.querySelector( '.pbs-toolbar-divcol.pbs-quick-action-overlay .pbs-toolbar-wrapper' );
		var rowToolbar = document.querySelector( '.pbs-toolbar-divrow.pbs-quick-action-overlay .pbs-toolbar-wrapper' );

		this._domElement.classList.remove( 'pbs-small-toolbar' );
		rowToolbar.parentNode.classList.remove( 'pbs-small-toolbar' );
		this._domElement.classList.remove( 'pbs-smaller-toolbar' );
		rowToolbar.parentNode.classList.remove( 'pbs-smaller-toolbar' );
		this._domElement.classList.remove( 'pbs-tiny-toolbar' );
		rowToolbar.parentNode.classList.remove( 'pbs-tiny-toolbar' );

		var ret = ToolbarColumn.__super__.show.call( this, element );

		var colRect = colToolbar.getBoundingClientRect();
		var rowRect = rowToolbar.getBoundingClientRect();

		if ( colRect.left - rowRect.right < 0 ) {
			colToolbar.parentNode.classList.add( 'pbs-small-toolbar' );
			rowToolbar.parentNode.classList.add( 'pbs-small-toolbar' );
		} else {
			return ret;
		}

		colRect = colToolbar.getBoundingClientRect();
		rowRect = rowToolbar.getBoundingClientRect();

		if ( colRect.left - rowRect.right < 0 ) {
			colToolbar.parentNode.classList.remove( 'pbs-small-toolbar' );
			rowToolbar.parentNode.classList.remove( 'pbs-small-toolbar' );
			colToolbar.parentNode.classList.add( 'pbs-smaller-toolbar' );
			rowToolbar.parentNode.classList.add( 'pbs-smaller-toolbar' );
		} else {
			return ret;
		}

		colRect = colToolbar.getBoundingClientRect();
		rowRect = rowToolbar.getBoundingClientRect();

		if ( colRect.left - rowRect.right < 0 ) {
			colToolbar.parentNode.classList.remove( 'pbs-smaller-toolbar' );
			rowToolbar.parentNode.classList.remove( 'pbs-smaller-toolbar' );
			colToolbar.parentNode.classList.add( 'pbs-tiny-toolbar' );
			rowToolbar.parentNode.classList.add( 'pbs-tiny-toolbar' );
		}

		return ret;
	};

	return ToolbarColumn;

} )( PBSEditor.Toolbar );

/* globals PBSEditor, __extends, ContentTools, pbsParams */

PBSEditor.ToolbarTabContainer = ( function( _super ) {
	__extends( ToolbarTabContainer, _super );

	var toolbar = [];

	toolbar.push(
		{
			label: pbsParams.labels.tabs
		},
		{
			id: 'move',
			tooltip: pbsParams.labels.move,
			onMouseDown: function( element, toolbar, ev ) {
				ev.stopPropagation();
				element.parent().drag( ev.pageX, ev.pageY );
			}
		},
		{
			id: 'add',
			tooltip: pbsParams.labels.add_tab,
			onClick: function( element ) {
				element.parent().addTab();
			}
		}
	);

	toolbar.push(
		{
			id: 'remove',
			tooltip: pbsParams.labels['delete'],
			onClick: function( element ) {
				element.parent().parent().detach( element.parent() );
			}
		}
	);

	function ToolbarTabContainer() {

		ToolbarTabContainer.__super__.constructor.call( this,
			'TabContainer',
			toolbar
		);
	}


	ToolbarTabContainer.prototype.applyTo = function( element ) {
		element = ToolbarTabContainer.__super__.applyTo.call( this, element );

		// Small toolbar when the column is small.
		var rect = element._domElement.getBoundingClientRect();
		this._domElement.classList.remove( 'pbs-small-toolbar' );
		// First element.
		if ( rect.width < 100 ) {
			this._domElement.classList.add( 'pbs-small-toolbar' );
		}

		return element;
	};

	return ToolbarTabContainer;

} )( PBSEditor.Toolbar );

/* globals PBSEditor, __extends, pbsParams */

PBSEditor.ToolbarTable = ( function( _super ) {
	__extends( ToolbarTable, _super );

	function ToolbarTable() {

		ToolbarTable.__super__.constructor.call( this,
			'Table',
			[
				{
					label: pbsParams.labels.table
				},
				{
					id: 'move',
					tooltip: pbsParams.labels.move,
					onMouseDown: function( element, toolbar, ev ) {
						ev.stopPropagation();
						element.drag( ev.pageX, ev.pageY );
					}
				},
				{
					id: 'remove',
					tooltip: pbsParams.labels['delete'],
					onClick: function( element ) {
						element.parent().detach( element );
					}
				}
			]
		);
	}

	return ToolbarTable;

} )( PBSEditor.Toolbar );

/* globals PBSEditor, __extends, ContentTools, pbsParams */

PBSEditor.ToolbarTitle = ( function( _super ) {
	__extends( ToolbarTitle, _super );

	function ToolbarTitle() {

		ToolbarTitle.__super__.constructor.call( this,
			'Title',
			[
				{
					label: 'Post Title', //pbsParams.labels.title
				}
			]
		);
	}

	return ToolbarTitle;

} )( PBSEditor.Toolbar );


/* globals ContentTools, PBSEditor, pbsSelectorMatches */

/**
 * The Tooltip API
 */
PBSEditor.Tooltip = ( function() {

    function Tooltip( name, selector, labelFunction, tools ) {
		this._domElement = null;
		this.name = name || this.constructor.name.toLowerCase();
		this.labelFunction = labelFunction || function() {};
		this.selector = selector || '';
		this.tools = tools || [];

		this.init();
    }

	Tooltip.prototype.init = function() {
		this._onMouseOverBound = this._onMouseOver.bind( this );
		this._onMouseOutBound = this._onMouseOut.bind( this );

		// Add/remove the event listeners to the editor.
		ContentTools.EditorApp.get().bind('start', function () {
			this._domElement = document.createElement( 'DIV' );
			this._domElement.classList.add( 'pbs-tooltip--' + this.name );
			this._domElement.classList.add( 'pbs-tooltip' );

			var label = document.createElement( 'DIV' );
			this._domElement.appendChild( label );

			for ( var i = 0; i < this.tools.length; i++ ) {
				var tool = document.createElement( 'DIV' );
				tool.classList.add( 'pbs-tooltip-button' );
				tool.classList.add( 'pbs-tooltip-button-' + this.tools[ i ].name );
				tool.addEventListener( 'click', this.tools[ i ].onClick.bind( this ) );
				this._domElement.appendChild( tool );
			}

			document.body.appendChild( this._domElement );

			document.addEventListener( 'mouseover', this._onMouseOverBound );
			document.addEventListener( 'mouseout', this._onMouseOutBound );
		}.bind( this ) );
		ContentTools.EditorApp.get().bind('stop', function () {
			this.hide();
			document.removeEventListener( 'mouseover', this._onMouseOverBound );
			document.removeEventListener( 'mouseout', this._onMouseOutBound );

			this._domElement.parentNode.removeChild( this._domElement );
			this._domElement = null;
		}.bind( this ) );
	};

	Tooltip.prototype._onMouseOver = function( ev ) {
		// Find whether the selector matches the element (or any of it's parents).
		if ( pbsSelectorMatches( ev.target, '.pbs-main-wrapper ' + this.selector + ', .pbs-main-wrapper ' + this.selector + ' *' ) ) {
			var target = ev.target;

			// Find the element that matched (if a child matched).
			while ( ! pbsSelectorMatches( target, '.pbs-main-wrapper ' + this.selector ) ) {
				target = target.parentNode;
			}

			this.show( target );
		}
	};

	/**
	 * Hide tooltip on mouse out.
	 */
	Tooltip.prototype._onMouseOut = function( ev ) {

		// Out of bounds.
		if ( ! ev.relatedTarget ) {
			this.hide();
			return;
		}

		// pbs-button -> tooltip / tooltip-button
		if ( pbsSelectorMatches( ev.target, '.pbs-main-wrapper ' + this.selector ) || pbsSelectorMatches( ev.target, '.pbs-main-wrapper ' + this.selector + ' *' ) ) {
			if ( ev.relatedTarget === this._domElement || this._domElement.contains( ev.relatedTarget ) ) {
				return;
			}
		}
		// tooltip / tooltip-button -> pbs-button
		if ( this._domElement === ev.target || this._domElement.contains( ev.target ) ) {
			if ( pbsSelectorMatches( ev.relatedTarget, '.pbs-main-wrapper ' + this.selector ) || pbsSelectorMatches( ev.relatedTarget, '.pbs-main-wrapper ' + this.selector + ' *' ) ) {
				return;
			}
		}
		// tooltip <-> tooltip-button
		if ( this._domElement === ev.target || this._domElement.contains( ev.target ) ) {
			if ( this._domElement === ev.relative || this._domElement.contains( ev.relatedTarget ) ) {
				return;
			}
		}

		this.hide();
	};

	Tooltip.prototype.show = function( domElementTarget ) {
		var rect = domElementTarget.getBoundingClientRect();
		var toolbar = getComputedStyle( document.querySelector( '.pbs-toolbox-bar' ) );
		var toolbarHeight = parseInt( toolbar.height, 10 );
		var scrollY = window.scrollY || window.pageYOffset;

		this._domElement.style.top = ( rect.top + scrollY - toolbarHeight ) + 'px';
		this._domElement.style.left = ( rect.left + rect.width / 2 ) + 'px';

		if ( typeof this.labelFunction === 'function' ) {
			this._domElement.firstChild.innerHTML = this.labelFunction( domElementTarget );
		} else {
			this._domElement.firstChild.innerHTML = this.labelFunction;
		}
		this._domElement.classList.add( 'pbs-tooltip-show' );
		this.element = domElementTarget;
	};

	Tooltip.prototype.hide = function() {
		this._domElement.classList.remove( 'pbs-tooltip-show' );
	};

	return Tooltip;

} )();

/* globals PBSEditor, ContentSelect, ContentTools, __extends */

PBSEditor.TooltipLink = ( function( _super ) {
	__extends( TooltipLink, _super );

    function TooltipLink() {
		TooltipLink.__super__.constructor.call( this,
		 	'link',
			'.ce-element--type-text a:not(.pbs-button)',
			function( element ) {
				var link = element.getAttribute( 'href' );
				if ( link.length > 70 ) {
					link = link.substr( 0, 70 ) + '...';
				}
				return link;
			},
			[
				{
					name: 'visit',
					onClick: function() {
						window.open( this.element.getAttribute( 'href' ), '_linktool' );
						this.hide();
					}
				},
				{
					name: 'edit',
					onClick: function() {

						// Find ce-element parent
						var domElement = this.element;
						while ( ! domElement._ceElement ) {
							domElement = domElement.parentNode;
						}

						// Select the link.
						var index = domElement._ceElement.content.indexOf( this.element.innerHTML );
						var selection = new ContentSelect.Range( index, index );
						selection.select( domElement );

						// Open the link editor.
						window.PBSEditor.getToolUI( 'link' ).apply( domElement._ceElement, selection, function() { } );

						this.hide();
					}
				},
				{
					name: 'unlink',
					onClick: function() {

						// Find ce-element parent
						var domElement = this.element;
						while ( ! domElement._ceElement ) {
							domElement = domElement.parentNode;
						}

						// Get the link position.
						var index = domElement._ceElement.content.indexOf( this.element.innerHTML );

						// The start should be the start of the link block.
						var selected = ContentTools.Tools.Link.getSelectedLink( domElement._ceElement, index, index );
						var from = selected.from;
						var to = selected.to;

						// Remove the link.
						domElement._ceElement.content = domElement._ceElement.content.unformat( from, to, 'a' );
						domElement._ceElement.updateInnerHTML();
						domElement._ceElement.taint();

						this.hide();
					}
				}
			]
		);
    }

	return TooltipLink;

} )( PBSEditor.Tooltip );

/* globals PBSEditor, ContentSelect, ContentTools, __extends */

PBSEditor.TooltipButton = ( function( _super ) {
	__extends( TooltipButton, _super );

    function TooltipButton() {
		TooltipButton.__super__.constructor.call( this,
		 	'button',
			'a.pbs-button',
			function( element ) {
				var link = element.getAttribute( 'href' );
				if ( link.length > 70 ) {
					link = link.substr( 0, 70 ) + '...';
				}
				return link;
			},
			[
				{
					name: 'settings',
					onClick: function() {
						ContentTools.EditorApp.get()._toolboxProperties.inspect( this.element );
					}
				},
				{
					name: 'visit',
					onClick: function() {
						window.open( this.element.getAttribute( 'href' ), '_linktool' );
						this.hide();
					}
				},
				{
					name: 'edit',
					onClick: function() {

						// Find ce-element parent
						var domElement = this.element;
						while ( ! domElement._ceElement ) {
							domElement = domElement.parentNode;
						}

						// Select the link.
						var index = domElement._ceElement.content.indexOf( this.element.innerHTML );
						var selection = new ContentSelect.Range( index, index );
						selection.select( domElement );

						// Open the link editor.
						window.PBSEditor.getToolUI( 'link' ).apply( domElement._ceElement, selection, function() { } );

						this.hide();
					}
				},
				{
					name: 'unlink',
					onClick: function() {

						// Find ce-element parent
						var domElement = this.element;
						while ( ! domElement._ceElement ) {
							domElement = domElement.parentNode;
						}

						// Get the link position.
						var index = domElement._ceElement.content.indexOf( this.element.innerHTML );

						// The start should be the start of the link block.
						var selected = ContentTools.Tools.Link.getSelectedLink( domElement._ceElement, index, index );
						var from = selected.from;
						var to = selected.to;

						// Remove the link.
						domElement._ceElement.content = domElement._ceElement.content.unformat( from, to, 'a' );
						domElement._ceElement.updateInnerHTML();
						domElement._ceElement.taint();

						this.hide();
					}
				}
			]
		);
    }

	return TooltipButton;

} )( PBSEditor.Tooltip );

/* globals PBSEditor, ContentTools, __extends, pbsParams */

PBSEditor.TooltipInput = ( function( _super ) {
	__extends( TooltipInput, _super );

    function TooltipInput() {
		TooltipInput.__super__.constructor.call( this,
		 	'input',
			'p[class*="ce-element--"] input[type="text"]',
			pbsParams.labels.input_field,
			[
				{
					name: 'settings',
					onClick: function() {
						ContentTools.EditorApp.get()._toolboxProperties.inspect( this.element );
					}
				}
			]
		);
    }

	return TooltipInput;

} )( PBSEditor.Tooltip );

/* globals PBSEditor, __extends, pbsParams */

PBSEditor.TooltipTab = ( function( _super ) {
	__extends( TooltipTab, _super );

    function TooltipTab() {
		TooltipTab.__super__.constructor.call( this,
		 	'button',
			'[data-ce-tag="tab"]',
			pbsParams.labels.tab,
			[
				{
					name: 'remove',
					onClick: function() {
						this.element._ceElement.parent().parent().removeTab( this.element._ceElement );
						this.hide();
					}
				}
			]
		);
    }

	return TooltipTab;

} )( PBSEditor.Tooltip );

/* globals ContentEdit, AOS */

document.addEventListener( 'DOMContentLoaded', function() {

	// Update when something gets deleted.
	ContentEdit.Root.get().bind( 'detach', function() {
		if ( typeof AOS !== 'undefined' ) {
			AOS.refresh();
		}
	} );
} );

/* globals ContentEdit, ContentSelect, PBSEditor */


/**
 * These are additional behavior adjustments for newly introduced block elements
 * for CT (e.g. Shortcode & Embed elements).
 *
 * Behaviors added are for handling keypresses when the element is selected, etc.
 */


/**
 * All elements are placed here. Helpful for specifying droppers for new elements.
 */
PBSEditor.allDroppers = {
	'Carousel': ContentEdit.Element._dropVert,
	'DivRow': ContentEdit.Element._dropVert,
	'Div': ContentEdit.Element._dropVert,
	'Embed': ContentEdit.Element._dropVert,
	'Hr': ContentEdit.Element._dropVert,
	'IFrame': ContentEdit.Element._dropVert,
	'Shortcode': ContentEdit.Element._dropVert,
	'Static': ContentEdit.Element._dropVert,
	'Text': ContentEdit.Element._dropVert,
	'Image': ContentEdit.Element._dropVert,
	'List': ContentEdit.Element._dropVert,
	'PreText': ContentEdit.Element._dropVert,
	'Table': ContentEdit.Element._dropVert,
	'Video': ContentEdit.Element._dropVert,
	'Tabs': ContentEdit.Element._dropVert,
	'Toggle': ContentEdit.Element._dropVert
};


/**
 * Check if this is one of our new elements.
 * Our new elements are all derived from the ContentEdit.Static class.
 */
PBSEditor.isNewStaticLikeElement = function( element ) {
	if ( element.constructor.name === 'Static' ) {
		return false;
	}
	if ( typeof element._content === 'undefined' ) {
		return false;
	}
	return true;
};


/********************************************************************************
 * Handle moving left/up into an element.
 ********************************************************************************/
ContentEdit.Text.prototype._elementOverrideKeyLeft = ContentEdit.Text.prototype._keyLeft;
ContentEdit.Text.prototype._keyLeft = function(ev) {
	var selection = ContentSelect.Range.query(this._domElement);

	if ( selection.get()[0] === 0 ) {
		var elem = this.previousContent();
		if ( elem ) {
			if ( PBSEditor.isNewStaticLikeElement( elem ) ) {
				ev.preventDefault();
				ev.stopPropagation(); // We need this or else the SC won't get focused
				elem.focus();
				return;
			}
		}
	}

	return this._elementOverrideKeyLeft(ev);
};


/********************************************************************************
 * Handle moving right/down into an element.
 ********************************************************************************/
ContentEdit.Text.prototype._elementOverrideKeyRight = ContentEdit.Text.prototype._keyRight;
ContentEdit.Text.prototype._keyRight = function(ev) {
	var selection = ContentSelect.Range.query(this._domElement);

	if ( this._atEnd(selection) ) {
		var elem = this.nextContent();
		if ( elem ) {
			if ( PBSEditor.isNewStaticLikeElement( elem ) ) {
				ev.preventDefault();
				ev.stopPropagation(); // We need this or else the SC won't get focused
				elem.focus();
				return;
			}
		}
	}

	return this._elementOverrideKeyRight(ev);
};


/*******************************************************************************************
 * Handle keypresses when an Element is focused.
 * We cannot handle keypresses inside the element since it cannot be focused.
 *******************************************************************************************/
window.addEventListener( 'DOMContentLoaded', function() {
	var editor = ContentEdit.Root.get();
	document.addEventListener('keydown', function(ev) {

		if ( ! editor.focused() ) {
			return;
		}
		if ( ev.target ) {
			if ( ['INPUT', 'TEXTAREA'].indexOf( ev.target.tagName ) !== -1 ) {
				return;
			}
		}

		if ( ! PBSEditor.isNewStaticLikeElement( editor.focused() ) ) {
			return;
		}

		// Only continue when nothing's selected
		if ( ['body', 'html'].indexOf( ev.target.tagName.toLowerCase() ) === -1 ) {
			return;
		}

		// Don't handle individual shift, alt, ctrl, command/window keypresses.
		if ( [16, 17, 18, 91, 92].indexOf( ev.which ) !== -1 ) {
			return;
		}

		var sc = editor.focused(), p, elem, parent, selection,
			index = sc.parent().children.indexOf( sc );

		// Don't double return
		if ( [13, 8, 46].indexOf( ev.which ) !== -1 ) {
			ev.preventDefault();
		}

		// Delete & backspace deletes the element then move to the next/prev element.

		// Backspace, focus on the end of the previous element.
		if ( ev.which === 8 ) {
			sc.blur();
			if ( sc.parent().children[ index - 1 ] ) {
				elem = sc.parent().children[ index - 1 ];
				elem.focus();
				if ( elem.content ) {
			        selection = new ContentSelect.Range(elem.content.length(), elem.content.length());
			        selection.select(elem._domElement);
				}
			} else if ( sc.parent().children[ index + 1 ] ) {
				elem = sc.parent().children[ index + 1 ];
				elem.focus();
				if ( elem.content ) {
			        selection = new ContentSelect.Range(elem.content.length(), elem.content.length());
			        selection.select(elem._domElement);
				}
			} else { // no children
				parent = sc.parent();
				setTimeout( function() {
					parent.children[0].focus();
				}, 10 );
			}

		// Delete, focus on the start of the next element.
		} else if ( ev.which === 46 ) {
			sc.blur();
			if ( sc.parent().children[ index + 1 ] ) {
				sc.parent().children[ index + 1 ].focus();
			} else if ( sc.parent().children[ index - 1 ] ) {
				sc.parent().children[ index - 1 ].focus();
			} else { // no children
				parent = sc.parent();
				setTimeout( function() {
					parent.children[0].focus();
				}, 10 );
			}
		}
		if ( ev.which === 8 || ev.which === 46 ) {
			sc.parent().detach( sc );
			return;
		}

		// On down & right keypress and there's a next element, focus on it.
		if ( ev.which === 40 || ev.which === 39 ) {
			if ( sc.nextContent() && sc.parent().children.indexOf( sc ) !== sc.parent().children.length - 1 ) {
				ev.preventDefault();
				sc.nextContent().focus();
				return;
			}
		}

		// On up & left keypress and there's a previous element, focus on it.
		if ( ev.which === 38 || ev.which === 37 ) {
			if ( sc.previousContent() && sc.parent().children.indexOf( sc ) !== 0 ) {
				ev.preventDefault();
				sc.previousContent().focus();
				return;
			}
		}

		// On keypress, create a new blank element and focus on it.
		// This is so that we can insert elements in other places
		if ( ev.which !== 38 && ev.which !== 37 ) { // Not up or left
			index++;
		}
		p = new ContentEdit.Text('p');
		sc.parent().attach( p, index );
		sc.blur();
		p.focus();
	});
});


/********************************************************************************
 * Include elements as previous content
 ********************************************************************************/
ContentEdit.Node.prototype._overridePreviousContent = ContentEdit.Node.prototype.previousContent;
ContentEdit.Node.prototype.previousContent = function() {
    var node = this.previousWithTest(function(node) {
		return node.content !== void 0 || PBSEditor.isNewStaticLikeElement( node );
    });
	return node;
};


/********************************************************************************
 * Include elements as next content
 ********************************************************************************/
ContentEdit.Node.prototype._overrideNextContent = ContentEdit.Node.prototype.nextContent;
ContentEdit.Node.prototype.nextContent = function() {
	return this.nextWithTest(function(node) {
		return node.content !== void 0 || PBSEditor.isNewStaticLikeElement( node );
	});
};


/**
 * Spell-checking triggers oninput, after oninput, sync content or the text will
 * remain the same before-spell-checking.
 * To replicate:
 * - Create a new element, type in "this is a tes."
 * - Spell check "tes" into "test"
 * - Make entire text bold (ctrl+b), "test" will revert to "tes".
 */
( function() {
	var proxied = ContentEdit.Element.prototype._addDOMEventListeners;
	ContentEdit.Element.prototype._addDOMEventListeners = function() {
		if ( this._syncContent ) {
			this._domElement.oninput = function() {
				if ( this._syncContent ) {
					return this._syncContent();
				}
			}.bind(this);
		}
		return proxied.call( this );
	};
} )();

/* globals ContentEdit */

(function() {
	var proxied = ContentEdit.Static.prototype._onMouseUp;
	ContentEdit.Static.prototype._onMouseUp = function(ev) {
		proxied.call( this, ev );
		clearTimeout(this._dragTimeout);

		clearTimeout( this._doubleClickTimeout );
		this._doubleClickTimeout = setTimeout((function(_this) {
			return function() {
				_this._doubleClickCount = 0;
			};
		})(this), 500);
		this._doubleClickCount++;
	};
})();

(function() {
	var proxied = ContentEdit.Static.prototype._onMouseOut;
	ContentEdit.Static.prototype._onMouseOut = function(ev) {
		proxied.call( this, ev );
		this._doubleClickCount = 0;
		clearTimeout(this._dragTimeout);
	};
})();

(function() {
	var proxied = ContentEdit.Static.prototype._onMouseMove;
	ContentEdit.Static.prototype._onMouseMove = function(ev) {
		proxied.call( this, ev );
		this._doubleClickCount = 0;
	};
})();


(function() {
	var proxied = ContentEdit.Static.prototype._onMouseDown;
	ContentEdit.Static.prototype._onMouseDown = function(ev) {

		// We need to do this or else StaticDoubleClicks will go out of editing mode right after entering it.
		ev.preventDefault();
		ev.stopPropagation();

		proxied.call( this, ev );
		clearTimeout(this._dragTimeout);

		if ( this.domElement() !== ev.target ) {
			return;
		}

		this._dragTimeout = setTimeout((function(_this) {
			return function() {
				return _this.drag(ev.pageX, ev.pageY);
			};
		})(this), ContentEdit.DRAG_HOLD_DURATION / 2);

		clearTimeout( this._doubleClickTimeout );
		this._doubleClickTimeout = setTimeout((function(_this) {
			return function() {
				_this._doubleClickCount = 0;
			};
		})(this), 500);
		this._doubleClickCount++;


		// Call the _onDoubleClick handler if there is one.
		if ( this._doubleClickCount === 3 ) {
			clearTimeout(this._dragTimeout);
			this._doubleClickCount = 0;
			if ( typeof this._onDoubleClick === 'function' ) {
				this._onDoubleClick(ev);
			}
		}
	};
})();

/* globals ContentEdit, ContentSelect */

// Converts a static element into a text element containing a
// given text and returns the created text element.
ContentEdit.Static.prototype.convertToText = function( text, keepSize ) {

	if ( typeof keepSize === 'undefined' ) {
		keepSize = false;
	}

	var elem = document.createElement('P');
	elem.innerHTML = text;
	elem = ContentEdit.Text.fromDOMElement( elem );

	this.blur();

	var index = this.parent().children.indexOf( this );
	var rect = this._domElement.getBoundingClientRect();

	// Take note the space between this element and the next so we
	// can maintain the spacing after converting.
	var marginBottom = 0;
	if ( this._domElement.nextElementSibling ) {
		var nextRect = this._domElement.nextElementSibling.getBoundingClientRect();
		marginBottom = nextRect.top - rect.bottom;
	}

	this.parent().attach( elem, index );
	this.parent().detach( this );

	// Change the element's size & margin to that we won't move the
	// page contents while editing the shortcode.
	if ( keepSize ) {
		elem._domElement.style.minHeight = rect.height + 'px';
		elem._domElement.style.marginBottom = marginBottom + 'px';
	}

	// Focus & place cursor at the end
	elem.focus();

	( function( elem ) {
		setTimeout( function() {
	        var selection = new ContentSelect.Range(elem.content.length(), elem.content.length());
			if ( elem._domElement ) {
	        	selection.select(elem._domElement);
			}
		}, 1 );
	}( elem ) );

	return elem;
};

/* globals ContentEdit, __extends, PBSEditor */


ContentEdit.StaticEditable = (function(_super) {
	__extends(StaticEditable, _super);

	function StaticEditable(tagName, attributes, content) {
		this._doubleClickCount = 0;
		StaticEditable.__super__.constructor.call(this, tagName, attributes);
		this._content = content;
	}


	StaticEditable.droppers = PBSEditor.allDroppers;


    StaticEditable.prototype.blur = function() {
      var root = ContentEdit.Root.get();
      if (this.isFocused()) {
        this._removeCSSClass('ce-element--focused');
        root._focused = null;
        return root.trigger('blur', this);
      }
    };


    StaticEditable.prototype._onMouseOver = function(ev) {
      StaticEditable.__super__._onMouseOver.call(this, ev);
      return this._addCSSClass('ce-element--over');
    };


    StaticEditable.prototype.focus = function(supressDOMFocus) {
      var root;
      root = ContentEdit.Root.get();
      if (this.isFocused()) {
        return;
      }
      if (root.focused()) {
        root.focused().blur();
      }
      this._addCSSClass('ce-element--focused');
      root._focused = this;
      if (this.isMounted() && !supressDOMFocus) {
        this.domElement().focus();
      }
      return root.trigger('focus', this);
    };


	StaticEditable.prototype.cssTypeName = function() {
		return 'staticeditable';
	};


	StaticEditable.prototype.typeName = function() {
		return 'StaticEditable';
	};


	return StaticEditable;


})(ContentEdit.Static);

/* globals ContentEdit, ContentSelect, HTMLString */

(function() {
	var proxied = ContentEdit.Text.prototype._keyReturn;
	ContentEdit.Text.prototype._keyReturn = function(ev) {

		ev.preventDefault();

	    if ( this.content.isWhitespace() ) {
			return proxied.call( this, ev );
	    }

		// On shift/ctrl/command + enter, add a line break
		if ( ev.shiftKey || ev.metaKey || ev.ctrlKey ) {

	        ContentSelect.Range.query(this._domElement);
	        var selection = ContentSelect.Range.query(this._domElement);
	        var tip = this.content.substring(0, selection.get()[0]);
	        var tail = this.content.substring(selection.get()[1]);
			var cursor = selection.get()[0] + 1;
			var br = new HTMLString.String('<br><br>', true);

			// Only insert 1 br
			if ( tail.length() !== 0 ) {
				br = new HTMLString.String('<br>', true);
			}

			this.content = tip.concat(br, tail);
	        this.updateInnerHTML();
			selection.set(cursor, cursor);
			this.selection(selection);
			return this.taint();

		} else {
			return proxied.call( this, ev );
		}

	};
})();


/**
 * The new CT doesn't allow us to select empty paragraph tags inside divs,
 * this fixes it.
 */
(function() {
	// var proxied = ContentEdit.Text.prototype._onMouseDown;
    ContentEdit.Text.prototype._onMouseDown = function(ev) {
		if ( this.isFocused() && this.content.isWhitespace() ) {
			ev.preventDefault();
			return;
		}

		ContentEdit.Text.__super__._onMouseDown.call(this);

		// Fixes problem with Firefox not being able to click on empty columns.
		// The cursor moves to the right, this re-places the cursor.
		if ( this.content.isWhitespace() ) {
			setTimeout( function() {
				var selection = new ContentSelect.Range( 0, 0 );
				selection.select( this.domElement() );
			}.bind( this ), 10 );
			return;
		}

		clearTimeout(this._dragTimeout);
		return this._dragTimeout = setTimeout((function(_this) {
			return function() {
				return _this.drag(ev.pageX, ev.pageY);
			};
		})(this), ContentEdit.DRAG_HOLD_DURATION);
	};


	// Fixes problem with Firefox not being able to click on empty columns.
	// The cursor moves to the right, this prevents that during mouse up.
	var proxied = ContentEdit.Text.prototype._onMouseUp;
    ContentEdit.Text.prototype._onMouseUp = function( ev ) {
		proxied.call( this, ev );

		if ( this.content.isWhitespace() ) {
			ev.preventDefault();
		}
	};
})();


/**
 * Fix some caret and blurring problems.
 */
(function() {
	// If typing while the caret isn't in the text element, move it back.
	// This only happens when
	// var keydownHandler = function( ev ) {
	// 	var root = ContentEdit.Root.get();
	// 	var element = root.focused();
	// 	if ( ! element ) {
	// 		return;
	// 	}
	//
	// 	if ( element.content.isWhitespace() ) {
	// 		var selection = new ContentSelect.Range( 1, 1 );
	// 		selection.select( element.domElement() );
	// 	}
	// };

	// On semi-blur (clicking on another area that DOESN'T trigger a blur event),
	// bring back the caret to the original position.
	// Only entertain clicks on the area being edited.
	var bringBackState = false;
	var mouseDownHandler = function( ev ) {
		if ( ! ev.target._ceElement ) {
			if ( window.pbsSelectorMatches( ev.target, '[data-editable]' ) ) {
				var root = ContentEdit.Root.get();
				var element = root.focused();
				if ( ! element ) {
					return;
				}
				element.storeState();
				bringBackState = true;
			}
		}
	};
	var mouseUpHandler = function() {
		if ( bringBackState ) {
			bringBackState = false;

			var root = ContentEdit.Root.get();
			var element = root.focused();
			if ( ! element ) {
				return;
			}
			element.restoreState();
		}
	};

	var proxiedFocus = ContentEdit.Text.prototype.focus;
	ContentEdit.Text.prototype.focus = function( supressDOMFocus ) {
		var ret = proxiedFocus.call( this, supressDOMFocus );
		document.addEventListener( 'mousedown', mouseDownHandler );
		document.addEventListener( 'mouseup', mouseUpHandler );
		// document.addEventListener( 'keydown', keydownHandler );
		return ret;
	};
	var proxiedBlur = ContentEdit.Text.prototype.blur;
	ContentEdit.Text.prototype.blur = function() {
		var ret = proxiedBlur.call( this );
		// document.removeEventListener( 'keydown', keydownHandler );
		document.removeEventListener( 'mousedown', mouseDownHandler );
		document.removeEventListener( 'mouseup', mouseUpHandler );
		return ret;
	};
})();


/**
 * Better button handling.
 * Normally, with buttons (inline-blocks) & contenteditable,
 * putting the caret at the end and typing will put the text OUTSIDE the html tag, &
 * putting the caret at the start and typing will put the text OUTSIDE the html tag.
 * We make this experience better by adding '&nbsp;' at the ends when typing
 * so that what users type appear INSIDE the html tag, then move the caret inside
 * the html tag after or before the &nbsp;.
 */
(function() {
	var proxied = ContentEdit.Text.prototype._onKeyDown;
	ContentEdit.Text.prototype._onKeyDown = function(ev) {
		if ( [ 40, 37, 39, 38, 9, 8, 46, 13, 32 ].indexOf( ev.keyCode ) === -1 ) {
			var docRange = window.getSelection().getRangeAt(0);
			var n, range, sel;

			if ( docRange.startContainer.parentNode ) {
				if ( docRange.startContainer.nextSibling && docRange.startContainer.parentNode.tagName !== 'A' && docRange.startContainer.nextSibling.tagName === 'A' ) {

					if ( docRange.startOffset === docRange.startContainer.length ) {

						if ( ! docRange.startContainer.nextSibling.innerHTML.match( /^&nbsp;/ ) ) {
							n = document.createTextNode( '\u00A0' );
							docRange.startContainer.nextSibling.insertBefore( n, docRange.startContainer.nextSibling.firstChild );

							range = document.createRange();
							sel = window.getSelection();
							range.setStart( docRange.startContainer.nextSibling, 1 );
							range.collapse(true);
							sel.removeAllRanges();
							sel.addRange(range);
						}
					}
				}

				else if ( docRange.startContainer.parentNode.tagName === 'A' ) {

					if ( docRange.startOffset === docRange.startContainer.length ) {

						if ( ! docRange.startContainer.parentNode.innerHTML.match( /&nbsp;$/ ) ) {
							n = document.createTextNode( '\u00A0' );
							docRange.startContainer.parentNode.appendChild( n );
						}

						range = document.createRange();
						sel = window.getSelection();
						range.setStart( docRange.startContainer, docRange.startContainer.length );
						range.collapse(true);
						sel.removeAllRanges();
						sel.addRange(range);
					}
				}
			}
		}
		proxied.call( this, ev );
	};

})();



// Remove the &nbsp;s added in by the previous function on blur.
(function() {
	var proxiedBlur = ContentEdit.Text.prototype.blur;
	ContentEdit.Text.prototype.blur = function() {
		if ( this._domElement ) {
			var innerHTML = this._domElement.innerHTML;
			innerHTML = innerHTML.replace( /(\s|&nbsp;)+(<\/a>)/, '$2' );
			innerHTML = innerHTML.replace( /(<a\s[^>]+>)(&nbsp;|\s)+/, '$1' );
			if ( this._domElement.innerHTML !== innerHTML ) {
				this._domElement.innerHTML = innerHTML;
				this._syncContent();
			}
		}
		return proxiedBlur.call( this );
	};
})();


// Fixed: 'innerHTML' undefined errors encountered randomly when editing normal text.
(function() {
	var proxied = ContentEdit.Text.prototype._syncContent;
	ContentEdit.Text.prototype._syncContent = function(ev) {
		if ( this._domElement ) {
			if ( typeof this._domElement.innerHTML !== 'undefined' ) {
				return proxied.call( this, ev );
			}
		}
		return this._flagIfEmpty();
	};
})();


/* globals ContentEdit, HTMLString, ContentSelect */

(function() {
	var proxied = ContentEdit.Text.prototype._onKeyUp;
	ContentEdit.Text.prototype._onKeyUp = function(ev) {

	   var ret = proxied.call( this, ev );

	   if ( ev.keyCode === 9 ) {
		   if ( this.content.text().toLowerCase() === 'lorem' ) {
			   this.content = new HTMLString.String( 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. At dolor sed numquam? Sapiente autem adipisci, minus expedita enim, suscipit laboriosam deleniti possimus sequi pariatur explicabo numquam alias atque officia sit.' );
			   this.updateInnerHTML();
			   this.taint();

			   var selection = new ContentSelect.Range( this.content.length(), this.content.length() );
			   selection.select( this._domElement );
		   }
	   }

	   return ret;
	};
})();


(function() {
	var proxied = ContentEdit.Text.prototype.blur;
	ContentEdit.Text.prototype.blur = function(ev) {

		if ( this.content.text().toLowerCase() === 'lorem' ) {
			this.content = new HTMLString.String( 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. At dolor sed numquam? Sapiente autem adipisci, minus expedita enim, suscipit laboriosam deleniti possimus sequi pariatur explicabo numquam alias atque officia sit.' );
			this.updateInnerHTML();
			this.taint();

			var selection = new ContentSelect.Range( this.content.length(), this.content.length() );
			selection.select( this._domElement );
		}

		return proxied.call( this, ev );

	};
})();

/* globals ContentEdit, HTMLString, pbsParams, __extends, PBSEditor */

ContentEdit.Shortcode = (function(_super) {
	__extends(Shortcode, _super);

	Shortcode.sc_raw = '';
	Shortcode.sc_hash = '';
	Shortcode.sc_base = '';

	// Used for checking whether we should do an ajax update
	Shortcode.sc_prev_raw = '';

	function Shortcode(tagName, attributes, content) {
		this.sc_hash = attributes['data-shortcode'];
		this.sc_base = attributes['data-base'];
		this.sc_raw = Shortcode.atob( this.sc_hash );
		this.sc_prev_raw = this.sc_raw;
		this.model = new Backbone.Model({});
		this.parseShortcode();
		this.model.element = this;
		this.model.listenTo( this.model, 'change', this.modelChanged.bind(this) );

		this._doubleClickCount = 0;

		Shortcode.__super__.constructor.call(this, tagName, attributes);

		this._content = content;
	}

	Shortcode.btoa = function(str) {
	    return btoa( encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
	        return String.fromCharCode('0x' + p1);
	    }));
	};

	Shortcode.atob = function(str) {
		return decodeURIComponent( Array.prototype.map.call( window.atob( str ), function( c ) {
	        return '%' + ( '00' + c.charCodeAt( 0 ).toString( 16 ) ).slice( -2 );
	    } ).join( '' ) );
	};

	Shortcode.prototype.mount = function() {
		var ret = Shortcode.__super__.mount.call( this );

		var scStyles = getComputedStyle( this._domElement );
		if ( scStyles.height === '0px' ) {
			this._domElement.classList.add('pbs--blank');
		} else {
			this._domElement.classList.remove('pbs--blank');
		}

		setTimeout( function() {
			if ( this._domElement ) {
				var scStyles = getComputedStyle( this._domElement );
				if ( scStyles.height === '0px' ) {
					this._domElement.classList.add('pbs--blank');
				} else {
					this._domElement.classList.remove('pbs--blank');
				}
			}
		}.bind( this ), 1 );

		return ret;
	};

	// Creates the base element of the shortcode div.
	// Does not have any contents, need to run `ajaxUpdate` after attaching to update.
	Shortcode.createShortcode = function( shortcode ) {

		var o = document.createElement('DIV');
		o.setAttribute( 'data-ce-moveable', '' );
		o.setAttribute( 'data-ce-tag', 'shortcode' );
		o.setAttribute( 'data-base', shortcode.shortcode.tag );
		// o.setAttribute( 'data-shortcode', btoa( shortcode.content ) );
		o.setAttribute( 'data-shortcode', Shortcode.btoa( shortcode.shortcode.string() ) );

		return ContentEdit.Shortcode.fromDOMElement( o );
	};

	Shortcode.fromDOMElement = function( domElement ) {
	    var newElement = new this( domElement.tagName, this.getDOMElementAttributes(domElement), domElement.innerHTML );

		// This global variable is set to TRUE when we have just added a pre-designed element,
		// in this case, we need to refresh the shortcode to make it's render updated.
		if ( PBSEditor._justAddedDesignElement ) {
			newElement.ajaxUpdate( true );
		}

		return newElement;
	};

	Shortcode.prototype.convertToText = function() {
		var innerHTML = this._domElement.innerHTML;
		var elem = Shortcode.__super__.convertToText.call( this, this.sc_raw );

		elem.origShortcode = this.sc_raw;
		elem.origInnerHTML = innerHTML;
		elem.isShortcodeEditing = true;

		return elem;
	};

	Shortcode.prototype.parseShortcode = function() {
		var sc = wp.shortcode.next( this.sc_base, this.sc_raw, 0 );

		for ( var attributeName in sc.shortcode.attrs.named ) {
			if ( sc.shortcode.attrs.named.hasOwnProperty( attributeName ) ) {
				this.model.set( attributeName, sc.shortcode.attrs.named[ attributeName ], { silent: true } );
			}
		}

		for ( var i = 0; i < sc.shortcode.attrs.numeric.length; i++ ) {
			this.model.set( i, sc.shortcode.attrs.numeric[ i ], { silent: true } );
		}

		this.model.set( 'content', sc.shortcode.content, { silent: true } );
	};

	Shortcode.prototype._onDoubleClick = function() {
		if ( ! wp.hooks.applyFilters( 'pbs.shortcode.allow_raw_edit', true, this.sc_base, this ) ) {
			return;
		}
		this.convertToText();
	};

	Shortcode.prototype.cssTypeName = function() {
		return 'shortcode';
	};

	Shortcode.prototype.typeName = function() {
		return 'Shortcode';
	};

	Shortcode.prototype.clone = function() {
        var root = ContentEdit.Root.get();
        if (root.focused() === this) {
			root.focused().blur();
        }
		var clone = document.createElement('div');
		clone.innerHTML = this.html();
		var newElement = Shortcode.fromDOMElement( clone.childNodes[0] );
		var index = this.parent().children.indexOf( this );
		this.parent().attach( newElement, index + 1 );

		newElement.focus();
	};

	Shortcode.prototype.modelChanged = function() {
		this.updateSCRaw();
		this.updateSCHash();

		clearTimeout( this._scRefreshTrigger );
		var _this = this;
		this._scRefreshTrigger = setTimeout(function() {
			_this.ajaxUpdate();
		}, 500 );
	};

	Shortcode.prototype.setSCAttr = function( name, value ) {
		this.model.set( name, value );
	};

	Shortcode.prototype.setSCContent = function( value ) {
		this.model.set( 'content', value );
	};

	Shortcode.prototype.updateSCRaw = function() {
		var sc = '';
		sc += '[' + this.sc_base;

		var keys = this.model.keys();
		for ( var i = 0; i < keys.length; i++ ) {
			var attrName = keys[ i ];
			if ( attrName !== 'content' ) {
				var value = this.model.get( attrName ) || '';
				value = value.replace( /\n/g, '<br>' );
				sc += ' ' + attrName + '="' + value + '"';
			}
		}
		sc += ']';

		if ( this.model.get('content') ) {
			sc += this.model.get('content');
		}

		sc += '[/' + this.sc_base + ']';

		this.sc_raw = sc;
	};

	Shortcode.prototype.updateSCHash = function() {
		this.sc_hash = Shortcode.btoa( this.sc_raw );
		this.attr( 'data-shortcode', this.sc_hash );
	};


	Shortcode.prototype.unmount = function() {
		Shortcode.__super__.unmount.call( this );

		// Re-init the shortcode scripts to make sure it still works.
		setTimeout( function() {
			this.runInitScripts();
		}.bind( this ), 100 );
	};

	Shortcode.prototype.runInitScripts = function() {

		var ranInitCode = false;

		if ( this._scriptsToRun ) {
			for ( var i = 0; i < this._scriptsToRun.length; i++ ) {
				try {

					/**
					 * Yes, this is a form of eval'ed code, but we can do this because:
					 * 1. We only do this when editing,
					 * 2. Logged out users will never see this code,
					 * 3. Script init code comes from the plugin's rendered shortcode,
					 * 4. This is only performed when refreshing shortcodes
					 */

					// jshint evil:true
					( new Function( this._scriptsToRun[ i ] ) )();

					ranInitCode = true;

				} catch ( err ) {

					// Shortcode init failed.
					console.log( 'PBS:', this.sc_base, 'init code errored out.' );
				}
			}
		}

		// Run shortcode mapping init code.
		if ( typeof pbsParams.shortcode_mappings[ this.sc_base ] !== 'undefined' ) {
			var map = pbsParams.shortcode_mappings[ this.sc_base ];
			if ( typeof map.init_code !== 'undefined' ) {
				try {

					/**
					 * Yes, this is a form of eval'ed code, but we can do this because:
					 * 1. We only do this when editing,
					 * 2. Logged out users will never see this code,
					 * 3. map.init_code doesn't come from any user input like GET vars,
					 * 4. This is only performed when refreshing shortcodes
					 */

					// jshint evil:true
					if ( this._domElement ) {
						( new Function( map.init_code ) ).bind( this._domElement.firstChild )();
					} else {
						( new Function( map.init_code ) )();
					}

					ranInitCode = true;

				} catch ( err ) {

					// Shortcode init failed.
					console.log( 'PBS:', this.sc_base, 'init code errored out.' );
				}
			}
		}

		// Refresh the dom element if some init code was used.
		if ( ranInitCode ) {
			setTimeout( function() {
				if ( this._domElement ) {
					this._content = this._domElement.innerHTML;
				}
			}.bind( this ), 10 );
		} else if ( this._domElement ) {
			this._content = this._domElement.innerHTML;
		}

	};

	Shortcode.prototype.ajaxUpdate = function( forceUpdate ) {
		clearTimeout( this._ajaxUpdateTimeout );
		this._ajaxUpdateTimeout = setTimeout( function() {
			this._ajaxUpdate( forceUpdate );
		}.bind( this ), 500 );
	};

	Shortcode.prototype._ajaxUpdate = function( forceUpdate ) {
		// If nothing was changed, don't update.
		if ( this.sc_prev_raw === this.sc_raw && ! forceUpdate ) {
			return;
		}

		var payload = new FormData();
		payload.append( 'action', 'pbs_shortcode_render' );
		payload.append( 'shortcode', this.sc_hash );
		payload.append( 'nonce', pbsParams.nonce );

		this._domElement.classList.add('pbs--rendering');

		var _this = this;
		var request = new XMLHttpRequest();
		request.open('POST', window.location.href );

		request.onload = function() {
			if (request.status >= 200 && request.status < 400) {

				var i, node, response;

				// The response should be a JSON object,
				// If not we probably encountered an error during rendering.
				try {
					response = JSON.parse( request.responseText );
				} catch ( err ) {

					console.log( 'PBS: Error getting rendered shortcode' );

					_this._domElement.classList.remove('pbs--rendering');

					// Min-height is set during editing, remove it
					_this._domElement.style.minHeight = '';
					_this._domElement.style.marginBottom = '';

					// Take note of the new hash to prevent unnecessary updating.
					_this.sc_prev_raw = _this.sc_raw;
					return;
				}

				// Create a dummy container for the scripts and styles the shortcode needs
				var enqueued = response.scripts + response.styles;
				var dummyContainer = document.createElement('div');
				dummyContainer.innerHTML = enqueued.trim();

				// Add the scripts & styles if they aren't in yet.
				var currentHead = document.querySelector('html').innerHTML;
				var enqueuedScriptsPending = 0;
				var scriptsToRun = [];

				if ( enqueued.trim().length ) {
					for ( i = dummyContainer.childNodes.length - 1; i >= 0; i-- ) {
						if ( dummyContainer.childNodes[i].getAttribute ) {
							node = dummyContainer.childNodes[i];

							// Scripts.
							if ( node.tagName === 'SCRIPT' ) {

								// JS scripts added are most likely initialization code.
								if ( ! node.getAttribute( 'src' ) ) {
									scriptsToRun.unshift( node.innerHTML );
									continue;

								} else {

									// Dynamically load these scripts.
									var scriptURL = node.getAttribute( 'src' );
									if ( ! document.querySelector( 'script[src="' + scriptURL + '"]' ) ) {

										// We count these so we can run initialization
										// when everything has completed loading.
										enqueuedScriptsPending++;

										/* jshint loopfunc:true */
										jQuery.getScript( node.getAttribute( 'src' ) )
										.done( function() {
											enqueuedScriptsPending--;
										} )
										.fail( function() {
											enqueuedScriptsPending--;
										} );
									}

									continue;
								}

							// Styles.
							} else if ( node.tagName === 'LINK' ) {

								// Include the style files if they aren't added in yet.
								if ( node.getAttribute( 'rel' ) === 'stylesheet' && node.getAttribute( 'href' ) ) {
									var styleURL = node.getAttribute( 'href' );
									if ( document.querySelector( 'link[href="' + styleURL + '"]' ) ) {
										continue;
									}
								}
							}

							// Add the script or styles.
							if ( currentHead.indexOf( node.outerHTML ) === -1 ) {
								document.body.appendChild( node );
							}
						}
					}
				}

				// Add the results
				dummyContainer = document.createElement('div');
				dummyContainer.innerHTML = response.output.trim();

				// Add the rendered shortcode output.
				_this._domElement.innerHTML = '';
				if ( dummyContainer.innerHTML.length ) {
					for ( i = dummyContainer.childNodes.length - 1; i >= 0; i-- ) {
						node = dummyContainer.childNodes[ i ];
						if ( dummyContainer.childNodes[ i ].nodeType === 3 ) {
							_this._domElement.insertBefore( node, _this._domElement.firstChild );
						} else {

							// If a script was outputted, we can use this to
							// initialize the shortcode.
							if ( node.tagName === 'SCRIPT' ) {
								scriptsToRun.unshift( node.innerHTML );
								continue;
							}

							// Insert rendered output.
							_this._domElement.insertBefore( node, _this._domElement.firstChild );
						}
					}
				}
				_this._content = dummyContainer.innerHTML;

				// Run initialization scripts.
				if ( scriptsToRun ) {
					_this._scriptsToRun = scriptsToRun;
					_this._scriptRunInterval = setInterval( function() {
						if ( ! enqueuedScriptsPending ) {
							this.runInitScripts();
							clearInterval( this._scriptRunInterval );
						}
					}.bind( _this ), 100 );
				}

				// If the first element is floated, mimic the float so that the shortcode can be selectable.
				_this.style('float', '');
				if ( _this._domElement.children.length === 1 ) {
					try {
						var style = getComputedStyle( _this._domElement.firstChild );
						if ( style['float'] === 'left' || style['float'] === 'right' ) {
							_this.style('float', style['float']);
						}
					} catch ( err ) {}
				}

				// Trigger the shortcode to render.
				// This should be listened to by plugins/shortcodes so that they can render correctly upon showing up in the page
				document.dispatchEvent( new CustomEvent( 'pbs:shortcode-render', { detail: document.querySelector('.pbs--rendering') } ) );
			}
			_this._domElement.classList.remove('pbs--rendering');
			_this._domElement.classList.remove('pbs--blank');

			// Min-height is set during editing, remove it
			_this._domElement.style.minHeight = '';
			_this._domElement.style.marginBottom = '';

			// Take note of the new hash to prevent unnecessary updating.
			_this.sc_prev_raw = _this.sc_raw;

			var scStyles = getComputedStyle( _this._domElement );
			if ( scStyles.height === '0px' ) {
				_this._domElement.classList.add('pbs--blank');
			} else {
				_this._domElement.classList.remove('pbs--blank');
			}

		};

		// There was a connection error of some sort.
		request.onerror = function() {
			_this._domElement.classList.remove('pbs--rendering');

			// Min-height is set during editing, remove it
			_this._domElement.style.minHeight = '';
			_this._domElement.style.marginBottom = '';

			// Take note of the new hash to prevent unnecessary updating.
			_this.sc_prev_raw = _this.sc_raw;
		};
		request.send( payload );
	};

	return Shortcode;

})(ContentEdit.StaticEditable);

ContentEdit.TagNames.get().register(ContentEdit.Shortcode, 'shortcode');



/****************************************************************
 * Checks the contents of the element then converts shortcodes
 * into shortcode elements. Also retains normal text
 * into text elements.
 ****************************************************************/
ContentEdit.Text.prototype.convertShortcodes = function() {

	// Find shortcodes
	var html = this.content.html();
	var textParts = [];
	var shortcodes = [];

	if ( html.trim() === '' ) {
		return;
	}

	var shortcodeRegex = /\[([^\/][^\s\]\[]+)[^\]]*\]/g;
	var shortcodeMatch = shortcodeRegex.exec( html );

	if ( ! shortcodeMatch ) {
		return;
	}

	var prevIndex = 0;
	while ( shortcodeMatch ) {

		// Don't render shortcodes that do not exist.
		if ( pbsParams.shortcodes.indexOf( shortcodeMatch[1] ) === -1 ) {
			shortcodeMatch = shortcodeRegex.exec( html );
			continue;
		}

		// The regex can capture nested shortcodes, ignore those and let the parent shortcode
		// handle the rendering
		if ( shortcodeMatch.index < prevIndex ) {
			shortcodeMatch = shortcodeRegex.exec( html );
			continue;
		}

		var base = shortcodeMatch[1];
		var sc = wp.shortcode.next( base, html, shortcodeMatch.index );
		textParts.push( html.substr( prevIndex, shortcodeMatch.index - prevIndex ) );
		shortcodes.push( sc );

		prevIndex = shortcodeMatch.index + sc.content.length;
		shortcodeMatch = shortcodeRegex.exec( html );
	}

	// Don't continue if no shortcodes are found.
	if ( shortcodes.length === 0 ) {
		return;
	}

	// Get the last part of the text.
	textParts.push( html.substr( prevIndex ) );

	var elem,
		insertAt = this.parent().children.indexOf( this ),
		parent = this.parent(),
		dom = this._domElement,
		minHeight, bottomMargin;

	if ( dom && dom.style.minHeight ) {
		minHeight = dom.style.minHeight;
		bottomMargin = dom.style.bottomMargin;
	}

	// Modify the current element and create the shortcodes seen.
	for ( var i = 0; i < textParts.length + shortcodes.length; i++ ) {

		var isShortcode = i % 2 === 1;
		elem = null;

		// The first element is always the original text element that will be altered.
		if ( i === 0 ) {
			this.content = new HTMLString.String( textParts[ i ], true);
			this.updateInnerHTML();
			this.taint();
			continue;
		}

		// Create either a shortcode or a text element.
		if ( isShortcode ) {
			elem = ContentEdit.Shortcode.createShortcode( shortcodes[ Math.floor( i / 2 ) ] );
		} else {
			// Don't create empty text elements.
			if ( textParts[ i / 2 ].trim() ) {
				elem = document.createElement('P');
				elem.innerHTML = textParts[ i / 2 ];
				elem = ContentEdit.Text.fromDOMElement( elem );
			}
		}

		// Attach the new elements.
		if ( elem ) {

			insertAt++;

			parent.attach( elem, insertAt );

			// If we just edited a shortcode (turned it into a text element), we will have a minHeight,
			// Copy it over to prevent the screen from jumping around because the heights are changing.
			// Only do this for the first shortcode.
			if ( i === 1 ) {
				if ( dom && minHeight ) {
					elem._domElement.style.minHeight = minHeight;
					elem._domElement.style.bottomMargin = bottomMargin;
				}
			}

			if ( elem.constructor.name === 'Shortcode' ) {

				// If we just edited a shortcode (turned it into a text element), we will have the original
				// shortcode remembered in this.origShortcode. If unedited, then just bring back the old
				// shortcode contents instead of doing an ajax call again.
				var doAjax = true;
				if ( i === 1 ) {
					if ( elem.sc_raw === this.origShortcode ) {
						elem._domElement.innerHTML = this.origInnerHTML;
						elem._content = this.origInnerHTML;

						var scStyles = getComputedStyle( elem._domElement );
						if ( scStyles.height === '0px' ) {
							elem._domElement.classList.add('pbs--blank');
						} else {
							elem._domElement.classList.remove('pbs--blank');
						}

						doAjax = false;
					}
				}

				if ( doAjax ) {
					elem.ajaxUpdate( true );
				}

			}
		}
	}

	// If the current element was converted into a blank, remove it.
	if ( this.parent() && this.content.isWhitespace() ) {
		this.parent().detach( this );
	}


};


/********************************************************************************
 * Event handlers to listen for typing shortcodes inside text elements
 ********************************************************************************/

// When hitting return.
(function() {
	var proxied = ContentEdit.Text.prototype._keyReturn;
	ContentEdit.Text.prototype._keyReturn = function(ev) {
		if ( this.isShortcodeEditing ) {
			this.blur();
			return this.convertShortcodes();
		}

		var ret = proxied.call( this, ev );
		this.convertShortcodes();
		return ret;
	};
})();

// On text element blur.
window.addEventListener( 'DOMContentLoaded', function() {
	ContentEdit.Root.get().bind('blur', function (element) {
		if ( element.constructor.name === 'Text' ) {
			element.convertShortcodes();
		}
	});

	// Saving WHILE shortcodes are being edited get an error, blur the text before being able to save to prevent this.
	document.querySelector('#wpadminbar').addEventListener('mouseover', function() {
		var root = ContentEdit.Root.get();
		var focused = root.focused();
		if ( focused ) {
			if ( focused.constructor.name === 'Text' ) {
				if ( focused.content ) {
					// Only do this IN shortcodes, or else the blur gets annoying.
					if ( focused.content.html().match( /\[\w+[^\]]+\]/ ) ) {
						focused.blur();
					}
				}
			}
		}
	});
});



/********************************************************************************
 * Float left/right shortcodes that have their only child as floated left/right.
 ********************************************************************************/
window.addEventListener( 'DOMContentLoaded', function() {

	// Carry over the float property to the parent shortcode div to make the behavior the same
	var shortcodes = document.querySelectorAll('[data-name="main-content"] [data-shortcode]');
	Array.prototype.forEach.call(shortcodes, function(el){
		if ( el.children.length === 1 ) {
			try {
				var style = getComputedStyle(el.firstChild);
				if ( style['float'] === 'left' || style['float'] === 'right' ) {
					el.style['float'] = style['float'];
				}
			} catch (err) {}
		}
	});

});

/* globals ContentEdit, __extends, PBSEditor */

ContentEdit.Hr = (function(_super) {
	__extends(Hr, _super);

	function Hr( tagName, attributes ) {
		this.model = new Backbone.Model({});

		Hr.__super__.constructor.call(this, tagName, attributes);

		this._content = '';
	}


    Hr.prototype.blur = function() {
      var root = ContentEdit.Root.get();
      if (this.isFocused()) {
        this._removeCSSClass('ce-element--focused');
        root._focused = null;
        return root.trigger('blur', this);
      }
    };


    Hr.droppers = PBSEditor.allDroppers;

    Hr.prototype.focus = function(supressDOMFocus) {
      var root;
      root = ContentEdit.Root.get();
      if (this.isFocused()) {
        return;
      }
      if (root.focused()) {
        root.focused().blur();
      }
      this._addCSSClass('ce-element--focused');
      root._focused = this;
      if (this.isMounted() && !supressDOMFocus) {
        this.domElement().focus();
      }
      return root.trigger('focus', this);
    };

	Hr.prototype.cssTypeName = function() {
		return 'hr';
	};

	Hr.prototype.typeName = function() {
		return 'Horizontal Rule';
	};


	return Hr;

})(ContentEdit.Static);

ContentEdit.TagNames.get().register(ContentEdit.Hr, 'hr');

/* globals ContentEdit, ContentTools, pbsParams, __extends */


ContentEdit.Embed = (function(_super) {
	__extends(Embed, _super);

	function Embed(tagName, attributes, content) {
		this.url = attributes['data-url'];
		this.model = new Backbone.Model({});

		this._doubleClickCount = 0;

		Embed.__super__.constructor.call(this, tagName, attributes);

		this._content = content;
	}

	// Creates the base element of the shortcode div.
	// Does not have any contents, need to run `ajaxUpdate` after attaching to update.
	Embed.create = function( url ) {

		var o = document.createElement('DIV');
		o.setAttribute( 'data-ce-moveable', '' );
		o.setAttribute( 'data-ce-tag', 'embed' );
		o.setAttribute( 'data-url', url );

		return ContentEdit.Embed.fromDOMElement( o );
	};


    Embed.prototype.mount = function() {
		var ret = Embed.__super__.mount.call( this );

		/*
		 * Use jQuery's html here since oEmbeds may have a script tag
		 * with them and that doesn't run with innerHTML.
		 */
		this._domElement.innerHTML = '';
		jQuery( this._domElement ).html( this._content );

		// Allow others to perform additional mounting functions.
		wp.hooks.doAction( 'pbs.embed.mount', this );

		return ret;
	};


	Embed.prototype._onDoubleClick = function() {
		this.convertToText( this.url, false );
	};

	Embed.prototype.cssTypeName = function() {
		return 'embed';
	};

	Embed.prototype.typeName = function() {
		return 'Embed';
	};


	Embed.updateEmbedContent = function( url, textElement ) {

		var payload = new FormData();
		payload.append( 'post_ID', pbsParams.post_id );
		payload.append( 'type', 'embed' );
		payload.append( 'action', 'parse-embed' );
		payload.append( 'shortcode', '[embed]' + url + '[/embed]' );

		// var _this = this;
		var request = new XMLHttpRequest();
		request.open('POST', pbsParams.ajax_url );

		request.onload = function() {
			if (request.status >= 200 && request.status < 400) {
				var response = JSON.parse( request.responseText );

				// Check if WP's check for embeddable URL failed.
				if ( ! response.success ) {
					return;
				}

				if ( ! textElement.parent() ) {
					return;
				}

				// If successful, convert the element into an Embed element.
				var elem = ContentEdit.Embed.create( url ),
					insertAt = textElement.parent().children.indexOf( textElement ),
					parent = textElement.parent();

				parent.attach( elem, insertAt );
				parent.detach( textElement );

				/*
				 * Use jQuery's html here since oEmbeds may have a script tag
				 * with them and that doesn't run with innerHTML.
				 */
				// _this._domElement.innerHTML = response.data.body;
				jQuery( elem._domElement ).html( '<p>' + response.data.body + '</p>' );
				elem._content = '<p>' + response.data.body + '</p>';

				elem._domElement.classList.remove('pbs--rendering');

				wp.hooks.doAction( 'pbs.embed.update_embed_content', elem );

			}
		};


		// There was a connection error of some sort.
		request.onerror = function() {
		};
		request.send( payload );
	};

	return Embed;

})(ContentEdit.StaticEditable);

ContentEdit.TagNames.get().register(ContentEdit.Embed, 'embed');



/****************************************************************
 * Checks the contents of the element then converts URLs
 * into oembed elements.
 ****************************************************************/
ContentEdit.Text.prototype.convertOEmbedURLs = function() {

	if ( this.content.isWhitespace() ) {
		return;
	}

	// Get the content
	var text = this.content.text();

	if ( ! text ) {
		return;
	}

	// Don't embed links.
	if ( this.content.html().match( /<a[^>]+/g ) ) {
		return;
	}

	text = text.trim();
	if ( ! text ) {
		return;
	}

	// Simple URL matching: @stephenhay
	// @see https://mathiasbynens.be/demo/url-regex
	if ( ! text.match( /^https?:\/\/[^\s/$.?#].[^\s]*$/ ) ) {
		return;
	}

	ContentEdit.Embed.updateEmbedContent( text, this );
};



// On text element blur.
window.addEventListener( 'DOMContentLoaded', function() {
	ContentEdit.Root.get().bind('blur', function (element) {
		if ( element.constructor.name === 'Text' ) {
			element.convertOEmbedURLs();
		}
	});
});



/**
 * When stopping the editor, the iframes get invalidated, re-run the scripts
 * included with the embeds to fix the iframes.
 */
window.addEventListener( 'DOMContentLoaded', function() {
	var editor = ContentTools.EditorApp.get();
	editor.bind('stop', function() {

		var shortcodes = document.querySelectorAll( '[data-ce-tag="embed"]' );
		Array.prototype.forEach.call(shortcodes, function(el){

			/*
			 * Use jQuery's html here since oEmbeds may have a script tag
			 * with them and that doesn't run with innerHTML.
			 */
			var html = el.innerHTML;
			el.innerHTML = '';
			jQuery( el ).html( html );

		});

	});
});

/* globals ContentEdit, ContentTools, ContentSelect, HTMLString, hljs */

( function() {

	// Updating the html contents removes all highlighting markup.
	ContentEdit.PreText.prototype.unhighlight = function() {
		this.updateInnerHTML();
	};

	// Turn on highlight syntaxing on the element.
	ContentEdit.PreText.prototype.rehighlight = function() {
		if ( typeof hljs !== 'undefined' ) {
			this.storeState();
			this.removeAllCSSClasses();
			hljs.highlightBlock( this._domElement );
			this.restoreState();
		}
	};

} )();


/**
 * When generating the html to save, don't include any markup. The additional
 * markup are the syntax highlighting stuff.
 */
( function() {
	var proxied = ContentEdit.PreText.prototype.html;
	ContentEdit.PreText.prototype.html = function( indent ) {
		proxied.call( this, indent );
		this._cached = this._cached.replace( /<\/?\w+[^>]*>/g, '' );
		return ( '' + indent + '<' + this._tagName + ( this._attributesToString() ) + '>' ) + ( '' + this._cached.replace( /\n/g, '\r\n' ) + '</' + this._tagName + '>' );
    };

} )();


/**
 * Remove all syntax highlighting when focsed on the element. Don't do syntax
 * highlighting during editing.
 */
( function() {
	var proxied = ContentEdit.PreText.prototype.focus;
    ContentEdit.PreText.prototype.focus = function() {
		var ret = proxied.call( this );
		this.unhighlight();
		return ret;
    };
} )();


/**
 * Re-apply the syntax highlighting during mounting.
 */
( function() {
	var proxied = ContentEdit.PreText.prototype.mount;
    ContentEdit.PreText.prototype.mount = function() {
		var ret = proxied.call( this );
		this.rehighlight();
		return ret;
    };
} )();


( function() {
	var proxied = ContentEdit.PreText.prototype.blur;
    ContentEdit.PreText.prototype.blur = function() {
		var ret = proxied.call( this );
		this.rehighlight();
		return ret;
    };
} )();


/**
 * When just starting out, remove all markup in the code. Assume those are all
 * syntax highlighting stuff.
 */
( function() {
	var proxied = ContentEdit.PreText.fromDOMElement;
    ContentEdit.PreText.fromDOMElement = function( domElement ) {
		domElement.innerHTML = domElement.innerHTML.replace( /<\/?\w+[^>]*>/g, '' );
		return proxied.call( this, domElement );
    };
} )();


/**
 * After we stop, turn on syntax highlighting since they will get removed.
 */
window.addEventListener( 'DOMContentLoaded', function() {
    var editor = ContentTools.EditorApp.get();
	editor.bind( 'stop', function () {
		if ( window.pbsInitAllPretext ) {
			window.pbsInitAllPretext();
		}
	} );
} );


/**
 * Support tabs inside PreText elements.
 */
( function() {
	var proxied = ContentEdit.PreText.prototype._onKeyDown;
    ContentEdit.PreText.prototype._onKeyDown = function( ev ) {
		if ( ev.keyCode === 9 ) {
			ev.preventDefault();
			ContentSelect.Range.query( this._domElement );
			var selection = ContentSelect.Range.query( this._domElement );
			var preserveWhitespace = this.content.preserveWhitespace();
			var insertAt;

			// TODO: When a string is selected, multi-indent:
			// 1. find the last \n before index 0, then turn into \n\t
			// 2. turn all \n into \n\t in the selected string.

			// if ( selection.isCollapsed() ) {
				insertAt = selection.get()[1];
				this.content = this.content.insert( insertAt, new HTMLString.String( '\t', preserveWhitespace ), preserveWhitespace );
				this.updateInnerHTML();
				insertAt += 1;
				selection = new ContentSelect.Range( insertAt, insertAt );
				selection.select( this.domElement() );
			// }
		}
		return proxied.call( this, ev );
    };
} )();

/* globals ContentTools */

/**
 * Videos can sometimes be unproportional in some themes.
 * IF FitVids is present, then use that to fix the video iframe dimensions,
 * otherwise there should be no problems. (e.g. Twenty Sixteen does not use fitvids.js)
 *
 * @see https://github.com/davatron5000/FitVids.js
 */


// Called when a Twitter embed element is mounted.
(function() {
	var fitVideos = function( element ) {

		if ( typeof jQuery === 'undefined' ) {
			return;
		}
		if ( typeof jQuery.fn.fitVids === 'undefined' ) {
			return;
		}

		var domElement = element._domElement || element;
		jQuery( domElement ).fitVids();
	};
	wp.hooks.addAction( 'pbs.embed.mount', fitVideos );
	wp.hooks.addAction( 'pbs.embed.update_embed_content', fitVideos );


	// Call Twitter API when the CT editor saves/stops because Twitter's iframe doesn't have a src.
	window.addEventListener( 'DOMContentLoaded', function() {
		var editor = ContentTools.EditorApp.get();
		editor.bind('stop', function() {

			var shortcodes = document.querySelectorAll( '[data-ce-tag="embed"] iframe' );
			Array.prototype.forEach.call(shortcodes, function(el){
				fitVideos( el.parentNode );
			});

		});
	});


})();

/* globals ContentTools, twttr */

/**
 * Twitter iframe embeds don't have a src attribute, so the iframe breaks when
 * CT/editor starts/stops, this script fixes the Twitter embeds by using
 * Twitter's Widget Library/API.
 *
 * @see https://dev.twitter.com/web/javascript/creating-widgets#create-tweet
 */


// Called when a Twitter embed element is mounted.
var pbsTwitterMount = function( element ) {

	var domElement = element._domElement || element;

	if ( domElement.querySelector( '[data-tweet-id]' ) ) {
		var tweetID = domElement.querySelector( '[data-tweet-id]' ).getAttribute( 'data-tweet-id' );

		domElement.innerHTML = '';
		twttr.widgets.createTweet( tweetID, domElement );

	}
};
wp.hooks.addAction( 'pbs.embed.mount', pbsTwitterMount );


// Call Twitter API when the CT editor saves/stops because Twitter's iframe doesn't have a src.
window.addEventListener( 'DOMContentLoaded', function() {
	var editor = ContentTools.EditorApp.get();
	editor.bind('stop', function() {

		var shortcodes = document.querySelectorAll( '[data-tweet-id]' );
		Array.prototype.forEach.call(shortcodes, function(el){
			pbsTwitterMount( el.parentNode );
		});

	});
});

/* globals ContentEdit, __extends */

ContentEdit.IFrame = (function(_super) {
	__extends(IFrame, _super);

	function IFrame(tagName, attributes, content) {
		this.model = new Backbone.Model({});

		IFrame.__super__.constructor.call(this, tagName, attributes);
		this._content = content;
	}


	IFrame.prototype.html = function() {
		return '<p>' + this._content + '</p>';
    };


	IFrame.prototype._onDoubleClick = function() {
		// Escape characters to prevent this from being read as html.
		var html = this._domElement.innerHTML.replace( /</g, '&lt;' ).replace( /<p>|<\/p>/g, '' ).replace( /data-ce-tag=['"]iframe['"]/, '' );
		var textElement = this.convertToText( html, false );
		textElement.isIframeEditing = true;
	};

	IFrame.prototype.cssTypeName = function() {
		return 'iframe';
	};

	IFrame.prototype.typeName = function() {
		return 'IFrame';
	};


	IFrame.convertTextToIFrame = function( html, textElement ) {
		// If successful, convert the element into an IFrame element.
		var elem = new ContentEdit.IFrame( 'P', [], html ),
			insertAt = textElement.parent().children.indexOf( textElement ),
			parent = textElement.parent();

		parent.attach( elem, insertAt );
		parent.detach( textElement );
	};

	return IFrame;

})(ContentEdit.StaticEditable);

ContentEdit.TagNames.get().register(ContentEdit.IFrame, 'iframe');


/**
 * Iframes are rendered inside paragraph tags. This handles the reading process of CT.
 */
(function() {
	var proxied = ContentEdit.Text.fromDOMElement;
	ContentEdit.Text.fromDOMElement = function( domElement ) {
		if ( domElement ) {
			if ( domElement.children && domElement.children.length === 1 && domElement.firstChild.tagName === 'IFRAME' ) {
				return new ContentEdit.IFrame(domElement.tagName, this.getDOMElementAttributes(domElement), domElement.innerHTML);
			}
		}
		return proxied.call( this, domElement );
	};
})();


/****************************************************************
 * Checks the contents of the element then converts URLs
 * into oiframe elements.
 ****************************************************************/
ContentEdit.Text.prototype.convertIFrameTags = function() {

	if ( this.content.isWhitespace() ) {
		return;
	}

	// Get the content
	var text = this.content.text();

	if ( ! text ) {
		return;
	}

	text = text.trim();
	if ( ! text ) {
		return;
	}

	if ( ! text.match( /^\s*<iframe.*/ ) ) {
		return;
	}

	ContentEdit.IFrame.convertTextToIFrame( text, this );
};



// On text element blur.
window.addEventListener( 'DOMContentLoaded', function() {
	ContentEdit.Root.get().bind('blur', function (element) {
		if ( element.constructor.name === 'Text' ) {
			element.convertIFrameTags();
		}
	});
});

// Saving WHILE shortcodes are being edited get an error, blur the text before being able to save to prevent this.
window.addEventListener( 'DOMContentLoaded', function() {
	document.querySelector('#wpadminbar').addEventListener('mouseover', function() {
		var root = ContentEdit.Root.get();
		var focused = root.focused();
		if ( focused ) {
			if ( focused.constructor.name === 'Text' ) {
				if ( focused.content ) {
					// Only do this for iframes.
					if ( focused.content.text().match( /^\s*<iframe.*/ ) ) {
						focused.blur();
					}
				}
			}
		}
	});
});


// When hitting return.
(function() {
	var proxied = ContentEdit.Text.prototype._keyReturn;
	ContentEdit.Text.prototype._keyReturn = function(ev) {
		if ( this.isIframeEditing ) {
			this.blur();
			return;
		}
		return proxied.call( this, ev );
	};
})();

/* globals ContentEdit, ContentSelect, pbsSelectorMatches, __extends, PBSEditor, ContentTools, HTMLString */

/**
 * Divs
 */
ContentEdit.Div = (function(_super) {
	__extends(Div, _super);

	function Div(tagName, attributes) {
		Div.__super__.constructor.call(this, tagName, attributes);
	}

	Div.prototype.cssTypeName = function() {
		return 'div';
	};
	Div.prototype.type = function() {
	  return 'Div';
	};
	Div.prototype.typeName = function() {
		return 'Div';
	};

    Div.prototype._onMouseUp = function(ev) {
		// Only do the event if we are the target, this is so that we won't bubble to other divs.
		if ( ev.target !== this._domElement ) {
			return;
		}

		Div.__super__._onMouseUp.call(this, ev);
		clearTimeout(this._dragTimeout);
	};

    Div.prototype._onMouseOut = function(ev) {
		Div.__super__._onMouseOut.call(this, ev);
		clearTimeout(this._dragTimeout);
	};

    Div.prototype._onMouseDown = function(ev) {
		// Only do the event if we are the target, this is so that we won't bubble to other divs.
		if ( ev.target !== this._domElement ) {
			return;
		}

		Div.__super__._onMouseDown.call(this, ev);
		clearTimeout(this._dragTimeout);
		if ( this.domElement() !== ev.target ) {
			return;
		}

		// This fixes dragging in Firefox.
		ev.preventDefault();

		return this._dragTimeout = setTimeout((function(_this) {
			return function() {
				return _this.drag(ev.pageX, ev.pageY);
			};
		})(this), ContentEdit.DRAG_HOLD_DURATION);
    };

	Div.prototype._onMouseOver = function(ev) {
		// Only do the event if we are the target, this is so that we won't bubble to other divs.
		if ( ev.target !== this._domElement ) {
			return;
		}

		Div.__super__._onMouseOver.call(this, ev);
	};

    Div.prototype._onMouseMove = function(ev) {
      Div.__super__._onMouseMove.call(this, ev);
    };

	Div.prototype.attach = function(component, index) {
		if ( this.children.length === 2 && typeof this.children[0].content !== 'undefined' && this.children[0].content.isWhitespace() ) {
			this.detach( this.children[0] );
		}
		if ( this.children.length === 2 && typeof this.children[1].content !== 'undefined' && this.children[1].content.isWhitespace() ) {
			this.detach( this.children[1] );
		}

		Div.__super__.attach.call(this, component, index);
	};

	Div.prototype.detach = function(element) {
		ContentEdit.NodeCollection.prototype.detach.call(this, element);

		// Make sure that we have at least 1 blank line, do not delete the last line.
		// Do this in a small timeout since this can trigger when a drop is cancelled.
		setTimeout( function() {
			if ( this.children.length === 0 ) {
				this.attach( new ContentEdit.Text('p'), 0);
			}
		}.bind( this ), 1 );
	};

	Div.prototype.focus = function() {

        var root = ContentEdit.Root.get();

		// Check if we have a text element we can select in the column.
		for ( var i = this.children.length - 1; i >= 0; i-- ) {
			if ( this.children[ i ].constructor ) {
				if ( this.children[ i ].constructor.name !== 'DivRow' ) {
					if ( this.children[ i ].isFocused() ) {
						return;
					}
					if ( root.focused() ) {
						root.focused().blur();
			        }
					if ( this.children[ i ].focus ) {
						this.children[ i ].focus();
					}
					return;
				}
			}
		}

		if ( this.children.length === 0 ) {
			this.attach( new ContentEdit.Text('p'), 0);
		}

		// Last resort, select the first element.
		if ( this.children[0].isFocused() ) {
			return;
		}
		if ( root.focused() ) {
			root.focused().blur();
        }
		this.children[0].focus();
	};

    Div.prototype.blur = function() {
      var root;
      root = ContentEdit.Root.get();
      if ( this.isFocused() ) {
        this._removeCSSClass('ce-element--focused');
        root._focused = null;
        return root.trigger('blur', this);
      }
    };

	Div._dropInside = function( element, target, placement ) {
		var insertIndex = 0;
		if (placement[0] === 'below') {
			insertIndex = target.children.length;
		}
		return target.attach(element, insertIndex);
	};

	Div.droppers = PBSEditor.allDroppers;

	Div._fromDOMElement = function(domElement) {
		var cls;

		var tagNames = ContentEdit.TagNames.get();
		if ( domElement.getAttribute('data-ce-tag') ) {
			cls = tagNames.match( domElement.getAttribute( 'data-ce-tag' ) );
		} else if ( domElement.classList.contains( 'pbs-row' ) ) {
			cls = tagNames.match( 'row' );
		} else if ( domElement.classList.contains( 'pbs-col' ) ) {
			cls = tagNames.match( 'column' );
		} else if ( domElement.getAttribute( 'data-shortcode' ) ) {
			cls = tagNames.match( 'shortcode' );
		} else if ( domElement.tagName === 'DIV' ) {
			// cls = tagNames.match('static');
			return null;
		} else {
			cls = tagNames.match(domElement.tagName);
		}

		return cls.fromDOMElement(domElement);
	};


	Div.fromDOMElement = function(domElement) {

		var element = this._fromDOMElement( domElement );
		if ( element ) {
			return element;
		}

		var c, childNode, childNodes, list, _i, _len;
		list = new this(domElement.tagName, this.getDOMElementAttributes(domElement));
		childNodes = (function() {
	        var _i, _len, _ref, _results;
	        _ref = domElement.childNodes;
	        _results = [];
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				c = _ref[_i];
				_results.push(c);
	        }
			return _results;
		})();

		var tagNames = ContentEdit.TagNames.get();
		for (_i = 0, _len = childNodes.length; _i < _len; _i++) {
			childNode = childNodes[_i];
			if (childNode.nodeType !== 1) {
				continue;
			}

			var cls;
			if ( childNode.getAttribute('data-ce-tag') ) {
				cls = tagNames.match(childNode.getAttribute('data-ce-tag'));
			} else {
				cls = tagNames.match(childNode.tagName);
			}

			element = cls.fromDOMElement(childNode);
			if (element) {
				list.attach(element);
			}
		}

		// If the column doesn't contain anything, create a single blank paragraph tag
		if ( list.children.length === 0 ) {
			list.attach( new ContentEdit.Text('p'), 0);
		}
		return list;
	};

	return Div;

})(ContentEdit.ElementCollection);

ContentEdit.TagNames.get().register(ContentEdit.Div, 'div');




/**
 * Rows
 */
ContentEdit.DivRow = (function(_super) {
	__extends(DivRow, _super);

	function DivRow(tagName, attributes) {
		DivRow.__super__.constructor.call(this, tagName, attributes);
		this.isCompundElement = true;
	}

	DivRow.prototype.cssTypeName = function() {
		return 'row';
	};
	DivRow.prototype.type = function() {
	  return 'DivRow';
	};
	DivRow.prototype.typeName = function() {
		return 'Row';
	};

	DivRow.prototype.showOutline = function() {
		var currElem = this;
		while ( currElem ) {
			if ( currElem.constructor.name === 'DivRow' ) {
				currElem._addCSSClass( 'pbs-new-column' );
			}
			currElem = currElem.parent();
		}
	};

	DivRow.prototype.hideOutline = function() {
		var currElem = this;
		while ( currElem ) {
			if ( currElem.constructor.name === 'DivRow' ) {
				currElem._removeCSSClass( 'pbs-new-column' );
			}
			currElem = currElem.parent();
		}
	};

	// Don't show the mouse over highlight
	DivRow.prototype._onMouseOver = function(ev) {

		this._removeCSSClass( 'pbs-new-column' );

		var root = ContentEdit.Root.get();
		var dragging = root.dragging();

		// Don't allow rows to be dragged inside themselves
		if ( root._dropTarget !== null ) {
			if ( dragging && pbsSelectorMatches( root._dropTarget.domElement(), '.ce-element--dragging *' ) ) {
		        root._dropTarget._removeCSSClass('ce-element--drop');
		        root._dropTarget._removeCSSClass('ce-element--drop-above');
		        root._dropTarget._removeCSSClass('ce-element--drop-below');
		        root._dropTarget._removeCSSClass('ce-element--drop-center');
		        root._dropTarget._removeCSSClass('ce-element--drop-left');
		        root._dropTarget._removeCSSClass('ce-element--drop-right');
				root._dropTarget = null;
				return;
			}
		}

		DivRow.__super__._onMouseOver.call(this, ev);

		if ( ! ev.target.classList.contains('pbs-row') ) {
			this._removeCSSClass('ce-element--over');
		}
	};

	// Cancel the drag event on mouse up
	DivRow.prototype._onMouseUp = function(ev) {
		DivRow.__super__._onMouseUp.call(this, ev);
		clearTimeout(this._dragTimeout);

		// If we fall inside the check for a click between rows, check if
		// we should create an empty paragraph between rows.
		if ( this._checkForBetweenRowClick ) {
			this.testClickBetweenRows( ev );
		}
		clearTimeout( this._betweenRowSelectorTimeout );
	};

    DivRow.prototype._onMouseOut = function(ev) {
		DivRow.__super__._onMouseOut.call(this, ev);
		clearTimeout(this._dragTimeout);

		// We are no longer checking whether between rows are clicked.
		this._checkForBetweenRowClick = false;
		clearTimeout( this._betweenRowSelectorTimeout );
	};

	DivRow.prototype._onMouseMove = function(ev) {

		// We are no longer checking whether between rows are clicked.
		this._checkForBetweenRowClick = false;
		clearTimeout( this._betweenRowSelectorTimeout );

		var root = ContentEdit.Root.get();
		if ( root._dropTarget !== null ) {

			// Dragging a row inside a column should put it above/below the whole parent row
			if ( root._dropTarget.constructor.name === 'DivCol' && root.dragging().constructor.name === 'DivRow' ) {
				var row = root._dropTarget.parent();
				root._dropTarget._onMouseOut(ev);
				row._onOver(ev);
				return;
			}
			// Allow cancelling drag when hovering the currently dragged item.
			if ( ev.target === root.dragging()._domElement ) {
				root._dropTarget._removeCSSClass('ce-element--drop');
		        root._dropTarget._removeCSSClass('ce-element--drop-above');
		        root._dropTarget._removeCSSClass('ce-element--drop-below');
		        root._dropTarget._removeCSSClass('ce-element--drop-center');
		        root._dropTarget._removeCSSClass('ce-element--drop-left');
		        root._dropTarget._removeCSSClass('ce-element--drop-right');
				root._dropTarget = null;
				return;
			}
			// Don't allow rows to be dragged inside themselves
			if ( pbsSelectorMatches( root._dropTarget._domElement, '.ce-element--dragging *' ) ) {
				root._dropTarget._removeCSSClass('ce-element--drop');
		        root._dropTarget._removeCSSClass('ce-element--drop-above');
		        root._dropTarget._removeCSSClass('ce-element--drop-below');
		        root._dropTarget._removeCSSClass('ce-element--drop-center');
		        root._dropTarget._removeCSSClass('ce-element--drop-left');
		        root._dropTarget._removeCSSClass('ce-element--drop-right');
				root._dropTarget = null;
				return;
			}
		}

		DivRow.__super__._onMouseMove.call(this, ev);
		clearTimeout(this._dragTimeout);
	};

	// Allow dragging the column
    DivRow.prototype._onMouseDown = function(ev) {
		DivRow.__super__._onMouseDown.call(this, ev);
		clearTimeout(this._dragTimeout);

		// Check if between rows is clicked.
		this._checkForBetweenRowClick = true;
		clearTimeout( this._betweenRowSelectorTimeout );
		this._betweenRowSelectorTimeout = setTimeout(function() {
			this._checkForBetweenRowClick = false;
		}.bind(this), 300 );

		if ( this.domElement() !== ev.target ) {
			return;
		}

		// This fixes dragging in Firefox.
		ev.preventDefault();

		// return this.drag(ev.pageX, ev.pageY);
		return this._dragTimeout = setTimeout((function(_this) {
			return function() {
				return _this.drag(ev.pageX, ev.pageY);
			};
		})(this), ContentEdit.DRAG_HOLD_DURATION);
    };

	// Allow these elements to be dropped around Rows
	DivRow.droppers = PBSEditor.allDroppers;

	// Make sure all rows have the pbs-row class
	DivRow.prototype.mount = function() {
		DivRow.__super__.mount.call(this);
		this.addCSSClass('pbs-row');

		// Generate a unique class if there isn't one yet.
		// var currentClass = this._domElement.getAttribute( 'class' );
		// if ( ! currentClass.match( /pbs_row_uid_/ ) ) {
		// 	this.addCSSClass( 'pbs_row_uid_' + Math.floor((1 + Math.random()) * 0x10000000).toString(36) );
		// }

		// Full-width rows get busted when mounting, this fixes them.
		if ( window._pbsFixRowWidth ) {
			window._pbsFixRowWidth( this._domElement );
		}
	};


	// Create Row elements from dom elements
	DivRow.fromDOMElement = function(domElement) {
		var childNode, childNodes, list, _i, _len;

		list = new this(domElement.tagName, this.getDOMElementAttributes(domElement));
		childNodes = domElement.children;

		var tagNames = ContentEdit.TagNames.get();
		for (_i = 0, _len = childNodes.length; _i < _len; _i++) {
			childNode = childNodes[_i];
			if (childNode.nodeType !== 1) {
				continue;
			}

			// Only allow div columns to be placed inside rows
			if ( childNode.tagName.toLowerCase() !== 'div' && ! childNode.classList.contains( 'pbs-col' ) ) {
				continue;
			}

			var element = tagNames.match( 'column' ).fromDOMElement( childNode );
			if (element) {
				list.attach(element);
			}

		}

		return list;
	};

	DivRow.prototype.focus = function() {
		var overElem = document.querySelector('.ce-element--over');

		// If nothing's over, this means that we might be just starting the editor
		if ( overElem === null ) {
			if ( this.children[0].isFocused() ) {
				return;
			}
			this.children[0].focus();
		}

		// Select the last column when clicking directly on the row
		if ( document.querySelector('.ce-element--over') === this._domElement ) {
			if ( this.children[ this.children.length - 1 ].isFocused() ) {
				return;
			}
			this.children[ this.children.length - 1 ].focus();
		}
	};

	DivRow.prototype.addNewColumn = function( index ) {
		if ( typeof index === 'undefined' ) {
			index = this.children.length;
		}

		// If existing columns have a gap, copy it.
		var existingGap = this.hasColumnGap();

		// If any columns don't have a flex-basis yet, add one.
		for ( var i = 0; i < this.children.length; i++ ) {
			var currFlexBasis = this.children[ i ].style( 'flex-basis' );
			if ( ! currFlexBasis || currFlexBasis === '0px' ) {
				this.children[ i ].style( 'flex-basis', ( 100 / ( this.children.length + 1 ) ) + '%' );
			}
		}

		var col = new ContentEdit.DivCol('div');
		var p = new ContentEdit.Text('p', {}, '');
		col.attach(p);
		this.attach( col, index );

		// Add some default width.
		col.style( 'flex-grow', '1' );
		col.style( 'flex-basis', ( 100 / this.children.length ) + '%' );

		// Apply existing column gap to the new column, or the previous column if adding on the end of the row.
		if ( existingGap && index !== this.children.length - 1 ) {
			col.style( 'margin-right', existingGap );
		} else if ( existingGap ) {
			this.children[ index - 1 ].style( 'margin-right', existingGap );
		}

		return col;
	};

	DivRow.prototype.adjustColumnNumber = function( numColumns ) {

		if ( this.children.length < numColumns ) {
			while ( this.children.length < numColumns ) {
				this.addNewColumn();
			}

		} else if ( this.children.length > numColumns ) {
			while ( this.children.length > numColumns ) {
				this.children[ numColumns ].blurIfFocused();
				this.children[ numColumns - 1 ].merge( this.children[ numColumns ] );
			}
		}
	};

	DivRow.prototype.adjustColumns = function( columnEquation ) {

		var arrWidths = columnEquation.replace(/(\s*\+\s*|\s+)/g, ' ').split(' ');

		this.adjustColumnNumber( arrWidths.length );

		var highestDenom = 1;
		for ( var i = 0; i < arrWidths.length; i++ ) {
			if ( arrWidths[i].indexOf('/') !== -1 ) {
				var denom = parseInt( arrWidths[i].split('/')[1], 10 );
				if ( denom > highestDenom ) {
					highestDenom = denom;
				}
			}
		}

		// Adjust the sizes
		for ( i = 0; i < arrWidths.length; i++ ) {
			var grow = 1;
			if ( arrWidths[i].indexOf('/') !== -1 ) {
				var nums = arrWidths[i].split('/');
				grow = nums[0] / nums[1] * highestDenom;
			} else {
				grow = parseInt( arrWidths[i], 10 );
			}
			this.children[i].style( 'flex-grow', grow );
		}

	};

	DivRow.prototype.clone = function() {
        this.blurIfFocused();
		var clone = document.createElement('div');
		clone.innerHTML = this.html();
		var newRow = ContentEdit.Div.fromDOMElement( clone.childNodes[0] );
		var index = this.parent().children.indexOf( this );
		this.parent().attach( newRow, index + 1 );
		newRow.focus();
		return newRow;
	};

	DivRow.prototype.getColumnEquation = function() {
		var col, colStyle, i, totalGrow = 0;

		for ( i = 0; i < this.children.length; i++ ) {
			col = this.children[ i ];
			colStyle = window.getComputedStyle( col._domElement );
			totalGrow += parseFloat( colStyle[ 'flex-grow' ] );
		}

		var equation = '';
		for ( i = 0; i < this.children.length; i++ ) {
			col = this.children[ i ];
			colStyle = window.getComputedStyle( col._domElement );
			equation += equation ? ' + ' : '';
			equation += parseFloat( colStyle[ 'flex-grow' ] ) + '/' + totalGrow;
		}

		return equation;
	};

	DivRow.prototype.blurIfFocused = function() {
        var root = ContentEdit.Root.get();
        if ( root.focused() ) {
			var currElem = root.focused();
			while ( currElem ) {
				if ( currElem === this ) {
					root.focused().blur();
					return;
				}
				currElem = currElem.parent();
			}
        }
	};

	DivRow.prototype.hasColumnGap = function() {
		var existingMargin = '';
		var currMargin = '';
		for ( var i = 0; i < this.children.length; i++ ) {
			if ( i < this.children.length - 1 ) {
				if ( currMargin === '' ) {
					currMargin = this.children[ i ]._domElement.style['margin-right'];
					existingMargin = currMargin;
				} else {
					if ( currMargin !== this.children[ i ]._domElement.style['margin-right'] ) {
						existingMargin = '';
					}
				}
			} else {
				if ( this.children[ i ]._domElement.style['margin-right'] !== '' ) {
					existingMargin = '';
				}
			}
		}
		return existingMargin;
	};

	DivRow.prototype.testClickBetweenRows = function(ev) {

		// Check if we're clicking on a row.
		if ( ! ev.target._ceElement ) {
			return;
		}
		if ( ev.target._ceElement.constructor.name !== 'DivCol' && ev.target._ceElement.constructor.name !== 'DivRow' ) {
			return;
		}
		if ( ev.target._ceElement.constructor.name === 'DivCol' ) {
			if ( ev.target._ceElement.parent() !== this ) {
				return;
			}
		}
		if ( ev.target._ceElement.constructor.name === 'DivRow' ) {
			if ( ev.target._ceElement !== this ) {
				return;
			}
		}
		// Prevent rows which are inside compound elements.
		if ( this.parent().constructor.name !== 'Region' && this.parent().constructor.name !== 'DivCol' ) {
			return;
		}

		// Check if we clicked near the edge.
		var clickedOnTop = false;
		var clickedOnBottom = false;
		if ( ev.offsetY < 10 ) {
			clickedOnTop = true;
		} else if ( ev.offsetY > ev.target.offsetHeight - 10 ) {
			clickedOnBottom = true;
		} else {
			return;
		}

		// Add the empty paragraph element if necessary.
		var index = this.parent().children.indexOf( this );
		var doAddEmpty = true, otherElement, p;
		if ( clickedOnTop ) {
			if ( index ) {
				otherElement = this.parent().children[ index - 1 ];
				if ( otherElement.type() === 'Text' ) {
					doAddEmpty = false;
				}
			}
			if ( doAddEmpty ) {
				p = new ContentEdit.Text( 'p', {}, '' );
				this.parent().attach( p, index );
				p.focus();
			}
		} else if ( clickedOnBottom ) {
			if ( index < this.parent().children.length - 1 ) {
				otherElement = this.parent().children[ index + 1 ];
				if ( otherElement.type() === 'Text' ) {
					doAddEmpty = false;
				}
			}
			if ( doAddEmpty ) {
				p = new ContentEdit.Text( 'p', {}, '' );
				this.parent().attach( p, index + 1 );
				p.focus();
			}
		}
	};

	return DivRow;

})(ContentEdit.ElementCollection);

ContentEdit.TagNames.get().register(ContentEdit.DivRow, 'row');


/**
 * Columns
 */
ContentEdit.DivCol = (function(_super) {
	__extends(DivCol, _super);

	function DivCol(tagName, attributes) {
		DivCol.__super__.constructor.call(this, tagName, attributes);
	}

	DivCol.prototype.cssTypeName = function() {
		return 'col';
	};
	DivCol.prototype.type = function() {
	  return 'DivRow';
	};
	DivCol.prototype.typeName = function() {
		return 'Column';
	};

	// Cancel the drag event on mouse up
	DivCol.prototype._onMouseUp = function(ev) {
		DivCol.__super__._onMouseUp.call(this, ev);
		clearTimeout(this._dragTimeout);
	};

    DivCol.prototype._onMouseOut = function(ev) {
		DivCol.__super__._onMouseOut.call(this, ev);
		clearTimeout(this._dragTimeout);
	};

    DivCol.prototype._onMouseDown = function(ev) {
		DivCol.__super__._onMouseDown.call(this, ev);

		clearTimeout(this._dragTimeout);
		if ( this.domElement() !== ev.target ) {
			return;
		}

		// This fixes dragging in Firefox.
		ev.preventDefault();

		// If we are in the drag row handle, drag the whole row
		// @see _onMouseMove
		// if ( this._domElement.classList.contains('pbs-drag-row') ) {
		// 	return this.parent().drag(ev.pageX, ev.pageY);
		// }

		if ( ! this.draggableParent ) {
			this.draggableParent = this.parent();
		}

		return this._dragTimeout = setTimeout((function(_this) {
			return function() {
				// Drag the column
				return _this.draggableParent.drag(ev.pageX, ev.pageY);
				// return _this.drag(ev.pageX, ev.pageY);
			};
		})(this), ContentEdit.DRAG_HOLD_DURATION);

	};


    DivCol.prototype._onMouseMove = function(ev) {
		DivCol.__super__._onMouseMove.call(this, ev);
		DivCol.__super__._onMouseOver.call(this, ev);
		
		clearTimeout(this._dragTimeout);

		var root = ContentEdit.Root.get(),
			dragging = root.dragging();

		// When dragging into a column, drag over the parent row instead.
		if ( dragging && ev.target === this._domElement ) {

			this._onMouseOut(ev);
			this.parent()._onOver(ev);
			this.parent()._removeCSSClass( 'ce-element--over' );

		} else if ( ev.target !== this._domElement ) {

			this._removeCSSClass('ce-element--over');
		}
	};

	// No longer needed, but keep
	/*
	DivCol._dropColumn = function(element, target, placement) {

		var insertIndex;

		// If the column is dragged above/below a column, create a new row for the column then use that
		// but if the column is alone, bring the whole row to keep the styles.
		if ( target._domElement.classList.contains('pbs-drop-outside-row') ) {

			if ( element.parent().children.length === 1 ) {
				var row = element.parent();
				row.parent().detach( row );

				insertIndex = target.parent().parent().children.indexOf( target.parent() );
				if ( placement[0] === 'below' ) {
					insertIndex++;
				}

				return target.parent().parent().attach( row, insertIndex );

			} else {
				element.parent().detach( element );

				insertIndex = target.parent().parent().children.indexOf( target.parent() );
				if ( placement[0] === 'below' ) {
					insertIndex++;
				}

				var newRow;
				newRow = new ContentEdit.DivRow('div');
				newRow.attach( element );

				return target.parent().parent().attach( newRow, insertIndex );

			}

		} else {

			element.parent().detach(element);
			insertIndex = target.parent().children.indexOf(target);
			if (placement[1] === 'right' || placement[1] === 'center') {
				insertIndex++;
			}
			return target.parent().attach(element, insertIndex);
		}
	};
	*/

	// Not needed anymore, but keep
	/*
	DivCol._dropInsideOrOutside = function( element, target, placement ) {

		var row, insertIndex;

		// When dragging on the top/bottom edge of a column,
		// we'll have this class for dragging to before/after the parent row
		if ( target._domElement.classList.contains('pbs-drop-outside-row') ) {

			row = target.parent();
			element.parent().detach(element);
			insertIndex = row.parent().children.indexOf( row );
			if ( placement[0] === 'below' ) {
				insertIndex++;
			}
			return row.parent().attach( element, insertIndex );

		} else if ( element.constructor.name === 'DivCol' && target.constructor.name !== 'DivCol' ) {

			if ( element.parent().children.length === 1 ) {
				row = element.parent();
				row.parent().detach( row );

				insertIndex = target.parent().children.indexOf( target );
				if ( placement[0] === 'below' ) {
					insertIndex++;
				}

				return target.parent().attach( row, insertIndex );

			} else {
				element.parent().detach( element );

				insertIndex = target.parent().children.indexOf( target );
				if ( placement[0] === 'below' ) {
					insertIndex++;
				}

				var newRow;
				newRow = new ContentEdit.DivRow('div');
				newRow.attach( element );

				return target.parent().attach( newRow, insertIndex );
			}



		} else {
			return ContentEdit.Div._dropInside( element, target, placement );
		}
	};
	*/

	// Allow pressing tab / shift+tab to move between columns.
	DivCol.prototype._onKeyDown = function( ev ) {
		DivCol.__super__._onMouseDown.call(this, ev);

		// Add new column.
		var index;
		if ( ev.keyCode === 190 && ( ev.metaKey || ev.ctrlKey ) && ev.shiftKey ) {
			index = this.parent().children.indexOf( this );
			this.blurIfFocused();
			this.parent().addNewColumn( index + 1 ).focus();
			ev.preventDefault();
			return;
		}

		// Delete column.
		if ( ev.keyCode === 188 && ( ev.metaKey || ev.ctrlKey ) && ev.shiftKey ) {
			index = this.parent().children.indexOf( this );
			this.blurIfFocused();
			var parent = this.parent();
			parent.detach( this );
			if ( index > 0 && parent && parent.children.length ) {
				index--;
			}
			if ( parent && parent.children.length ) {
				parent.children[ index ].focus();
			}
			ev.preventDefault();
			return;
		}

		// Don't do this for lists & tables.
		if ( ev.target._ceElement ) {
			if ( ev.target._ceElement.constructor.name.toLowerCase().indexOf( 'list' ) !== -1 ) {
				return;
			} else if ( ev.target._ceElement.constructor.name.toLowerCase().indexOf( 'table' ) !== -1 ) {
				return;
			}
		}

		// Check if tab is pressed.
		if ( ev.keyCode === 9 ) {
			if ( ! ev.shiftKey && this.nextSibling() ) {
				this.nextSibling().focus();

				// Don't propagate to nested columns.
				ev.stopPropagation();
			} else if ( ev.shiftKey && this.previousSibling() ) {
				this.previousSibling().focus();

				// Don't propagate to nested columns.
				ev.stopPropagation();
			}

		}

	};

	DivCol.droppers = {};

	DivCol.prototype.mount = function() {
		DivCol.__super__.mount.call(this);

		// Make sure columns have a .pbs-col class
		this.addCSSClass('pbs-col');

		// Generate a unique class if there isn't one yet.
		// var currentClass = this._domElement.getAttribute( 'class' );
		// if ( ! currentClass.match( /pbs_col_uid_/ ) ) {
		// 	this.addCSSClass( 'pbs_col_uid_' + Math.floor((1 + Math.random()) * 0x10000000).toString(36) );
		// }

		// Check how many empty paragraphs are there.
		var numEmpties = 0;
		var numNonEmpties = 0;
		for ( var i = this.children.length - 1; i >= 0; i-- ) {
			if ( typeof this.children[i].content !== 'undefined' ) {
				if ( this.children[i].content.isWhitespace() ) {
					numEmpties++;
					continue;
				}
			}
			numNonEmpties++;
		}

		// Remove empty paragraph tags
		if ( numEmpties > 1 ) {
			for ( i = this.children.length - 1; i >= 0; i-- ) {
				if ( typeof this.children[i].content !== 'undefined' ) {
					if ( this.children[i].content.isWhitespace() ) {
						if ( numEmpties > 1 && numNonEmpties === 0 ) {
							this.detach( this.children[i] );
							numEmpties--;
						} else {
							this.detach( this.children[i] );
						}
					}
				}
			}
		}
	};

	DivCol.prototype.merge = function ( element ) {

		// Append the other column's content
		var len = element.children.length;
		for ( var i = 0; i < len; i++ ) {
			this.attach( element.children[0] );
		}

		// Remove the old column
		element.parent().detach( element );

		// Clean out the empty elements
		len = this.children.length;
		for ( i = len - 1; i >= 0; i-- ) {
			if ( this.children[i].content ) {
				if ( this.children[i].content.isWhitespace() ) {
					this.detach( this.children[i] );
				}
			}
		}

		return this.taint();
    };

	DivCol.fromDOMElement = function(domElement) {
		var c, childNode, childNodes, list, _i, _len;
		list = new this(domElement.tagName, this.getDOMElementAttributes(domElement));
		childNodes = (function() {
	        var _i, _len, _ref, _results;
	        _ref = domElement.childNodes;
	        _results = [];
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				c = _ref[_i];
				_results.push(c);
	        }
			return _results;
		})();

		var tagNames = ContentEdit.TagNames.get();
		for (_i = 0, _len = childNodes.length; _i < _len; _i++) {
			childNode = childNodes[_i];
			if (childNode.nodeType !== 1) {
				continue;
			}

			var cls;
			if ( childNode.getAttribute('data-ce-tag') ) {
				cls = tagNames.match(childNode.getAttribute('data-ce-tag'));
			} else {
				cls = tagNames.match(childNode.tagName);
			}

			var element = cls.fromDOMElement(childNode);
			if (element) {
				list.attach(element);
			}
		}

		// If the column doesn't contain anything, create a single blank paragraph tag
		if ( list.children.length === 0 ) {
			list.attach( new ContentEdit.Text('p'), 0);
		}
		return list;
	};

	function selectAfterFocus( domElement, index ) {
		var selection = new ContentSelect.Range( index, index );
		selection.select(domElement);
	}

	DivCol.prototype.focus = function() {

        var root = ContentEdit.Root.get();

		// Check if we have a text element we can select in the column.
		// for ( var i = this.children.length - 1; i >= 0; i-- ) {
		for ( var i = 0; i < this.children.length; i++ ) {
			if ( this.children[ i ].constructor ) {
				if ( this.children[ i ].constructor.name !== 'DivRow' ) {
					if ( this.children[ i ].isFocused() ) {
						return;
					}

					if ( root.focused() ) {
						root.focused().blur();
					}
					if ( this.children[ i ].focus ) {
						this.children[ i ].focus();
					}

					// Select the element
					var index = 0;
					if ( this.children[ i ].content ) {
						index = this.children[ i ].content.length();
					}

					// Add the cursor, we need to do this at set timeout because
					// some other events are affecting the selection. We can't do
					// a preventDefault or else dragging to the screen edges won't work.
					var domElement = this.children[ i ]._domElement;
					setTimeout( selectAfterFocus, 1, domElement, index );
					return;
				}
			}
		}


		// If no text element and all children are compound elements, focus the column directly.
		if ( this.children.length ) {
			var allCompounds = true;
			for ( i = 0; i < this.children.length; i++ ) {
				if ( typeof this.children[ i ].isCompundElement === 'undefined' || ! this.children[ i ].isCompundElement ) {
					allCompounds = false;
				}
			}
			if ( allCompounds ) {
				if ( root.focused() ) {
					root.focused().blur();
				}

				this._addCSSClass( 'ce-element--focused' );
		        root._focused = this;
				this.domElement().focus();
				return root.trigger( 'focus', this );
			}
		}


		// If no text element and there's a row, select the first column inside it.
		for ( i = this.children.length - 1; i >= 0; i-- ) {
			if ( this.children[ i ].constructor ) {
				if ( this.children[ i ].constructor.name === 'DivRow' ) {
					if ( this.children[ i ].children[0].isFocused() ) {
						return;
					}
					if ( root.focused() ) {
						root.focused().blur();
					}
					this.children[ i ].children[0].focus();
					return;
				}
			}
		}

		if ( this.children.length === 0 ) {
			this.attach( new ContentEdit.Text('p'), 0);
		}

		// Last resort, select the first element.
		if ( this.children[0].isFocused() ) {
			return;
		}
		if ( root.focused() ) {
			root.focused().blur();
		}
		this.children[0].focus();
	};

	DivCol.prototype.clone = function() {
		var existingGap = this.parent().hasColumnGap();

		this.blurIfFocused();
		var clone = document.createElement('div');
		clone.innerHTML = this.html();
		var newCol = ContentEdit.Div.fromDOMElement( clone.childNodes[0] );
		var index = this.parent().children.indexOf( this );
		this.parent().attach( newCol, index + 1 );
		newCol.focus();

		// Remove existing column gap in the original column if there is one.
		if ( existingGap && this.style( 'margin-right' ) !== existingGap ) {
			this.style( 'margin-right', existingGap );
		}

		return newCol;
	};

	DivCol.prototype.blurIfFocused = function() {
        var root = ContentEdit.Root.get();
        if ( root.focused() ) {
			var currElem = root.focused();
			while ( currElem ) {
				if ( currElem === this ) {
					root.focused().blur();
					return;
				}
				currElem = currElem.parent();
			}
        }
	};

	return DivCol;

})(ContentEdit.Div);

ContentEdit.TagNames.get().register(ContentEdit.DivCol, 'column');


/**
 * Remove empty elements inside columns upon drop
 */
ContentEdit.Root.get().bind('drop', function (element, droppedElement) {
	if ( droppedElement === null ) {
		return;
	}
	if ( droppedElement.parent() === null ) {
		return;
	}
	var col, i;

	if ( droppedElement.parent().constructor.name === 'DivCol' || droppedElement.parent().constructor.name === 'Div' ) {
		col = droppedElement.parent();
		for ( i = 0; i < col.children.length; i++ ) {
			if ( col.children[i].content === null || typeof col.children[i].content === 'undefined' ) {
				continue;
			}
			if ( col.children.length > 1 && col.children[i].content.isWhitespace() && col.children[i] !== element ) {
				col.detach(col.children[i]);
			}
		}

	} else if ( droppedElement.parent().constructor.name === 'DivRow' ) {
		col = droppedElement;
		for ( i = 0; i < col.children.length; i++ ) {
			if ( col.children[i].content === null || typeof col.children[i].content === 'undefined' ) {
				continue;
			}
			if ( col.children.length > 1 && col.children[i].content.isWhitespace() && col.children[i] !== element ) {
				col.detach(col.children[i]);
			}
		}
	}
});


/**
 * Remove full-width attribute and styles when a Row becomes nested.
 */
ContentEdit.Root.get().bind('drop', function (element, droppedElement) {
	if ( droppedElement === null ) {
		return;
	}
	if ( droppedElement.parent() === null ) {
		return;
	}

	if ( element.constructor.name === 'DivRow'  ) {
		if ( element.parent().constructor.name === 'Div' || element.parent().constructor.name === 'DivCol' ) {

			if ( element.attr('data-width') ) {

				element.style('margin-right', '');
				element.style('margin-left', '');

				if ( element.attr('data-width') === 'full-width-retain-content' ) {
					element.style('padding-right', '');
					element.style('padding-left', '');
				}

				// Remove the width if nested.
				element.removeAttr( 'data-width' );
			}
		}
	}
});



/**
 * When pressing the return key at the end of a div, create a new paragraph outside the div
 */
// (function() {
// 	var proxied = ContentEdit.Text.prototype._keyReturn;
// 	ContentEdit.Text.prototype._keyReturn = function(ev) {
// 		ev.preventDefault();
//
// 		if ( ! this.content.isWhitespace() ) {
// 			return proxied.call( this, ev );
// 		}
//
// 		if ( ( this.parent().constructor.name === 'DivCol' || this.parent().constructor.name === 'Div' ) && this.parent().children.indexOf(this) === this.parent().children.length - 1 ) {
//
// 			var row = this.parent().parent();
// 			this.parent().detach(this);
// 			var index = row.parent().children.indexOf(row) + 1;
// 			var p = new ContentEdit.Text('p', {}, '');
// 			row.parent().attach(p, index );
// 			p.focus();
// 			return;
// 		}
//
// 		return proxied.call( this, ev );
// 	};
// })();


/**
 * When pressing the up key at the very start of a div, create a new paragraph before the div
 */
(function() {
	var proxied = ContentEdit.Text.prototype._keyUp;
	ContentEdit.Text.prototype._keyUp = function( ev ) {
	    var selection = ContentSelect.Range.query(this._domElement);
		// this.parent().parent().parent().children.indexOf( this.parent().parent() ) === 0
		if ( ( this.parent().constructor.name === 'DivCol' || this.parent().constructor.name === 'Div' ) && this.parent().children.indexOf(this) === 0 && selection.get()[0] === 0 ) {
			var row = this.parent().parent();
			var index = row.parent().children.indexOf(row);
			if ( index > 0 ) {
				if ( row.parent().children[ index - 1 ].content ) {
					row.parent().children[ index - 1 ].focus();
					return;
				}
			}
			var p = new ContentEdit.Text('p', {}, '');
			row.parent().attach( p, index );
			p.focus();
			return;
		}
		return proxied.call( this, ev );
	};
})();

/**
 * When pressing the down key at the very end of a div, create a new paragraph after the div
 */
(function() {
	var proxied = ContentEdit.Text.prototype._keyDown;
	ContentEdit.Text.prototype._keyDown = function( ev ) {
	    var selection = ContentSelect.Range.query(this._domElement);
		// this.parent().parent().parent().children.indexOf( this.parent().parent() ) === this.parent().parent().parent().children.length - 1
		if ( ( this.parent().constructor.name === 'DivCol' || this.parent().constructor.name === 'Div' ) && this.parent().children.indexOf(this) === this.parent().children.length - 1 && this._atEnd(selection) ) {
			var row = this.parent().parent();
			var index = row.parent().children.indexOf( row );
			if ( index < row.parent().children.length - 1 ) {
				if ( row.parent().children[ index + 1 ].content ) {
					row.parent().children[ index + 1 ].focus();
					return;
				}
			}
			var p = new ContentEdit.Text('p', {}, '');
			row.parent().attach( p, index + 1 );
			p.focus();
			return;
		}
		return proxied.call( this, ev );
	};
})();


/**
 * Don't triger an empty text dettach if the text is.
 */
(function() {
	var proxied = ContentEdit.Text.prototype.blur;
	ContentEdit.Text.prototype.blur = function( ev ) {
		if ( this.content.isWhitespace() ) {
			if ( this.parent() ) {
				if ( this.parent().constructor.name === 'Div' || this.parent().constructor.name === 'DivCol' ) {
					var otherWhitespaces = 0;
					var otherNonWhitespaces = 0;
					for ( var i = 0; i < this.parent().children.length; i++ ) {
						var sibling = this.parent().children[ i ];
						if ( sibling.content ) {
							if ( sibling.content.isWhitespace() ) {
								otherWhitespaces++;
								continue;
							}
						}
						otherNonWhitespaces++;
					}
					if ( otherWhitespaces === 1 && otherNonWhitespaces === 0 ) {
						var error;
						if ( this.isMounted() ) {
							this._syncContent();
						}
						if (this.isMounted()) {
							try {
								this._domElement.blur();
							} catch (_error) {
								error = _error;
							}
							this._domElement.removeAttribute('contenteditable');
						}
						return ContentEdit.Text.__super__.blur.call(this);
					}
				}
			}
		}
		return proxied.call( this, ev );
	};
})();


/**
 * When dragging a column on an element inside it, remove the effects to make it look like
 * nothing's happening.
 */
// ContentEdit.Element.prototype._onColOverrideMouseOver = ContentEdit.Element.prototype._onMouseOver;
// ContentEdit.Element.prototype._onMouseOver = function(ev) {
// 	var ret = this._onColOverrideMouseOver(ev);
//
// 	var root = ContentEdit.Root.get();
// 	var dragging = root.dragging();
//
// 	if ( dragging ) {
// 		if ( dragging.constructor.name === 'DivCol' ) {
// 			if ( pbsSelectorMatches( ev.target, '.ce-element--dragging *' ) ) {
// 				var over = document.querySelector('.ce-element--over');
// 				if ( over ) {
// 			        over._ceElement._removeCSSClass('ce-element--over');
// 					dragging._addCSSClass('ce-element--over');
// 				}
// 			}
// 		}
// 	}
//
// 	return ret;
// };


// Remove the computed widths on rows on saving.
wp.hooks.addFilter( 'pbs.save', function( html ) {

	html = html.replace(/(<[^>]+pbs-row[^>]+style=[^>]*[^-])(max-width:\s?[-0-9.\w]+;?\s?)([^>]+>)/g, '$1$3');
	html = html.replace(/(<[^>]+pbs-row[^>]+style\=[^>]*[^-])(width:\s?[-0-9.\w]+;?\s?)([^>]+>)/g, '$1$3');
	html = html.replace(/(<[^>]+pbs-row[^>]+style=[^>]*[^-])(left:\s?[-0-9.\w]+;?\s?)([^>]+>)/g, '$1$3');

	// Remove spaces surrounding divs.
	html = html.replace( /(<div[^>]+>)\s+/gm, '$1' );
	html = html.replace( /\s+(<\/div>)/gm, '$1' );

	// For full-width-retain-content,
	// Don't save left/right paddings & margins since those will be computed by the full-width script.
	html = html.replace( /<[^>]+pbs-row[^>]+data-width\=["']full-width-retain-content["'][^>]+>/g,
		function ( match ) {
			match = match.replace( /(padding:\s?)([\d\w.]+)\s([\d\w.]+)\s([\d\w.]+)\s([\d\w.]+)[;"']/, 'padding-top: $2; padding-bottom: $4;' );
			match = match.replace( /(padding:\s?)([\d\w.]+)\s([\d\w.]+)\s([\d\w.]+)[;"']/, 'padding-top: $2; padding-bottom: $4;' );
			match = match.replace( /(padding:\s?)([\d\w.]+)\s([\d\w.]+)[;"']/, 'padding-top: $2; padding-bottom: $2;' );
			match = match.replace( /(padding:\s?)([\d\w.]+)[;"']/, 'padding-top: $2; padding-bottom: $2;' );

			match = match.replace( /\s?padding-left:\s?[\d\w.]+;?\s?/g, '' );
			match = match.replace( /\s?padding-right:\s?[\d\w.]+;?\s?/g, '' );

			match = match.replace( /(margin:\s?)([\d\w.]+)\s([\d\w.]+)\s([\d\w.]+)\s([\d\w.]+)[;"']/, 'margin-top: $2; margin-bottom: $4;' );
			match = match.replace( /(margin:\s?)([\d\w.]+)\s([\d\w.]+)\s([\d\w.]+)[;"']/, 'margin-top: $2; margin-bottom: $4;' );
			match = match.replace( /(margin:\s?)([\d\w.]+)\s([\d\w.]+)[;"']/, 'margin-top: $2; margin-bottom: $2;' );
			match = match.replace( /(margin:\s?)([\d\w.]+)[;"']/, 'margin-top: $2; margin-bottom: $2;' );

			match = match.replace( /\s?margin-left:\s?[\d\w.-]+;?\s?/g, '' );
			match = match.replace( /\s?margin-right:\s?[\d\w.-]+;?\s?/g, '' );

			match = match.replace( /([^-])left:\s?[-\d\w.]+;?\s?/g, '$1' );
			return match;
		}
	);

	// For full-width,
	// Don't save left/right margins since those will be computed by the full-width script.
	html = html.replace( /<[^>]+pbs-row[^>]+data-width\=["']full-width["'][^>]+>/g,
		function ( match ) {
			match = match.replace( /(margin:\s?)([\d\w.]+)\s([\d\w.]+)\s([\d\w.]+)\s([\d\w.]+)[;"']/, 'margin-top: $2; margin-bottom: $4;' );
			match = match.replace( /(margin:\s?)([\d\w.]+)\s([\d\w.]+)\s([\d\w.]+)[;"']/, 'margin-top: $2; margin-bottom: $4;' );
			match = match.replace( /(margin:\s?)([\d\w.]+)\s([\d\w.]+)[;"']/, 'margin-top: $2; margin-bottom: $2;' );
			match = match.replace( /(margin:\s?)([\d\w.]+)[;"']/, 'margin-top: $2; margin-bottom: $2;' );

			match = match.replace( /\s?margin-left:\s?[\d\w.-]+;?\s?/g, '' );
			match = match.replace( /\s?margin-right:\s?[\d\w.-]+;?\s?/g, '' );

			match = match.replace( /([^-])left:\s?[-\d\w.]+;?\s?/g, '$1' );
			return match;
		}
	);


	return html;
} );


/**
 * Fixes issue: When pasting multiple lines of text inside a row, the text gets pasted OUTSIDE the row.
 * Problem: CT checks if the parent is not of type 'Region'
 * Solution: Check also if the parent is a 'DivRow'.
 * Most of this code comes from _EditorApp.prototype.paste
 */
(function() {
	var _EditorApp = ContentTools.EditorApp.getCls();
	var proxied = _EditorApp.prototype.paste;
	_EditorApp.prototype.paste = function(element, clipboardData) {
		var content, encodeHTML, i, insertAt, insertIn, insertNode, item, lastItem, line, lineLength, lines, type, _i, _len;
        content = clipboardData.getData('text/plain');
        lines = content.split('\n');
        lines = lines.filter(function(line) {
			return line.trim() !== '';
        });
        if (!lines) {
			return proxied.call( this, element, clipboardData );
        }
		encodeHTML = HTMLString.String.encode;
        type = element.type();
		if ( type === 'PreText' || type === 'ListItemText' || element.parent().type() !== 'DivRow' ) {
			return proxied.call( this, element, clipboardData );
		}
		// We're sure that the element is inside a Row.
		if ( lines.length > 1 || ! element.content ) {
            insertNode = element;
			insertIn = insertNode.parent();
			insertAt = insertIn.children.indexOf(insertNode) + 1;
			for (i = _i = 0, _len = lines.length; _i < _len; i = ++_i) {
				line = lines[i];
				line = encodeHTML(line);
				item = new ContentEdit.Text('p', {}, line);
				lastItem = item;
				insertIn.attach(item, insertAt + i);
			}
			lineLength = lastItem.content.length();
			lastItem.focus();
			return lastItem.selection(new ContentSelect.Range(lineLength, lineLength));
		}
		return proxied.call( this, element, clipboardData );
	};
})();

/* globals ContentEdit, __extends, PBSEditor, pbsParams */

ContentEdit.Icon = ( function( _super ) {
	__extends( Icon, _super );

	function Icon( tagName, attributes, content ) {

		if ( ! attributes['data-ce-tag'] ) {
			attributes['data-ce-tag'] = 'icon';
		}
		if ( ! attributes.role ) {
			attributes.role = 'presentation';
		}

		Icon.__super__.constructor.call(this, tagName, attributes);

        this._content = content;

        this._domSizeInfoElement = null;
        this._aspectRatio = 1;
	}

	Icon.prototype.cssTypeName = function() {
		return 'icon';
	};

	Icon.prototype.typeName = function() {
		return 'Icon';
	};

    Icon.fromDOMElement = function(domElement) {
		return new this(domElement.tagName, this.getDOMElementAttributes(domElement), domElement.innerHTML);
    };

    Icon.droppers = PBSEditor.allDroppers;

    Icon.prototype.focus = function(supressDOMFocus) {
		var root;
		root = ContentEdit.Root.get();
		if (this.isFocused()) {
			return;
		}
		if (root.focused()) {
			root.focused().blur();
		}
		this._addCSSClass('ce-element--focused');
		root._focused = this;
		if (this.isMounted() && !supressDOMFocus) {
			this.domElement().focus();
		}
		return root.trigger('focus', this);
    };

    Icon.prototype.blur = function() {
      var root;
      root = ContentEdit.Root.get();
    //   if ( this.isFocused() ) {
        this._removeCSSClass( 'ce-element--over' );
        this._removeCSSClass( 'ce-element--focused' );
        root._focused = null;
        return root.trigger( 'blur', this );
    //   }
    };

	Icon.prototype.mount = function() {
		var ret = Icon.__super__.mount.call( this );

		// Required attributes.
		var svg = this._domElement.children[0];
		svg.setAttribute( 'xmlns', 'http://www.w3.org/2000/svg' );
		svg.setAttributeNS( 'http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink' );

		// We need to add a whitespace inside the svg tag or else
		// TinyMCE in the backend will remove the svg.
		// content = content.replace( /\s*\<\/svg>/g, ' </svg>' );
		svg.innerHTML = svg.innerHTML.trim() + ' ';

		this._content = this._domElement.innerHTML;

		this._domElement.setAttribute('data-ce-size', this._getSizeInfo());
		// if ( this._domElement. )

		return ret;
	};

	Icon.prototype.change = function( svg ) {
		this._domElement.innerHTML = svg.outerHTML;
		this._content = this._domElement.innerHTML;
		this.taint();
	};

	Icon.prototype.clone = function() {
		if ( this.isFocused() ) {
			this.blur();
		}
		var clone = document.createElement('div');
		clone.innerHTML = this.html();
		var newElem = ContentEdit.Div.fromDOMElement( clone.childNodes[0] );
		var index = this.parent().children.indexOf( this );
		this.parent().attach( newElem, index + 1 );
		newElem.focus();
		return newElem;
	};

	Icon.prototype._onMouseOver = function(ev) {
	  Icon.__super__._onMouseOver.call(this, ev);
	  return this._addCSSClass('ce-element--over');
	};

	Icon.droppers = PBSEditor.allDroppers;


    Icon.prototype.aspectRatio = function() {
      return this._aspectRatio;
    };

    Icon.prototype.maxSize = function() {
      var maxWidth;
      maxWidth = parseInt( this.attr('data-ce-max-width') || 0, 10 );
      if (!maxWidth) {
        maxWidth = ContentEdit.DEFAULT_MAX_ELEMENT_WIDTH;
      }
      maxWidth = Math.max(maxWidth, this.size()[0]);
      return [maxWidth, maxWidth * this.aspectRatio()];
    };

    Icon.prototype.minSize = function() {
      var minWidth;
      minWidth = parseInt( this.attr('data-ce-min-width') || 0, 10 );
      if (!minWidth) {
        minWidth = 20;
        //   minWidth = ContentEdit.DEFAULT_MIN_ELEMENT_WIDTH;
      }
      minWidth = Math.min(minWidth, this.size()[0]);
      return [minWidth, minWidth * this.aspectRatio()];
    };

    Icon.prototype.resize = function(corner, x, y) {
      if (!this.isMounted()) {
        return;
      }
      return ContentEdit.Root.get().startResizing(this, corner, x, y, true);
    };


	Icon.prototype._onDoubleClick = function() {
		PBSEditor.iconFrame.open({
			title: pbsParams.labels.icon_frame_change_title,
			button: pbsParams.labels.icon_frame_change_button,
			successCallback: function( frameView ) {
				this.change( frameView.selected.firstChild );
			}.bind( this )
		});
	};

    Icon.prototype.size = function(newSize) {
		var height, maxSize, minSize, width;
		if (!newSize) {
			width = parseInt( this.style( 'width' ) || 1, 10 );
			height = parseInt( this.style( 'height' ) || 1, 10 );
			return [width, height];
		}
		newSize[0] = parseInt( newSize[0], 10 );
		newSize[1] = parseInt( newSize[1], 10 );
		minSize = this.minSize();
		newSize[0] = Math.max(newSize[0], minSize[0]);
		newSize[1] = Math.max(newSize[1], minSize[1]);
		maxSize = this.maxSize();
		newSize[0] = Math.min(newSize[0], maxSize[0]);
		newSize[1] = Math.min(newSize[1], maxSize[1]);
		this.style( 'width', parseInt( newSize[0], 10 ) + 'px' );
		this.style( 'height', parseInt( newSize[1], 10 ) + 'px' );
		if (this.isMounted()) {
			this._domElement.style.width = newSize[0] + 'px';
			this._domElement.style.height = newSize[1] + 'px';
			return this._domElement.setAttribute('data-ce-size', this._getSizeInfo());
		}
    };

    Icon.prototype._onMouseDown = function(ev) {
      var corner;
      Icon.__super__._onMouseDown.call(this, ev);
      corner = this._getResizeCorner(ev.clientX, ev.clientY);
      if (corner) {

		  // Reset the size back to 100px x 100px in SHIFT+CTRL/CMD click.
		  if ( window.PBSEditor.isCtrlDown && window.PBSEditor.isShiftDown ) {
			  this.style( 'width', '100px' );
			  this.style( 'height', '100px' );
		  }

		  // Cancel the normal dragging behavior
        clearTimeout(this._dragTimeout);
        return this.resize(corner, ev.clientX, ev.clientY);
      } else {
        clearTimeout(this._dragTimeout);
        return this._dragTimeout = setTimeout((function(_this) {
          return function() {
            return _this.drag(ev.pageX, ev.pageY);
          };
        })(this), 150);
      }
    };

    Icon.prototype._onMouseMove = function(ev) {
      var corner;
      Icon.__super__._onMouseMove.call(this);
      this._removeCSSClass('ce-element--resize-top-left');
      this._removeCSSClass('ce-element--resize-top-right');
      this._removeCSSClass('ce-element--resize-bottom-left');
      this._removeCSSClass('ce-element--resize-bottom-right');
      corner = this._getResizeCorner(ev.clientX, ev.clientY);
      if (corner) {
        return this._addCSSClass('ce-element--resize-' + corner[0] + '-' + corner[1]);
      }
    };

    Icon.prototype._onMouseOut = function( ev ) {
		Icon.__super__._onMouseOut.call( this, ev );
		this._removeCSSClass('ce-element--resize-top-left');
		this._removeCSSClass('ce-element--resize-top-right');
		this._removeCSSClass('ce-element--resize-bottom-left');
		return this._removeCSSClass('ce-element--resize-bottom-right');
    };

    Icon.prototype._onMouseUp = function( ev ) {
		Icon.__super__._onMouseUp.call(this, ev );
		if (this._dragTimeout) {
			return clearTimeout(this._dragTimeout);
		}
    };

    Icon.prototype._getResizeCorner = function(x, y) {
      var corner, cornerSize, rect, size, _ref;
      rect = this._domElement.getBoundingClientRect();
      _ref = [x - rect.left, y - rect.top], x = _ref[0], y = _ref[1];
      size = this.size();
      cornerSize = ContentEdit.RESIZE_CORNER_SIZE;
      cornerSize = Math.min(cornerSize, Math.max( parseInt( size[0] / 4, 10 ), 1));
      cornerSize = Math.min(cornerSize, Math.max( parseInt( size[1] / 4, 10 ), 1));
      corner = null;
      if (x < cornerSize) {
        if (y < cornerSize) {
          corner = ['top', 'left'];
        } else if (y > rect.height - cornerSize) {
          corner = ['bottom', 'left'];
        }
      } else if (x > rect.width - cornerSize) {
        if (y < cornerSize) {
          corner = ['top', 'right'];
        } else if (y > rect.height - cornerSize) {
          corner = ['bottom', 'right'];
        }
	}
      return corner;
    };

    Icon.prototype._getSizeInfo = function() {
      var size;
      size = this.size();
      return 'w ' + size[0] + ' × h ' + size[1];
    };

	return Icon;

})(ContentEdit.Static);

ContentEdit.TagNames.get().register( ContentEdit.Icon, 'icon' );

/* globals ContentEdit, __extends, PBSEditor, pbsParams */

ContentEdit.Html = (function(_super) {
	__extends(Html, _super);

	function Html(tagName, attributes, content) {
		this.model = new Backbone.Model({});

		Html.__super__.constructor.call(this, tagName, attributes);
		this._content = content;
	}

	Html.prototype.openEditor = function() {
		PBSEditor.htmlFrame.open({
			title: pbsParams.labels.html,
			button: pbsParams.labels.html_frame_button,
			successCallback: function( frameView ) {
				var html = frameView.getHtml();
				this._domElement.innerHTML = html;
				this._content = html;

				if ( ! html ) {
					if ( this.nextContent() ) {
						this.nextContent().focus();
					} else if ( this.previousContent() ) {
						this.previousContent().focus();
					}
					this.parent().detach( this );
				}
			}.bind( this ),
			openCallback: function( frameView ) {
				frameView.setHtml( this._content );
			}.bind( this )
		});
	};


	Html.prototype._onDoubleClick = function() {
		this.openEditor();
	};

	Html.prototype.cssTypeName = function() {
		return 'html';
	};

	Html.prototype.typeName = function() {
		return 'Html';
	};

    Html.prototype.focus = function(supressDOMFocus) {
		var root;
		root = ContentEdit.Root.get();
		if (this.isFocused()) {
			return;
		}
		if (root.focused()) {
			root.focused().blur();
		}
		this._addCSSClass('ce-element--focused');
		root._focused = this;
		if (this.isMounted() && !supressDOMFocus) {
			this.domElement().focus();
		}
		return root.trigger('focus', this);
    };

    Html.prototype.blur = function() {
		var root;
		root = ContentEdit.Root.get();
        this._removeCSSClass( 'ce-element--over' );
        this._removeCSSClass( 'ce-element--focused' );
        root._focused = null;
        return root.trigger( 'blur', this );
    };

	Html.prototype._onMouseOver = function(ev) {
		Html.__super__._onMouseOver.call(this, ev);
		return this._addCSSClass('ce-element--over');
	};

	return Html;

})(ContentEdit.StaticEditable);

ContentEdit.TagNames.get().register( ContentEdit.Html, 'html' );

/**
 * Widgets are actually just shortcodes.
 */

/* globals pbsParams */

 // wp.hooks.addFilter( 'pbs.shortcode.allow_raw_edit', function( allow, scBase ) {
 //  if ( scBase === 'pbs_widget' ) {
 // 	 return false;
 //  }
 //  return allow;
 // } );

// wp.hooks.addFilter( 'pbs.toolbar.tools.allow', function( allow, target ) {
// 	if ( target.getAttribute('data-base') === 'pbs_widget' ) {
// 		return false;
// 	}
// 	return allow;
// } );

wp.hooks.addFilter( 'pbs.toolbar.shortcode.label', function( scBase ) {
	if ( scBase === 'pbs_sidebar' ) {
		return pbsParams.labels.sidebar;
	}
	return scBase;
} );

/* globals ContentEdit, __extends, PBSEditor, ContentTools, google */

ContentEdit.Map = (function(_super) {
	__extends(Map, _super);

	function Map( tagName, attributes ) {
		if ( ! attributes['data-ce-tag'] ) {
			attributes['data-ce-tag'] = 'map';
		}

		this.model = new Backbone.Model({});

		Map.__super__.constructor.call(this, tagName, attributes);

		this._content = '';
	}


    Map.prototype.blur = function() {
      var root = ContentEdit.Root.get();
      if (this.isFocused()) {
		  this._removeCSSClass( 'ce-element--over' );
        this._removeCSSClass('ce-element--focused');
        root._focused = null;
        return root.trigger('blur', this);
      }
    };

	Map.prototype._onMouseOver = function(ev) {
		Map.__super__._onMouseOver.call(this, ev);
		return this._addCSSClass('ce-element--over');
	};

    Map.prototype._onMouseUp = function( ev ) {
		Map.__super__._onMouseUp.call( this, ev );

		this.updateMapData();

		this._removeCSSClass( 'pbs-map-editing' );
		this._dragging = false;
		this._clicked = false;
		clearInterval( this._forceCentered );
    };

	Map.prototype.updateMapData = function() {

		if ( ! this._dragging ) {
			var latlng = this._domElement.map.getCenter();
			var center = latlng.lat().toFixed( 6 ) + ', ' + latlng.lng().toFixed( 6 );

			if ( this.attr( 'data-center' ) !== center ) {
				this.attr( 'data-center', center );
				this.attr( 'data-lat', latlng.lat().toFixed( 6 ) );
				this.attr( 'data-lng', latlng.lng().toFixed( 6 ) );
				this.model.set( 'data-center', center );

				// Move existing markers.
				if ( this._domElement.map.marker ) {
					this._domElement.map.marker.setPosition( this._domElement.map.getCenter() );
				}
			}
		}

		var zoom = this._domElement.map.getZoom();
		if ( parseInt( this.attr( 'data-zoom' ), 10 ) !== zoom ) {
			this.attr( 'data-zoom', zoom );
			this.model.trigger( 'change', this.model );
		}

	};

    Map.prototype._onMouseDown = function( ev ) {
		this._clicked = true;
		this.focus();
		clearTimeout( this._dragTimeout );
			return this._dragTimeout = setTimeout( ( function( _this ) {
				return function() {
					_this._dragging = true;
				return _this.drag( ev.pageX, ev.pageY );
			};
		} )( this ), ContentEdit.DRAG_HOLD_DURATION * 2 );
    };

    Map.prototype._onMouseMove = function( ev ) {
		if ( ! this._dragging ) {
			clearTimeout( this._dragTimeout );
		}
		if ( ! this._dragging && this._clicked ) {
			this._addCSSClass( 'pbs-map-editing' );
		}
		Map.__super__._onMouseMove.call(this, ev );

    };


    Map.droppers = PBSEditor.allDroppers;

    Map.prototype.focus = function(supressDOMFocus) {
		var root;
		root = ContentEdit.Root.get();
		if (this.isFocused()) {
			return;
		}
		if (root.focused()) {
			root.focused().blur();
		}
		this._addCSSClass('ce-element--focused');
		root._focused = this;
		if (this.isMounted() && !supressDOMFocus) {
			this.domElement().focus();
		}
		return root.trigger('focus', this);
    };

	Map.prototype.cssTypeName = function() {
		return 'map';
	};

	Map.prototype.typeName = function() {
		return 'Map';
	};

	Map.prototype.mount = function() {
		var ret = Map.__super__.mount.call( this );

		window.initPBSMaps( this._domElement, function() {
			google.maps.event.addListener( this._domElement.map, 'zoom_changed', _.throttle( function() {
				this.updateMapData();
			}.bind( this ), 2 ) );
			google.maps.event.addListener( this._domElement.map, 'drag', _.throttle( function() {
				this.updateMapData();
			}.bind( this ), 2 ) );
		}.bind( this ) );

		return ret;
	};

	Map.prototype.unmount = function() {
		if ( typeof google !== 'undefined' ) {
			google.maps.event.clearInstanceListeners( this._domElement.map );
		}
		return Map.__super__.unmount.call( this );
	};


	// Creates the base element of the shortcode div.
	// Does not have any contents, need to run `ajaxUpdate` after attaching to update.
	Map.create = function() {

		var o = document.createElement('DIV');
		o.setAttribute( 'data-ce-tag', 'map' );
		o.setAttribute( 'data-ce-moveable', '' );
		// o.setAttribute( 'data-url', url );

		return ContentEdit.Map.fromDOMElement( o );
	};

	return Map;

})(ContentEdit.Static);

ContentEdit.TagNames.get().register(ContentEdit.Map, 'map');


window.addEventListener( 'DOMContentLoaded', function() {
	var editor = ContentTools.EditorApp.get();
	if ( window.initPBSMaps ) {

		// When we end editing, the DOM gets rebuilt, we need to re-init the maps.
		editor.bind( 'stop', window.initPBSMaps );
	}

	var mapRefreshInterval;
	if ( window.pbsMapsReCenter ) {
		editor.bind( 'start', function() {
			mapRefreshInterval = setInterval( function() {
				if ( document.querySelector( '.ce-element--dragging' ) || document.querySelector( '.pbs-map-editing' ) ) {
					return;
				}
				window.pbsMapsReCenter();
			}, 1000 );
		} );
		editor.bind( 'stop', function() {
			clearInterval( mapRefreshInterval );
		} );
	}
} );


/* globals ContentEdit, __extends, PBSEditor, ContentSelect */

ContentEdit.Tabs = ( function( _super ) {
	__extends( Tabs, _super );

	function Tabs( tagName, attributes ) {
		Tabs.__super__.constructor.call( this, tagName, attributes );
		this.isCompundElement = true;
	}

	Tabs.prototype.cssTypeName = function() {
		return 'tabs';
	};

	Tabs.prototype.type = function() {
		return 'Tabs';
	};

	Tabs.prototype.typeName = function() {
		return 'Tabs';
	};

	Tabs.fromDOMElement = function( domElement ) {

		var c, childNode, childNodes, list, _i, _len;
		list = new this( domElement.tagName, this.getDOMElementAttributes( domElement ) );
		childNodes = (function() {
			var _i, _len, _ref, _results;
			_ref = domElement.childNodes;
			_results = [];
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				c = _ref[_i];
				_results.push(c);
			}
			return _results;
		})();

		var tagNames = ContentEdit.TagNames.get();
		for (_i = 0, _len = childNodes.length; _i < _len; _i++) {
			childNode = childNodes[_i];
			if (childNode.nodeType !== 1) {
				continue;
			}

			var cls;
			if ( childNode.getAttribute('data-ce-tag') ) {
				cls = tagNames.match(childNode.getAttribute('data-ce-tag'));
			} else {
				cls = tagNames.match(childNode.tagName);
			}

			var element = cls.fromDOMElement(childNode);
			if (element) {
				list.attach(element);
			}
		}

		return list;
	};

	Tabs.prototype.detachTabAndContent = function( tab ) {
		var inputID = tab._domElement.getAttribute( 'for' );
		var inputElem = this._domElement.querySelector( '[id="' + inputID + '"]' )._ceElement;
		var tabID = inputElem.attr( 'data-tab' );
		var tabRow = this._domElement.querySelector( '[data-panel="' + tabID + '"]' )._ceElement;
		inputElem.parent().detach( inputElem );
		tab.parent().detach( tab );
		tabRow.parent().detach( tabRow );
		this.reIndexTabs();
		return tabRow;
	};

	Tabs.prototype.attachTabAndContent = function( tab, index, row ) {
		var tabsID = this._domElement.getAttribute( 'class' ).match( /pbs-tabs-(\w+)/ )[0];

		var tabIndex = this.numTabs() + 1;

		var hash = window.PBSEditor.generateHash();
		while ( document.querySelector( '[id="pbs-tab-' + hash + '"]') ) {
			hash = window.PBSEditor.generateHash();
		}

		var radio = document.createElement( 'input' );
		radio.classList.add( 'pbs-tab-state' );
		radio.setAttribute( 'type', 'radio' );
		radio.setAttribute( 'name', tabsID );
		radio.setAttribute( 'id', 'pbs-tab-' + hash );
		radio.setAttribute( 'data-tab', tabIndex );
		radio.setAttribute( 'data-ce-tag', 'static' );
		this.attach( ContentEdit.Static.fromDOMElement( radio ), 0 );

		tab.attr( 'for', 'pbs-tab-' + hash );
		row.attr( 'data-panel', tabIndex );

		this._domElement.querySelector( '.pbs-tab-tabs' )._ceElement.attach( tab, index );
		this._domElement.querySelector( '.pbs-tab-panels' )._ceElement.attach( row );

	};

	/**
	 * Fixes the indices of the tabs.
	 * Only works when there is only 1 tab missing.
	 */
	Tabs.prototype.reIndexTabs = function() {
		var numTabs = this._domElement.querySelectorAll( '.pbs-tab-state' ).length;
		for ( var i = 1; i <= numTabs; i++ ) {
			var radio = this._domElement.querySelector( '[data-tab="' + i + '"]' );
			if ( ! radio ) {
				radio = this._domElement.querySelector( '[data-tab="' + ( i + 1 ) + '"]' );
				if ( radio ) {
					radio._ceElement.attr( 'data-tab', i );
					this._domElement.querySelector( '[data-panel="' + ( i + 1 ) + '"]' )._ceElement.attr( 'data-panel', i );
				}
			}
		}
	};

	Tabs.prototype.getOpenTab = function() {
		var radio = this._domElement.querySelector( '.pbs-tab-state:checked' )._ceElement;
		var panel = this._domElement.querySelector( '[data-panel="' + radio.attr( 'data-tab' ) + '"]' );
		if ( ! panel ) {
			panel = this._domElement.querySelector( '[data-panel]' );
		}
		return panel._ceElement;
	};

	Tabs.prototype.numTabs = function() {
		return this._domElement.querySelectorAll( '.pbs-tab-state' ).length;
	};

	Tabs.prototype.addTab = function() {
		var firstTab = this._domElement.querySelector( '.pbs-tab-state' )._ceElement;
		var radioID = 'pbs-tab-' + window.PBSEditor.generateHash();
		var tabNum = this.numTabs() + 1;
		var radio = new ContentEdit.TabRadio( 'input', {
			'data-ce-tag': 'tabradio',
			'class': 'pbs-tab-state',
			'data-tab': tabNum,
			'id': radioID,
			'name': firstTab.attr( 'name' ),
			'type': 'radio'
		} );
		this.attach( radio, 0 );

		var tab = new ContentEdit.Tab( 'label', {
			'data-ce-tag': 'tab',
			'for': radioID
		}, '<span>New Tab</span>' );

		var tabContainer = this._domElement.querySelector( '.pbs-tab-tabs' )._ceElement;
		tabContainer.attach( tab, tabContainer.children.length );

		// Copy all existing tab styles.
		if ( tabContainer.children.length ) {
			tab.attr( 'style', tabContainer.children[0].attr( 'style' ) );
		}

		var panelContainer = this._domElement.querySelector( '.pbs-tab-panels' )._ceElement;
		var row = new ContentEdit.DivRow( 'div', {
			'data-panel': tabNum
		} );
		panelContainer.attach( row );

		var col = new ContentEdit.DivCol('div');
		row.attach( col );

		var p = new ContentEdit.Text('p', {}, '');
		col.attach( p );

		tab.openTab();
		p.focus();
	};

	Tabs.prototype.removeTab = function( tab ) {
		if ( typeof tab === 'undefined' ) {
			var radio = this._domElement.querySelector( '.pbs-tab-state:checked' )._ceElement;
			tab = this._domElement.querySelector( 'label[for="' + radio.attr( 'id' ) + '"]' )._ceElement;
		}
		var otherTab = tab.nextSibling();
		if ( ! otherTab ) {
			otherTab = tab.previousSibling();
		}
		this.detachTabAndContent( tab );
		if ( otherTab ) {
			otherTab.openTab();
		} else {
			this.blur();
			var focusTo = this.nextSibling();
			if ( ! focusTo ) {
				focusTo = this.previousSibling();
			}
			if ( focusTo ) {
				focusTo.focus();
			}
			this.parent().detach( this );
		}
	};

	Tabs.droppers = PBSEditor.allDroppers;

	return Tabs;

})(ContentEdit.Div);


ContentEdit.TagNames.get().register(ContentEdit.Tabs, 'tabs');



ContentEdit.Tab = ( function( _super ) {
	__extends( Tab, _super );

	function Tab( tagName, attributes, content ) {
		Tab.__super__.constructor.call( this, tagName, attributes, content );
	}

	Tab.prototype.cssTypeName = function() {
		return 'tab';
	};

	Tab.prototype.type = function() {
		return 'Tab';
	};

	Tab.prototype.typeName = function() {
		return 'Tab';
	};

	Tab.prototype.parentTab = function() {
		return this.parent().parent();
	};

	Tab.prototype.setActiveTab = function() {
		var activeTab = this.parentTab()._domElement.querySelector( '.pbs-tab-tabs .pbs-tab-active' );
		if ( activeTab ) {
			activeTab._ceElement.removeCSSClass( 'pbs-tab-active' );
		}
		this.addCSSClass( 'pbs-tab-active' );
	};

	Tab.prototype._onMouseDown = function( ev ) {
		setTimeout( function() {
			this.setActiveTab();
		}.bind( this ), 1 );
		return Tab.__super__._onMouseDown.call( this, ev );
	};

	Tab.prototype.openTab = function() {
		this.parentTab()._domElement.querySelector( '[id="' + this.attr( 'for' ) + '"]' ).checked = true;
		this.setActiveTab();
	};

	Tab._dropTab = function( element, target, placement ) {
		var insertIndex = target.parent().children.indexOf( target );
		if ( placement[1] !== 'left' ) {
			insertIndex += 1;
		}

		// Different handling if the tab is dropped into another set of tabs.
		if ( element.parent() !== target.parent() ) {

			var originalTabElement = element.parentTab();

			// Get the closest tab.
			var otherTab = element.previousSibling();
			if ( ! otherTab ) {
				otherTab = element.nextSibling();
			}

			var tabRow = element.parentTab().detachTabAndContent( element );

			target.parentTab().attachTabAndContent( element, insertIndex, tabRow );
			element.openTab();

			// Open the other tab since a tab was removed.
			if ( otherTab ) {
				otherTab.openTab();
			} else {

				// If there are no more tabs, just remove the whole thing.
				originalTabElement.parent().detach( originalTabElement );
			}

			return;
		}

		element.parent().detach( element );
		return target.parent().attach( element, insertIndex );
	};

	Tab.prototype._onMouseOver = function( ev ) {
        var root = ContentEdit.Root.get();
        if ( root.dragging() ) {
			this.openTab();
		}
		return Tab.__super__._onMouseOver.call( this, ev );
	};

	Tab.droppers = {
		'Tab': Tab._dropTab
	};

	Tab.placements = [ 'left', 'right' ];

	// If a tab is focused, check the matching radio button since they are all disabled.
	Tab.prototype.focus = function() {
		this.openTab();
		return Tab.__super__.focus.call( this );
	};

	Tab.prototype._keyReturn = function( ev ) {
		ev.preventDefault();
		var next = this.nextSibling();
		if ( next ) {
			next.focus();
		}
	};

	Tab.prototype.isLastTab = function() {
		return this.parent().children.indexOf( this ) === this.parent().children.length - 1;
	};

	//
	Tab.prototype.getMatchingPanel = function() {
		var inputID = this.attr( 'for' );
		var inputElem = this.parentTab()._domElement.querySelector( '[id="' + inputID + '"]' )._ceElement;
		var tabID = inputElem.attr( 'data-tab' );
		return this.parentTab()._domElement.querySelector( '[data-panel="' + tabID + '"]' )._ceElement;
	};

	/**
	 * Make sure the saved HTML has the first tab active.
	 */
	Tab.prototype.html = function() {
		var ret = Tab.__super__.html.call( this );
		if ( this.parent().children.indexOf( this ) === 0 ) {
			if ( ! ret.match( /pbs-tab-active/ ) ) {
				var r = new RegExp( '(<' + this._tagName + '[^>]+class=[\'"])' );
				if ( ret.match( r ) ) {
					ret = ret.replace( r, '$1pbs-tab-active ' );
				} else {
					r = new RegExp( '(<' + this._tagName + ')' );
					ret = ret.replace( r, '$1 class="pbs-tab-active"' );
				}
			}
		} else {
			ret = ret.replace( /\s*pbs-tab-active\s*/g, '' );
			ret = ret.replace( /\s*class=[\'\"][\'\"]/g, '' );
		}
		return ret;
	};

	Tab.prototype._keyLeft = function( ev ) {
		if ( this.parent().children.indexOf( this ) === 0 ) {
			var selection = ContentSelect.Range.query( this._domElement );
			if ( selection.get()[0] === 0 && selection.isCollapsed() ) {
				this._keyUp( ev );
			}
		}
		return Tab.__super__._keyLeft.call( this, ev );
	};

	Tab.prototype._keyUp = function( ev ) {
		if ( this.parent().children.indexOf( this ) === 0 ) {
			var selection = ContentSelect.Range.query( this._domElement );
			if ( selection.get()[0] === 0 && selection.isCollapsed() ) {

				var tabs = this.parent().parent();
				var index = tabs.parent().children.indexOf( tabs );
				if ( index > 0 ) {
					if ( tabs.parent().children[ index - 1 ].content ) {
						var elem = tabs.parent().children[ index - 1 ];
						elem.focus();

				        selection = new ContentSelect.Range( elem.content.length(), elem.content.length() );
				        return selection.select( elem.domElement() );
					}
				}
				var p = new ContentEdit.Text('p', {}, '');
				tabs.parent().attach( p, index );
				p.focus();
			}
		}
		return Tab.__super__._keyUp.call( this, ev );
	};

	Tab.prototype._keyDown = function( ev ) {

		if ( this.parent().children.indexOf( this ) === this.parent().children.length - 1 ) {
			var selection = ContentSelect.Range.query(this._domElement);
			if (!(this._atEnd(selection) && selection.isCollapsed())) {
				return;
			}
			if ( this._atEnd( selection ) ) {
				ev.preventDefault();
				var row = this.getMatchingPanel();
				row.children[0].children[0].focus();
				return;
			}
		}
		return Tab.__super__._keyDown.call( this, ev );
	};

	Tab.prototype._keyRight = function( ev ) {

	      var selection = ContentSelect.Range.query(this._domElement);
	      if (!(this._atEnd(selection) && selection.isCollapsed())) {
	        return;
	      }
		  if ( this.isLastTab() ) {
			  ev.preventDefault();
			  var row = this.getMatchingPanel();
			  row.children[0].children[0].focus();
			  return;
		  }
		return Tab.__super__._keyRight.call( this, ev );
	};

	return Tab;

} )( ContentEdit.Text );

ContentEdit.TagNames.get().register( ContentEdit.Tab, 'tab' );


ContentEdit.TabContainer = ( function( _super ) {
	__extends( TabContainer, _super );

	function TabContainer( tagName, attributes ) {
		TabContainer.__super__.constructor.call( this, tagName, attributes );
		// this._content = '';
	}

	TabContainer.prototype.cssTypeName = function() {
		return 'tabcontainer';
	};

	TabContainer.prototype.type = function() {
		return 'TabContainer';
	};

	TabContainer.prototype.typeName = function() {
		return 'TabContainer';
	};

	TabContainer._dropOutside = function( element, target, placement ) {
		var insertIndex;
		element.parent().detach( element );
		insertIndex = target.parent().parent().children.indexOf( target.parent() );
		if ( placement[0] === 'below' ) {
			insertIndex += 1;
		}
		return target.parent().parent().attach( element, insertIndex );
    };

	TabContainer.prototype._onOver = function( ev ) {
		var ret = TabContainer.__super__._onOver.call( this, ev );
		if ( ret ) {
			var root = ContentEdit.Root.get();
			this._removeCSSClass( 'ce-element--drop' );
			this.parent()._addCSSClass( 'ce-element--drop' );
			return root._dropTarget = this.parent();
		}
		return ret;
	};

	TabContainer.droppers = {
		'*': TabContainer._dropOutside
	};

	// TabContainer.placements = [ 'above', 'below' ];

	// Cancel the drag event on mouse up
	TabContainer.prototype._onMouseUp = function(ev) {
		TabContainer.__super__._onMouseUp.call(this, ev);
		clearTimeout(this._dragTimeout);
	};

    TabContainer.prototype._onMouseOut = function(ev) {
		TabContainer.__super__._onMouseOut.call(this, ev);
		clearTimeout(this._dragTimeout);
	};

    TabContainer.prototype._onMouseDown = function(ev) {
		TabContainer.__super__._onMouseDown.call(this, ev);

		clearTimeout(this._dragTimeout);
		if ( this.domElement() !== ev.target ) {
			return;
		}

		// This fixes dragging in Firefox.
		ev.preventDefault();

		// If we are in the drag row handle, drag the whole row
		// @see _onMouseMove
		// if ( this._domElement.classList.contains('pbs-drag-row') ) {
		// 	return this.parent().drag(ev.pageX, ev.pageY);
		// }

		if ( ! this.draggableParent ) {
			this.draggableParent = this.parent();
		}

		return this._dragTimeout = setTimeout((function(_this) {
			return function() {
				// Drag the column
				return _this.draggableParent.drag(ev.pageX, ev.pageY);
				// return _this.drag(ev.pageX, ev.pageY);
			};
		})(this), ContentEdit.DRAG_HOLD_DURATION);

	};

	TabContainer.fromDOMElement = function(domElement) {

		var c, childNode, childNodes, list, _i, _len;
		list = new this(domElement.tagName, this.getDOMElementAttributes(domElement));
		childNodes = (function() {
			var _i, _len, _ref, _results;
			_ref = domElement.childNodes;
			_results = [];
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				c = _ref[_i];
				_results.push(c);
			}
			return _results;
		})();

		var tagNames = ContentEdit.TagNames.get();
		for (_i = 0, _len = childNodes.length; _i < _len; _i++) {
			childNode = childNodes[_i];
			if (childNode.nodeType !== 1) {
				continue;
			}

			var cls;
			if ( childNode.getAttribute('data-ce-tag') ) {
				cls = tagNames.match(childNode.getAttribute('data-ce-tag'));
			} else {
				cls = tagNames.match(childNode.tagName);
			}

			var element = cls.fromDOMElement(childNode);
			if (element) {
				list.attach(element);
			}
		}

		return list;
	};

	return TabContainer;

} )( ContentEdit.Div );
ContentEdit.TagNames.get().register( ContentEdit.TabContainer, 'tabcontainer' );


ContentEdit.TabPanelContainer = ( function( _super ) {
	__extends( TabPanelContainer, _super );

	function TabPanelContainer( tagName, attributes ) {
		TabPanelContainer.__super__.constructor.call( this, tagName, attributes );
	}

	TabPanelContainer.prototype.cssTypeName = function() {
		return 'tabpanelcontainer';
	};

	TabPanelContainer.prototype.type = function() {
		return 'TabPanelContainer';
	};

	TabPanelContainer.prototype.typeName = function() {
		return 'TabPanelContainer';
	};

	TabPanelContainer.fromDOMElement = function(domElement) {

		var c, childNode, childNodes, list, _i, _len;
		list = new this(domElement.tagName, this.getDOMElementAttributes(domElement));
		childNodes = (function() {
			var _i, _len, _ref, _results;
			_ref = domElement.childNodes;
			_results = [];
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				c = _ref[_i];
				_results.push(c);
			}
			return _results;
		})();

		var tagNames = ContentEdit.TagNames.get();
		for (_i = 0, _len = childNodes.length; _i < _len; _i++) {
			childNode = childNodes[_i];
			if (childNode.nodeType !== 1) {
				continue;
			}

			var cls;
			if ( childNode.getAttribute('data-ce-tag') ) {
				cls = tagNames.match(childNode.getAttribute('data-ce-tag'));
			} else {
				cls = tagNames.match(childNode.tagName);
			}

			var element = cls.fromDOMElement(childNode);
			if (element) {
				list.attach(element);
			}
		}

		return list;
	};

	return TabPanelContainer;

} )( ContentEdit.Div );
ContentEdit.TagNames.get().register( ContentEdit.TabPanelContainer, 'tabpanelcontainer' );


ContentEdit.TabRadio = ( function( _super ) {
	__extends( TabRadio, _super );

	function TabRadio( tagName, attributes ) {
		TabRadio.__super__.constructor.call( this, tagName, attributes );
	}

	TabRadio.prototype.cssTypeName = function() {
		return 'tabradio';
	};

	TabRadio.prototype.type = function() {
		return 'TabRadio';
	};

	TabRadio.prototype.typeName = function() {
		return 'TabRadio';
	};

	// Disable the radio buttons since when a tab is focused it is preventing text
	// keyboard navigation, since the radio buttons get focused.
	TabRadio.prototype.mount = function() {
		var ret = TabRadio.__super__.mount.call( this );
		this._domElement.setAttribute( 'disabled', 'disabled' );
		return ret;
	};

	// Re-enable all radio buttons or else we cannot switch tabs after editing.
	TabRadio.prototype.unmount = function() {
		this._domElement.removeAttribute( 'disabled' );
		return TabRadio.__super__.unmount.call( this );
	};

	return TabRadio;

} )( ContentEdit.Static );

ContentEdit.TagNames.get().register( ContentEdit.TabRadio, 'tabradio' );


wp.hooks.addFilter( 'pbs.overlay.margin_top.can_apply', function( apply, element ) {
	if ( element && element._domElement && element._domElement.parentNode && element._domElement.parentNode.classList ) {
		var parent = element._domElement.parentNode;
		if ( parent.classList && parent.classList.contains( 'pbs-tab-tabs' ) ) {
			return false;
		}
	}
	return apply;
} );
wp.hooks.addFilter( 'pbs.overlay.margin_bottom.can_apply', function( apply, element ) {
	if ( element && element._domElement && element._domElement.parentNode && element._domElement.parentNode.classList ) {
		var parent = element._domElement.parentNode;
		if ( parent.classList && parent.classList.contains( 'pbs-tab-tabs' ) ) {
			return false;
		}
	}
	return apply;
} );


/**
 * When pressing the up key at the very start of the current panel, put the cursor on the last tab.
 */
(function() {
	var proxied = ContentEdit.Text.prototype._keyUp;
	ContentEdit.Text.prototype._keyUp = function( ev ) {
	    var selection = ContentSelect.Range.query(this._domElement);
		if ( this.parent().constructor.name === 'DivCol' && this.parent().children.indexOf(this) === 0 && selection.get()[0] === 0 ) {
			if ( this.parent().parent().parent().constructor.name === 'TabPanelContainer' ) {
				ev.preventDefault();
				var tabs = this.parent().parent().parent().parent()._domElement.querySelector( '.pbs-tab-tabs' )._ceElement;
				var tab = tabs.children[ tabs.children.length - 1 ];
				tab.focus();

		        selection = new ContentSelect.Range( tab.content.length(), tab.content.length() );
		        return selection.select( tab.domElement() );
			}
		}
		return proxied.call( this, ev );
	};
})();

/**
 * When pressing the left key at the very start of the current panel, put the cursor on the last tab.
 */
(function() {
   var proxied = ContentEdit.Text.prototype._keyLeft;
   ContentEdit.Text.prototype._keyLeft = function( ev ) {
	   var selection = ContentSelect.Range.query(this._domElement);
	   if ( this.parent().constructor.name === 'DivCol' && this.parent().children.indexOf(this) === 0 && this.parent().parent().children.indexOf( this.parent() ) === 0 && selection.get()[0] === 0 ) {
		   if ( this.parent().parent().parent().constructor.name === 'TabPanelContainer' ) {
			   ev.preventDefault();
			   var tabs = this.parent().parent().parent().parent()._domElement.querySelector( '.pbs-tab-tabs' )._ceElement;
			   var tab = tabs.children[ tabs.children.length - 1 ];
			   tab.focus();

			   selection = new ContentSelect.Range( tab.content.length(), tab.content.length() );
			   return selection.select( tab.domElement() );
		   }
	   }
	   return proxied.call( this, ev );
   };
})();

/**
 * When pressing the down key at the very end of the current panel, put the cursor on the next text element, or create a new one.
 */
(function() {
   var proxied = ContentEdit.Text.prototype._keyDown;
   ContentEdit.Text.prototype._keyDown = function( ev ) {
	   var selection = ContentSelect.Range.query(this._domElement);
	   if ( this.parent().constructor.name === 'DivCol' && this.parent().children.indexOf(this) === this.parent().children.length - 1 && this._atEnd(selection) ) {
		   if ( this.parent().parent().parent().constructor.name === 'TabPanelContainer' ) {

			   var tabs = this.parent().parent().parent().parent();
	   			var index = tabs.parent().children.indexOf( tabs );
	   			if ( index < tabs.parent().children.length - 1 ) {
	   				if ( tabs.parent().children[ index + 1 ].content ) {
						ev.preventDefault();

	   					tabs.parent().children[ index + 1 ].focus();
						selection = new ContentSelect.Range( 0, 0 );
						return selection.select( tabs.parent().children[ index + 1 ]._domElement );
	   				}
	   			}
	   			var p = new ContentEdit.Text('p', {}, '');
	   			tabs.parent().attach( p, index + 1 );
	   			p.focus();
				return;
		   }
	   }
	   return proxied.call( this, ev );
   };
})();


/**
 * When pressing the right key at the very end of the current panel, put the cursor on the next text element, or create a new one.
 */
(function() {
   var proxied = ContentEdit.Text.prototype._keyRight;
   ContentEdit.Text.prototype._keyRight = function( ev ) {
	   var selection = ContentSelect.Range.query(this._domElement);
	   if ( this.parent().constructor.name === 'DivCol' && this.parent().children.indexOf(this) === this.parent().children.length - 1 && this.parent().parent().children.indexOf( this.parent() ) === this.parent().parent().children.length - 1 && this._atEnd(selection) ) {
		   if ( this.parent().parent().parent().constructor.name === 'TabPanelContainer' ) {

			   var tabs = this.parent().parent().parent().parent();
	   			var index = tabs.parent().children.indexOf( tabs );
	   			if ( index < tabs.parent().children.length - 1 ) {
	   				if ( tabs.parent().children[ index + 1 ].content ) {
						ev.preventDefault();
	   					tabs.parent().children[ index + 1 ].focus();
	   					return;
	   				}
	   			}
	   			var p = new ContentEdit.Text('p', {}, '');
	   			tabs.parent().attach( p, index + 1 );
	   			p.focus();
	   			return;
		   }
	   }
	   return proxied.call( this, ev );
   };
})();

/**
 * When pressing up key towards a tabs element, select the last element of the current tab.
 */
(function() {
	var proxied = ContentEdit.Node.prototype.previous;
	ContentEdit.Node.prototype.previous = function() {
		var node = proxied.call( this );

		if ( node && node._domElement && window.pbsSelectorMatches( node._domElement, '.pbs-tab-panels *' ) ) {

			// If not visible.
			if ( node._domElement.offsetWidth === 0 && node._domElement.offsetHeight === 0 ) {
				var tabs = node.parent().parent();
				while ( tabs && tabs.constructor.name !== 'Tabs' ) {
					tabs = tabs.parent();
				}
				if ( tabs ) {
					node = tabs.getOpenTab();

					var allVisibles = node._domElement.querySelectorAll( '*' );
					for ( var i = allVisibles.length - 1; i >= 0; i-- ) {
						if ( allVisibles[ i ]._ceElement ) {
							return allVisibles[ i ]._ceElement;
						}
					}
				}
			}
		}

		return node;
	};
})();


/**
 * Dragging columns inside tabs, drag the whole tabs element.
 */
( function() {
	var proxied = ContentEdit.DivCol.prototype._onMouseDown;
    ContentEdit.DivCol.prototype._onMouseDown = function( ev ) {
		if ( this.parent().parent()._domElement.classList.contains( 'pbs-tab-panels' ) ) {
			this.draggableParent = this.parent().parent().parent();
		}
		return proxied.call( this, ev );
	};
} )();


( function() {
	var proxied = ContentEdit.DivRow.prototype._onOver;
	ContentEdit.DivRow.prototype._onOver = function( ev ) {
		var ret = proxied.call( this, ev );
		if ( ret && this.parent().constructor.name === 'TabPanelContainer' ) {
			var root = ContentEdit.Root.get();
			this._removeCSSClass( 'ce-element--drop' );
			this.parent().parent()._addCSSClass( 'ce-element--drop' );
			return root._dropTarget = this.parent().parent();
		}
		return ret;
	};
} )();


/* globals ContentEdit, ContentTools */

// Remove the size class when resizing images, so that WP can detect
// that we now have a custom size.
var root = ContentEdit.Root.get();
root._overrideImageOnStopResizing = root._onStopResizing;
root._onStopResizing = function(ev) {

	if ( this._resizing.constructor.name === 'Image' ) {
		var match = this._resizing._attributes['class'].match( /size-\w+/ );
		if ( match ) {
			this._resizing.removeCSSClass( match[0] );
		}

		// Set the height style to auto, so that images & icons won't get smushed in responsive mode.
		this._resizing.style( 'height', 'auto' );
	}

	return this._overrideImageOnStopResizing(ev);
}.bind(root);



// Open the edit Media Manager window on double click
ContentEdit.Image.prototype._onDblclick = function() {
	this.openMediaManager();
};

ContentEdit.Image.prototype.openMediaManager = function() {
	var frame = wp.media.editor.open( 'edit', {
		frame: 'image',
		state: 'image-details',
		metadata: _pbsImageGetMetaData( this._domElement )
	});

	frame.state('image-details').on( 'update', function( imageData ) {
		_pbsUpdateNonCaptionedImageCTElement( this, imageData );
	}.bind( this ) );

	frame.state('replace-image').on( 'replace', function( imageData ) {
		_pbsUpdateNonCaptionedImageCTElement( this, imageData );
	}.bind( this ) );

	// Delete the frame's state so that opening another frame won't have the settings
	// of the previous frame.
	frame.on('close', function() {
		wp.media.editor.remove( 'edit' );
		frame.detach();
	});
};


// Remove image edit event listener.
ContentEdit.Image.prototype._removeDOMEventListeners = function() {
	this._domElement.removeEventListener('dblclick', this._onDblClickBound);
	window.removeEventListener('keydown', this._onKeyDownBound );
};


// Simpler mounting, don't add an anchor tag.
ContentEdit.Image.prototype.mount = function() {

	var i;

	// Remove responsive attributes added in by WordPress since these are
	// dynamically added on creation.
	if ( this._attributes ) {
		var responsiveAttributes = [ 'srcset', 'sizes', 'data-lazy-loaded', 'data-lazy-src', 'data-pin-nopin', 'src-orig', 'scale' ];
		for ( i = 0; i < responsiveAttributes.length; i++ ) {
			if ( this._attributes[ responsiveAttributes[ i ] ] ) {
				delete this._attributes[ responsiveAttributes[ i ]  ];
			}
		}
	}

	// Remove alignnone. We won't support alignnone since they are problematic.
	if ( this._attributes ) {
		if ( this._attributes['class'] ) {
			var classes = this._attributes['class'].split( ' ' );
			if ( classes.indexOf( 'alignnone' ) !== -1 ) {
				classes[ classes.indexOf( 'alignnone' ) ] = 'aligncenter';
				this._attributes['class'] = classes.join( ' ' );
			}
		}
	}

  	this._domElement = document.createElement('img');
    for ( i in this._attributes ) {
		if ( this._attributes.hasOwnProperty( i ) ) {
			if ( this._attributes[ i ] ) {
				this._domElement.setAttribute( i, this._attributes[ i ] );
			}
		}
	}

	// Edit image edit event listener.
	this._onDblClickBound = this._onDblclick.bind(this);
	this._domElement.addEventListener('dblclick', this._onDblClickBound);

	// Character press event listener.
	this._onKeyDownBound = this._onKeyDown.bind(this);
	window.addEventListener('keydown', this._onKeyDownBound );

	return ContentEdit.Image.__super__.mount.call(this);
};


// If typed while an image is focused, create a new paragraph.
ContentEdit.Image.prototype._onKeyDown = function(ev) {
	// If ONLY shift is pressed, don't do anything.
	if ( ev.keyCode === 16 || ev.keyCode === 91 || ev.keyCode === 93 ) {
		return;
	}
	// If ctrl is pressed, don't do anything.
	if ( ev.ctrlKey || ev.metaKey ) {
		return;
	}
	// If something else is selected, don't do anything.
	if ( ['input', 'select', 'textarea', 'button'].indexOf( ev.target.tagName.toLowerCase() ) !== -1 ) {
		return;
	}
	if ( this.isFocused() ) {

		// This fixes the bug where an empty div is added when pressing enter.
		ev.preventDefault();

		ContentTools.Tools.Paragraph.apply(this, null, function() {});
	}
};


// Simpler droppers
ContentEdit.Image._dropBoth = function(element, target, placement) {
	var insertIndex;
	element.parent().detach(element);
	insertIndex = target.parent().children.indexOf(target);
	if (placement[0] === 'below' && placement[1] === 'center') {
		insertIndex += 1;
	}
	element.removeCSSClass('alignleft');
	element.removeCSSClass('alignright');
	element.removeCSSClass('aligncenter');
	element.removeCSSClass('alignnone');
	if (['left', 'right', 'center'].indexOf( placement[1] ) !== -1 ) {
		element.addCSSClass('align' + placement[1]);
	}
	return target.parent().attach(element, insertIndex);
};


// Override the droppers to allow for 'alignleft', 'alignright', 'aligncenter',
// classes instead of just 'align-left' and 'align-right'.
ContentEdit.Image.droppers = {
	'Image': ContentEdit.Image._dropBoth,
	'PreText': ContentEdit.Image._dropBoth,
	'Static': ContentEdit.Image._dropBoth,
	'Text': ContentEdit.Image._dropBoth
};


wp.hooks.addFilter( 'pbs.shortcode.allow_raw_edit', function( allow, scBase, element ) {
	if ( scBase === 'caption' ) {
		var target = element._domElement.querySelector( 'img' );

		var frame = wp.media.editor.open( 'edit', {
			frame: 'image',
			state: 'image-details',
			metadata: _pbsImageGetMetaData( target )
		});

		frame.state('image-details').on( 'update', function( imageData ) {
			_pbsUpdateNonCaptionedImage( target, imageData );
		} );

		frame.state('replace-image').on( 'replace', function( imageData ) {
			_pbsUpdateNonCaptionedImage( target, imageData );
		} );

		// Delete the frame's state so that opening another frame won't have the settings
		// of the previous frame.
		frame.on('close', function() {
			wp.media.editor.remove( 'edit' );
			frame.detach();
		});
		return false;
	}
	return allow;
} );


/************************************************************************************
 * From updateImage function js/tinymce/plugins/wpeditimage/plugins.js
 ************************************************************************************/
var _pbsToolbarImageHasTextContent = function( node ) {
	return node && !! ( node.textContent || node.innerText );
};
var _pbsToolbarImageGetParent = function ( node, className ) {
	while ( node && node.parentNode ) {
		if ( node.className && ( ' ' + node.className + ' ' ).indexOf( ' ' + className + ' ' ) !== -1 ) {
			return node;
		}

		node = node.parentNode;
	}

	return false;
};
var _pbsUpdateNonCaptionedImage = function( imageNode, imageData ) {

	var classes, node, captionNode, id, attrs, linkAttrs, width, height, align;

	// classes = tinymce.explode( imageData.extraClasses, ' ' );
	classes = imageData.extraClasses.split( ' ' );

	if ( ! classes ) {
		classes = [];
	}

	if ( ! imageData.caption ) {
		classes.push( 'align' + imageData.align );
	}

	if ( imageData.attachment_id ) {
		classes.push( 'wp-image-' + imageData.attachment_id );
		if ( imageData.size && imageData.size !== 'custom' ) {
			classes.push( 'size-' + imageData.size );
		}
	}

	width = imageData.width;
	height = imageData.height;

	if ( imageData.size === 'custom' ) {
		width = imageData.customWidth;
		height = imageData.customHeight;
	}

	attrs = {
		src: imageData.url,
		width: width || null,
		height: height || null,
		alt: imageData.alt,
		title: imageData.title || null,
		'class': classes.join( ' ' ) || null
	};

	// dom.setAttribs( imageNode, attrs );
	for ( var key in attrs ) {
		if ( attrs.hasOwnProperty( key ) ) {
			imageNode.setAttribute( key, attrs[ key ] );
		}
	}

	linkAttrs = {
		href: imageData.linkUrl,
		rel: imageData.linkRel || null,
		target: imageData.linkTargetBlank ? '_blank': null,
		'class': imageData.linkClassName || null
	};

	if ( imageNode.parentNode && imageNode.parentNode.nodeName === 'A' && ! _pbsToolbarImageHasTextContent( imageNode.parentNode ) ) {
		// Update or remove an existing link wrapped around the image
		if ( imageData.linkUrl ) {

			// Update the attributes of the link
			// dom.setAttribs( imageNode.parentNode, linkAttrs );
			for ( key in linkAttrs ) {
				if ( linkAttrs.hasOwnProperty( key ) ) {
					if ( linkAttrs[ key ] !== null ) {
						imageNode.parentNode.setAttribute( key, linkAttrs[ key ] );
					}
				}
			}
		} else {

			// Unwrap the image from the link.
			// dom.remove( imageNode.parentNode, true );
			var oldA = imageNode.parentNode;
			oldA.parentNode.insertBefore( imageNode, oldA );
			oldA.parentNode.removeChild( oldA );

		}

	} else if ( imageData.linkUrl ) { // If a link was added to a non-linked image
		// if ( linkNode = dom.getParent( imageNode, 'a' ) ) {
		var linkNode = _pbsToolbarImageGetParent( imageNode, 'a' );
		if ( linkNode ) {
			// The image is inside a link together with other nodes,
			// or is nested in another node, move it out
			// dom.insertAfter( imageNode, linkNode );
			imageNode.parentNode.insertBefore( linkNode, imageNode.nextSibling);
		}

		// Add link wrapped around the image
		// linkNode = dom.create( 'a', linkAttrs );
		linkNode = document.createElement('a');
		for ( var i in linkAttrs ) {
			if ( linkAttrs.hasOwnProperty( i ) ) {
				if ( linkAttrs[ i ] !== null ) {
					linkNode.setAttribute( i, linkAttrs[ i ] );
				}
			}
		}
		imageNode.parentNode.insertBefore( linkNode, imageNode );
		linkNode.appendChild( imageNode );
	}

	// captionNode = editor.dom.getParent( imageNode, '.mceTemp' );
	captionNode = _pbsToolbarImageGetParent( imageNode, '.mceTemp' );

	if ( imageNode.parentNode && imageNode.parentNode.nodeName === 'A' && ! _pbsToolbarImageHasTextContent( imageNode.parentNode ) ) {
		node = imageNode.parentNode;
	} else {
		node = imageNode;
	}

	// Find the main Text element
	var textElement = null;
	var currElement = node;
	while ( currElement ) {
		if ( currElement._ceElement ) {
			textElement = currElement._ceElement;
			break;
		}
		currElement = currElement.parentNode;
	}


	// Captioned image.
	var parent, index, newElem;
	if ( imageData.caption ) {

		id = imageData.attachment_id ? 'attachment_' + imageData.attachment_id : null;
		align = 'align' + ( imageData.align || 'none' );

		// Default data
		var scData = {
			tag: 'caption',
			type: 'closed',
			content: node.outerHTML + ' ' + imageData.caption,
			attrs: {
				id: id,
				align: align,
				width: width
			}
		};

		// Generate the shortcode
		var shortcode = new wp.shortcode( scData ).string();
		parent = textElement.parent();
		index = parent.children.indexOf( textElement );

		shortcode = wp.shortcode.next( 'caption', shortcode, 0 );
		newElem = ContentEdit.Shortcode.createShortcode( shortcode );
		parent.attach( newElem, index );
		parent.detach( textElement );

		newElem.ajaxUpdate( true );
		newElem.focus();

		textElement = newElem;

	} else {

		// Normal image.
		parent = textElement.parent();
		index = parent.children.indexOf( textElement );
		newElem = ContentEdit.Image.fromDOMElement( node );
		parent.attach( newElem, index );
		parent.detach( textElement );
		newElem.focus();
	}
};
var _pbsToolbarImageGetParent = function ( node, className ) {
	while ( node && node.parentNode ) {
		if ( node.className && ( ' ' + node.className + ' ' ).indexOf( ' ' + className + ' ' ) !== -1 ) {
			return node;
		}

		node = node.parentNode;
	}

	return false;
};


var _pbsUpdateNonCaptionedImageCTElement = function( imageNode, imageData ) {

	var classes, id, attrs, linkAttrs, width, height, align;

	// classes = tinymce.explode( imageData.extraClasses, ' ' );
	classes = imageData.extraClasses.split( ' ' );

	if ( ! classes ) {
		classes = [];
	}

	if ( ! imageData.caption ) {
		classes.push( 'align' + imageData.align );
	}

	if ( imageData.attachment_id ) {
		classes.push( 'wp-image-' + imageData.attachment_id );
		if ( imageData.size && imageData.size !== 'custom' ) {
			classes.push( 'size-' + imageData.size );
		}
	}

	width = imageData.width;
	height = imageData.height;

	if ( imageData.size === 'custom' ) {
		width = imageData.customWidth;
		height = imageData.customHeight;
	}

	attrs = {
		src: imageData.url,
		width: width || null,
		height: height || null,
		alt: imageData.alt,
		title: imageData.title || null,
		'class': classes.join( ' ' ) || null
	};

	// The aspect ratio might have changed.
	imageNode._aspectRatio = height / width;
	imageNode.size([width, height]);

	// Remove any existing attachment id class
	var cls = imageNode.attr( 'class' ).match( /wp-image-\d+/ );
	if ( cls ) {
		imageNode.removeCSSClass( cls[0] );
	}
	cls = imageNode.attr( 'class' ).match( /size-\w+/ );
	if ( cls ) {
		imageNode.removeCSSClass( cls[0] );
	}

	// Add the classes
	imageNode.removeCSSClass('alignleft');
	imageNode.removeCSSClass('alignright');
	imageNode.removeCSSClass('aligncenter');
	imageNode.removeCSSClass('alignnone');
	for ( var i = 0; i < classes.length; i++ ) {
		if ( classes[ i ] ) {
			imageNode.addCSSClass( classes[ i ] );
		}
	}

	// Add the other attributes
	for ( var key in attrs ) {
		if ( ! attrs.hasOwnProperty( key ) ) {
			continue;
		}
		if ( key === 'class' ) {
			continue;
		}
		if ( attrs[ key ] !== null ) {
			imageNode.attr( key, attrs[ key ] );
		} else {
			imageNode.removeAttr( key );
		}
	}

	linkAttrs = {
		href: imageData.linkUrl,
		rel: imageData.linkRel || null,
		target: imageData.linkTargetBlank ? '_blank': null,
		'class': imageData.linkClassName || null
	};

	if ( imageNode.a ) {
		if ( imageData.linkUrl ) {
			// Update the attributes of the link
			// dom.setAttribs( imageNode.parentNode, linkAttrs );
			for ( key in linkAttrs ) {
				if ( linkAttrs.hasOwnProperty( key ) ) {
					if ( linkAttrs[ key ] !== null ) {
						imageNode.a[ key ] = linkAttrs[ key ];
					} else {
						delete imageNode.a[ key ];
					}
				}
			}
		} else {
			imageNode.a = null;
		}
	} else if ( imageData.linkUrl ) {
		imageNode.a = {};
		for ( key in linkAttrs ) {
			if ( linkAttrs.hasOwnProperty( key ) ) {
				if ( linkAttrs[ key ] !== null ) {
					imageNode.a[ key ] = linkAttrs[ key ];
				}
			}
		}
	}


	// We always come from a non-captioned image, transform into a caption shortcode and
	// never from a captioned image (that's another function)
	if ( imageData.caption ) {

		id = imageData.attachment_id ? 'attachment_' + imageData.attachment_id : null;
		align = 'align' + ( imageData.align || 'none' );

		// Default data
		var scData = {
			tag: 'caption',
			type: 'closed',
			content: imageNode.html() + ' ' + imageData.caption,
			attrs: {
				id: id,
				align: align,
				width: width
			}
		};

		// Generate the shortcode
		var shortcode = new wp.shortcode( scData );//.string();

		var newElem = ContentEdit.Shortcode.createShortcode( wp.shortcode.next( 'caption', shortcode.string(), 0 ) );
		var index = imageNode.parent().children.indexOf( imageNode );
		imageNode.parent().attach( newElem, index );
		imageNode.parent().detach( imageNode );
		newElem.ajaxUpdate( true );
		return;

	}

};


// From js/tinymce/plugins/wpeditimage/plugin.js
var _pbsImageGetMetaData = function( img ) {

	// Modified from extractImageData() in plugin.js
	var attachmentID = img.getAttribute('class').match(/wp-image-(\d+)/);
	var align = img.getAttribute('class').match(/align(\w+)/);
	var size = img.getAttribute('class').match(/size-(\w+)/);
	var i;

	var tmpClasses = img.getAttribute('class').split(' ');
	var extraClasses = [];

	var classRegex = /wp-image-\d+|align\w+|size-\w+|ce-element[-\w]*/;

	// Extract classes on Image Elements
	if ( img._ceElement ) {
		if ( img._ceElement.a && img._ceElement.a['class'] ) {
			var aClasses = img._ceElement.a['class'].split(' ');
			for ( i = 0; i < aClasses.length; i++ ) {
				if ( ! aClasses[ i ].match(classRegex) ) {
					extraClasses.push( aClasses[ i ] );
				}
			}
		}
	}

	for ( i = 0; i < tmpClasses.length; i++ ) {
		if ( ! tmpClasses[ i ].match(classRegex) ) {
			extraClasses.push( tmpClasses[ i ] );
		}
	}

	var metadata = {
		attachment_id: attachmentID ? attachmentID[1] : false,
		size: size ? size[1] : 'custom',
		caption: '',
		align: align ? align[1] : 'none',
		extraClasses: extraClasses.join(' '),
		link: false,
		linkUrl: '',
		linkClassName: '',
		linkTargetBlank: false,
		linkRel: '',
		title: ''
	};
	metadata.url = img.getAttribute('src');
	metadata.alt = img.getAttribute('alt');
	metadata.title = img.getAttribute('title');

	var width = img.getAttribute('width');
	var height = img.getAttribute('height');

	metadata.customWidth = metadata.width = width;
	metadata.customHeight = metadata.height = height;


	// Extract caption
	var captionClassName = [];
	var captionBlock = img.parentNode;
	while ( captionBlock !== null && typeof captionBlock.classList !== 'undefined' ) {

		if ( captionBlock.classList.contains( 'wp-caption' ) ) {
			break;
		}
		captionBlock = captionBlock.parentNode;
	}

	if ( captionBlock && captionBlock.classList ) {
		var classes = captionBlock.classList;

		for ( i = 0; i < classes.length; i++ ) {
			var c = classes.item( i );
			if ( /^align/.test( c ) ) {
				metadata.align = c.replace( 'align', '' );
			} else if ( c && c !== 'wp-caption' ) {
				captionClassName.push( c );
			}
		}

		metadata.captionClassName = captionClassName.join( ' ' );

		var caption = captionBlock.querySelector('.wp-caption-text');
		if ( caption ) {
			metadata.caption = caption.innerHTML.replace( /<br[^>]*>/g, '$&\n' ).replace( /^<p>/, '' ).replace( /<\/p>$/, '' );
		}
	}

	// Extract linkTo
	if ( img.parentNode && img.parentNode.nodeName === 'A' ) {
		var link = img.parentNode;
		metadata.linkUrl = link.getAttribute( 'href' );
		metadata.linkTargetBlank = link.getAttribute( 'target' ) === '_blank' ? true : false;
		metadata.linkRel = link.getAttribute( 'rel' );
		metadata.linkClassName = link.className;
	}
	// Extract linkTo for Image Elements
	if ( img._ceElement ) {
		if ( img._ceElement.a ) {
			metadata.linkUrl = img._ceElement.a.href;
			metadata.linkTargetBlank = img._ceElement.a.target === '_blank' ? true : false;
			metadata.linkRel = img._ceElement.a.rel;
			metadata.linkClassName = img._ceElement.a['class'];
		}
	}

	return metadata;
};



// Upon load, unwrap all images from their paragraph tags so that they can all be rendered as Image Elements.
/**
Scenarios:
<p><img>blahblah</p> --> <img><p>blahblah</p>
<p>start<img>end</p> --> <p>start</p><img><p>end</p>
*/
window.addEventListener( 'DOMContentLoaded', function() {
	if ( ! document.querySelector('[data-name="main-content"]') ) {
		return;
	}

	var editableArea = document.querySelector('[data-name="main-content"]');
	var selector = 'a:not([data-ce-tag]) > img.alignright, a:not([data-ce-tag]) > img.alignleft, a:not([data-ce-tag]) > img.aligncenter, a:not([data-ce-tag]) > img.alignnone, p > img.alignright, p > img.alignleft, p > img.aligncenter, p > img.alignnone';

	while ( editableArea.querySelector( selector ) ) {
		var el = editableArea.querySelector( selector );
		var mainImageNode = el;
		if ( el.parentNode.tagName === 'A' ) {
			mainImageNode = el.parentNode;
			mainImageNode.setAttribute('data-ce-tag', 'img');
		}

		if ( mainImageNode.parentNode.tagName === 'P' ) {
			var p = mainImageNode.parentNode;
			var startingIndex = p.innerHTML.indexOf( mainImageNode.outerHTML );
			var endingIndex = startingIndex + mainImageNode.outerHTML.length;
			var tip = p.innerHTML.substr(0, startingIndex).trim();
			var tail = p.innerHTML.substr(endingIndex).trim();

			var newContent = '';
			var clonedPNode;
			if ( tip !== '' ) {
				clonedPNode = p.cloneNode();
				clonedPNode.innerHTML = tip;
				newContent += clonedPNode.outerHTML;
			}
			newContent += mainImageNode.outerHTML;
			if ( tail !== '' ) {
				clonedPNode = p.cloneNode();
				clonedPNode.innerHTML = tail;
				newContent += clonedPNode.outerHTML;
			}
			p.outerHTML = newContent;
		}
	}

	// WordPress adds br tags after images in certain scenario, remove them
	// since we do not need them.
	while ( editableArea.querySelector('img ~ br, [data-ce-tag="img"] ~ br') ) {
		editableArea.querySelector('img ~ br, [data-ce-tag="img"] ~ br').remove();
	}
});


/*******************************************************************************
 * Clean image tags on saving.
 *******************************************************************************/
wp.hooks.addFilter( 'pbs.save', function( html ) {

	// Remove the data-ce-tag="img" left by CT.
	html = html.replace( /\sdata-ce-tag=["']img["']/g, '' );

	// Remove the empty class left by CT.
	html = html.replace( /(<a[^>]*)\sclass((\s|>)[^>]*>)/g, '$1$2' );

	// Put back images inside paragraph tags.
	html = html.replace( /((<a[^>]+>\s*)?<img[^>]*>(\s*<\/a>)?)\s*(<p[^\w>]*>)/g, '$4$1' );

	// Wrap images which aren't inside paragraph tags inside paragraph tags.
	html = html.replace( /(<[^pa][^>]*>\s*)(<img[^>]*>)/g, '$1<p>$2</p>' );
	html = html.replace( /(<[^p][^>]*>\s*)(<a[^>]+>\s*<img[^>]*>\s*<\/a>)/g, '$1<p>$2</p>' );

	// Remove br tags after images since WP sometimes adds them.
	html = html.replace( /((<a[^>]+>\s*)?<img[^>]*>(\s*<\/a>)?)\s*(<br[^>]*>)*/g, '$1' );

	return html;
} );

/**
 * Widgets are actually just shortcodes.
 */

/* globals pbsParams */

 // wp.hooks.addFilter( 'pbs.shortcode.allow_raw_edit', function( allow, scBase ) {
 //  if ( scBase === 'pbs_widget' ) {
 // 	 return false;
 //  }
 //  return allow;
 // } );

// wp.hooks.addFilter( 'pbs.toolbar.tools.allow', function( allow, target ) {
// 	if ( target.getAttribute('data-base') === 'pbs_widget' ) {
// 		return false;
// 	}
// 	return allow;
// } );

wp.hooks.addFilter( 'pbs.toolbar.shortcode.label', function( scBase ) {
	if ( scBase === 'pbs_widget' ) {
		return pbsParams.labels.widget;
	}
	return scBase;
} );


/**
 * Widgets which are (previously) used in the content, but have been disabled in the site will still
 * show up in the content. Their templates would not be available anymore, this would cause
 * errors, so override the section creation and disable it.
 *
 * Instead of displaying the widget settings in the inspector, it now reverts to just a normal shortcode.
 */
wp.hooks.addFilter( 'pbs.inspector.do_add_section_options', function( doContinue, optionName, model, divGroup, element, toolboxUI ) {
	if ( optionName === 'widgetSettings' && model && model.attributes && model.attributes.widget ) {

		// doContinue = true only if the widget template is there.
		doContinue = !! document.querySelector( '#tmpl-pbs-widget-' + model.attributes.widget );
		if ( ! doContinue ) {
			toolboxUI.addGenericShortcodeOptions( divGroup, element );
		}
	}
	return doContinue;
} );


/**
 * A collection of functions that extend the capabilities of HTMLString to
 * manipulate CSS styles.
 *
 * This is used by various formatting tools.
 */


/* globals HTMLString */

/**
 * Removes all inline styles from all the content.
 */
HTMLString.String.prototype.removeStyles = function() {
	var c, from, i, newString, to, _i, newStyles, tagName;
	from = arguments[0], to = arguments[1], tagName = arguments[2], newStyles = arguments[3];

	if ( to < 0 ) {
		to = this.length() + to + 1;
	}
	if ( from < 0 ) {
		from = this.length() + from;
	}

	newString = this.copy();
	for (i = _i = from; from <= to ? _i < to : _i > to; i = from <= to ? ++_i : --_i) {
		c = newString.characters[i];

		// Make sure we have a span tag for styling.
		if ( c._tags.length ) {

			// Remove all tags except for anchor tags.
			for ( var z = c._tags.length - 1; z >= 0; z-- ) {
				if ( c.tags()[ z ].name() !== 'a' ) {
					newString.characters[i].removeTags( c.tags()[ z ] );
				}
			}

		}
	}

	newString.optimize();

	return newString;
};


/**
 * Checks whether a specific style is present anywhere in the content.
 * If the style name is not given, the function checks if there is any style defined.
 */
HTMLString.String.prototype.hasStyle = function() {
	var c, from, i, to, _i, styleName = null;
	from = arguments[0], to = arguments[1];
	if ( arguments.length >= 3 ) {
		styleName = arguments[2];
	}

	if ( to < 0 ) {
		to = this.length() + to + 1;
	}
	if ( from < 0 ) {
		from = this.length() + from;
	}

	// newString = this.copy();
	for (i = _i = from; from <= to ? _i < to : _i > to; i = from <= to ? ++_i : --_i) {
		c = this.characters[i];

		// Make sure we have a span tag for styling.
		if ( ! c ) {
			continue;
		}
		if ( ! c._tags.length ) {
			continue;
		}

		if ( ! styleName ) {
			if ( ['b', 'strong', 'i', 'em'].indexOf( c.tags()[0].name() ) !== -1 ) {
				return true;
			}
			if ( c.tags()[0].attr('style') ) {
				return true;
			}
		} else {
			var currentStyles = window.cssToStyleObject( c.tags()[0].attr('style') );
			if ( typeof currentStyles[ styleName ] !== 'undefined' ) {
				return currentStyles[ styleName ];
			}
		}
	}

	return false;
};



/**
 * Applies a style to the content.
 */
HTMLString.String.prototype.style = function() {
	var c, from, i, newString, tags, to, _i, newStyles, tagName;
	from = arguments[0], to = arguments[1], tagName = arguments[2], newStyles = arguments[3];
	tags = new HTMLString.Tag('span');

	if ( to < 0 ) {
		to = this.length() + to + 1;
	}
	if ( from < 0 ) {
		from = this.length() + from;
	}

	// Create a dummy element where we can test styles.
	var dummy = document.createElement( tagName );
	dummy.style.display = 'none';
	document.body.appendChild( dummy );

	newString = this.copy();
	for (i = _i = from; from <= to ? _i < to : _i > to; i = from <= to ? ++_i : --_i) {
		c = newString.characters[i];

		// Make sure we have a span tag for styling.
		if ( ! c._tags.length ) {
			c.addTags( tags );
		}

		// Don't apply styles to BR tags.
		var isBr = false;
		for ( var z = 0; z < c._tags.length; z++ ) {
			if ( c._tags[ z ].name() === 'br' ) {
				isBr = true;
				break;
			}
		}
		if ( isBr ) {
			continue;
		}

		// Add the new styles to the existing styles.
		var currentStyles = window.cssToStyleObject( c.tags()[0].attr('style') );
		for ( var styleName in newStyles ) {
			if ( newStyles.hasOwnProperty( styleName ) && newStyles[ styleName ] ) {

				if ( typeof newStyles[ styleName ] === 'string' ) {
					newStyles[ styleName ] = [ '', newStyles[ styleName ] ];
				} else if ( newStyles[ styleName ][0] !== '' ) {
					newStyles[ styleName ].unshift( '' );
				}
				var expectedStyleValue = newStyles[ styleName ][ newStyles[ styleName ].length - 1 ];

				// Go through styles we want to apply.
				var applyStyle;
				for ( var k = 0; k < newStyles[ styleName ].length; k++ ) {
					applyStyle = newStyles[ styleName ][ k ];

					// Try it out if it works.
					var dummyStyleAttribute = '';
					if ( applyStyle ) {
						dummyStyleAttribute = 'style="' + styleName + ': ' + applyStyle + '"';
					}
					dummy.innerHTML = '<span ' + dummyStyleAttribute + '>' + c.c() + '</span>';
					var appliedStyles = window.getComputedStyle( dummy.firstChild );

					if ( appliedStyles[ styleName ] === expectedStyleValue ) {
						break;
					}
				}

				currentStyles[ styleName ] = applyStyle;

			} else {

				// Remove the style.
				delete currentStyles[ styleName ];
			}

			// If the style is blank, just don't include it.
			if ( currentStyles[ styleName ] === '' ) {
				delete currentStyles[ styleName ];
			}

		}

		// Apply the styles.
		newString.characters[i]._tags[0].attr('style', window.cssToStyleString( currentStyles ) );

		// Remove the span if it doesn't have any styles.
		if ( newString.characters[i]._tags[0].name() === 'span' ) {
			if ( newString.characters[i]._tags[0].attr('style').trim() === '' ) {
				newString.characters[i].removeTags();
			}
		}
	}

	// Remove the style tester.
	document.body.removeChild( dummy );

	newString.optimize();

	return newString;
};


/**
 * Gets the style of the content. This only returns the first encountered
 * style.
 */
HTMLString.String.prototype.getStyle = function( styleName, element ) {
	var dashedStyleName = styleName;
	styleName = styleName.replace(/-([a-z])/g, function (m, w) {
	    return w.toUpperCase();
	});

	// We check this node's styles.
	var nodeToCheck = element._domElement;

	// If the highlighted text is a node, find it in the element
	var nodeHTML = this.html();
	var foundNode = false;
	if ( nodeHTML.indexOf( '<' ) === 0 ) {
		for ( var i = 0; i < element._domElement.children.length; i++ ) {
			if ( element._domElement.children[ i ].outerHTML === nodeHTML ) {
				nodeToCheck = element._domElement.children[ i ];
				foundNode = true;
				break;
			}
		}
	}

	// If the node cannot be found, this means multiple nodes are selected,
	// use the first node's styles
	if ( ! foundNode && nodeHTML.indexOf( '<' ) === 0 ) {
		var styleRegex = new RegExp( '(<\\w+[^>]+style=[^>]*[^-]' + dashedStyleName + ':\\s*)([\\w.]+)' );
		var match = nodeHTML.match( styleRegex );
		if ( match ) {
			return match[2];
		}
	}

	return getComputedStyle( nodeToCheck )[ styleName ];
};


/**
 * Fixed: Edge bug where PBS did not start at all and was stuck in "Please Wait".
 * HACK: IE Edge sometimes sends an array containing an empty array to this method.
 *
 * @see https://github.com/GetmeUK/ContentTools/issues/258
 */
HTMLString.Character.prototype.addTags = function() {
	var tag, tags, _i, _len, _results;
	tags = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	_results = [];
	for (_i = 0, _len = tags.length; _i < _len; _i++) {
		tag = tags[_i];

        // HACK: IE Edge sometimes sends an array containing an empty array to this method.
        if ( Array.isArray( tag ) ) {
			continue;
        }

		if (tag.selfClosing()) {
			if (!this.isTag()) {
				this._tags.unshift(tag.copy());
			}
			continue;
		}

		_results.push(this._tags.push(tag.copy()));
	}
	return _results;
};

/* globals PBSEditor, pbsParams */

/**
 * Usage:

	PBSEditor.openMediaManager( function( attachment ) {
		element.style( 'background-image', 'url(' + attachment.attributes.url + ')' );
		element.attr( 'data-bg-image-id', attachment.id );
	}, imageID );
 */

window.addEventListener( 'DOMContentLoaded', function() {
	wp.media.frames.pbsSelectImage = wp.media({
		title: pbsParams.labels.select_image,
		multiple: false,
		library: {
			type: 'image'
		},
		button: {
			text: pbsParams.labels.use_selected_image
		}
	});

	PBSEditor.openMediaManager = function( callback, selectedImageID ) {
		wp.media.frames.pbsSelectImage.callback = function( ) {

			// Remove event listeners.
			wp.media.frames.pbsSelectImage.off('close', wp.media.frames.pbsSelectImage.callback);
			wp.media.frames.pbsSelectImage.off('select', wp.media.frames.pbsSelectImage.callback);

			// Get selected image.
		    var selection = wp.media.frames.pbsSelectImage.state().get( 'selection' );

		    // Nothing selected, do nothing.
		    if ( ! selection ) {
		        return;
		    }

			// iterate through selected elements
			var ret = null;
	        selection.each(function(attachment) {
				ret = attachment;
	        });
			if ( ret ) {
				callback( ret );
			}
		};

		// Add new event handlers;
		wp.media.frames.pbsSelectImage.on('close', wp.media.frames.pbsSelectImage.callback);
		wp.media.frames.pbsSelectImage.on('select', wp.media.frames.pbsSelectImage.callback);

		wp.media.frames.pbsSelectImage._onOpen = function() {
			wp.media.frames.pbsSelectImage.off('open', wp.media.frames.pbsSelectImage._onOpen);

			var selection = wp.media.frames.pbsSelectImage.state().get( 'selection' );
			if ( ! selection ) {
				return;
			}

			while ( selection.length ) {
				selection.remove( selection.first() );
			}

			if ( selectedImageID ) {
				var attachment = wp.media.attachment( selectedImageID );

				if ( attachment ) {
					selection.add( attachment );
				}
			}
		};
		wp.media.frames.pbsSelectImage.on('open', wp.media.frames.pbsSelectImage._onOpen);

		wp.media.frames.pbsSelectImage.open();
	};

});

/* globals pbsParams */

/**
 * Loads widget templates in the DOM, we need to do this using Ajax since
 * Doing it via PHP enqueues scripts that may cause errors.
 */
window.addEventListener( 'DOMContentLoaded', function() {

	// Only do this if the editor is present.
	if ( ! document.querySelector( '[data-name="main-content"]' ) ) {
		return;
	}


	/**
	 * Appends all the widget templates into the page.
	 */
	var appendWidgetTemplates = function( ajaxResponse ) {

		// Store it so we won't have to do this next time.
		localStorage.setItem( 'pbs_get_widget_templates_hash', pbsParams.widget_list_hash );
		localStorage.setItem( 'pbs_get_widget_templates', ajaxResponse );

		// Append the templates into the body.
		var dummy = document.createElement( 'DIV' );
		dummy.innerHTML = ajaxResponse;

		while ( dummy.firstChild ) {
			document.body.appendChild( dummy.firstChild );
		}
	};


	/**
	 * Check if we have a stored set of widget templates from a previous page load,
	 * use those to make things faster.
	 */
	var storedWidgetHash = localStorage.getItem( 'pbs_get_widget_templates_hash' );
	var storedWidgets = localStorage.getItem( 'pbs_get_widget_templates' );

	if ( storedWidgetHash === pbsParams.widget_list_hash && storedWidgets ) {
		appendWidgetTemplates( storedWidgets );
		return;
	}


	/**
	 * Perform an ajax call to get all the widget templates.
	 */
	var payload = new FormData();
	payload.append( 'action', 'pbs_get_widget_templates' );
	payload.append( 'nonce', pbsParams.nonce );

	var xhr = new XMLHttpRequest();

	xhr.onload = function() {
		if (xhr.status >= 200 && xhr.status < 400) {
			appendWidgetTemplates( xhr.responseText );
		}
	};

	xhr.open('POST', pbsParams.ajax_url );
	xhr.send( payload );

});

/* globals ContentTools, ContentEdit, __extends, pbsParams */

ContentTools.ToolboxBarUI = ( function( _super ) {
	__extends( ToolboxBarUI, _super );

	function ToolboxBarUI(tools) {
		ToolboxBarUI.__super__.constructor.call(this);
		this._tools = tools;
		this._toolUIs = {};
	}

	ToolboxBarUI.prototype.isDragging = function() {
		return false;
	};

	ToolboxBarUI.prototype.hide = function() {
		this._removeDOMEventListeners();
		return ToolboxBarUI.__super__.hide.call(this);
	};

	ToolboxBarUI.prototype.tools = function(tools) {
		if (tools === void 0) {
			return this._tools;
		}
		this._tools = tools;
		this.unmount();
		return this.mount();
	};

	ToolboxBarUI.prototype.mount = function() {
		var domToolGroup, i, tool, toolGroup, toolName, _i, _j, _len, _len1, _ref;
		this._domElement = this.constructor.createDiv( [ 'pbs-toolbox-bar', 'ct-widget', 'ct-toolbox' ] );
		document.body.appendChild( this._domElement );
		_ref = this._tools;
		for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
			toolGroup = _ref[i];
			domToolGroup = this.constructor.createDiv(['ct-tool-group']);
			this._domElement.appendChild(domToolGroup);
			for (_j = 0, _len1 = toolGroup.length; _j < _len1; _j++) {
				toolName = toolGroup[_j];

				if ( toolName === '|' ) {
					tool = this.constructor.createDiv(['pbs-tool-sep']);
					domToolGroup.appendChild( tool );
					continue;
				}

				tool = ContentTools.ToolShelf.fetch(toolName);
				this._toolUIs[toolName] = new ContentTools.ToolUI(tool);
				this._toolUIs[toolName].mount(domToolGroup);
				this._toolUIs[toolName].disabled(true);
				this._toolUIs[toolName].bind('apply', (function(_this) {
					return function() {
						return _this.updateTools();
					};
				})(this));
			}
		}
		return this._addDOMEventListeners();
	};

	ToolboxBarUI.prototype.updateTools = function() {
		ToolboxBarUI.__super__.updateTools.call( this );
	};

	ToolboxBarUI.prototype._addDOMEventListeners = function() {
	  this._updateTools = (function(_this) {
	    return function() {
	      var app, element, name, selection, toolUI, update, _ref, _results;
	      app = ContentTools.EditorApp.get();
	      update = false;
	      element = ContentEdit.Root.get().focused();
	      selection = null;
	      if (element === _this._lastUpdateElement) {
	        if (element && element.selection) {
	          selection = element.selection();
	          if (_this._lastUpdateSelection && selection.eq(_this._lastUpdateSelection)) {
	            update = true;
	          }
	        }
	      } else {
	        update = true;
	      }
	      if (app.history) {
	        if (_this._lastUpdateHistoryLength !== app.history.length()) {
	          update = true;
	        }
	        _this._lastUpdateHistoryLength = app.history.length();
	      }
	      _this._lastUpdateElement = element;
	      _this._lastUpdateSelection = selection;
	      _ref = _this._toolUIs;
	      _results = [];
	      for (name in _ref) {
	        toolUI = _ref[name];
	        _results.push(toolUI.update(element, selection));
	      }
	      return _results;
	    };
	  })(this);
	  this._updateToolsTimeout = setInterval(this._updateTools, 100);
	  this._handleKeyDown = (function() {
	    return function(ev) {
	      var element, os, redo, undo, version;
	      if (ev.keyCode === 46) {
	        element = ContentEdit.Root.get().focused();
	        if (element && !element.content) {
	          ContentTools.Tools.Remove.apply(element, null, function() {});
	        }
	      }
	      version = navigator.appVersion;
	      os = 'linux';
	      if (version.indexOf('Mac') !== -1) {
	        os = 'mac';
	      } else if (version.indexOf('Win') !== -1) {
	        os = 'windows';
	      }
	      redo = false;
	      undo = false;
	      switch (os) {
	        case 'linux':
	          if (ev.keyCode === 90 && ev.ctrlKey) {
	            redo = ev.shiftKey;
	            undo = !redo;
	          }
	          break;
	        case 'mac':
	          if (ev.keyCode === 90 && ev.metaKey) {
	            redo = ev.shiftKey;
	            undo = !redo;
	          }
	          break;
	        case 'windows':
	          if (ev.keyCode === 89 && ev.ctrlKey) {
	            redo = true;
	          }
	          if (ev.keyCode === 90 && ev.ctrlKey) {
	            undo = true;
	          }
	      }
	      if (undo && ContentTools.Tools.Undo.canApply(null, null)) {
	        ContentTools.Tools.Undo.apply(null, null, function() {});
	      }
	      if (redo && ContentTools.Tools.Redo.canApply(null, null)) {
	        return ContentTools.Tools.Redo.apply(null, null, function() {});
	      }
	    };
	  })(this);
	  return window.addEventListener('keydown', this._handleKeyDown);
	};

	ToolboxBarUI.prototype._removeDOMEventListeners = function() {
		window.removeEventListener('keydown', this._handleKeyDown);
		return clearInterval( this._updateToolsTimeout );
	};

	ToolboxBarUI.prototype._onStartDragging = function() {
	};

	ToolboxBarUI.prototype._onStopDragging = function() {
	};

	ToolboxBarUI.prototype._onDrag = function() {
	};

	return ToolboxBarUI;

})(ContentTools.ToolboxUI);


( function() {
	var _EditorApp = ContentTools.EditorApp.getCls();
	var proxied = _EditorApp.prototype.init;
	_EditorApp.prototype.init = function( queryOrDOMElements, namingProp ) {
		proxied.call( this, queryOrDOMElements, namingProp );

		this._toolboxBar = new ContentTools.ToolboxBarUI( window.PBSEditor.formattingTools );
		this.attach(this._toolboxBar);
	};

	var unmountProxy = _EditorApp.prototype.unmount;
	_EditorApp.prototype.unmount = function() {
		unmountProxy.call( this );
		if ( ! this.isMounted() ) {
			return;
		}
		this._toolboxBar = null;
	};

	var startProxy = _EditorApp.prototype.start;
	_EditorApp.prototype.start = function() {
		startProxy.call( this );
		this._toolboxBar.show();
	};

	var stopProxy = _EditorApp.prototype.stop;
	_EditorApp.prototype.stop = function() {
		stopProxy.call( this );
		this._toolboxBar.hide();
	};

} )();


/**
 * Make labels translatable.
 */
ContentTools.Tools.Bold.label = pbsParams.labels.bold;
ContentTools.Tools.Italic.label = pbsParams.labels.italic;
ContentTools.Tools.Link.label = pbsParams.labels.link;
ContentTools.Tools.AlignLeft.label = pbsParams.labels.align_left;
ContentTools.Tools.AlignCenter.label = pbsParams.labels.align_center;
ContentTools.Tools.AlignRight.label = pbsParams.labels.align_right;
ContentTools.Tools.OrderedList.label = pbsParams.labels.numbered_list;
ContentTools.Tools.UnorderedList.label = pbsParams.labels.bullet_list;
ContentTools.Tools.Indent.label = pbsParams.labels.indent;
ContentTools.Tools.Unindent.label = pbsParams.labels.unindent;
ContentTools.Tools.Undo.label = pbsParams.labels.undo;
ContentTools.Tools.Redo.label = pbsParams.labels.redo;

/* globals ContentTools, ContentEdit, __extends, pbsParams */

ContentTools.ToolboxFixedUI = ( function( _super ) {
	__extends( ToolboxFixedUI, _super );

	function ToolboxFixedUI(tools) {
		ToolboxFixedUI.__super__.constructor.call(this);
		this._tools = tools;
		this._toolUIs = {};
	}

	ToolboxFixedUI.prototype.isDragging = function() {
		return false;
	};

	ToolboxFixedUI.prototype.toggle = function() {
		if ( ! this._domElement ) {
			this.show();
		} else if ( this._domElement.classList.contains( 'pbs-toolbox-elements-shown' ) ) {
			this.hide();
		} else {
			this.show();
		}
	};

	ToolboxFixedUI.prototype.show = function() {
        if ( ! this.isMounted() ) {
			this.mount();
        }
		this._domElement.scrollTop = 0;
		this.addCSSClass( 'ct-widget--active' );
	};

	ToolboxFixedUI.prototype.hide = function() {
		if ( this._domElement ) {
			this.removeCSSClass( 'ct-widget--active' );
		}
		this._removeDOMEventListeners();
		return ToolboxFixedUI.__super__.hide.call(this);
	};

	ToolboxFixedUI.prototype.tools = function(tools) {
		if (tools === void 0) {
			return this._tools;
		}
		this._tools = tools;
		this.unmount();
		return this.mount();
	};

	ToolboxFixedUI.prototype.mount = function() {
		var domToolGroup, i, tool, toolGroup, toolName, _i, _j, _len, _len1, _ref;
		this._domElement = this.constructor.createDiv( [ 'pbs-interactive-elements-group', 'pbs-toolbox-elements', 'ct-widget', 'ct-toolbox' ] );
		document.body.appendChild( this._domElement );

		var note = this.constructor.createDiv( [ 'pbs-toolbox-elements-note' ] );
		note.innerHTML = pbsParams.labels.drag_an_element;
		this._domElement.appendChild( note );

		_ref = this._tools;
		for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
			toolGroup = _ref[i];
			domToolGroup = this.constructor.createDiv(['ct-tool-group']);
			this._domElement.appendChild(domToolGroup);
			for (_j = 0, _len1 = toolGroup.length; _j < _len1; _j++) {
				toolName = toolGroup[_j];
				tool = ContentTools.ToolShelf.fetch(toolName);
				this._toolUIs[toolName] = new ContentTools.ToolUI(tool);
				this._toolUIs[toolName].mount(domToolGroup);
				this._toolUIs[toolName].disabled(true);
				this._toolUIs[toolName].bind('apply', (function(_this) {
					return function() {
						return _this.updateTools();
					};
				})(this));
			}
		}
		return this._addDOMEventListeners();
	};

	ToolboxFixedUI.prototype.updateTools = function() {
		ToolboxFixedUI.__super__.updateTools.call( this );
	};

	ToolboxFixedUI.prototype._addDOMEventListeners = function() {

		// When leaving the toolbar, hide it.
		this._domElement.addEventListener( 'mouseleave', function( ev ) {
			if ( ev.relatedTarget ) {
				if ( window.pbsSelectorMatches( ev.relatedTarget, '.ct-tool--insert-element, .ct-tool--insert-element *' ) ) {
					return;
				}
			}
			this.hide();
		}.bind( this ) );

	  this._updateTools = (function(_this) {
	    return function() {
	      var app, element, name, selection, toolUI, update, _ref, _results;
	      app = ContentTools.EditorApp.get();
	      update = false;
	      element = ContentEdit.Root.get().focused();
	      selection = null;
	      if (element === _this._lastUpdateElement) {
	        if (element && element.selection) {
	          selection = element.selection();
	          if (_this._lastUpdateSelection && selection.eq(_this._lastUpdateSelection)) {
	            update = true;
	          }
	        }
	      } else {
	        update = true;
	      }
	      if (app.history) {
	        if (_this._lastUpdateHistoryLength !== app.history.length()) {
	          update = true;
	        }
	        _this._lastUpdateHistoryLength = app.history.length();
	      }
	      _this._lastUpdateElement = element;
	      _this._lastUpdateSelection = selection;
	      _ref = _this._toolUIs;
	      _results = [];
	      for (name in _ref) {
	        toolUI = _ref[name];
	        _results.push(toolUI.update(element, selection));
	      }
	      return _results;
	    };
	  })(this);
	  this._updateToolsTimeout = setInterval(this._updateTools, 100);
	  this._handleKeyDown = (function() {
	    return function(ev) {
	      var element, os, redo, undo, version;
	      if (ev.keyCode === 46) {
	        element = ContentEdit.Root.get().focused();
	        if (element && !element.content) {
	          ContentTools.Tools.Remove.apply(element, null, function() {});
	        }
	      }
	      version = navigator.appVersion;
	      os = 'linux';
	      if (version.indexOf('Mac') !== -1) {
	        os = 'mac';
	      } else if (version.indexOf('Win') !== -1) {
	        os = 'windows';
	      }
	      redo = false;
	      undo = false;
	      switch (os) {
	        case 'linux':
	          if (ev.keyCode === 90 && ev.ctrlKey) {
	            redo = ev.shiftKey;
	            undo = !redo;
	          }
	          break;
	        case 'mac':
	          if (ev.keyCode === 90 && ev.metaKey) {
	            redo = ev.shiftKey;
	            undo = !redo;
	          }
	          break;
	        case 'windows':
	          if (ev.keyCode === 89 && ev.ctrlKey) {
	            redo = true;
	          }
	          if (ev.keyCode === 90 && ev.ctrlKey) {
	            undo = true;
	          }
	      }
	      if (undo && ContentTools.Tools.Undo.canApply(null, null)) {
	        ContentTools.Tools.Undo.apply(null, null, function() {});
	      }
	      if (redo && ContentTools.Tools.Redo.canApply(null, null)) {
	        return ContentTools.Tools.Redo.apply(null, null, function() {});
	      }
	    };
	  })(this);
	  return window.addEventListener('keydown', this._handleKeyDown);
	};

	ToolboxFixedUI.prototype._removeDOMEventListeners = function() {
		window.removeEventListener('keydown', this._handleKeyDown);
		return clearInterval( this._updateToolsTimeout );
	};

	ToolboxFixedUI.prototype._onStartDragging = function() {
	};

	ToolboxFixedUI.prototype._onStopDragging = function() {
	};

	ToolboxFixedUI.prototype._onDrag = function() {
	};

	return ToolboxFixedUI;

})(ContentTools.ToolboxUI);


( function() {
	var _EditorApp = ContentTools.EditorApp.getCls();
	var proxied = _EditorApp.prototype.init;
	_EditorApp.prototype.init = function( queryOrDOMElements, namingProp ) {
		proxied.call( this, queryOrDOMElements, namingProp );

		this._toolboxElements = new ContentTools.ToolboxFixedUI( window.PBSEditor.insertElements );
		this.attach(this._toolboxElements);
	};

	var unmountProxy = _EditorApp.prototype.unmount;
	_EditorApp.prototype.unmount = function() {
		unmountProxy.call( this );
		if ( ! this.isMounted() ) {
			return;
		}
		this._toolboxElements = null;
	};

	var startProxy = _EditorApp.prototype.start;
	_EditorApp.prototype.start = function() {
		startProxy.call( this );
		if ( ! this._toolboxElements.isMounted() ) {
			this._toolboxElements.mount();
		}
	};

	var stopProxy = _EditorApp.prototype.stop;
	_EditorApp.prototype.stop = function() {
		stopProxy.call( this );
		this._toolboxElements.hide();
	};

} )();


// Close the elemen list when contents are clicked.
window.addEventListener( 'DOMContentLoaded', function() {
	document.querySelector( '.pbs-main-wrapper' ).addEventListener( 'mousedown', function() {
		ContentTools.EditorApp.get()._toolboxElements.hide();
	} );
	document.querySelector( '.pbs-main-wrapper' ).addEventListener( 'mouseup', function() {
		ContentTools.EditorApp.get()._toolboxElements.hide();
	} );
	document.querySelector( '.pbs-main-wrapper' ).addEventListener( 'keydown', function() {
		ContentTools.EditorApp.get()._toolboxElements.hide();
	} );
} );

/* globals ContentTools, ContentEdit, __extends, PBSEditor */


( function() {
	var proxied = ContentTools.ToolUI.prototype._onMouseLeave;
	ContentTools.ToolUI.prototype._onMouseLeave = function( ev ) {
		if ( this._mouseDown && this._domElement.classList.contains( 'pbs-tool-large' ) ) {
			var element = new ContentEdit.NewElementDragHelper( this.tool );
			var scrollY = window.scrollY || window.pageYOffset;
			ContentTools.EditorApp.get().regions()['main-content'].attach( element );
			element.drag( ev.screenX, ev.screenY + scrollY );
			ev.stopPropagation();
			ev.preventDefault();
		}
		return proxied.call( this, ev );
	};
} )();


ContentEdit.NewElementDragHelper = ( function( _super ) {
	__extends( NewElementDragHelper, _super );

	function NewElementDragHelper( tool, attributes ) {
		NewElementDragHelper.__super__.constructor.call( this, 'div', attributes );
		this._content = '';
		this.tool = tool;
	}

    NewElementDragHelper.droppers = PBSEditor.allDroppers;

	NewElementDragHelper.prototype.typeName = function() {
		return this.tool.label;
	};

	NewElementDragHelper.prototype.drop = function(element, placement) {

		// If dragged into nothing, cancel the drag.
		if ( ! element ) {
			ContentEdit.Root.get().cancelDragging();
			this.parent().detach( this );
			return;
		}

		var index = element.parent().children.indexOf( element );
		index += placement[0] === 'above' ? 0 : 1;

		this.tool.createNew( element.parent(), index );

		// Remove the drag helper element.
		this.parent().detach( this );
	};

	return NewElementDragHelper;

})(ContentEdit.Static);

ContentEdit.TagNames.get().register( ContentEdit.NewElementDragHelper, 'NewElementDragHelper' );

/* globals ContentTools, __extends, __bind, PBSInspectorOptions, pbsParams */

ContentTools.ToolboxPropertiesUI = (function(_super) {
	__extends(ToolboxPropertiesUI, _super);

	function ToolboxPropertiesUI(tools) {
		this._onClose = __bind( this._onClose, this );
		ToolboxPropertiesUI.__super__.constructor.call( this, tools );
	}

    ToolboxPropertiesUI.prototype.isDragging = function() {
		return ToolboxPropertiesUI.__super__.isDragging.call( this );
    };

	ToolboxPropertiesUI.prototype.show = function() {
		if ( ! this.isMounted() ) {
			this.mount();
		}
		return this.addCSSClass( 'ct-widget--active' );
	};

    ToolboxPropertiesUI.prototype.hide = function() {
		this.removeCSSClass( 'ct-widget--active' );
    };

    ToolboxPropertiesUI.prototype.tools = function( tools ) {
		return ToolboxPropertiesUI.__super__.tools.call( this, tools );
    };

    ToolboxPropertiesUI.prototype.mount = function() {
      var coord, domToolGroup, i, position, restore, tool, toolGroup, toolName, _i, _j, _len, _len1, _ref;
      this._domElement = this.constructor.createDiv(['pbs-toolbox-properties', 'ct-widget', 'ct-toolbox']);
      this.parent().domElement().appendChild(this._domElement);
      this._domGrip = this.constructor.createDiv( [ 'pbs-toolbox-titlebar' ] );
      this._domElement.appendChild( this._domGrip );
      this._domTabs = this.constructor.createDiv( [ 'pbs-toolbox-tabs' ] );
      this._domElement.appendChild( this._domTabs );
      this._domSections = this.constructor.createDiv( [ 'pbs-toolbox-sections' ] );
      this._domElement.appendChild( this._domSections );
      this._domResize = this.constructor.createDiv( [ 'pbs-toolbox-resizer' ] );
      this._domElement.appendChild( this._domResize );
	  var title = this.constructor.createDiv( [ 'pbs-toolbox-title' ] );
	  title.innerHTML = pbsParams.labels.properties_inspector;
      this._domGrip.appendChild( title );
	  this._closeButton = this.constructor.createDiv( [ 'pbs-titlebox-close' ] );
      this._domGrip.appendChild( this._closeButton );
      _ref = this._tools;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        toolGroup = _ref[i];
        domToolGroup = this.constructor.createDiv(['ct-tool-group']);
        this._domElement.appendChild(domToolGroup);
        for (_j = 0, _len1 = toolGroup.length; _j < _len1; _j++) {
          toolName = toolGroup[_j];
          tool = ContentTools.ToolShelf.fetch(toolName);
          this._toolUIs[toolName] = new ContentTools.ToolUI(tool);
          this._toolUIs[toolName].mount(domToolGroup);
        //   this._toolUIs[toolName].disabled(true);
          this._toolUIs[toolName].bind('apply', (function(_this) {
            return function() {
              return _this.updateTools();
            };
          })(this));
        }
      }
	  if ( window.localStorage.getItem( 'pbs-toolbox-elements-position' ) === null ) {
		  window.localStorage.setItem( 'pbs-toolbox-elements-position', ( window.innerWidth - 250 - 30 ) + ',87,' + ( window.innerHeight - 77 - 20 ) );
	  }
      restore = window.localStorage.getItem('pbs-toolbox-elements-position');
      if (restore && /^\d+,\d+,\d+$/.test(restore)) {
        position = (function() {
          var _k, _len2, _ref1, _results;
          _ref1 = restore.split(',');
          _results = [];
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            coord = _ref1[_k];
            _results.push(parseInt(coord, 10));
          }
          return _results;
        })();
        this._domElement.style.left = position[0] + 'px';
        this._domElement.style.top = position[1] + 'px';
		this._domElement.style.height = position[2] + 'px';
      }
      return this._addDOMEventListeners();
    };

    ToolboxPropertiesUI.prototype.updateTools = function() {
		return ToolboxPropertiesUI.__super__.updateTools.call( this );
    };

    ToolboxPropertiesUI.prototype.unmount = function() {
		return ToolboxPropertiesUI.__super__.unmount.call( this );
    };

    ToolboxPropertiesUI.prototype._addDOMEventListeners = function() {
		this._closeButton.addEventListener( 'mousedown', this._onClose );
		this._onResizeBound = this._onResize.bind( this );
		this._onResizeMoveBound = this._onResizeMove.bind( this );
		this._onResizeStopBound = this._onResizeStop.bind( this );
		this._domResize.addEventListener( 'mousedown', this._onResizeBound );
		ToolboxPropertiesUI.__super__._addDOMEventListeners.call( this );
    };

	ToolboxPropertiesUI.prototype._onResize = function( ev ) {
		ev.preventDefault();
		ev.stopPropagation();
		document.body.addEventListener( 'mousemove', this._onResizeMoveBound );
		document.body.addEventListener( 'mouseup', this._onResizeStopBound );
		this._resizeStart = ev.screenY;
		this._resizeOrigHeight = this._domElement.getBoundingClientRect().height;
	};

	ToolboxPropertiesUI.prototype._onResizeMove = function( ev ) {
		ev.preventDefault();
		ev.stopPropagation();
		this._domElement.style.transition = 'none';
		this._domElement.style.height = ( this._resizeOrigHeight + ( ev.screenY - this._resizeStart ) ) + 'px';
	};

	ToolboxPropertiesUI.prototype._onResizeStop = function( ev ) {
		ev.preventDefault();
		ev.stopPropagation();
		document.body.removeEventListener( 'mousemove', this._onResizeMoveBound );
		document.body.removeEventListener( 'mouseup', this._onResizeStopBound );
		this._domElement.style.transition = '';

		var rect = this._domElement.getBoundingClientRect();

		window.localStorage.setItem( 'pbs-toolbox-elements-position', parseInt( rect.left, 10 ) + ',' + parseInt( rect.top, 10 ) + ',' + parseInt( rect.height, 10 ) );

		this._contain();
	};

    ToolboxPropertiesUI.prototype._contain = function() {
		var rect;
		if ( ! this.isMounted() ) {
			return;
		}

		var top = 0;
		if ( document.querySelector('#wpadminbar') ) {
			top += parseInt( document.querySelector('#wpadminbar').clientHeight, 10 );
		}
		if ( document.querySelector('.pbs-toolbox-bar') ) {
			top += parseInt( document.querySelector('.pbs-toolbox-bar').clientHeight, 10 );
		}

		rect = this._domElement.getBoundingClientRect();

		if ( rect.left + rect.width > window.innerWidth ) {
			if ( window.innerWidth - rect.width < 0 ) {
				this._domElement.style.left = '0px';
			} else {
				this._domElement.style.left = ( window.innerWidth - rect.width ) + 'px';
			}
		}
		if ( rect.top + rect.height > window.innerHeight ) {
			if ( window.innerHeight - rect.height < 77 ) {
				this._domElement.style.top = '77px';
			} else {
				this._domElement.style.top = ( window.innerHeight - rect.height ) + 'px';
			}
		}
		if (rect.left < 0) {
			this._domElement.style.left = '0px';
		}
		if (rect.top < 77) {
			this._domElement.style.top = '77px';
		}
    };

    ToolboxPropertiesUI.prototype._removeDOMEventListeners = function() {
		if ( this.isMounted() ) {
			this._closeButton.removeEventListener( 'mousedown', this._onClose );
		}
		ToolboxPropertiesUI.__super__._removeDOMEventListeners.call( this );
    };

    ToolboxPropertiesUI.prototype._onClose = function() {
		if ( this.isMounted() ) {
			return this.hide();
		}
    };

    ToolboxPropertiesUI.prototype._onDrag = function(ev) {
		return ToolboxPropertiesUI.__super__._onDrag.call( this, ev );
    };

    ToolboxPropertiesUI.prototype._onStartDragging = function(ev) {
		return ToolboxPropertiesUI.__super__._onStartDragging.call( this, ev );
    };

    ToolboxPropertiesUI.prototype._onStopDragging = function( ev ) {

		var rect = this._domElement.getBoundingClientRect();

		window.localStorage.setItem( 'pbs-toolbox-elements-position', parseInt( rect.left, 10 ) + ',' + parseInt( rect.top, 10 ) + ',' + parseInt( rect.height, 10 ) );

		return ToolboxPropertiesUI.__super__._onStopDragging.call( this, ev );
    };

	// Open the toolbox and inspect an element.
	ToolboxPropertiesUI.prototype.inspect = function( element ) {
		this._inspectElement( element );
		this.show();
		this._contain();
		setTimeout( function() {
			if ( this._domElement.classList.contains( 'ct-widget--active' ) ) {
				this._contain();
			}
		}.bind( this ), 1000 );
	};

	// Adds a tab. Used internally by addSection().
	ToolboxPropertiesUI.prototype._addTab = function( label, element ) {
		var tab = document.createElement( 'DIV' );
		tab.classList.add( 'pbs-toolbox-tab' );
		tab.innerHTML = label;
		tab.setAttribute( 'data-name', element.constructor.name );
		this._domTabs.appendChild( tab );
		tab._targetElement = element;

		// If this is the only tab, make it visible.
		if ( this._domTabs.children.length === 1 ) {
			tab.classList.add( 'pbs-toolbox-tab-shown' );
		}

		// Add event handlers.
		tab.addEventListener( 'click', function() {
			var visibleTab = this.parentNode.querySelector( '.pbs-toolbox-tab-shown' );
			if ( visibleTab ) {
				visibleTab.classList.remove( 'pbs-toolbox-tab-shown' );
			}
			this.classList.add( 'pbs-toolbox-tab-shown' );

			var visibleSection = this.parentNode.parentNode.querySelector( '.pbs-toolbox-section-shown' );
			if ( visibleSection ) {
				visibleSection.classList.remove( 'pbs-toolbox-section-shown' );
			}
			this.parentNode.parentNode.querySelector( '.pbs-toolbox-section[data-name="' + this.getAttribute( 'data-name' ) + '"]' ).classList.add( 'pbs-toolbox-section-shown' );

		}.bind( tab ) );
	};

	// Removes a tab. Used internally by removeSection().
	ToolboxPropertiesUI.prototype._removeTab = function( name ) {
		var removeMe = this._domTabs.querySelector( '[data-name="' + name + '"]' );
		if ( removeMe ) {
			this._domTabs.removeChild( removeMe );
		}
	};

	// Adds a section of options for the given element.
	ToolboxPropertiesUI.prototype.addSection = function( label, element, optionIndex ) {

		// Add the tab.
		this._addTab( label, element );

		// Add the section.
		var section = document.createElement( 'DIV' );
		section.classList.add( 'pbs-toolbox-section' );
		section.setAttribute( 'data-name', element.constructor.name );
		this._domSections.appendChild( section );

		if ( this._domSections.children.length === 1 ) {
			section.classList.add( 'pbs-toolbox-section-shown' );
		}

		//
		if ( element.constructor.name === 'Shortcode' ) {

			// If there is an existing shortcode mapping, use that.
			if ( typeof PBSInspectorOptions.Shortcode[ element.sc_base ] === 'undefined' ) {
				if ( typeof pbsParams.shortcode_mappings !== 'undefined' && typeof pbsParams.shortcode_mappings[ element.sc_base ] !== 'undefined' ) {
					if ( this.createShortcodeMappingOptions ) {
						this.createShortcodeMappingOptions( element.sc_base );
					}
				}
			}
		}

		// Add options for the element.

		var elemType = element.constructor.name, numWithGroups, numNoGroup, k, note;

		if ( elemType === 'Shortcode' ) {

			var shortcodeBase = element.sc_base;
			var shortcodeProperties = PBSInspectorOptions.Shortcode[ shortcodeBase ];

			if ( typeof shortcodeProperties !== 'undefined' && typeof shortcodeProperties.hidden !== 'undefined' ) {
				if ( shortcodeProperties.hidden ) {
					return;
				}
			}

			var heading;
			if ( typeof shortcodeProperties !== 'undefined' && typeof shortcodeProperties.options !== 'undefined' ) {

				// If there's a group, add a general group for those without a group.
				numWithGroups = 0;
				numNoGroup = 0;
				for ( k = 0; k < shortcodeProperties.options.length; k++ ) {
					if ( shortcodeProperties.options[ k ].group ) {
						numWithGroups++;
					} else {
						numNoGroup++;
					}
				}
				if ( numWithGroups && numNoGroup ) {
					for ( k = 0; k < shortcodeProperties.options.length; k++ ) {
						if ( ! shortcodeProperties.options[ k ].group ) {
							shortcodeProperties.options[ k ].group = pbsParams.labels.general;
						}
					}
				}

				for ( k = 0; k < shortcodeProperties.options.length; k++ ) {
					this.addSectionOptions( section, shortcodeProperties.options[ k ], element );
				}

				// Add a note if the shortcode doesn't have attributes.
				if ( ! shortcodeProperties.options.length ) {
					note = document.createElement( 'DIV' );
					note.innerHTML = pbsParams.labels.no_attributes_available;
					note.classList.add( 'pbs-shortcode-no-options' );
					section.appendChild( note );
				}

			} else {

				heading = document.createElement( 'DIV' );
				heading.innerHTML = pbsParams.labels.note_options_are_detected;
				section.appendChild( heading );
				// heading.innerHTML += '<span>' + pbsParams.labels.note_options_are_detected + '</span>';

				this.addGenericShortcodeOptions( section, element );
			}

			// Add note.
			var shortcodeNote = document.createElement( 'DIV' );
			shortcodeNote.classList.add( 'pbs-inspector-shortcode-note' );
			shortcodeNote.innerHTML = pbsParams.labels.note_shortcode_not_appearing;
			section.appendChild( shortcodeNote );

		} else if ( typeof PBSInspectorOptions[ optionIndex ] !== 'undefined' ) {

			var currElemModel;
			if ( ! element.model ) {
				currElemModel = new Backbone.Model({
					element: element
				});
			} else {
				currElemModel = element.model;
				currElemModel.set( 'element', element );
			}

			// If there's a group, add a general group for those without a group.
			numWithGroups = 0;
			numNoGroup = 0;
			for ( k = 0; k < PBSInspectorOptions[ optionIndex ].options.length; k++ ) {
				if ( PBSInspectorOptions[ optionIndex ].options[ k ].group ) {
					numWithGroups++;
				} else {
					numNoGroup++;
				}
			}
			if ( numWithGroups && numNoGroup ) {
				for ( k = 0; k < PBSInspectorOptions[ optionIndex ].options.length; k++ ) {
					if ( ! PBSInspectorOptions[ optionIndex ].options[ k ].group ) {
						PBSInspectorOptions[ optionIndex ].options[ k ].group = pbsParams.labels.general;
					}
				}
			}

			for ( k = 0; k < PBSInspectorOptions[ optionIndex ].options.length; k++ ) {
				this.addSectionOptions( section, PBSInspectorOptions[ optionIndex ].options[ k ], element, currElemModel );
			}

			// Add hover events if there are any.
			if ( PBSInspectorOptions[ optionIndex ].onMouseEnter ) {
				section.addEventListener( 'mouseenter', function( e ) {
					PBSInspectorOptions[ optionIndex ].onMouseEnter( this, e );
				}.bind( element ) );
			}
			if ( PBSInspectorOptions[ optionIndex ].onMouseLeave ) {
				section.addEventListener( 'mouseleave', function( e ) {
					PBSInspectorOptions[ optionIndex ].onMouseLeave( this, e );
				}.bind( element ) );
			}

			// Footer notice for the inspector.
			if ( typeof PBSInspectorOptions[ optionIndex ].footer !== 'undefined' ) {
				if ( Math.random() > 0.5 ) { // Do this only half of the time.
					note = document.createElement( 'DIV' );
					note.innerHTML = PBSInspectorOptions[ optionIndex ].footer;
					note.classList.add( 'pbs-group-footer' );
					section.appendChild( note );
				}
			}
		}
	};

	// Remove a section.
	ToolboxPropertiesUI.prototype.removeSection = function( name ) {
		// Remove the tab.
		this._removeTab( name );

		// Remove the section.
		var removeMe = this._domSections.querySelector( '[data-name="' + name + '"]' );
		if ( removeMe ) {
			this._domSections.removeChild( removeMe );
		}
	};

	ToolboxPropertiesUI.prototype.removeAllSections = function() {

		this.clearSections();

		// Remove all tabs.
		while ( this._domTabs.firstChild ) {
			this._domTabs.removeChild( this._domTabs.firstChild );
		}

		// Remove all sections.
		while ( this._domSections.firstChild ) {
			this._domSections.removeChild( this._domSections.firstChild );
		}
	};

	ToolboxPropertiesUI.prototype._inspectElement = function( element ) {

		this.removeAllSections();

		// Add the options for the DOM element if there is one.
		while ( element.nodeType && ! element._ceElement && element.tagName !== 'BODY' ) {

			this.addOptions( element );

			element = element.parentNode;
		}

		if ( element._ceElement ) {
			element = element._ceElement;
		}

		var inspectedElementNames = [];

		// Add the options for the CT elements.
		while ( element && element.type ) {
			if ( inspectedElementNames.indexOf( element.constructor.name ) === -1 ) {
				this.addOptions( element );

				// Don't add options of those already added.
				inspectedElementNames.push( element.constructor.name );

				// If we already added row options, don't show another column.
				if ( element.constructor.name === 'DivRow' ) {
					inspectedElementNames.push( 'DivCol' );
				}
			}
			element = element.parent();
		}
	};

	ToolboxPropertiesUI.prototype.addOptions = function( element ) {
		var optionIndex = element.constructor.name;
		var label = optionIndex;

		if ( ! window.PBSInspectorOptions[ element.constructor.name ] && element.nodeType ) {
			// Check if the element matches any of the selectors.
			var matched = false;

			for ( var index in window.PBSInspectorOptions ) {
				if ( window.PBSInspectorOptions.hasOwnProperty( index ) ) {
					if ( window.pbsSelectorMatches( element, index ) ) {
						optionIndex = index;
						matched = true;
						break;
					}
				}
			}
			if ( ! matched ) {
				return;
			}
		}

		if ( ! window.PBSInspectorOptions[ optionIndex ] ) {
			return;
		}

		label = window.PBSInspectorOptions[ optionIndex ].label;

		// Shortcodes are just labeled 'Shortcode'.
		if ( element.constructor.name === 'Shortcode' ) {
			label = element.constructor.name;

			if ( element.sc_base === 'pbs_widget' ) {
				label = 'Widget';
			} else if ( element.sc_base === 'pbs_sidebar' ) {
				label = 'Sidebar';
			}
		}

		this.addSection( label, element, optionIndex );
	};

	ToolboxPropertiesUI.prototype.addOption = function() { // element, section, option ) {
		// We override it to nothing.
	};

    return ToolboxPropertiesUI;

  })(ContentTools.ToolboxUI);


( function() {
	var _EditorApp = ContentTools.EditorApp.getCls();
	var proxied = _EditorApp.prototype.init;
	_EditorApp.prototype.init = function( queryOrDOMElements, namingProp ) {
		proxied.call( this, queryOrDOMElements, namingProp );

		this._toolboxProperties = new ContentTools.ToolboxPropertiesUI([]);
		this.attach(this._toolboxProperties);
	};

	var unmountProxy = _EditorApp.prototype.unmount;
	_EditorApp.prototype.unmount = function() {
		unmountProxy.call( this );
		if ( ! this.isMounted() ) {
			return;
		}
		this._toolboxProperties = null;
	};

	var startProxy = _EditorApp.prototype.start;
	_EditorApp.prototype.start = function() {
		startProxy.call( this );
		// this._toolbox.hide();
		if ( ! this._toolboxProperties.isMounted() ) {
			this._toolboxProperties.mount();
		}
	};

	var stopProxy = _EditorApp.prototype.stop;
	_EditorApp.prototype.stop = function() {
		stopProxy.call( this );
		this._toolboxProperties.hide();
	};

} )();

/* globals ContentEdit, ContentTools, PBSOption, pbsParams */


/***********************************************************************************************
 * Override the Toolbox to allow it to be docked on the left or right side of the screen.
 ***********************************************************************************************/

window.addEventListener( 'DOMContentLoaded', function() {
	if ( ! document.querySelector( '[data-name="main-content"]' ) ) {
		return;
	}

	var editor = ContentTools.EditorApp.get();

	// Remove added docking classes
	// editor.bind('stop', function() {
	// 	document.querySelector('html').classList.remove('pbs-inspector-docked-right');
	// 	document.querySelector('html').classList.remove('pbs-inspector-docked-left');
	// });

	// When first time opening the dock in the browser, make sure it's docked on the left.
	// if ( window.localStorage.getItem( 'ct-toolbox-position' ) === null ) {
	// 	window.localStorage.setItem( 'ct-toolbox-position', '10,87' );
	// }

	/*
	// Allow left & right screen docking
	var toolbox = ContentTools.EditorApp.get()._toolboxProperties;
	toolbox.__contain = toolbox._contain;
	toolbox._contain = function() {

		// Get the admin bar height.
		var adminBarTop = 32;
		var formatBar = 45;
		if ( document.querySelector('#wpadminbar') ) {
			adminBarTop = parseInt( document.querySelector('#wpadminbar').clientHeight, 10 );
		}
		if ( document.querySelector('.pbs-toolbox-bar') ) {
			formatBar = parseInt( document.querySelector('.pbs-toolbox-bar').clientHeight, 10 );
		}

		this._domElement.style.top = ( adminBarTop + formatBar ) + 'px';

		if ( isNaN( parseInt( this._domElement.style.left, 10 ) ) ) {
			this._domElement.style.left = '10px';
		}

		var ret = toolbox.__contain();
		if ( window.innerWidth - this._domElement.offsetWidth <= parseInt( this._domElement.style.left, 10 ) + 5 ) {
			this._domElement.style.left = ( window.innerWidth - this._domElement.offsetWidth ) + 'px';
			document.querySelector('html').classList.add('pbs-inspector-docked-right');
			document.querySelector('html').classList.remove('pbs-inspector-docked-left');
		} else if ( 5 >= parseInt( this._domElement.style.left, 10 ) ) {
			this._domElement.style.left = '0px';
			document.querySelector('html').classList.add('pbs-inspector-docked-left');
			document.querySelector('html').classList.remove('pbs-inspector-docked-right');
		} else {
			document.querySelector('html').classList.remove('pbs-inspector-docked-right');
			document.querySelector('html').classList.remove('pbs-inspector-docked-left');
		}

		return ret;
	};
	*/

	/*******************************************************************************************
	 * When scrolling inside the inspector, prevent the page from scrolling.
	 *******************************************************************************************/
	var stopBodyScroll = function(ev) {
		var $ = jQuery;
	    var $this = $(this),
	        scrollTop = this.scrollTop,
	        scrollHeight = this.scrollHeight,
	        height = $this.height(),
	        delta = (ev.type === 'DOMMouseScroll' ?
	            ev.originalEvent.detail * -40 :
	            ev.originalEvent.wheelDelta),
	        up = delta > 0;

	    var prevent = function() {
	        ev.stopPropagation();
	        ev.preventDefault();
	        ev.returnValue = false;
	        return false;
	    };

	    if (!up && -delta > scrollHeight - height - scrollTop) {
	        // Scrolling down, but this will take us past the bottom.
	        $this.scrollTop(scrollHeight);
	        return prevent();
	    } else if (up && delta > scrollTop) {
	        // Scrolling up, but this will take us past the top.
	        $this.scrollTop(0);
	        return prevent();
	    }
	};
	editor.bind('start', function() {
		// Won't work if this isn't jQuery...
		jQuery( 'body' ).on( 'DOMMouseScroll mousewheel', '.pbs-toolbox-elements, .pbs-toolbox-sections', stopBodyScroll );
	});
	editor.bind('stop', function() {
		jQuery( 'body' ).off( 'DOMMouseScroll mousewheel', '.pbs-toolbox-elements, .pbs-toolbox-sections', stopBodyScroll );
	});
});




/***********************************************************************************************
 * Override the Toolbox to allow it to be docked on the left or right side of the screen.
 ***********************************************************************************************/

/*
window.updateInspector = function( clickedElement ) {
	clearTimeout( window._updateInspectorTimeout );
	window._updateInspectorTimeout = setTimeout( function() {
		var domElement = document.getSelection().anchorNode;
		var editor = ContentTools.EditorApp.get();

		if ( clickedElement ) {
			domElement = clickedElement;
		}

		window._inspectorOrigScrollTop = document.querySelector('.ct-toolbox').scrollTop;
		editor._toolboxProperties.addSection( domElement );
		document.querySelector('.ct-toolbox').scrollTop = window._inspectorOrigScrollTop;
	}, 10 );
};
*/

/*
window.addEventListener( 'DOMContentLoaded', function() {

	document.addEventListener( 'mouseup', function(ev) {
		if ( ! window.PBSEditor.isEditing() ) {
			return;
		}

		// Only entertain clicks on the editor area.
		if ( window.pbsSelectorMatches( ev.target, '[data-name="main-content"] *' ) ) {
			window.updateInspector( ev.target );
		}
	});
	document.addEventListener( 'keyup', function(ev) {
		if ( ! window.PBSEditor.isEditing() ) {
			return;
		}
		// Only entertain keyups on the editor area.
		if ( ! window.pbsSelectorMatches( ev.target, '[data-name="main-content"] *' ) ) {
			return;
		}
		if ( [ 40, 37, 39, 38, 9, 8, 46, 13 ].indexOf( ev.keyCode ) !== -1 ) {
			window.updateInspector();
		}
	});

	// When something's focused, trigger the inspector to update
	ContentEdit.Root.get().bind('focus', function ( element ) {
		// var editor = ContentTools.EditorApp.get();

		if ( ! element.isFocused() ) {
			if ( element.focus ) {
				element.focus();
			}
		}

		var root = ContentEdit.Root.get();
		if ( ! root.focused() ) {
			return;
		}
		var domElement = null;
		if ( root.focused()._domElement )  {
			domElement = root.focused()._domElement;
		}
		window.updateInspector( domElement );
	});

	// When something's focused, trigger the inspector to update
	ContentEdit.Root.get().bind('drop', function ( element ) {
		// var editor = ContentTools.EditorApp.get();

		if ( ! element.isFocused() ) {
			if ( element.focus ) {
				element.focus();
			}
		}

		// setTimeout( function() {
		var root = ContentEdit.Root.get();
		if ( ! root.focused() ) {
			return;
		}
		var domElement = null;
		if ( root.focused()._domElement )  {
			domElement = root.focused()._domElement;
		}
		window.updateInspector( domElement );

	});

	// When something's blurred, update the inspector
	ContentEdit.Root.get().bind('blur', function() {
		setTimeout( function() {
			var editor = ContentTools.EditorApp.get(), root = ContentEdit.Root.get();
			if ( ! root.focused() ) {
				editor._toolboxProperties.clearOldGroups();
				return;
			}
			var domElement = null;
			if ( root.focused()._domElement )  {
				domElement = root.focused()._domElement;
			}

			if ( domElement ) {
				window.updateInspector( domElement );
			} else {
				editor._toolboxProperties.clearOldGroups();
			}
		}, 10 );
	});
});
*/

window.addEventListener( 'DOMContentLoaded', function() {

	// When the cursor has moved, hide the properties panel.
	document.addEventListener( 'mousedown', function(ev) {
		if ( ! window.PBSEditor.isEditing() ) {
			return;
		}

		// Only entertain clicks on the editor area.
		if ( window.pbsSelectorMatches( ev.target, '[data-name="main-content"] *, .pbs-quick-action-overlay, .pbs-quick-action-overlay *' ) ) {
			ContentTools.EditorApp.get()._toolboxProperties.hide();
		}
	} );

	// When the cursor has moved, hide the properties panel.
	document.addEventListener( 'keyup', function(ev) {
		if ( ! window.PBSEditor.isEditing() ) {
			return;
		}
		// Only entertain keyups on the editor area.
		if ( ! window.pbsSelectorMatches( ev.target, '[data-name="main-content"] *' ) ) {
			return;
		}
		if ( [ 40, 37, 39, 38, 9, 8, 46, 13 ].indexOf( ev.keyCode ) !== -1 ) {
			ContentTools.EditorApp.get()._toolboxProperties.hide();
		}
	});

	// When something's focused hide the properties panel.
	ContentEdit.Root.get().bind( 'focus', function () {
		ContentTools.EditorApp.get()._toolboxProperties.hide();
	} );

	// When something's blurred hide the properties panel.
	ContentEdit.Root.get().bind( 'blur', function () {
		// ContentTools.EditorApp.get()._toolboxProperties.hide();
	} );

	// When something's dragged, hide the properties panel.
	ContentEdit.Root.get().bind( 'drag', function () {
		ContentTools.EditorApp.get()._toolboxProperties.hide();
	} );

	// When something's dropped, hide the properties panel.
	ContentEdit.Root.get().bind( 'drop', function () {
		ContentTools.EditorApp.get()._toolboxProperties.hide();
	} );
} );

/*
ContentTools.ToolboxUI.prototype._pbsAddDesignMount = ContentTools.ToolboxUI.prototype.mount;
ContentTools.ToolboxUI.prototype.mount = function() {
	var ret = this._pbsAddDesignMount();

	for ( var i = 0; i < window.PBSEditor.toolHeadings.length; i++ ) {
		var toolHeader = window.PBSEditor.toolHeadings[ i ];
		var label = toolHeader.label;
		var cls = 'pbs-' + toolHeader['class'];

		if ( ! document.querySelectorAll('.ct-toolbox .ct-tool-group')[ i ] ) {
			continue;
		}

		var group = document.querySelectorAll('.ct-toolbox .ct-tool-group')[ i ];
		group.classList.add( cls + '-group' );

		var heading = document.createElement('div');
		heading.innerHTML = label;
		heading.classList.add( 'pbs-group-title' );
		heading.classList.add( 'pbs-collapsable-title' );
		heading.classList.add( cls + '-title' );
		group.insertBefore( heading, group.firstChild );
		wp.hooks.doAction( 'inspector.group_title.create', group );

		if ( toolHeader.tip ) {
			heading.appendChild( window.PBSEditor.createGroupTip( toolHeader.tip ) );
		}
	}

	return ret;
};
*/

window.PBSEditor.createGroupTip = function( text ) {
	var tip = document.createElement( 'span' );
	tip.classList.add( 'pbs-group-tip' );
	tip.innerHTML = '?';
	var tipText = document.createElement( 'span' );
	tipText.classList.add( 'pbs-group-tip-details' );
	tipText.innerHTML = text;
	tip.appendChild( tipText );
	return tip;
};




var _pbsCreatedViews = [];
ContentTools.ToolboxPropertiesUI.prototype.addSectionOptions = function( divGroup, option, element, model ) {
	if ( typeof model === 'undefined' ) {
		model = element.model;
	}

	// If an option type doesn't match any of the supported types, default back to 'Text'.
	var matchesAnOptionType = null;
	if ( typeof option.type !== 'undefined' ) {
		matchesAnOptionType = Object.keys( PBSOption ).some( function( name ) {
			return name.toLowerCase() === option.type.toLowerCase().replace( /_/g, '' );
		} );
	}
	if ( ! matchesAnOptionType ) {
		option.type = 'Text';
	}

	var type = option.type.toLowerCase().replace( /_/g, '' );
	for ( optionName in PBSOption ) {
		if ( PBSOption.hasOwnProperty( optionName ) && type === optionName.toLowerCase() ) {

			var id = optionName.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
			if ( element.constructor.name ) {
				id = element.constructor.name.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase() + '-' + option.id;
			}
			var optionWrapper = document.createElement('DIV');
			optionWrapper.classList.add( 'ct-tool' );
			if ( type !== 'button' ) {
				optionWrapper.classList.add( 'pbs-tool-option' );
			}
			if ( option['class'] ) {
				optionWrapper.setAttribute( 'class', optionWrapper.getAttribute('class') + ' ' + option['class'] );
			}
			if ( optionName ) {
				optionWrapper.classList.add( 'pbs-' + optionName.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase() );
			}
			if ( option.id ) {
				optionWrapper.setAttribute( 'id', id );
			}
			// divGroup.insertBefore( optionWrapper, divGroup.firstChild );

			// Add in group if there is a group specified.
			if ( option.group ) {
				var subGroupName = option.group.toLowerCase().trim().replace( /\"/g, '' );
				var subGroup = divGroup.querySelector( '[data-subgroup="' + subGroupName + '"]' );

				divGroup.classList.add( 'pbs-has-group' );
				if ( ! subGroup ) {
					subGroup = document.createElement( 'DIV' );
					subGroup.setAttribute( 'data-subgroup', subGroupName );
					divGroup.appendChild( subGroup );

					// Create the group title (subtitle)
					if ( option.group !== 'default' ) {
						subGroup.innerHTML = '<div class="pbs-option-subtitle pbs-tool-option">' + option.group + '</div>';

						// For shortcodes, groupings are accordions. Make it collapsable.
						// if ( element.constructor.name === 'Shortcode' ) {
							subGroup.firstChild.classList.add( 'pbs-collapsable-title' );

							// Grouping is applied to shortcodes to make them into an accordion,
							// Opening one, closes all the other settings.
							subGroup.setAttribute( 'data-collapse-group', element.constructor.name.toLowerCase() );
							if ( divGroup.querySelectorAll( '[data-subgroup]' ).length > 1 ) {
								window.pbsCollapseSection( subGroup );
							}
						// }
					}
				}
				subGroup.appendChild( optionWrapper );

				if ( option['group-tip'] ) {
					if ( subGroup.querySelector( '.pbs-group-tip-details' ) ) {
						subGroup.querySelector( '.pbs-group-tip-details' ).innerHTML = option['group-tip'];
					} else {
						subGroup.querySelector( '.pbs-option-subtitle' ).appendChild( window.PBSEditor.createGroupTip( option['group-tip'] ) );
					}
				}

			} else {

				var firstSubGroup = divGroup.querySelector( '[data-subgroup]');
				if ( firstSubGroup ) {
					divGroup.insertBefore( optionWrapper, firstSubGroup );
				} else {
					divGroup.appendChild( optionWrapper );
				}

			}

			if ( ! wp.hooks.applyFilters( 'pbs.inspector.do_add_section_options', true, optionName, model, divGroup, element, this ) ) {
				return;
			}

			// this._domInspector.insertBefore( optionWrapper, this._domInspector.firstChild );
			var o = new PBSOption[ optionName ]({
				optionSettings: option,
				model: model,
				el: optionWrapper
			});
			_pbsCreatedViews.push( o.render() );

			divGroup.view = o;

			// Dependency.
			this.applyOptionDependencies( o );

			return;
		}
	}

};


ContentTools.ToolboxPropertiesUI.prototype.applyOptionDependencies = function( view ) {
	if ( ! view.optionSettings.depends ) {
		return;
	}

	// We need an array for the input.
	var depends = view.optionSettings.depends;
	if ( typeof depends.length !== 'number' ) {
		depends = [ depends ];
	}

	// Listen to changes on attributes we are dependent on.
	view.listenTo( view.model, 'change', function() {
		var allConditions = [];
		for ( var i = 0; i < depends.length; i++ ) {
			if ( ! depends[ i ].id || ! depends[ i ].value ) {
				continue;
			}

			var id = depends[ i ].id;
			var value = depends[ i ].value;
			var currentValue = this.model.get( id );
			var makeVisible = false;

			// Put all normal strings into an array to combine the checking process later on for strings..
			// Turn all value: 'string' into value: [ 'string' ]
			if ( typeof value === 'string' ) {
				if ( value.toLowerCase().trim() !== '__not_empty' && value.toLowerCase().trim() !== '__empty' && ! value.match( /^(>=?|<=?|==|!=)(.*)/ ) ) {
					value = [ value ];
				}
			}

			/**
			 * Checkers.
			 */

			// value: false
			if ( value === false || ( typeof value === 'string' && value.toLowerCase().trim() === 'false' ) ) {
				if ( typeof currentValue === 'undefined' ) {
					makeVisible = true;
				} else if ( typeof currentValue === 'string' && currentValue.toLowerCase().trim() === 'false' ) {
					makeVisible = true;
				} else if ( typeof currentValue === 'string' && currentValue.toLowerCase().trim() === '' ) {
					makeVisible = true;
				} else if ( typeof currentValue === 'boolean' && ! currentValue ) {
					makeVisible = true;
				} else if ( ! currentValue ) {
					makeVisible = true;
				}

			// value: true
			} else if ( value === true || ( typeof value === 'string' && value.toLowerCase().trim() === 'true' ) ) {
				if ( typeof currentValue === 'string' && currentValue.toLowerCase().trim() === 'true' ) {
					makeVisible = true;
				} else if ( typeof currentValue === 'boolean' && currentValue ) {
					makeVisible = true;
				} else if ( currentValue ) {
					makeVisible = true;
				}

			// value: [ string, ... ]
			} else if ( typeof value === 'object' && typeof value.length === 'number' ) {
				var k;
				var brokenByUnmatch = false;
				var onceMatched = false;
				var allNegatives = true;
				for ( k = 0; k < value.length; k++ ) {
					if ( ! value[ k ].match( /^!(.*)/ ) ) {
						allNegatives = false;
						break;
					}
				}
				for ( k = 0; k < value.length; k++ ) {
					if ( value[ k ].match( /^!(.*)/ ) ) {
						var text = value[ k ].match( /^!(.*)/ );
						text = text[1];
						if ( text === currentValue ) {
							brokenByUnmatch = true;
							break;
						}
					} else {
						if ( value[ k ] === currentValue ) {
							onceMatched = true;
							break;
						}
					}
				}

				if ( allNegatives && ! brokenByUnmatch ) {
					makeVisible = true;
				} else if ( ! brokenByUnmatch && onceMatched ) {
					makeVisible = true;
				}

			// value: '__not_empty'
			} else if ( value.toLowerCase().trim() === '__not_empty' ) {
				if ( typeof currentValue === 'string' && currentValue.trim() !== '' ) {
					makeVisible = true;
				} else if ( typeof currentValue === 'boolean' && currentValue ) {
					makeVisible = true;
				}

			// value: '__empty'
			} else if ( value.toLowerCase().trim() === '__empty' ) {
				if ( typeof currentValue === 'undefined' ) {
					makeVisible = true;
				} else if ( currentValue.trim() === '' ) {
					makeVisible = true;
				}

			// value: '<num', '<=num', '>num', '>=num', '==num', '!=num'
			} else if ( value.match( /^(>=?|<=?|==|!=)(.*)/ ) ) {
				var matches = value.match( /^(>=?|<=?|==|!=)(.*)/ );
				var operator = matches[1];
				var num = matches[2];

				if ( num.match( /\./ ) ) {
					num = parseFloat( num );
				} else {
					num = parseInt( num, 10 );
				}

				if ( typeof currentValue === 'undefined' ) {
					currentValue = 0;
				} else if ( currentValue.match( /\./ ) ) {
					currentValue = parseFloat( currentValue );
				} else {
					currentValue = parseInt( currentValue, 10 );
				}

				if ( operator === '<' ) {
					makeVisible = currentValue < num;
				} else if ( operator === '<=' ) {
					makeVisible = currentValue <= num;
				} else if ( operator === '>' ) {
					makeVisible = currentValue > num;
				} else if ( operator === '>=' ) {
					makeVisible = currentValue >= num;
				} else if ( operator === '!=' ) {
					makeVisible = currentValue !== num;
				} else {
					makeVisible = currentValue === num;
				}

			}

			allConditions.push( makeVisible );
		}

		// Check if all the dependencies are met.
		var allTrue = true;
		for ( i = 0; i < allConditions.length; i++ ) {
			if ( ! allConditions[ i ] ) {
				allTrue = false;
			}
		}

		// Hide or show the option.
		if ( allTrue ) {
			this.$el.fadeIn();
		} else {
			this.$el.fadeOut();
		}


	} );

	view.model.trigger( 'change', view.model );
};


ContentTools.ToolboxPropertiesUI.prototype.addGenericShortcodeOptions = function( divGroup, element ) {

	var view, keys, i, attributeName, hasOptions = false;

	divGroup.classList.add( 'pbs-shortcode-generic' );

	// do matches
	keys = element.model.keys();
	for ( i = 0; i < keys.length; i++ ) {
		attributeName = keys[ i ];
		if ( attributeName !== 'content' ) {

			view = new PBSOption.GenericOption({
				attribute: attributeName,
				model: element.model
			});
			_pbsCreatedViews.push( view.render() );
			divGroup.appendChild( view.el );

			hasOptions = true;
		}
	}

	// do content
	if ( element.model.get('content') ) {

		view = new PBSOption.GenericOption({
			attribute: 'content',
			model: element.model
		});
		_pbsCreatedViews.push( view.render() );
		divGroup.appendChild( view.el );

		hasOptions = true;
	}

	if ( ! hasOptions ) {
		var note = document.createElement( 'DIV' );
		note.innerHTML = pbsParams.labels.shortcodes_not_attributes_detected;
		note.classList.add( 'pbs-shortcode-no-options' );
		divGroup.appendChild( note );
	}

};




ContentTools.ToolboxPropertiesUI.prototype._addSection = function( domElement ) {
	var currElem, i, k, group, heading, label,
		doneTypes = [];

	// Remember previous selected element.
	// Don't add the sections again for the same element.
	if ( this._previouslySelectedElement === domElement ) {
		return;
	}

	this._newGroups = [];
	this._currentGroupIndex = 0;
	if ( typeof this._oldGroups === 'undefined' ) {
		this._oldGroups = [];

		// Make sure the oldGroups don't carry over to the next editing session.
		var editor = ContentTools.EditorApp.get();
		editor.bind( 'start', function() {
			this._oldGroups = [];
		}.bind( this ) );
	}

	// this.clearSections();
	this._previouslySelectedElement = domElement;

	if ( typeof this._domInspectorGroups === 'undefined' ) {
		this._domInspectorGroups = [];
	}

	/**
	 * Create the inspector for the first DOM element selected if possible.
	 */
	if ( domElement ) {
		var currDomElement = null;
		while ( domElement ) {
			if ( domElement.tagName && domElement.tagName !== 'DIV' ) {
				if ( window.pbsSelectorMatches( domElement, '[data-name="main-content"] *' ) ) {
					currDomElement = domElement;
					break;
				}
			}
			domElement = domElement.parentNode;
		}

		var matchedPattern = '';
		label = '';
		if ( currDomElement ) {
			for ( var pattern in PBSInspectorOptions ) {
				if ( PBSInspectorOptions.hasOwnProperty( pattern ) ) {
					try {
						if ( window.pbsSelectorMatches( domElement, pattern ) ) {
							matchedPattern = pattern;
						}
					} catch (err) {
					}
				}
			}
		}

		if ( matchedPattern ) {
			if ( PBSInspectorOptions[ matchedPattern ].label ) {
				label = PBSInspectorOptions[ matchedPattern ].label;
			}
			if ( ! label ) {
				label = matchedPattern;
			}

			// Create the group.
			group = this.constructor.createDiv( ['ct-tool-group', 'pbs-inspector-group', 'pbs-dom-group'] );
			group.groupType = matchedPattern;

			// Create the title.
			heading = document.createElement('DIV');
			heading.classList.add( 'pbs-group-title' );
			heading.classList.add( 'pbs-collapsable-title' );
			heading.classList.add( 'pbs-dom-title' );
			heading.innerHTML = pbsParams.labels.inspector_title.replace( '%s', label );
			group.insertBefore( heading, group.firstChild );

			wp.hooks.doAction( 'inspector.group_title.create', group );
			this.placeGroup( group );


			currElemModel = new Backbone.Model({
				element: currDomElement
			});

			for ( i = 0; i < PBSInspectorOptions[ matchedPattern ].options.length; i++ ) {
				this.addSectionOptions( group, PBSInspectorOptions[ matchedPattern ].options[i], currDomElement, currElemModel );
			}
		}
	}


	/**
	 * Build the CT Element hierarchy.
	 */
	var root = ContentEdit.Root.get();
	var element = root.focused();
	if ( ! element ) {
		return;
	}
	currElem = element;
	var hierarchy = [];


	var finishedClasses = [];
	while ( currElem && currElem.constructor.name !== 'Region' ) {
		if ( finishedClasses.indexOf( currElem.constructor.name ) === -1 ) {
			hierarchy.push( currElem );
			finishedClasses.push( currElem.constructor.name );
		}
		currElem = currElem.parent();
	}


	// Adjust the order of the inspector. Make sure the row & column are last.
	var elem, note;
	for ( i = 0; i < hierarchy.length; i++ ) {
		if ( hierarchy[ i ].constructor.name === 'DivRow' ) {
			elem = hierarchy[ i ];
			hierarchy.splice( i, 1 );
			hierarchy.push( elem );
			break;
		}
	}
	for ( i = 0; i < hierarchy.length; i++ ) {
		if ( hierarchy[ i ].constructor.name === 'DivCol' ) {
			elem = hierarchy[ i ];
			hierarchy.splice( i, 1 );
			hierarchy.push( elem );
			break;
		}
	}


	var finishedElemTypes = [];
	var currElemModel;
	for ( i = 0; i < hierarchy.length; i++ ) {
		currElem = hierarchy[ i ];

		var elemType = currElem.constructor.name;
		var groupClasses, shortcodeProperties;

		elemType = wp.hooks.applyFilters( 'pbs.inspector.elemtype', elemType, currElem );

		if ( finishedElemTypes.indexOf( elemType ) !== -1 ) {
			continue;
		}
		finishedElemTypes.push( elemType );

		// Get the title label.
		if ( elemType === 'Shortcode' ) {

			label = currElem._domElement.getAttribute( 'data-base' );
		 	label = label.replace( /[-_]/g, ' ' ).replace( /\b[a-z]/g, function( letter ) {
				return letter.toUpperCase();
			});

			// If there is an existing shortcode mapping, use that.
			if ( typeof PBSInspectorOptions.Shortcode[ currElem.sc_base ] === 'undefined' ) {
				if ( typeof pbsParams.shortcode_mappings !== 'undefined' && typeof pbsParams.shortcode_mappings[ currElem.sc_base ] !== 'undefined' ) {
					if ( this.createShortcodeMappingOptions ) {
						this.createShortcodeMappingOptions( currElem.sc_base );
					}
				}
			}

			if ( typeof PBSInspectorOptions.Shortcode[ currElem.sc_base ] !== 'undefined' && typeof PBSInspectorOptions.Shortcode[ currElem.sc_base ].label !== 'undefined' ) {
				label = PBSInspectorOptions.Shortcode[ currElem.sc_base ].label;
			}

		} else if ( typeof PBSInspectorOptions[ elemType ] !== 'undefined' && doneTypes.indexOf( elemType ) === -1 ) {

			label = currElem.typeName();
			if ( PBSInspectorOptions[ elemType ].label ) {
				label = PBSInspectorOptions[ elemType ].label;
			}

 		} else {
			continue;
		}


		// Create the group.
		groupClasses = ['ct-tool-group', 'pbs-inspector-group', 'pbs-' + currElem.cssTypeName() + '-group'];
		if ( elemType === 'Shortcode' ) {
			groupClasses.push( 'pbs-shortcode-' + currElem.sc_base + '-group' );
		}
		group = this.constructor.createDiv( groupClasses );
		group.groupType = elemType;

		// Create the title.
		heading = document.createElement('DIV');
		heading.classList.add( 'pbs-group-title' );
		heading.classList.add( 'pbs-collapsable-title' );
		heading.classList.add( 'pbs-' + currElem.cssTypeName() + '-title' );
		heading.innerHTML = pbsParams.labels.inspector_title.replace( '%s', label );
		group.insertBefore( heading, group.firstChild );

		wp.hooks.doAction( 'inspector.group_title.create', group );
		this.placeGroup( group );


		// Create the options.
		if ( elemType === 'Shortcode' ) {

			var shortcodeBase = currElem.sc_base;
			shortcodeProperties = PBSInspectorOptions.Shortcode[ shortcodeBase ];

			if ( typeof shortcodeProperties !== 'undefined' && typeof shortcodeProperties.hidden !== 'undefined' ) {
				if ( shortcodeProperties.hidden ) {
					continue;
				}
			}

			if ( typeof shortcodeProperties !== 'undefined' && typeof shortcodeProperties.options !== 'undefined' ) {
				for ( k = 0; k < shortcodeProperties.options.length; k++ ) {
					this.addSectionOptions( group, shortcodeProperties.options[ k ], currElem );
				}
				if ( shortcodeProperties.desc ) {
					heading.innerHTML += '<span>' + shortcodeProperties.desc + '</span>';
				}

				// Add a note if the shortcode doesn't have attributes.
				if ( ! shortcodeProperties.options.length ) {
					var note = document.createElement( 'DIV' );
					note.innerHTML = pbsParams.labels.no_attributes_available;
					note.classList.add( 'pbs-shortcode-no-options' );
					group.appendChild( note );
				}

			} else {
				this.addGenericShortcodeOptions( group, currElem );
				heading.innerHTML += '<span>' + pbsParams.labels.note_options_are_detected + '</span>';
			}

			// Add note.
			var shortcodeNote = document.createElement( 'DIV' );
			shortcodeNote.classList.add( 'pbs-inspector-shortcode-note' );
			shortcodeNote.innerHTML = pbsParams.labels.note_shortcode_not_appearing;
			group.appendChild( shortcodeNote );

		} else if ( typeof PBSInspectorOptions[ elemType ] !== 'undefined' && doneTypes.indexOf( elemType ) === -1 ) {

			// currElemModel = new Backbone.Model({
			// 	element: currElem
			// });
			if ( ! currElem.model ) {
				currElemModel = new Backbone.Model({
					element: currElem
				});
			} else {
				currElemModel = currElem.model;
				currElemModel.set( 'element', currElem );
			}

			for ( k = 0; k < PBSInspectorOptions[ elemType ].options.length; k++ ) {
				this.addSectionOptions( group, PBSInspectorOptions[ elemType ].options[ k ], currElem, currElemModel );
			}

			// Footer notice for the inspector.
			if ( typeof PBSInspectorOptions[ elemType ].footer !== 'undefined' ) {
				if ( Math.random() > 0.5 ) { // Do this only half of the time.
					note = document.createElement( 'DIV' );
					note.innerHTML = PBSInspectorOptions[ elemType ].footer;
					note.classList.add( 'pbs-group-footer' );
					group.appendChild( note );
				}
			}

			wp.hooks.doAction( 'pbs.inspector.add_section', group, label );

 		} else {
			continue;
		}
	}

	this.clearOldGroups();

	while ( this._newGroups.length ) {
		this._oldGroups.push( this._newGroups.pop() );
	}

};


ContentTools.ToolboxPropertiesUI.prototype.clearOldGroups = function() {
	for ( var i = 0; i < this._oldGroups.length; i++ ) {
		var oldGroup = this._oldGroups[ i ];
		if ( typeof oldGroup.view !== 'undefined' ) {
			// oldGroup.view.remove();
		}



		oldGroup.style.height = window.getComputedStyle( oldGroup ).height;
		oldGroup.style.webkitTransition = 'height .3s ease-in-out';
		oldGroup.style.mozTransition = 'height .3s ease-in-out';
		oldGroup.style.msTransition = 'height .3s ease-in-out';
		oldGroup.style.transition = 'height .3s ease-in-out';
		oldGroup.style.overflow = 'hidden';
		oldGroup.offsetHeight; // force repaint
		oldGroup.style.height = 0;

		// Remove from dom after transition.
		oldGroup.addEventListener('transitionend', function transitionEnd(event) {
			if (event.propertyName === 'height') {
				this.removeEventListener('transitionend', transitionEnd, false);
				if ( typeof this.view !== 'undefined' ) {
					this.view.remove();
				}
				this.parentNode.removeChild( this );
			}
		}.bind(oldGroup), false);

		// Fallback, when fast switching, transitionend sometimes does not fire.
		setTimeout( function() {
			if ( typeof this.view !== 'undefined' ) {
				this.view.remove();
			}
			if ( this.parentNode ) {
				this.parentNode.removeChild( this );
			}
		}.bind(oldGroup), 350);
	}
	this._oldGroups = [];
};

ContentTools.ToolboxPropertiesUI.prototype.clearSections = function() {

	while ( _pbsCreatedViews.length > 0 ) {
		var o = _pbsCreatedViews.pop();
		o.remove();
	}

	if ( this._domInspectorGroups ) {
		while ( this._domInspectorGroups.length ) {
			var elemToRemove = this._domInspectorGroups.shift();
			elemToRemove.parentNode.removeChild( elemToRemove );
		}
	}

	this._previouslySelectedElement = null;
};


/**
 * Places the section/group in the inspector.
 * If a similar group already exists (same type), then replace it's contents & resize it
 * If it's a new group, add it and animate it.
 */
ContentTools.ToolboxPropertiesUI.prototype.placeGroup = function( group ) {
	this._newGroups.push( group );

	// Check the existing groups and replace if it already exists.
	for ( var i = 0; i < this._oldGroups.length; i++ ) {
		var oldGroup = this._oldGroups[ i ];
		if ( oldGroup.groupType === group.groupType ) {
			var startHeight = getComputedStyle( oldGroup ).height;
			group.style.overflow = 'hidden';
			group.style.height = startHeight;

			if ( typeof oldGroup.view !== 'undefined' ) {
				oldGroup.view.remove();
			}
			this._domElement.replaceChild( group, oldGroup );
			this._currentGroupIndex = i + 1;
			this._oldGroups.splice( i, 1 );

			setTimeout( function() { // jshint ignore:line
				this.style.height = 'auto';
				var endHeight = getComputedStyle(this).height;
				if ( this.classList.contains('pbs-collapse') ) {
					endHeight = getComputedStyle( this.querySelector( '.pbs-group-title' ) ).height;
				}
				this.style.height = startHeight;
				this.offsetHeight; // force repaint
				this.style.webkitTransition = 'height .3s ease-in-out';
				this.style.mozTransition = 'height .3s ease-in-out';
				this.style.msTransition = 'height .3s ease-in-out';
				this.style.transition = 'height .3s ease-in-out';
				this.style.overflow = 'hidden';
				this.style.height = endHeight;

				var didTransition = false;
				this.addEventListener('transitionend', function transitionEnd(event) {
					if (event.propertyName === 'height') {
						this.style.webkitTransition = '';
						this.style.mozTransition = '';
						this.style.msTransition = '';
						this.style.transition = '';
						if ( ! this.classList.contains('pbs-collapse') ) {
							this.style.height = 'auto';
							this.style.overflow = 'visible'; // Allow tooltips to overflow.
						}
						didTransition = true;
						this.removeEventListener('transitionend', transitionEnd, false);
					}
				}, false);

				// If another same element was previously selected, the transition above will not
				// trigger. Make sure the container can overflow or else our colorpickers and
				// tooltips will not display.
				setTimeout( function() {
					if ( ! didTransition && this ) {
						if ( ! this.classList.contains('pbs-collapse') ) {
							this.style.height = 'auto';
							this.style.overflow = 'visible';
						}
					}
				}.bind( this ), 350 );

			}.bind( group ), 1 );

			return;
		}
	}

	// Add the new group.
	group.style.height = 0;
	group.style.overflow = 'hidden';
	this._domElement.insertBefore( group, this._domElement.querySelectorAll( '.ct-tool-group' )[ this._currentGroupIndex + 1 ] );
	this._currentGroupIndex++;

	setTimeout( function() {
		this.style.height = 'auto';
		var endHeight = getComputedStyle(this).height;
		if ( this.classList.contains('pbs-collapse') ) {
			endHeight = getComputedStyle( this.querySelector( '.pbs-group-title' ) ).height;
		}
		this.style.height = 0;
		this.offsetHeight; // force repaint
		this.style.webkitTransition = 'height .3s ease-in-out';
		this.style.mozTransition = 'height .3s ease-in-out';
		this.style.msTransition = 'height .3s ease-in-out';
		this.style.transition = 'height .3s ease-in-out';
		this.style.overflow = 'hidden';
		this.style.height = endHeight;
		this.addEventListener('transitionend', function transitionEnd(event) {
			if (event.propertyName === 'height') {
				this.style.webkitTransition = '';
				this.style.mozTransition = '';
				this.style.msTransition = '';
				this.style.transition = '';
				if ( ! this.classList.contains('pbs-collapse') ) {
					this.style.height = 'auto';
					this.style.overflow = 'visible'; // Allow tooltips to overflow.
				}
				this.removeEventListener('transitionend', transitionEnd, false);
			}
		}, false);
	}.bind( group ), 1 );
};




/***********************************************************************************************
 * These are the inspector elements that we are supporting.
 ***********************************************************************************************/
window.pbsElementsWithInspector = [];
window.pbsAddInspector = function( elemName, args ) {// options ) {
	if ( typeof args !== 'object' ) {
		return;
	}
	var i, container = PBSInspectorOptions;

	// Support multiple element names given.
	if ( typeof elemName === 'object' ) {
		for ( i = 0; i < elemName.length; i++ ) {
			window.pbsAddInspector( elemName[ i ], args );
		}
		return;
	}

	if ( typeof args.is_shortcode !== 'undefined' ) {
		if ( args.is_shortcode ) {
			container = PBSInspectorOptions.Shortcode;
		} else {
			if ( window.pbsElementsWithInspector.indexOf( elemName ) === -1 ) {
				window.pbsElementsWithInspector.push( elemName );
			}
		}
	} else {
		if ( window.pbsElementsWithInspector.indexOf( elemName ) === -1 ) {
			window.pbsElementsWithInspector.push( elemName );
		}
	}

	if ( typeof container[ elemName ] === 'undefined' ) {
		container[ elemName ] = args;
		return;
	}

	for ( var argName in args ) {
		if ( args.hasOwnProperty( argName ) ) {
			if ( argName !== 'options' ) {
				container[ elemName ][ argName ] = args[ argName ];
			} else {
				var options = args[ argName ];
				for ( i = 0; i < options.length; i++ ) {
					container[ elemName ].options.push( options[ i ] );
				}
			}
		}
	}
};
window.pbsRemoveInspector = function( elemName ) {
	var i, container = PBSInspectorOptions;

	// Support multiple element names given.
	if ( typeof elemName === 'object' ) {
		for ( i = 0; i < elemName.length; i++ ) {
			window.pbsRemoveInspector( elemName[ i ] );
		}
		return;
	}

	if ( typeof PBSInspectorOptions.Shortcode[ elemName ] !== 'undefined' ) {
		container = PBSInspectorOptions.Shortcode;
	}

	if ( typeof container[ elemName ] !== 'undefined' ) {
		delete container[ elemName ];
	}
};
var PBSInspectorOptions = {
	'Shortcode': {}
};

	// 'pbs_button': {
	// 	'name': 'Button',
	// 	'desc': 'Add a button',
	// 	'icon': pbsParams.default_icon
	// 	// 'options': [
	// 	// ],
	// }
// };


/*********************************************************************
 * Allow localize in PHP to add new shortcode options.
 *********************************************************************/
if ( pbsParams.additional_shortcodes ) {
	for ( var elemName in pbsParams.additional_shortcodes ) {
		if ( pbsParams.additional_shortcodes.hasOwnProperty( elemName ) ) {
			PBSInspectorOptions.Shortcode[ elemName ] = pbsParams.additional_shortcodes[ elemName ];
		}
	}
}



/**
 * Collapse transition.
 * @see http://n12v.com/css-transition-to-from-auto/ for animating the height from auto to 0.
 */
window.pbsCollapseSection = function( section ) {
	var classes;

	// Do collapse animation.
	if ( section.classList.contains( 'pbs-collapse' ) ) {

		// If data-collapse-group is present, then this means that the collapsable area
		// should act like an accordion.
		if ( section.getAttribute( 'data-collapse-group' ) ) {
			var openSections = document.querySelectorAll( '[data-collapse-group="' + section.getAttribute( 'data-collapse-group' ) + '"]:not(.pbs-collapse)' );
			Array.prototype.forEach.call( openSections, function(el) {
				window.pbsCollapseSection( el );
			});
		}

		var prevHeight = section.style.height;
		section.style.height = 'auto';
		var endHeight = getComputedStyle(section).height;
		section.style.height = prevHeight;
		section.offsetHeight; // force repaint
		section.style.webkitTransition = 'height .3s ease-in-out';
		section.style.mozTransition = 'height .3s ease-in-out';
		section.style.msTransition = 'height .3s ease-in-out';
		section.style.transition = 'height .3s ease-in-out';
		section.style.overflow = 'hidden';
		section.style.height = endHeight;
		section.addEventListener('transitionend', function transitionEnd(event) {
			if (event.propertyName === 'height') {
				section.style.webkitTransition = '';
				section.style.mozTransition = '';
				section.style.msTransition = '';
				section.style.transition = '';
				section.style.height = 'auto';
				section.style.overflow = 'visible'; // Allow tooltips to overflow.
				section.removeEventListener('transitionend', transitionEnd, false);
			}
		}, false);

		section.classList.remove( 'pbs-collapse' );

		classes = section.getAttribute( 'class' );
		classes = classes.replace( /\s*(ct-tool-group|pbs-collapse|pbs-inspector-group)\s*/g, '' );

	} else {

		// Do collapse animation.
		section.style.height = window.getComputedStyle( section ).height;
		section.style.webkitTransition = 'height .3s ease-in-out';
		section.style.mozTransition = 'height .3s ease-in-out';
		section.style.msTransition = 'height .3s ease-in-out';
		section.style.transition = 'height .3s ease-in-out';
		section.style.overflow = 'hidden';
		section.offsetHeight; // force repaint;

		section.style.height = '38px';
		section.addEventListener('transitionend', function transitionEnd(event) {
			if (event.propertyName === 'height') {
				section.removeEventListener('transitionend', transitionEnd, false);
			}
		}, false);

		section.classList.add( 'pbs-collapse' );

		classes = section.getAttribute( 'class' );
		classes = classes.replace( /\s*(ct-tool-group|pbs-collapse|pbs-inspector-group)\s*/g, '' );
	}
};
window.pbsOpenAllSections = function() {
	var sections = document.querySelectorAll( '.ct-tool-group' );
	Array.prototype.forEach.call( sections, function(el){
		if ( el.classList.contains('pbs-collapse') ) {
			window.pbsCollapseSection( el );
		}
	});
};
window.pbsOnlyOpenSection = function( sectionClass ) {
	var sections = document.querySelectorAll( '.ct-tool-group' );
	Array.prototype.forEach.call( sections, function(el){
		// Open the section we need.
		if ( sectionClass && el.classList.contains( sectionClass ) ) {
			if ( el.classList.contains('pbs-collapse') ) {
				window.pbsCollapseSection( el );
			}
		} else {
			// Close the rest.
			if ( ! el.classList.contains('pbs-collapse') ) {
				window.pbsCollapseSection( el );
			}
		}
	});
};

window.addEventListener( 'DOMContentLoaded', function() {
	if ( ! document.querySelector( '[data-name="main-content"]' ) ) {
		return;
	}

	// Load saved collapsed sections on start.
	// var editor = ContentTools.EditorApp.get();
	// editor.bind( 'start', function() {
	// 	if ( typeof localStorage.getItem( 'pbs_collapsed_sections' ) !== 'undefined' && localStorage.getItem( 'pbs_collapsed_sections' ) ) {
	// 		storedCollapsed = JSON.parse( localStorage.getItem( 'pbs_collapsed_sections' ) );
	//
	// 		for ( var i = 0; i < storedCollapsed.length; i++ ) {
	// 			var groupClass = storedCollapsed[ i ].replace( /\s/g, '.' );
	// 			if ( groupClass ) {
	// 				var section = document.querySelector( '.ct-tool-group.' + groupClass );
	// 				if ( section ) {
	// 					section.classList.add( 'pbs-collapse' );
	// 					section.style.height = window.getComputedStyle( section.firstChild ).height;
	// 				}
	// 			}
	// 		}
	// 	}
	// } );

	// Handler for collapsing / uncollapsing.
	document.addEventListener('click', function(ev) {
		var section = ev.target;
		if ( ! ev.target.classList.contains( 'pbs-collapsable-title' ) ) {
			if ( ! ev.target.parentNode ) {
				return;
			}
			if ( ! ev.target.parentNode.classList ) {
				return;
			}
			if ( ! ev.target.parentNode.classList.contains( 'pbs-collapsable-title' ) ) {
				return;
			}
			section = ev.target.parentNode.parentNode;
		} else {
			section = ev.target.parentNode;
		}

		window.pbsCollapseSection( section );
	});
});
// Add collapse class for dynamically added inspector sections.
wp.hooks.addAction( 'inspector.group_title.create', function( section ) {
	var classes = section.getAttribute( 'class' );
	classes = classes.replace( /\s*(ct-tool-group|pbs-collapse|pbs-inspector-group)\s*/g, '' );

	if ( storedCollapsed.indexOf( classes ) !== -1 ) {
		section.classList.add( 'pbs-collapse' );

		// Add the actual height of the section. We need to do this in a timeout since
		// the title/subtitle is still being created.
		setTimeout( function() {
			section.style.height = window.getComputedStyle( section.firstChild ).height;
		}, 1 );
	}
} );


/**
 * Prevent pressing the delete button while editing stuff in the inspector
 * from deleting elements.
 */
( function() {
   var proxied = ContentTools.Tools.Remove.apply;
   ContentTools.Tools.Remove.apply = function( element, selection, callback ) {
	   if ( document.activeElement ) {
		   if ( ['INPUT', 'TEXTAREA'].indexOf( document.activeElement.tagName ) !== -1 ) {
			   return;
		   }
	   }
	   proxied.call( element, selection, callback );
   };
} )();

/* globals ContentEdit, ContentTools, pbsParams */


var PBSOption = {};


var PBSBaseView = Backbone.View.extend( {

	initialize: function(options) {

		this.optionSettings = _.clone( options.optionSettings );

		if ( this.optionSettings.initialize ) {
			this.optionSettings.initialize( this.model.get('element'), this );
		}

		if ( this.optionSettings.visible ) {
			this._visibleBound = this._visible.bind( this );
			wp.hooks.addAction( 'pbs.option.changed', this._visibleBound );
			this._visible();
		}

		Backbone.View.prototype.initialize.call( this, options );
	},

	_visible: function() {
		if ( this.optionSettings.visible( this.model.get( 'element' ) ) ) {
			this.$el.show();
		} else {
			this.$el.hide();
		}
	},

	remove: function() {
		if ( this.optionSettings.visible ) {
			wp.hooks.removeAction( 'pbs.option.changed', this._visibleBound );
		}

        Backbone.View.prototype.remove.apply( this );
    }
} );

PBSOption.widgetSettings = Backbone.View.extend({

	className: 'pbs-tool-option',

	events: {
		'change input' : 'attributeChanged',
		'keyup input' : 'attributeChanged',
		'change textarea' : 'attributeChanged',
		'keyup textarea' : 'attributeChanged',
		'click input[type="radio"]' : 'attributeChanged',
		'click input[type="checkbox"]' : 'attributeChanged',
		'change select' : 'attributeChanged',
		'keyup select' : 'attributeChanged'
	},

	initialize: function(options) {
		this.optionSettings = _.clone( options.optionSettings );
		this.attribute = _.clone( options.attribute );

		if ( typeof this.model.attributes.widget === 'undefined' ) {
			this.model.attributes.widget = 'WP_Widget_Text';
		}
		this.template = wp.template( 'pbs-widget-' + this.model.attributes.widget );
	},

	render: function() {
		var data = _.extend( {}, this.model.attributes, this.optionSettings );
	    this.$el.html( this.template( data ) );

		// Adjust the inspector title.
		var widgetInfo = pbsParams.widget_list[ this.model.attributes.widget ];
		// var inspectorContainer = this.el.parentNode.querySelector( '.pbs-group-title' );
		// inspectorContainer.innerHTML = pbsParams.labels.widget_properties_title.replace( '%s', widgetInfo.name ) + '<span>' + widgetInfo.description + '</span>';

		// Assign the current settings of the widget.
		for (var attributeName in this.model.attributes ) {
			if ( ! this.model.attributes.hasOwnProperty( attributeName ) ) {
				continue;
			}

			var option = this.el.querySelector( '#widget-' + widgetInfo.id_base + '--' + attributeName );
			if ( option ) {
				if ( option.tagName === 'TEXTAREA' ) {
					option.value = this.model.attributes[  attributeName ].replace( /<br>/g, '\n' );
				} else if ( option.tagName === 'INPUT' && option.getAttribute( 'type' ) === 'checkbox' ) {
					if ( this.model.attributes[ attributeName ] ) {
						option.checked = true;
					}
				} else {
					option.value = this.model.attributes[  attributeName ];
				}
			}
		}

		// The only way to get the default values of widgets is using the form.
		// At the start trigger the form fields to save so we can get the default values.
		var fields = this.el.querySelectorAll( '[id^=widget-' + widgetInfo.id_base + '--' );
		Array.prototype.forEach.call( fields, function(el) {
			this.attributeChanged( { target: el } );
		}.bind( this ) );

	    return this;
	},

	attributeChanged: function(e) {

		var widgetInfo = pbsParams.widget_list[ this.model.attributes.widget ];
		var attribute = e.target.getAttribute( 'id' ).replace( 'widget-' + widgetInfo.id_base + '--', '' );

		if ( e.target.tagName === 'INPUT' && e.target.getAttribute( 'type' ) === 'checkbox' ) {
			this.model.set( attribute, e.target.checked ? e.target.value : '' );
		} else {
			this.model.set( attribute, e.target.value );
		}
	}
});


PBSOption.Button = PBSBaseView.extend({

	events: {
		'click': 'click',
		'mouseenter': 'mouseenter',
		'mouseleave': 'mouseleave',
		'mousedown': 'mousedown',
		'mouseup': 'mouseup'
	},

	initialize: function(options) {
		PBSBaseView.prototype.initialize.call( this, options );

		this.attribute = _.clone( options.attribute );

		this._canApplyUpdater();
	},

	render: function() {
		if ( this.optionSettings.name ) {
			this.el.setAttribute( 'data-tooltip', this.optionSettings.name );
		}
		if ( this.optionSettings.render ) {
			this.optionSettings.render( this.model.get('element'), this );
		}
		this._tooltipUpdater();
		this._isAppliedUpdater();
		this._canApplyUpdater();
	    return this;
	},

	click: function() {
		if ( this.el.classList.contains( 'ct-tool--disabled' ) ) {
			return;
		}
		if ( this.optionSettings.click ) {
			this.optionSettings.click( this.model.get('element'), this );
		}
		this._tooltipUpdater();
		this._isAppliedUpdater();
		this._canApplyUpdater();

		// Restore the caret position.
		if ( this._selectedElement && this._selectedElement.restoreState ) {
			this._selectedElement.restoreState();
		}
	},

	updateTooltip: function( value ) {
		if ( ! value ) {
			value = '';
		}
		if ( window.PBSEditor.isCtrlDown && window.PBSEditor.isShiftDown ) {
			if ( this.optionSettings['tooltip-reset'] ) {
				this.el.setAttribute( 'data-tooltip', this.optionSettings['tooltip-reset'].replace( '{0}', value ) );
				return;
			}
		} else if ( window.PBSEditor.isCtrlDown ) {
			if ( this.optionSettings['tooltip-down'] ) {
				this.el.setAttribute( 'data-tooltip', this.optionSettings['tooltip-down'].replace( '{0}', value ) );
				return;
			}
		} else {
			if ( this.optionSettings.tooltip ) {
				this.el.setAttribute( 'data-tooltip', this.optionSettings.tooltip.replace( '{0}', value ) );
				return;
			}
		}
		if ( this.optionSettings.tooltip ) {
			this.el.setAttribute( 'data-tooltip', this.optionSettings.tooltip );
		} else if ( this.optionSettings.name ) {
			this.el.setAttribute( 'data-tooltip', this.optionSettings.name );
		}
	},

	_tooltipUpdater: function() {
		if ( this.optionSettings.tooltipValue && this.model.get('element') ) {
			this.updateTooltip( this.optionSettings.tooltipValue( this.model.get('element'), this ) );
		} else {
			this.updateTooltip();
		}
	},

	updateIsApplied: function( value ) {
		this.el.classList.remove( 'ct-tool--applied' );

		if ( value ) {
			this.el.classList.add( 'ct-tool--applied' );
		}
	},

	_canApplyUpdater: function() {
		this.el.classList.remove( 'ct-tool--disabled' );
		if ( this.optionSettings.canApply && this.model.get('element') && this.model.get('element')._domElement ) {
			if ( ! this.optionSettings.canApply( this.model.get('element'), this ) ) {
				this.el.classList.add( 'ct-tool--disabled' );
			}
		}
	},

	_isAppliedUpdater: function() {
		if ( this.optionSettings.isApplied && this.model.get('element') && this.model.get('element')._domElement ) {
			this.updateIsApplied( this.optionSettings.isApplied( this.model.get('element'), this ) );
		}
	},

	mouseenter: function() {
		if ( this.optionSettings.mouseenter && this.model.get('element') && this.model.get('element')._domElement ) {
			this.optionSettings.mouseenter( this.model.get('element'), this );
		}
		if ( this.optionSettings.hold ) {
			clearTimeout( this._holdTimeout );
			clearInterval( this._holdInterval );
		}
		if ( this.model.get('element') && this.model.get('element')._domElement ) {
			this.model.get('element')._domElement.classList.add('ce-element--over');
		}
		this._tooltipUpdaterInterval = setInterval( this._tooltipUpdater.bind(this), 100 );
	},

	mouseleave: function() {
		if ( this.optionSettings.mouseleave && this.model.get('element') && this.model.get('element')._domElement ) {
			this.optionSettings.mouseleave( this.model.get('element'), this );
		}
		if ( this.optionSettings.hold ) {
			clearTimeout( this._holdTimeout );
			clearInterval( this._holdInterval );
		}
		if ( this.model.get('element') ) {
			if ( this.model.get('element')._domElement ) {
				this.model.get('element')._domElement.classList.remove('ce-element--over');
			}
		}
		clearInterval( this._tooltipUpdaterInterval );
	},

	mousedown: function() {

		// Store the cursor state.
		var root = ContentEdit.Root.get();
		var selectedElement = root.focused();
		if ( selectedElement && selectedElement.storeState ) {
			selectedElement.storeState();
		}
		if ( selectedElement ) {
			this._selectedElement = selectedElement;
		}

		if ( this.optionSettings.hold ) {
			clearTimeout( this._holdTimeout );
			clearInterval( this._holdInterval );

			this._holdTimeout = setTimeout(function() {
				this._holdInterval = setInterval( function() {
					this.optionSettings.hold( this.model.get('element'), this );
					this._tooltipUpdater();
					this._isAppliedUpdater();
				}.bind(this), 30 );
			}.bind(this), 500);
		}
	},

	mouseup: function() {
		if ( this.optionSettings.hold ) {
			clearTimeout( this._holdTimeout );
			clearInterval( this._holdInterval );
		}
	}
});



PBSOption.GenericOption = Backbone.View.extend({
	template: wp.template( 'pbs-shortcode-generic-option' ),

	className: 'pbs-tool-option',

	events: {
		'change input' : 'attributeChanged',
		'keyup input' : 'attributeChanged',
		'change textarea' : 'attributeChanged',
		'keyup textarea' : 'attributeChanged'
	},

	initialize: function(options) {
		// _.extend(this, _.pick(options, 'optionSettings', 'attribute'));
		this.optionSettings = _.clone( options.optionSettings );
		this.attribute = _.clone( options.attribute );

		if ( this.attribute === 'content' ) {
			this.template = wp.template( 'pbs-shortcode-generic-content' );
		}
	},

	render: function() {
		var data = _.extend( {}, this.model.attributes, this.optionSettings );
		data.value = this.model.get( this.attribute );
		data.attr = this.attribute;

	    this.$el.html( this.template( data ) );

	    return this;
	},

	attributeChanged: function(e) {
		this.model.set( this.attribute, e.target.value );
	}
});


PBSOption.Border = Backbone.View.extend({
	template: wp.template( 'pbs-option-border' ),

	events: {
		'change select' : 'styleChanged',
		'change .width' : 'widthChanged',
		'keyup .width' : 'widthChanged',
		'change .radius' : 'radiusChanged',
		'keyup .radius' : 'radiusChanged',
		'click .pbs-color-preview': 'togglePicker',
		'change .pbs-color-popup input' : 'colorChanged',
		'keyup .pbs-color-popup input' : 'colorChanged'
	},

	initialize: function(options) {
		this.optionSettings = _.clone( options.optionSettings );
		this.randomID = this.optionSettings.id + '-' + _.random(0, 10000);

		this._hidePickerBound = this.hidePicker.bind(this);
		document.querySelector('.ct-toolbox').addEventListener('mouseleave', this._hidePickerBound);
	},

	render: function() {
		var data = _.extend( {}, this.model.attributes, this.optionSettings );
		data.id = this.randomID;
		// data.value = this.optionSettings.value( this.model.get('element' ) );


		var styles = window.getComputedStyle( this.model.get('element')._domElement );
		var stylesToAdd = [ 'border-color', 'border-style', 'border-width', 'border-radius' ];

		for ( var i = 0; i < stylesToAdd.length; i++ ) {
			this.model.set( stylesToAdd[ i ], styles[ stylesToAdd[ i ] ], { silent: true } );
		}

	    this.$el.html( this.template( data ) );

		var _this = this;
		jQuery('#' + this.randomID).iris({
			// or in the data-default-color attribute on the input
			defaultColor: true,
			// a callback to fire whenever the color changes to a valid color
			change: function(){
				_this.colorChanged();
			},
			// a callback to fire when the input is emptied or an invalid color
			clear: function() {},
			// hide the color picker controls on load
			hide: false,
			// Add our own pretty colors
			palettes: [ '#000', '#fff', '#CF000F', '#D2527F', '#F89406', '#F9BF3B', '#2ECC71', '#19B5FE', '#8E44AD' ]
		});
	    return this;


	},

	remove: function(){
		jQuery('#' + this.randomID).iris('destroy');
		document.querySelector('.ct-toolbox').removeEventListener('mouseleave', this._hidePickerBound);
        Backbone.View.prototype.remove.call( this );
    },

	colorChanged: function() {
		var inputColor = this.el.querySelector('.pbs-color-popup input').value;
		var color = jQuery(this.el.querySelector('#' + this.randomID)).iris( 'color' );

		if ( inputColor === 'transparent' || inputColor === '' ) {
			color = inputColor;
		}

		this.model.get('element').style( 'border-color', color );
		if ( color === 'transparent' ) {
			color = '';
		}
		this.el.querySelector('.pbs-color-preview').style.background = color;
	},

	styleChanged: function(e) {

		this.model.get('element').style( 'border-style', e.target.value );

		// If all borders are 0px, then make them into 1px if !== none
		// If none, turn all borders to 0px.

		var newBorder = '0px';
		if ( e.target.value !== 'none' ) {
			newBorder = '1px';
		}

		var allBordersZero = true;
		if ( parseInt( this.model.get( 'border-top-width' ), 10 ) ) {
			allBordersZero = false;
		}
		if ( parseInt( this.model.get( 'border-right-width' ), 10 ) ) {
			allBordersZero = false;
		}
		if ( parseInt( this.model.get( 'border-bottom-width' ), 10 ) ) {
			allBordersZero = false;
		}
		if ( parseInt( this.model.get( 'border-left-width' ), 10 ) ) {
			allBordersZero = false;
		}

		// Apply the border widths.
		if ( ( allBordersZero && e.target.value !== 'none' ) || e.target.value === 'none' ) {
			this.model.set( 'border-top-width', newBorder );
			this.model.set( 'border-right-width', newBorder );
			this.model.set( 'border-bottom-width', newBorder );
			this.model.set( 'border-left-width', newBorder );
			this.model.get('element').style( 'border-width', newBorder );
			this.model.trigger('change', this.model);
		}
	},

	widthChanged: function(e) {
		var value = e.target.value;
		if ( ! isNaN( value ) && value.trim() !== '' ) {
			value = value + 'px';
		}
		this.model.get('element').style( 'border-width', value );
	},

	radiusChanged: function(e) {
		var value = e.target.value;
		if ( ! isNaN( value ) && value.trim() !== '' ) {
			value = value + 'px';
		}
		this.model.get('element').style( 'border-radius', value );
	},

	togglePicker: function() {
		if ( this.el.querySelector('.pbs-color-popup').style.display === 'block' ) {
			this.el.querySelector('.pbs-color-popup').style.display = '';
		} else {
			this.el.querySelector('.pbs-color-popup').style.display = 'block';
		}
	},

	hidePicker: function() {
		this.el.querySelector('.pbs-color-popup').style.display = '';
	}
});



PBSOption.Color = PBSBaseView.extend({
	template: wp.template( 'pbs-option-color' ),

	events: {
		'mouseenter': 'mouseenter',
		'mouseleave': 'mouseleave',
		'change input' : 'selectChanged',
		'keyup input' : 'selectChanged',
		'click .pbs-color-preview': 'togglePicker',
		'mousedown .iris-square-handle': 'mousedownPicker',
		'mouseup .iris-square-handle': 'mouseupPicker',
		'click .iris-square-handle': 'irisHandleClick'
	},

	initialize: function(options) {
        PBSBaseView.prototype.initialize.call( this, options );
		this.randomID = this.optionSettings.id + '-' + _.random(0, 10000);

		if ( this.optionSettings.value ) {
			this.model.set( this.optionSettings.id, this.optionSettings.value( this.model.get('element') ) );
		}

		this._hidePickerBound = this.hidePicker.bind(this);
		document.querySelector('.ct-toolbox').addEventListener('mouseleave', this._hidePickerBound);

		this._canApplyUpdater();
	},

	_canApplyUpdater: function() {
		this.el.classList.remove( 'ct-tool--disabled' );
		if ( this.optionSettings.canApply ) {
			if ( ! this.optionSettings.canApply( this.model.get('element'), this ) ) {
				this.el.classList.add( 'ct-tool--disabled' );
			}
		}
	},

	updateColor: function( color ) {
		if ( this.el.querySelector('.pbs-color-preview').style.background !== color ) {
			this.el.querySelector('.pbs-color-preview').style.background = color;
			this.el.querySelector('input').value = color;
			jQuery( '#' + this.randomID ).iris( 'color', color );
		}
	},

	// Prevent the screen from jumping up when clicking on the handle.
	irisHandleClick: function( ev ) {
		ev.preventDefault();
	},

	/*
	updateTooltip: function( value ) {
		if ( ! value ) {
			if ( this.optionSettings.value ) {
				value = this.optionSettings.value( this.model.get('element' ) );
			} else if ( this.optionSettings.id ) {
				value = this.model.get( this.optionSettings.id );
			}
		}
		if ( window.PBSEditor.isCtrlDown && window.PBSEditor.isShiftDown ) {
			if ( this.optionSettings['tooltip-reset'] ) {
				this.el.setAttribute( 'data-tooltip', this.optionSettings['tooltip-reset'].replace( '{0}', value ) );
				return;
			}
		} else if ( window.PBSEditor.isCtrlDown ) {
			if ( this.optionSettings['tooltip-down'] ) {
				this.el.setAttribute( 'data-tooltip', this.optionSettings['tooltip-down'].replace( '{0}', value ) );
				return;
			}
		} else {
			if ( this.optionSettings.tooltip ) {
				this.el.setAttribute( 'data-tooltip', this.optionSettings.tooltip.replace( '{0}', value ) );
				return;
			}
		}
		if ( this.optionSettings.tooltip ) {
			this.el.setAttribute( 'data-tooltip', this.optionSettings.tooltip );
		} else if ( this.optionSettings.name ) {
			this.el.setAttribute( 'data-tooltip', this.optionSettings.name );
		}
	},
	*/

	render: function() {
		var data = _.extend( {}, this.model.attributes, this.optionSettings );
		data.id = this.randomID;

		if ( this.optionSettings.value ) {
			data.value = this.optionSettings.value( this.model.get('element' ) );
		} else if ( this.optionSettings.id ) {
			data.value = this.model.get( this.optionSettings.id );
		}

	    this.$el.html( this.template( data ) );
		// this.el.classList.add( 'pbs-button' );

		// this.updateTooltip( data.value );

		var _this = this;
		jQuery( '#' + this.randomID ).iris({
			// or in the data-default-color attribute on the input
			defaultColor: true,
			// a callback to fire whenever the color changes to a valid color
			change: function(){
				// Change fires when Iris initializes, prevent change calls.
				if ( ! _this._justInit ) {
					_this._justInit = true;
					return;
				}
				_this.selectChanged();
			},
			// a callback to fire when the input is emptied or an invalid color
			clear: function() {},
			// hide the color picker controls on load
			hide: false,
			// Add our own pretty colors
			palettes: [ '#000', '#fff', '#CF000F', '#D2527F', '#F89406', '#F9BF3B', '#2ECC71', '#19B5FE', '#8E44AD' ]
		});

		this._canApplyUpdater();

	    return this;
	},

	remove: function() {
		jQuery('#' + this.randomID).iris('destroy');
		document.querySelector('.ct-toolbox').removeEventListener('mouseleave', this._hidePickerBound);

        PBSBaseView.prototype.remove.call( this );
    },

	selectChanged: function( forceColor ) {
		var input = this.el.querySelector('input');
		var color = jQuery( input ).iris( 'color' );

		if ( forceColor ) {
			color = input.value;
		}

		if ( input.value === '' || input.value === 'transparent' ) {
			color = input.value;
		}

		if ( this.optionSettings.change ) {
			this.optionSettings.change( this.model.get('element'), color, this );
		}
		if ( this.optionSettings.id ) {
			this.model.set( this.optionSettings.id, color );
		}

		if ( color === 'transparent' ) {
			color = '';
		}
		this.el.querySelector('.pbs-color-preview').style.background = color;

		wp.hooks.doAction( 'pbs.option.changed' );
	},

	togglePicker: function() {

		// Remove the current image with shift+ctrl+click
		if ( window.PBSEditor.isCtrlDown && window.PBSEditor.isShiftDown ) {
			var input = this.el.querySelector('input');
			input.value = '';
			this.selectChanged();

			jQuery( '#' + this.randomID ).iris( 'color', 'transparent' );
			return;
		}

		var popup = this.el.querySelector('.pbs-color-popup');
		var otherPopups = document.querySelectorAll( '.pbs-color-popup' );
		Array.prototype.forEach.call( otherPopups, function( el ) {
			if ( el !== popup ) {
				el.style.display = '';
			}
		} );

		if ( popup.style.display === 'block' ) {
			popup.style.display = '';
		} else {
			// Let others know that we're going to open a popup.
			wp.hooks.doAction( 'pbs.tool.popup.open' );
			popup.style.display = 'block';
		}

		// Close popup if other popups open.
		wp.hooks.addAction( 'pbs.tool.popup.open', function() {
			popup.style.display = '';
		}.bind(this));
	},

	hidePicker: function() {
		this.el.querySelector('.pbs-color-popup').style.display = '';
	},

	mouseenter: function() {
		if ( this.optionSettings.mouseenter ) {
			this.optionSettings.mouseenter( this.model.get('element'), this );
		}
		// this._tooltipUpdaterInterval = setInterval( this.updateTooltip.bind(this), 100 );
	},

	mouseleave: function() {
		if ( this.optionSettings.mouseleave ) {
			this.optionSettings.mouseleave( this.model.get('element'), this );
		}
		// clearInterval( this._tooltipUpdaterInterval );
	},

	mousedownPicker: function() {
        ContentTools.EditorApp.get().history.stopWatching();
	},

	mouseupPicker: function() {
        ContentTools.EditorApp.get().history.watch();
	}
});


PBSOption.ColorButton = PBSOption.Color.extend({});


PBSOption.Select = PBSBaseView.extend({
	template: wp.template( 'pbs-option-select' ),

	events: {
		'change select' : 'selectChanged'
	},

	initialize: function(options) {
		PBSBaseView.prototype.initialize.call( this, options );

		this.listenTo( this.model, 'change', this.render );
		if ( this.optionSettings.value ) {
			this.model.set( this.optionSettings.id, this.optionSettings.value( this.model.get('element') ) );
		} else {
			var value = this.model.element.model.attributes[ this.optionSettings.id ] || '';
			this.model.set( this.optionSettings.id, value );
		}
	},

	render: function() {
		var data = _.extend( {}, this.model.attributes, this.optionSettings );
		if ( this.optionSettings.value ) {
			data.value = this.optionSettings.value( this.model.get('element' ), this );
		} else {
			data.value = this.model.element.model.attributes[ this.optionSettings.id ] || '';
		}
	    this.$el.html( this.template( data ) );
	    return this;
	},

	selectChanged: function(e) {
		if ( this.optionSettings.change ) {
			this.optionSettings.change( this.model.get('element'), e.target.value, this );
		}
		this.model.set( this.optionSettings.id, e.target.value );
		wp.hooks.doAction( 'pbs.option.changed' );
	}
});


PBSOption.Checkbox = PBSBaseView.extend({
	template: wp.template( 'pbs-option-checkbox' ),

	events: {
		'change input' : 'selectChanged'
	},

	initialize: function(options) {
		PBSBaseView.prototype.initialize.call( this, options );

		if ( typeof this.optionSettings.checked === 'undefined' ) {
			this.optionSettings.checked = true;
		}

		this.listenTo( this.model, 'change', this.render );
		if ( this.optionSettings.value ) {
			this.model.set( this.optionSettings.id, this.optionSettings.value( this.model.get('element') ) );
		}
	},

	render: function() {
		var data = _.extend( {}, this.model.attributes, this.optionSettings );
		data.value = '';

		if ( this.optionSettings.value ) {
			data.value = this.optionSettings.value( this.model.get('element' ) );
		} else if ( this.optionSettings.id ) {
			data.value = this.model.get( this.optionSettings.id );
		}

		// Add the template if it doesn't exist yet.
		if ( ! this.$el.html() ) {
    		this.$el.html( this.template( data ) );
		} else {
			this.$el.find( 'input[type="checkbox"]' )[0].checked = data.value === this.optionSettings.checked;
		}
	    return this;
	},

	selectChanged: function(e) {
		var value = false;
		if ( this.optionSettings.unchecked ) {
			value = this.optionSettings.unchecked;
		}
		if ( e.target.checked ) {
			value = true;
			if ( this.optionSettings.checked ) {
				value = this.optionSettings.checked;
			}
		}
		if ( this.optionSettings.change ) {
			this.optionSettings.change( this.model.get('element'), value, this );
		}

		this.model.set( this.optionSettings.id, value );
		wp.hooks.doAction( 'pbs.option.changed' );
	},

	click: function(e) {
		if ( this.optionSettings.click ) {
			this.optionSettings.click( this.model.get('element'), e.target.value );
		}
	}
});


PBSOption.Text = PBSBaseView.extend({
	template: wp.template( 'pbs-option-text' ),

	events: {
		'change input' : 'selectChanged',
		'keyup input' : 'selectChanged',
		'click input' : 'click'
	},

	initialize: function(options) {
		PBSBaseView.prototype.initialize.call( this, options );

		this.listenTo( this.model, 'change', this.render );
		if ( this.optionSettings.value ) {
			this.model.set( this.optionSettings.id, this.optionSettings.value( this.model.get('element') ) );
		}
	},

	render: function() {
		var data = _.extend( {}, this.model.attributes, this.optionSettings );
		data.value = '';

		if ( this.optionSettings.value ) {
			data.value = this.optionSettings.value( this.model.get('element' ) );
		} else if ( this.optionSettings.id ) {
			data.value = this.model.get( this.optionSettings.id );
		}

		// Add the template if it doesn't exist yet.
		if ( ! this.$el.html() ) {
	    	this.$el.html( this.template( data ) );
		// If it exists, only update the value so that we don't lose focus on the field.
		} else if ( this.$el.find( 'input[type="text"]' ).val() !== data.value ) {
			this.$el.find( 'input[type="text"]' ).val( data.value );
		}
	    return this;
	},

	selectChanged: function(e) {
		if ( this.optionSettings.change ) {
			this.optionSettings.change( this.model.get('element'), e.target.value, this );
		}
		this.model.set( this.optionSettings.id, e.target.value );
		wp.hooks.doAction( 'pbs.option.changed' );
	},

	click: function(e) {
		if ( this.optionSettings.click ) {
			this.optionSettings.click( this.model.get('element'), e.target.value );
		}
	}
});



PBSOption.Textarea = PBSOption.Text.extend({
	template: wp.template( 'pbs-option-textarea' ),

	events: {
		'change textarea' : 'selectChanged',
		'keyup textarea' : 'selectChanged',
		'click textarea' : 'click'
	}
} );


PBSOption.Number = PBSOption.Text.extend( {
	template: wp.template( 'pbs-option-number' ),

	render: function() {

		var input;
		if ( this.$el.html() ) {

			if ( this.optionSettings.value ) {
				var value = this.optionSettings.value( this.model.get('element' ) );
				var slider = this.$el.find( '.pbs-option-number-slider' );
				input = this.$el.find( 'input' );

				if ( slider.slider( 'value' ).toString() !== value.toString() ) {
					slider.slider( 'value', value );
				}
				input.val( value );
			}

			return this;
		}

		PBSOption.Number.__super__.render.call( this );

		input = this.$el.find( 'input' );
		this.$el.find( '.pbs-option-number-slider' ).slider({
			max: parseFloat( input.attr( 'max' ) ),
			min: parseFloat( input.attr( 'min' ) ),
			step: parseFloat( input.attr( 'step' ) ),
			value: input.val(),
			animate: 'fast',
			change: function( event, ui ) {
				clearTimeout( this._changeTimeout );
				this._changeTimeout = setTimeout( function( ui ) {
					var input = this.$el.find( 'input' );
					if ( ui.value !== input.val() ) {
						input.val( ui.value ).trigger( 'change' );
					}
				}.bind( this, ui ), 60 );
			}.bind( this ),
			slide: function( event, ui ) {
				clearTimeout( this._changeTimeout );
				this._changeTimeout = setTimeout( function( ui ) {
					var input = this.$el.find( 'input' );
					if ( ui.value !== input.val() ) {
						input.val( ui.value ).trigger( 'change' );
					}
				}.bind( this, ui ), 60 );
			}.bind( this )
		}).disableSelection();

		return this;
	},

	selectChanged: function( e ) {
		PBSOption.Number.__super__.selectChanged.call( this, e );

		var slider = this.$el.find( '.pbs-option-number-slider' );
		var input = this.$el.find( 'input' );
		var inputVal = input.val();

		if ( e.type === 'keyup' && inputVal !== '' ) {
			if ( slider.slider( 'value' ).toString() !== input.val().toString() ) {
				slider.slider( 'value', input.val() );
			}
		}

		if ( inputVal === '' ) {
			input.val( '' );
		}

		if ( this.optionSettings.change ) {
			this.optionSettings.change( this.model.get('element'), inputVal, this );
		}
		wp.hooks.doAction( 'pbs.option.changed' );
	}
} );


PBSOption.Image = PBSOption.Text.extend( {
	template: wp.template( 'pbs-option-image' ),

	multiple: false,

	events: {
		'change input' : 'selectChanged',
		'click .pbs-image-preview' : 'openImagePicker',
		'click .pbs-image-preview-remove': 'removeImage'
	},

	render: function() {
		var ajaxToGetImageURL = false;
		if ( ! this.$el.html() ) {
			ajaxToGetImageURL = true;
		}

		var ret = PBSOption.Image.__super__.render.call( this );

		// First load of the attribute.
		if ( ajaxToGetImageURL ) {

			// This will hold the imageIDs that we don't have URLs to.
			var imageIDsToAjaxLoad = '';

			// The attribute is an attachment ID, so we don't have the actual
			// URL of the image. Check if we have one already in memory.
			this.$el.find( '.pbs-image-preview:not([data-id=""])' ).each( function() {
				var imageID = this.getAttribute( 'data-id' );
				if ( ! imageID.match( /^[\d,]+$/ ) ) {
					this.style.backgroundImage = imageID.match( /url\(/ ) ? imageID : 'url(' + imageID + ')';
					return;
				}
				if ( PBSOption.Image._imageURLs.hasOwnProperty( imageID ) ) {
					this.style.backgroundImage = 'url(' + PBSOption.Image._imageURLs[ imageID ] + ')';
				} else {
					imageIDsToAjaxLoad += imageIDsToAjaxLoad ? ',' : '';
					imageIDsToAjaxLoad += imageID;
				}
			} );

			// Use Ajax to get the image URLs of the attachment IDs that we
			// don't have the URLs of yet.
			if ( imageIDsToAjaxLoad ) {
				PBSOption.Image.doAjaxToGetImageURLs( imageIDsToAjaxLoad );
			}

		}

		return ret;
	},

	openImagePicker: function() {
		var frame = wp.media( {
			title: pbsParams.labels.s_attribute.replace( '%s', this.optionSettings.name ),
			multiple: this.multiple,
			library: { type: 'image' },
			button : { text : pbsParams.labels.select_image }
		});

		frame.on( 'open', function() {
			var imageIDs = this.model.get( this.optionSettings.id ) || '';
			imageIDs = imageIDs.split( ',' );
			var selection = frame.state().get( 'selection' );
			for ( var i = 0; i < imageIDs.length; i++ ) {
				var attachment = wp.media.attachment( imageIDs[ i ] );
				selection.add( attachment ? [ attachment ] : [] );
			}
		}.bind( this ) );

		// get the url when done
		frame.on('select', function() {
			var selection = frame.state().get( 'selection' );
			var value = '';

			// Remove all preview images.
			this.$el.find( '.pbs-image-preview' ).remove();

			var attachmentURLs = [];
			var attachmentIDs = [];
			selection.each( function( attachment ) {
				if ( typeof attachment.attributes.sizes === 'undefined' ) {
					return;
				}

				var image = attachment.attributes.sizes.full;
				if ( typeof attachment.attributes.sizes.medium !== 'undefined' ) {
					image = attachment.attributes.sizes.medium;
				}

				// Add preview images for each selected image.
				jQuery( '<div></div>' )
					.addClass( 'pbs-image-preview' )
					.css( 'backgroundImage', 'url(' + image.url + ')' )
					.attr( 'data-id', attachment.id )
					.append( jQuery( '<div></div>' ).addClass( 'pbs-image-preview-remove' ) )
					.appendTo( this.$el );

				attachmentURLs.push( attachment.attributes.sizes.full.url );
				attachmentIDs.push( attachment.id );

				value += value ? ',' : '';
				value += attachment.id;

				// Keep the image preview URL in memory for future renders.
				PBSOption.Image._imageURLs[ attachment.id ] = image.url;

			}.bind( this ) );

			// Set the new image value.
			this.model.set( this.optionSettings.id, value );
			wp.hooks.doAction( 'pbs.option.changed' );

			if ( this.optionSettings.change ) {
				this.optionSettings.change( this.model.get('element'), attachmentIDs, attachmentURLs, this );
			}

			frame.off('select');
		}.bind( this ) );

		// open the uploader
		frame.open();
		return false;
	},

	removeImage: function(e) {

		var value = '', removeMe = e.target.parentNode.getAttribute( 'data-id' );

		var attachmentIDs = [];

		if ( this.multiple ) {
			this.$el.find( '.pbs-image-preview' ).each( function() {
				if ( this.getAttribute( 'data-id' ) !== removeMe ) {
					value += value ? ',' : '';
					value += this.getAttribute( 'data-id' );

					attachmentIDs.push( this.getAttribute( 'data-id' ) );
				}
			} );
		}
		e.target.parentNode.parentNode.removeChild( e.target.parentNode );

		if ( ! this.multiple || ( this.multiple && ! this.$el.find( '.pbs-image-preview' ).length ) ) {
			jQuery( '<div></div>' )
				.addClass( 'pbs-image-preview' )
				.attr( 'data-id', '' )
				.appendTo( this.$el );
		}

		this.model.set( this.optionSettings.id, value );
		wp.hooks.doAction( 'pbs.option.changed' );

		if ( this.optionSettings.remove ) {
			this.optionSettings.remove( this.model.get('element'), attachmentIDs, this );
		}

		return false;
	}
} );


// This contains imageURLs per attachment ID that we have gotten through
// the course of editing, remember them so as not to re-get them during
// the entire editing session.
PBSOption.Image._imageURLs = {};


// This is called to get the image URLs from a given set of
// comma separated attachment IDs.
PBSOption.Image.doAjaxToGetImageURLs = function( imageIDs ) {
	if ( typeof PBSOption.Image._imageIDsToAjax === 'undefined' ) {
		PBSOption.Image._imageIDsToAjax = '';
	}

	if ( ! imageIDs.match( /^[\d,]+$/ ) ) {
		return;
	}

	PBSOption.Image._imageIDsToAjax += PBSOption.Image._imageIDsToAjax ? ',' : '';
	PBSOption.Image._imageIDsToAjax += imageIDs;

	// Do this in a timeout to only do one ajax at a time for faster querying.
	clearTimeout( PBSOption.Image._doAjaxToGetImageURLsTimeout );
	PBSOption.Image._doAjaxToGetImageURLsTimeout = setTimeout( function() {
		PBSOption.Image._doAjaxToGetImageURLs();
	}, 50 );
};
PBSOption.Image._doAjaxToGetImageURLs = function() {

	var imageIDs = PBSOption.Image._imageIDsToAjax || '';
	imageIDs = imageIDs.split( ',' );
	for ( var i = 0; i < imageIDs.length; i++ ) {
		jQuery( '.pbs-tool-option .pbs-image-preview[data-id=' + imageIDs[ i ] + ']' ).addClass( 'pbs-loading' );
	}

	var payload = new FormData();
	payload.append( 'action', 'pbs_get_attachment_urls' );
	payload.append( 'image_ids', PBSOption.Image._imageIDsToAjax );
	payload.append( 'nonce', pbsParams.nonce );

	var request = new XMLHttpRequest();
	request.open('POST', pbsParams.ajax_url );

	request.onload = function() {
		var i, response;
		if (request.status >= 200 && request.status < 400) {
			try {
				response = JSON.parse( request.responseText );

				// The response is an object of IDs => URLs.
				for ( i = 0; i < imageIDs.length; i++ ) {
					if ( typeof response[ imageIDs[ i ] ] !== 'undefined' ) {

						// Add the background image.
						jQuery( '.pbs-tool-option .pbs-image-preview[data-id=' + imageIDs[ i ] + ']' ).css( 'backgroundImage', 'url(' + response[ imageIDs[ i ] ] + ')' );

						// Keep the image for future use.
						PBSOption.Image._imageURLs[ imageIDs[ i ] ] = response[ imageIDs[ i ] ];

					} else {
						// We didn't have an image for this image ID.
						jQuery( '.pbs-tool-option .pbs-image-preview[data-id=' + imageIDs[ i ] + ']' ).addClass( 'pbs-ajax-error' );
					}
				}

			} catch (e) {
				// Add error class.
				for ( i = 0; i < imageIDs.length; i++ ) {
					jQuery( '.pbs-tool-option .pbs-image-preview[data-id=' + imageIDs[ i ] + ']' ).addClass( 'pbs-ajax-error' );
				}
			}
		}

		// Remove the loading class.
		for ( i = 0; i < imageIDs.length; i++ ) {
			jQuery( '.pbs-tool-option .pbs-image-preview[data-id=' + imageIDs[ i ] + ']' ).removeClass( 'pbs-loading' );
		}

		// When we're done, make the image IDs blank for future requests.
		PBSOption.Image._imageIDsToAjax = '';
	};

	// There was a connection error of some sort.
	request.onerror = function() {
		// Remove the loading class.
		for ( var i = 0; i < imageIDs.length; i++ ) {
			jQuery( '.pbs-tool-option .pbs-image-preview[data-id=' + imageIDs[ i ] + ']' ).removeClass( 'pbs-loading' );
		}

		// When we're done, make the image IDs blank for future requests.
		PBSOption.Image._imageIDsToAjax = '';
	};
	request.send( payload );
};


PBSOption.Images = PBSOption.Image.extend( {
	multiple: 'toggle'
} );

PBSOption.MarginsAndPaddings = Backbone.View.extend({
	template: wp.template( 'pbs-option-margins-and-paddings' ),

	events: {
		'keyup input' : 'inputChanged',
		'change input': 'inputChanged',
		'blur input': 'fixBlankValue',
		'keydown input': 'incrementDecrementValue'
	},

	initialize: function(options) {
		// _.extend(this, _.pick(options, 'optionSettings'));
		this.optionSettings = _.clone( options.optionSettings );
		this.listenTo( this.model, 'change', this.render );
	},

	render: function() {

		var element = this.model.get('element')._domElement;
		var styles = window.getComputedStyle( element );
		var stylesToAdd = [
			'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
			'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
			'padding-top', 'padding-right', 'padding-bottom', 'padding-left'
		];

		for ( var i = 0; i < stylesToAdd.length; i++ ) {
			// Use the inline style if set, else use the computed style.
			if ( element.style[ stylesToAdd[ i ] ] ) {
				this.model.set( stylesToAdd[ i ], element.style[ stylesToAdd[ i ] ], { silent: true } );
			} else {
				this.model.set( stylesToAdd[ i ], styles[ stylesToAdd[ i ] ], { silent: true } );
			}
		}

		// Only disable stuff for the currently selected row, the width data comes from the main/parent row.
		if ( element.getAttribute('data-width') === 'full-width-retain-content' || element.getAttribute('data-width') === 'full-width' ) {
			if ( this.model.get('width') === 'full-width-retain-content' ) {
				this.model.set('disableHorizontalPaddings', true );
			} else {
				this.model.unset('disableHorizontalPaddings' );
			}
			if ( this.model.get('width') === 'full-width-retain-content' || this.model.get('width') === 'full-width' ) {
				this.model.set('disableHorizontalMargins', true );
			} else {
				this.model.unset('disableHorizontalMargins' );
			}
		} else {
			this.model.unset('disableHorizontalPaddings' );
			this.model.unset('disableHorizontalMargins' );
		}

		var data = _.extend( {}, this.model.attributes, this.optionSettings );
	    this.$el.html( this.template( data ) );
	    return this;
	},

	inputChanged: function(e) {
		var value = e.target.value;
		var styleName = e.target.getAttribute('data-style');
		if ( ! isNaN( value ) && value.trim() !== '' ) {
			value = value + 'px';
		}
		this.model.get('element').style( styleName, value );
		this.model.set( styleName, value, {silent: true} );
	},

	incrementDecrementValue: function(e) {
		var regex = /^(\-?\d+)([^\d]*)$/;
		var match = regex.exec( e.target.value );
		if ( match && ( e.which === 38 || e.which === 40 ) ) {
			if ( e.which === 38 ) {
				match[1]++;
				if ( e.ctrlKey || e.metaKey || e.shiftKey ) {
					match[1]++;
					match[1]++;
					match[1]++;
					match[1]++;
				}
			} else {
				match[1]--;
				if ( e.ctrlKey || e.metaKey || e.shiftKey ) {
					match[1]--;
					match[1]--;
					match[1]--;
					match[1]--;
				}
			}
			e.target.value = match[1] + match[2];

			// Fire the change
			e.target.dispatchEvent( new CustomEvent( 'change' ) );
		}
	},

	fixBlankValue: function(e) {
		// Update the text input.
		var style = e.target.getAttribute('data-style');
		var styleCamel = style.replace( /-([a-z])/g, function (m, w) {
		    return w.toUpperCase();
		});

		// Get the inline style.
		var cssValue = this.model.get('element')._domElement.style[ styleCamel ];

		// If inline style isn't available, get the computed style.
		if ( ! cssValue ) {
			var values = window.getComputedStyle( this.model.get('element')._domElement );
			cssValue = values[ style ];
		}

		e.target.value = cssValue;
		this.model.set( style, cssValue, {silent: true} );
	}

});



PBSOption.CustomClass = Backbone.View.extend({
	template: wp.template( 'pbs-option-text' ),

	events: {
		'change input' : 'selectChanged',
		'keyup input' : 'selectChanged'
	},

	getClasses: function() {
		var element = this.model.get('element');
		if ( typeof element.attr( 'class' ) === 'undefined' ) {
			return '';
		}

		var classes = element.attr( 'class' );

		// Allow regex matched classes from being edited.
		if ( this.optionSettings.ignoredClasses ) {
			var currentClasses = classes.trim().split( ' ' );
			classes = '';
			this.staticClasses = [];
			var staticClassRegex = new RegExp( this.optionSettings.ignoredClasses, 'i' );
			for ( var i = 0; i < currentClasses.length; i++ ) {
				if ( staticClassRegex.test( currentClasses[ i ] ) ) {
					this.staticClasses.push( currentClasses[ i ] );
				} else {
					classes += classes.length === 0 ? '' : ' ';
					classes += currentClasses[ i ];
				}
			}
		}

		return classes;
	},

	change: function( element, value ) {
		var i;
		value = value.toLowerCase();

		// Remove all class names.
		if ( typeof element.attr( 'class' ) !== 'undefined' ) {
			var currentClasses = element.attr( 'class' ).split( ' ' );
			for ( i = 0; i < currentClasses.length; i++ ) {
				element.removeCSSClass( currentClasses[ i ] );
			}
		}

		// Add the new class names.
		if ( value.trim() !== '' ) {
			var newClasses = value.trim().split( ' ' );
			for ( i = 0; i < newClasses.length; i++ ) {
				element.addCSSClass( newClasses[ i ] );
			}
		}

		// If there are regex matched class names, add them again.
		if ( this.staticClasses.length ) {
			for ( i = 0; i < this.staticClasses.length; i++ ) {
				element.addCSSClass( this.staticClasses[ i ] );
			}
		}

		element.taint();
	},

	initialize: function(options) {
		// _.extend(this, _.pick(options, 'optionSettings'));
		this.optionSettings = _.clone( options.optionSettings );
		this.staticClasses = [];

		if ( this.optionSettings.initialize ) {
			this.optionSettings.initialize( this.model.get('element'), this );
		}

		this.listenTo( this.model, 'change', this.render );
		this.model.set( this.optionSettings.id, this.getClasses( this.model.get('element') ) );
	},

	render: function() {
		var data = _.extend( {}, this.model.attributes, this.optionSettings );
		data.value = this.getClasses( this.model.get('element' ) );
	    this.$el.html( this.template( data ) );
	    return this;
	},

	selectChanged: function(e) {
		this.change( this.model.get('element'), e.target.value );
		this.model.set( this.optionSettings.id, e.target.value );
	}
});


PBSOption.CustomID = Backbone.View.extend({
	template: wp.template( 'pbs-option-text' ),

	events: {
		'change input' : 'selectChanged',
		'keyup input' : 'selectChanged'
	},

	getID: function() {
		var element = this.model.get('element');
		if ( typeof element.attr( 'id' ) === 'undefined' ) {
			return '';
		}

		return element.attr( 'id' );
	},

	change: function( element, value ) {
		element.attr( 'id', value );
		element.taint();
	},

	initialize: function(options) {
		// _.extend(this, _.pick(options, 'optionSettings'));
		this.optionSettings = _.clone( options.optionSettings );
		this.staticClasses = [];

		if ( this.optionSettings.initialize ) {
			this.optionSettings.initialize( this.model.get('element'), this );
		}

		this.listenTo( this.model, 'change', this.render );
		this.model.set( this.optionSettings.id, this.getID( this.model.get('element') ) );
	},

	render: function() {
		var data = _.extend( {}, this.model.attributes, this.optionSettings );
		data.value = this.getID( this.model.get('element' ) );
	    this.$el.html( this.template( data ) );
	    return this;
	},

	selectChanged: function(e) {
		this.change( this.model.get('element'), e.target.value );
		this.model.set( this.optionSettings.id, e.target.value );
	}
});



PBSOption.Button2 = PBSBaseView.extend({
	template: wp.template( 'pbs-option-button2' ),

	events: {
		'click input[type="button"]' : 'click'
	},

	// initialize: function(options) {
	// 	// this.optionSettings = _.clone( options.optionSettings );
	//
	// 	if ( this.optionSettings.initialize ) {
	// 		this.optionSettings.initialize( this.model.get('element'), this );
	// 	}
	// },

	render: function() {

		// Add the template if it doesn't exist yet.
		if ( ! this.$el.html() ) {
			var data = _.extend( {}, this.model.attributes, this.optionSettings );
	    	this.$el.html( this.template( data ) );
		}

		if ( this.optionSettings.disabled ) {
			if ( ! this.optionSettings.disabled( this.model.get('element'), this ) ) {
				this.$el.find( '[type="button"]' ).attr( 'disabled', 'disabled' );
			} else {
				this.$el.find( '[type="button"]' ).removeAttr( 'disabled' );
			}
		}

	    return this;
	},

	click: function(e) {
		if ( this.optionSettings.click ) {
			this.optionSettings.click( this.model.get('element'), e.target.value, this );
		}
	}
});



/* globals PBSEditor, pbsParams */



var options = [];



options.push(

	{

		'name': pbsParams.labels.icon_frame_change_title,

		'button': pbsParams.labels.pick_an_icon,

		'type': 'button2',

		'group': pbsParams.labels.general,

		'click': function( element ) {

			PBSEditor.iconFrame.open({

				title: pbsParams.labels.choose_icon,

				button: pbsParams.labels.choose_icon,

				successCallback: function( frameView ) {

					element.change( frameView.selected.firstChild );

				}

			});

		}

	},

	{

		'name': pbsParams.labels.icon_color,

		'type': 'color',

		'group': pbsParams.labels.general,

		'value': function( element ) {

			return element._domElement.style.fill;

		},

		'change': function( element, value ) {

			element.style( 'fill', value );

		}

	}

);





window.pbsAddInspector( 'Icon', {

	'label': pbsParams.labels.icon,

	'footer': pbsParams.labels.icon_lite_footer, // LITE-ONLY

	'onMouseEnter': function( element ) {

		element._addCSSClass( 'ce-element--over' );

	},

	'onMouseLeave': function( element ) {

		element._removeCSSClass( 'ce-element--over' );

	},

	'options': options

} );


/* globals pbsParams */

window.pbsAddInspector('pbs_widget', {
	'is_shortcode': true,
	'label': pbsParams.labels.widget,
	'desc': pbsParams.labels.widget_inspector_desc,
	'options': [
		{
			'type': 'widgetSettings'
		}
	]
});
//
//
// window.pbsAddInspector('divider_advanced', {
// 	'label': 'Champion - Advanced Divider Line',
// 	'desc': 'A more customizable divider.',
// 	'options': [
// 		{
// 			'name': 'Color',
// 			'type': 'color',
// 			'id': 'color',
// 			'desc': 'The divider&apos;s color',
// 			'default': ''
// 		},
// 		{
// 			'name': 'Top Padding',
// 			'type': 'text',
// 			'id': 'paddingtop',
// 			'desc': 'in px',
// 			'default': '20'
// 		},
// 		{
// 			'name': 'Bottom Padding',
// 			'type': 'text',
// 			'id': 'paddingbottom',
// 			'desc': 'in px',
// 			'default': 'false'
// 		},
// 		{
// 			'name': 'Thickness',
// 			'type': 'text',
// 			'id': 'thickness',
// 			'desc': 'in px',
// 			'default': 'false'
// 		},
// 		{
// 			'name': 'Width',
// 			'type': 'text',
// 			'id': 'width',
// 			'desc': 'add units, e.g. px or %',
// 			'default': 'false'
// 		},
// 		{
// 			'name': 'Go to top link',
// 			'type': 'checkbox',
// 			'id': 'top',
// 			'checked': 'true',
// 			'unchecked': 'false',
// 			'default': 'false'
// 		}
// 	]
// });
//
// window.pbsAddInspector('divider_arrow', {
// 	'label': 'Champion - Divider Arrow',
// 	'desc': 'A customizable divider with arrows.',
// 	'options': [
// 		{
// 			'name': 'Color',
// 			'type': 'color',
// 			'id': 'color',
// 			'desc': 'The divider&apos;s color',
// 			'group': 'Colors',
// 			'default': ''
// 		},
// 		{
// 			'name': 'Background Color',
// 			'type': 'color',
// 			'id': 'bgcolor',
// 			'desc': 'The divider&apos;s background color',
// 			'group': 'Colors',
// 			'default': ''
// 		},
// 		{
// 			'name': 'Arrow Width Left',
// 			'type': 'text',
// 			'id': 'widthleft',
// 			'desc': 'in px',
// 			'group': 'Arrow',
// 			'default': ''
// 		},
// 		{
// 			'name': 'Arrow Width Right',
// 			'type': 'text',
// 			'id': 'widthright',
// 			'desc': 'in px',
// 			'group': 'Arrow',
// 			'default': ''
// 		},
// 		{
// 			'name': 'Arrow Height',
// 			'type': 'text',
// 			'id': 'height',
// 			'desc': 'in px',
// 			'group': 'Arrow',
// 			'default': '30'
// 		},
// 		{
// 			'name': 'Arrow Horizontal Position',
// 			'type': 'text',
// 			'id': 'horizontal',
// 			'desc': 'add units, e.g. px or %',
// 			'group': 'Arrow',
// 			'default': ''
// 		},
// 		{
// 			'name': 'Arrow Offset',
// 			'type': 'text',
// 			'id': 'offset',
// 			'desc': 'in px',
// 			'group': 'Arrow',
// 			'default': ''
// 		},
// 		{
// 			'name': 'Arrow Type',
// 			'type': 'select',
// 			'id': 'arrow',
// 			'options': {
// 				'down': 'Down Arrow',
// 				'up': 'Up Arrow'
// 			},
// 			'desc': 'The direction of the arrow',
// 			'group': 'Arrow',
// 			'default': 'down'
// 		},
// 		{
// 			'name': 'Divider Line Thickness',
// 			'type': 'text',
// 			'id': 'thickness',
// 			'desc': 'in px',
// 			'group': 'Line',
// 			'default': ''
// 		},
// 		{
// 			'name': 'Divider Line Color',
// 			'type': 'color',
// 			'id': 'linecolor',
// 			'desc': '',
// 			'group': 'Line',
// 			'default': '',
// 			'depends': [
// 				{
// 					'id': 'thickness',
// 					'value': '__not_empty'
// 				}
// 			]
// 		},
// 		{
// 			'name': 'Optional Class',
// 			'type': 'text',
// 			'id': 'class',
// 			'desc': '',
// 			'group': 'Advanced',
// 			'default': ''
// 		},
// 		{
// 			'name': 'Visible Screen Size',
// 			'type': 'select',
// 			'id': 'visible',
// 			'options': {
// 				'all': 'All',
// 				'320': '0-320',
// 				'480': '0-480',
// 				'568': '0-568',
// 				'768': '0-768',
// 				'980': '0-980',
// 				'-480': '480-all',
// 				'-568': '568-all',
// 				'-768': '768-all',
// 				'-980': '980-all'
// 			},
// 			'desc': '',
// 			'group': 'Advanced',
// 			'default': 'all'
// 		}
// 	]
// });

/* globals pbsParams */

window.pbsAddInspector('pbs_sidebar', {
	'is_shortcode': true,
	'label': pbsParams.labels.sidebar,
	'desc': pbsParams.labels.sidebar_inspector_desc,
	'options': [
		{
			'type': 'select',
			'name': pbsParams.labels.select_a_sidebar,
			'id': 'id',
			'options': pbsParams.sidebar_list,
			'desc': pbsParams.sidebar_label_id
		}
	]
});



/* globals pbsParams, Color, ContentEdit */





var options = [];

options.push(

	{

		'name': pbsParams.labels.row_width,

		'desc': pbsParams.labels.desc_row_width,

		'type': 'select',

		'group': pbsParams.labels.general,

		'options': {

			'': pbsParams.labels.normal_width,

			'full-width-retain-content': pbsParams.labels.full_width_retained_content_width,

			'full-width': pbsParams.labels.full_width

		},

		'getRootRow': function( element ) {

			var rootRow = element;



			// Get the root row element, we can only set the root row as full width

			var currElem = element._domElement;

			while ( currElem && currElem._ceElement ) {

				if ( currElem.classList.contains( 'pbs-row' ) ) {

					rootRow = currElem._ceElement;

				}

				currElem = currElem.parentNode;

			}



			return rootRow;

		},

		'value': function ( element ) {

			return element._domElement.getAttribute( 'data-width' ) || '';

			// return wp.hooks.applyFilters( 'inspector.row.change_width.can_apply', true, element );

		},

		'render': function( element, view ) {

			// Get the root row element, we can only set the root row as full width.

			var rootRow = view.optionSettings.getRootRow( element );



			var val = rootRow._domElement.getAttribute('data-width');

			if ( ! val ) {

				val = '';

			}



			view.el.classList.remove('full');

			view.el.classList.remove('full-retain');

			if ( val === 'full-width' ) {

				view.el.classList.add('full');

			} else if ( val === 'full-width-retain-content' ) {

				view.el.classList.add('full-retain');

			}



			// Set the model width so other views can detect the value.

			view.model.set( view.optionSettings.id, val );

		},

		'change': function( element, value, view ) {

			// Get the root row element, we can only set the root row as full width.

			var rootRow = view.optionSettings.getRootRow( element );



			// var val = rootRow._domElement.getAttribute('data-width');

			// if ( ! val ) {

				// val = '';

			// }



			rootRow.style('margin-left', '');

			rootRow.style('margin-right', '');

			rootRow.style('padding-left', '');

			rootRow.style('padding-right', '');



			view.el.classList.remove('full');

			view.el.classList.remove('full-retain');

			// if ( window.PBSEditor.isCtrlDown && window.PBSEditor.isShiftDown ) {

				// val = '';

			// } else if ( window.PBSEditor.isCtrlDown ) {

			// 	if ( val === 'full-width' ) {

			// 		val = 'full-width-retain-content';

			// 		view.el.classList.add('full-retain');

			// 	} else if ( val === 'full-width-retain-content' ) {

			// 		val = '';

			// 	} else {

			// 		val = 'full-width';

			// 		view.el.classList.add('full');

			// 	}

			// } else {

				// if ( value === 'full-width' ) {

					// value = '';

				if ( value === 'full-width' ) {

					// value = 'full-width';

					view.el.classList.add( 'full' );

				} else if ( value === 'full-width-retain-content' ) {

					// value = 'full-width-retain-content';

					view.el.classList.add( 'full-retain' );

				}

			// }



			rootRow.attr( 'data-width', value );

			window._pbsFixRowWidth( rootRow._domElement );

			rootRow.taint();



			view.model.set( view.optionSettings.id, value );

		}

	},

	{

		'name': pbsParams.labels.full_height,

		'type': 'checkbox',

		'group': pbsParams.labels.general,

		'value': function( element ) {

			return element._domElement.style['min-height'] === '100vh';

		},

		'change': function( element, value ) {

			element.style( 'min-height', value ? '100vh' : '' );

		}

	},

	{

		'name': pbsParams.labels.background_color,

		'type': 'color',

		'group': pbsParams.labels.background,

		'initialize': function( element, view ) {

			view.listenTo( view.model, 'change:background-color', view.render );

		},

		'value': function( element ) {

			return element._domElement.style.backgroundColor || '';

		},

		'change': function( element, value ) {



			var bgImage = element._domElement.style['background-image'];

			var url = bgImage.match( /url\([^\)]+\)/i ) || '';



			element.style( 'background-color', value );



			// If there's a gradient, change that also.

			if ( bgImage.indexOf( 'gradient' ) !== -1 ) {

				element.style( 'background-image', 'linear-gradient(' + value + ', ' + value + '), ' + url );

			}

		}

	},

	{

		'name': pbsParams.labels.background_image,

		'type': 'image',

		'group': pbsParams.labels.background,

		'value': function( element ) {

			if ( element._domElement.style.backgroundImage ) {

				var matches = element._domElement.style.backgroundImage.match( /url\([^,$]+/ );

				if ( matches ) {

					return matches[0];

				}

				return element._domElement.style.backgroundImage;

			}

			return '';

		},

		'change': function( element, attachmentIDs, attachmentURLs ) {

			var backgrounds = '';

			for ( var i = 0; i < attachmentURLs.length; i++ ) {

				backgrounds += backgrounds ? ',' : '';

				backgrounds += 'url(' + attachmentURLs[ i ] + ')';

			}

			var background = element.style( 'background-image' );

			if ( background.match( /url\(/ ) ) {

				background = background.replace( /url\([^\)]+\)/, backgrounds );

				element.style( 'background-image', background );

			} else {

				element.style( 'background-image', backgrounds );

			}

		},

		'remove': function( element, attachmentIDs, view ) {

			element.style( 'background-image', '' );

			view.model.set( 'background-image', '' );

		}

	}

);



options.push(

	{

		'name': pbsParams.labels.border_style,

		'type': 'select',

		'group': pbsParams.labels.borders,

		'options': {

			'': pbsParams.labels.none,

			'solid': pbsParams.labels.solid,

			'dashed': pbsParams.labels.dashed,

			'dotted': pbsParams.labels.dotted

		},

		'value': function ( element ) {

			return element._domElement.style['border-style'];

		},

		'change': function( element, value, view ) {

			element.style( 'border-style', value );

			if ( value ) {

				if ( element._domElement.style['border-width'] === '' || element._domElement.style['border-width'] === 'transparent' ) {

					element.style( 'border-width', '1px' );

					view.model.set( 'border-width', '1' );

				}

				if ( element._domElement.style['border-color'] === '' || element._domElement.style['border-color'] === '0px' ) {

					element.style( 'border-color', '#000000' );

					view.model.set( 'border-color', '#000000' );

				}

			} else {

				element.style( 'border-width', '' );

				element.style( 'border-color', '' );

				view.model.set( 'border-width', '' );

				view.model.set( 'border-color', '' );

			}

		}

	},

	{

		'name': pbsParams.labels.border_color,

		'type': 'color',

		'group': pbsParams.labels.borders,

		'initialize': function( element, view ) {

			view.listenTo( view.model, 'change:border-color', view.render );

		},

		'value': function( element ) {

			return element._domElement.style.borderColor || '';

		},

		'change': function( element, value ) {

			element.style( 'border-color', value );

		}

	},

	{

		'name': pbsParams.labels.border_thickness,

		'type': 'number',

		'group': pbsParams.labels.borders,

		'step': '1',

		'min': '0',

		'max': '20',

		'initialize': function( element, view ) {

			view.listenTo( view.model, 'change:border-width', view.render );

		},

		'value': function( element ) {

			var size = parseInt( element._domElement.style['border-width'], 10 );

			if ( isNaN( size ) ) {

				return 0;

			}

			return size;

		},

		'change': function( element, value ) {

			element.style( 'border-width', value + 'px' );

		}

	},

	{

		'name': pbsParams.labels.border_radius,

		'type': 'number',

		'group': pbsParams.labels.borders,

		'step': '1',

		'min': '0',

		'max': '1000',

		'initialize': function( element ) {

			this.max = parseInt( parseInt( element._domElement.getBoundingClientRect().height, 10 ) / 2 + 1, 10 );

		},

		'value': function( element ) {

			var size = parseInt( element._domElement.style['border-radius'], 10 );

			if ( isNaN( size ) ) {

				return 0;

			}

			return size;

		},

		'change': function( element, value ) {

			element.style( 'border-radius', value + 'px' );

		}

	}

);



window.pbsAddInspector( 'DivRow', {

	'label': pbsParams.labels.row,

	'options': options

} );





/**

 * Remove other border styles on blur if the border style was removed.

 * We need to do this or else the border will come back when focusing again.

 */

window.addEventListener( 'DOMContentLoaded', function() {

	ContentEdit.Root.get().bind('blur', function (element) {



		var row = null;



		while ( element && element.constructor.name !== 'Region' ) {

			if ( element.constructor.name === 'DivRow' ) {

				row = element;

			}

			element = element.parent();

		}



		if ( row ) {

			if ( row.style( 'border-style' ) === 'none' ) {

				if ( row.style( 'border-width' ) !== '0px' ) {

					row.style( 'border-width', '' );

				}

				if ( row.style( 'border-color' ) !== '' ) {

					row.style( 'border-color', '' );

				}

			}

		}



	});

} );


/* globals pbsParams, Color, ContentEdit */

var options = [];
options.push(
	{
		'name': pbsParams.labels.background_color,
		'type': 'color',
		'group': pbsParams.labels.background,
		'initialize': function( element, view ) {
			view.listenTo( view.model, 'change:background-color', view.render );
		},
		'value': function( element ) {
			return element._domElement.style.backgroundColor || '';
		},
		'change': function( element, value ) {

			var bgImage = element._domElement.style['background-image'];
			var url = bgImage.match( /url\([^\)]+\)/i ) || '';

			element.style( 'background-color', value );

			// If there's a gradient, change that also.
			if ( bgImage.indexOf( 'gradient' ) !== -1 ) {
				element.style( 'background-image', 'linear-gradient(' + value + ', ' + value + '), ' + url );
			}
		}
	},
	{
		'name': pbsParams.labels.background_image,
		'type': 'image',
		'group': pbsParams.labels.background,
		'value': function( element ) {
			if ( element._domElement.style.backgroundImage ) {
				var matches = element._domElement.style.backgroundImage.match( /url\([^,$]+/ );
				if ( matches ) {
					return matches[0];
				}
				return element._domElement.style.backgroundImage;
			}
			return '';
		},
		'change': function( element, attachmentIDs, attachmentURLs ) {
			var backgrounds = '';
			for ( var i = 0; i < attachmentURLs.length; i++ ) {
				backgrounds += backgrounds ? ',' : '';
				backgrounds += 'url(' + attachmentURLs[ i ] + ')';
			}
			var background = element.style( 'background-image' );
			if ( background.match( /url\(/ ) ) {
				background = background.replace( /url\([^\)]+\)/, backgrounds );
				element.style( 'background-image', background );
			} else {
				element.style( 'background-image', backgrounds );
			}
		},
		'remove': function( element, attachmentIDs, view ) {
			element.style( 'background-image', '' );
			view.model.set( 'background-image', '' );
		}
	}
);
options.push(
	{
		'name': pbsParams.labels.border_style,
		'type': 'select',
		'group': pbsParams.labels.borders,
		'options': {
			'': pbsParams.labels.none,
			'solid': pbsParams.labels.solid,
			'dashed': pbsParams.labels.dashed,
			'dotted': pbsParams.labels.dotted
		},
		'value': function ( element ) {
			return element._domElement.style['border-style'];
		},
		'change': function( element, value, view ) {
			element.style( 'border-style', value );
			if ( value ) {
				if ( element._domElement.style['border-width'] === '' || element._domElement.style['border-width'] === 'transparent' ) {
					element.style( 'border-width', '1px' );
					view.model.set( 'border-width', '1' );
				}
				if ( element._domElement.style['border-color'] === '' || element._domElement.style['border-color'] === '0px' ) {
					element.style( 'border-color', '#000000' );
					view.model.set( 'border-color', '#000000' );
				}
			} else {
				element.style( 'border-width', '' );
				element.style( 'border-color', '' );
				view.model.set( 'border-width', '' );
				view.model.set( 'border-color', '' );
			}
		}
	},
	{
		'name': pbsParams.labels.border_color,
		'type': 'color',
		'group': pbsParams.labels.borders,
		'initialize': function( element, view ) {
			view.listenTo( view.model, 'change:border-color', view.render );
		},
		'value': function( element ) {
			return element._domElement.style.borderColor || '';
		},
		'change': function( element, value ) {
			element.style( 'border-color', value );
		}
	},
	{
		'name': pbsParams.labels.border_thickness,
		'type': 'number',
		'group': pbsParams.labels.borders,
		'step': '1',
		'min': '0',
		'max': '20',
		'initialize': function( element, view ) {
			view.listenTo( view.model, 'change:border-width', view.render );
		},
		'value': function( element ) {
			var size = parseInt( element._domElement.style['border-width'], 10 );
			if ( isNaN( size ) ) {
				return 0;
			}
			return size;
		},
		'change': function( element, value ) {
			element.style( 'border-width', value + 'px' );
		}
	},
	{
		'name': pbsParams.labels.border_radius,
		'type': 'number',
		'group': pbsParams.labels.borders,
		'step': '1',
		'min': '0',
		'max': '1000',
		'initialize': function( element ) {
			this.max = parseInt( parseInt( element._domElement.getBoundingClientRect().height, 10 ) / 2 + 1, 10 );
		},
		'value': function( element ) {
			var size = parseInt( element._domElement.style['border-radius'], 10 );
			if ( isNaN( size ) ) {
				return 0;
			}
			return size;
		},
		'change': function( element, value ) {
			element.style( 'border-radius', value + 'px' );
		}
	}
);


window.pbsAddInspector( 'DivCol', {
	'label': pbsParams.labels.column,
	'options': options
} );


/**
 * Remove other border styles on blur if the border style was removed.
 * We need to do this or else the border will come back when focusing again.
 */
window.addEventListener( 'DOMContentLoaded', function() {
	ContentEdit.Root.get().bind('blur', function (element) {

		var col = null;

		while ( element && element.constructor.name !== 'Region' ) {
			if ( element.constructor.name === 'DivCol' ) {
				col = element;
			}
			element = element.parent();
		}

		if ( col ) {
			if ( col.style( 'border-style' ) === 'none' ) {
				if ( col.style( 'border-width' ) !== '0px' ) {
					col.style( 'border-width', '' );
				}
				if ( col.style( 'border-color' ) !== '' ) {
					col.style( 'border-color', '' );
				}
			}
		}

	});
} );


/* globals pbsParams, ContentTools */

ContentTools.ToolboxUI.prototype.createShortcodeMappingOptions = function( shortcodeTag ) {

	var map = pbsParams.shortcode_mappings[ shortcodeTag ];

	var name = map.name;
	if ( ! name ) {
		name = shortcodeTag;
	}
	name = name.replace( /[-_]/g, ' ' ).replace( /\b[a-z]/g, function( letter ) {
		return letter.toUpperCase();
	});

	// Create the attribute objects.
	var i, opts, value, label, attributes = [], typesDone = [];
	for ( var attribute in map.attributes ) {
		var options = map.attributes[ attribute ];
		options.desc = options.description || '';
		options.id = options.attribute;

		// This is used to display get-the-premium version messages in sc map options.
		options.type_orig = options.type;
		options.first_of_type = typesDone.indexOf( options.type ) === -1;
		typesDone.push( options.type );

		// Iframes don't have attributes.
		if ( options.type === 'iframe' ) {
			options.attribute = '';
		}

		// Base the name of the attribute on the attribute itself if not available.
		if ( typeof options.name === 'undefined' || ! options.name ) {
			options.name = options.attribute;
			options.name = options.name.replace( /[-_]/g, ' ' ).replace( /\b[a-z]/g, function( letter ) {
				return letter.toUpperCase();
			});
		}

		// Lite version doesn't have a color option, but has one defined, force it.
		if ( pbsParams.is_lite ) {
			if ( 'color' === options.type ) {
				options.type = 'text';
			} else if ( 'dropdown_post' === options.type ) {
				options.type = 'text';
			} else if ( 'dropdown_post_type' === options.type ) {
				options.type = 'text';
			} else if ( 'boolean' === options.type ) {
				options.type = 'text';
			} else if ( 'number' === options.type ) {
				options.type = 'text';
			} else if ( 'dropdown' === options.type ) {
				options.type = 'text';
			} else if ( 'select' === options.type ) {
				options.type = 'text';
			} else if ( 'iframe' === options.type ) {
				// Don't support the iframe in lite versions.
				continue;
			}
		}

		if ( 'boolean' === options.type ) {
			options.type = 'checkbox';
			options.checked = options.extra_boolean_checked || 'true';
			options.unchecked = options.extra_boolean_unchecked || 'false';
		} else if ( 'number' === options.type ) {
			options.min = options.extra_num_min || 0;
			options.max = options.extra_num_max || 1000;
			options.step = options.extra_num_step || 1;
		} else if ( 'multicheck' === options.type ) {
			options.options = {};
			opts = options.extra_dropdown.split( /\n/ ) || {};
			for ( i = 0; i < opts.length; i++ ) {
				value = opts[ i ].substr( 0, opts[ i ].indexOf( ',' ) );
				label = opts[ i ].substr( opts[ i ].indexOf( ',' ) + 1 );
				options.options[ value ] = label;
			}
		} else if ( 'multicheck_post_type' === options.type ) {
			options.type = 'multicheck';
			options.options = pbsParams.post_types;
		} else if ( 'dropdown' === options.type ) {
			options.type = 'select';
			options.options = {
				'': '— ' + pbsParams.labels.select_one + ' —'
			};
			opts = options.extra_dropdown.split( /\n/ ) || {};
			for ( i = 0; i < opts.length; i++ ) {
				value = opts[ i ].substr( 0, opts[ i ].indexOf( ',' ) );
				label = opts[ i ].substr( opts[ i ].indexOf( ',' ) + 1 );
				options.options[ value ] = label;
			}
		} else if ( 'dropdown_post_type' === options.type ) {
			options.type = 'select';
			options.options = {
				'': '— ' + pbsParams.labels.select_a_post_type + ' —'
			};
			for ( i in pbsParams.post_types ) {
				options.options[ i ] = pbsParams.post_types[ i ];
			}
		} else if ( 'dropdown_post' === options.type ) {
			options.type = 'select_post';
			options.post_type = options.extra || 'post';
		} else if ( 'dropdown_db' === options.type ) {
			options.type = 'select_db';
			options.db_table = options.extra_db_table || 'posts';
			options.db_field_id = options.extra_db_value || 'ID';
			options.db_field_label = options.extra_db_label || 'post_title';
			options.db_where_column = options.extra_db_where_field;
			options.db_where_value = options.extra_db_where_value;
		} else if ( 'iframe' === options.type ) {
			options.url = options.extra_url;
			if ( ! options.url ) {
				continue;
			}
			options.button = options.extra_button || pbsParams.labels.open;
		} else if ( 'content' === options.type ) {
			options.type = 'textarea';
		}

		attributes.push( options );
	}

	// Add it in the inspector
	window.pbsAddInspector( shortcodeTag, {
		'is_shortcode': true,
		'label': name,
		'desc': map.description || '',
		'options': attributes
	});

};

/* globals google, pbsParams, PBSEditor */

var options = [];

options.push(
	{
		'name': pbsParams.labels.latitude_longitude_and_address,
		'type': 'text',
		'desc': pbsParams.labels.latitude_longitude_desc,
		'initialize': function( element, view ) {
			view.listenTo( view.model, 'change:data-center', view.render );
		},
		'value': function( element ) {
			return element.attr( 'data-center' );
		},
		'change': _.debounce( function( element, value, view ) {
			if ( element.attr( 'data-center' ) === value ) {
				return;
			}
			element.attr( 'data-center', value );

			view.$el.find( 'input' ).removeClass( 'pbs-option-error' );

			var center = value.trim() || '37.09024, -95.712891';

			// Remove all existing markers.
			if ( element._domElement.map.marker ) {
				element._domElement.map.marker.setMap( null );
				delete( element._domElement.map.marker );
			}

			var latLonMatch = center.match( /^([-+]?\d{1,2}([.]\d+)?)\s*,?\s*([-+]?\d{1,3}([.]\d+)?)$/ );
			if ( latLonMatch ) {
				element.attr( 'data-lat', latLonMatch[1] );
				element.attr( 'data-lng', latLonMatch[3] );
				center = { lat: parseFloat( latLonMatch[1] ), lng: parseFloat( latLonMatch[3] ) };
				element._domElement.map.setCenter( center );

				// Put back the map marker.
				if ( element.attr( 'data-marker-image' ) ) {
					element._domElement.map.marker = new google.maps.Marker({
						position: element._domElement.map.getCenter(),
						map: element._domElement.map,
						icon: element.attr( 'data-marker-image' )
					});
				} else if ( element.attr( 'data-marker' ) ) {
					element._domElement.map.marker = new google.maps.Marker({
						position: element._domElement.map.getCenter(),
						map: element._domElement.map
					});
				}

			} else {
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode( { 'address': center }, function( results, status ) {
					if ( status === google.maps.GeocoderStatus.OK ) {
						element.attr( 'data-lat', results[0].geometry.location.lat() );
						element.attr( 'data-lng', results[0].geometry.location.lng() );
						center = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() };
						element._domElement.map.setCenter( center );

						// Put back the map marker.
						if ( element.attr( 'data-marker-image' ) ) {
							element._domElement.map.marker = new google.maps.Marker({
								position: element._domElement.map.getCenter(),
								map: element._domElement.map,
								icon: element.attr( 'data-marker-image' )
							});
						} else if ( element.attr( 'data-marker' ) ) {
							element._domElement.map.marker = new google.maps.Marker({
								position: element._domElement.map.getCenter(),
								map: element._domElement.map
							});
						}
					} else {
						view.$el.find( 'input' ).addClass( 'pbs-option-error' );
					}
				});
			}
		}, 300 )
	},
	{
		'name': pbsParams.labels.map_controls,
		'type': 'checkbox',
		'value': function( element ) {
			return ! element._domElement.getAttribute( 'data-disable-ui' );
		},
		'change': function( element, value ) {
			element.attr( 'data-disable-ui', value ? '1' : '' );
			element._domElement.map.setOptions( { disableDefaultUI: ! value } );
		}
	},
	{
		'name': pbsParams.labels.map_marker,
		'type': 'checkbox',
		'value': function( element ) {
			return !! element._domElement.getAttribute( 'data-marker' );
		},
		'change': function( element, value ) {

			// Remove any existing map markers.
			if ( element._domElement.map.marker ) {
				element._domElement.map.marker.setMap( null );
				delete( element._domElement.map.marker );
			}

			if ( ! value ) {
				element.attr( 'data-marker', '' );
				element.attr( 'data-marker-image', '' );
			} else {
				element.attr( 'data-marker', '1' );

				// Add the marker.
				element._domElement.map.marker = new google.maps.Marker({
					position: element._domElement.map.getCenter(),
					map: element._domElement.map
				});
			}
		}
	}
);

window.pbsAddInspector( 'Map', {
 	'label': pbsParams.labels.map,
	'footer': pbsParams.is_lite ? pbsParams.labels.map_lite_footer : '',
 	'options': options
} );

/* globals pbsParams */

var options = [];

window.pbsAddInspector( 'Tabs', {
	'label': pbsParams.labels.tabs,
	'footer': pbsParams.is_lite ? pbsParams.labels.tabs_lite_footer : '',
	'options': options
} );


/* globals ContentEdit, pbsParams */


/**
 * These are all the common options.
 */
var options = [];


/**
 * Add all the options above to all the proper elements (not buttons, input fields, etc).
 */
for ( var i = 0; i < window.pbsElementsWithInspector.length; i++ ) {
	if ( ContentEdit[ window.pbsElementsWithInspector[ i ] ] ) {
		window.pbsAddInspector( window.pbsElementsWithInspector[ i ], {
			'options': options
		} );
	}
}

/* globals ContentTools, __extends */

/**
 * This serves as the base for all big element buttons
 */
ContentTools.Tools.ElementButton = ( function( _super ) {
	__extends( ElementButton, _super );

	function ElementButton() {
		return ElementButton.__super__.constructor.apply( this, arguments );
	}

	ElementButton.canApply = function() {
		return true;
    };

    ElementButton.isApplied = function() {
		return false;
    };

	return ElementButton;

} )( ContentTools.Tool );


// Stop add element buttons from being disabled.
(function() {
	var proxied = ContentTools.ToolUI.prototype.disabled;
	ContentTools.ToolUI.prototype.disabled = function(disabledState) {
		if ( this._domElement.classList.contains( 'pbs-tool-large' ) ) {
			return;
		}
		return proxied.call( this, disabledState );
    };

	var proxied2 = ContentTools.ToolUI.prototype._onMouseUp;
	ContentTools.ToolUI.prototype._onMouseUp = function(ev) {
		if ( this._domElement.classList.contains( 'pbs-tool-large' ) ) {
			this._mouseDown = false;
	        return this.removeCSSClass('ct-tool--down');
		}
		return proxied2.call( this, ev );
    };
})();


/**
 * Display element buttons as large buttons.
 */
(function() {
   var proxied = ContentTools.ToolUI.prototype.mount;
   ContentTools.ToolUI.prototype.mount = function( domParent, before ) {
	   var ret = proxied.call( this, domParent, before );

	   if ( this.tool.buttonName ) {
		   this._domElement.classList.add( 'pbs-tool-large' );
		   var label = document.createElement( 'div' );
		   label.classList.add( 'pbs-tool-title' );
		   label.textContent = this.tool.buttonName;
		   this._domElement.appendChild( label );
		   //
		//    if ( this.tool.premium && pbsParams.is_lite ) {
		// 	   this._domElement.classList.add( 'pbs-tool-is-premium' );
		// 	   var star = document.createElement( 'div' );
		// 	   star.classList.add( 'pbs-tool-premium' );
		// 	   this._domElement.appendChild( star );
		   //
		// 	   this._domElement.addEventListener( 'mouseover', function(ev) {
		// 		   ev.target.setAttribute( 'data-tooltip', 'Available only in Premium.' );
		// 	   }.bind(this) );
		// 	   this._domElement.addEventListener( 'click', function(ev) {
		// 		   var preview = document.createElement( 'DIV' );
		// 		   preview.innerHTML = wp.template( 'pbs-preview-premium-element' )( {
		// 			   'title': this.tool.title || this.tool.icon,
		// 			   'description': this.tool.description,
		// 			   'image': pbsParams.plugin_url + 'page_builder_sandwich/images/preview-' + this.tool.icon + '.gif'
		// 		   } );
		// 		   preview.addEventListener( 'click', function(ev) {
		// 			   if ( [ 'IMG', 'DIV' ].indexOf( ev.target.tagName ) !== -1 ) {
		// 				   preview.parentNode.removeChild( preview );
		// 			   }
		// 		   } );
		// 		   document.body.appendChild( preview );
		// 	   }.bind(this) );
		//    }
	   }

	   return ret;
   };
})();

/* globals ContentTools, ContentEdit, HTMLString, pbsParams */


/***************************************************************************
 * Allow headings inside divs
 ***************************************************************************/
ContentTools.Tools.Heading._canApply = ContentTools.Tools.Heading.canApply;
ContentTools.Tools.Heading.canApply = function(element, selection) {
	var origReturn = ContentTools.Tools.Heading._canApply( element, selection );
	if ( element.constructor.name === 'ListItemText' ) {
		return false;
	}
	if ( element.content !== void 0 && element.parent().tagName ) {
		return origReturn || element.parent().tagName() === 'div';
	}
	return origReturn;
};



/***************************************************************************
 * Applied state for the paragraph tool.
 ***************************************************************************/
ContentTools.Tools.Paragraph.isApplied = function(element) {
	return element.tagName() === this.tagName;
};



/***************************************************************************
 * Allow lists to be placed inside divs.
 ***************************************************************************/
ContentTools.Tools.UnorderedList.canApply = function(element, selection) {
	var ret = ContentTools.Tools.Heading1.canApply( element, selection );
   	if ( element.parent() ) {
		if ( element.parent().tagName ) {
	   		if ( element.parent().tagName() === 'li' ) {
	   			return true;
	   		}
		}
   	}
	return ret;
};
ContentTools.Tools.OrderedList.canApply = ContentTools.Tools.UnorderedList.canApply;


/***************************************************************************
 * Applied state for the list tools.
 ***************************************************************************/
ContentTools.Tools.UnorderedList.isApplied = function( element ) {
	if ( element.parent() ) {
		if ( element.parent().parent() ) {
			if ( element.parent().parent().tagName ) {
				if ( element.parent().parent().tagName() === this.listTag ) {
					return true;
				}
			}
		}
	}
	return false;
};
ContentTools.Tools.OrderedList.isApplied = ContentTools.Tools.UnorderedList.isApplied;


/***************************************************************************
 * Allow lists to be removed when clicking the list tool again.
 ***************************************************************************/

(function() {
	var proxied = ContentTools.Tools.UnorderedList.apply;
	ContentTools.Tools.UnorderedList.apply = function(element, selection, callback) {
		if ( this.isApplied( element ) ) {
			element.parent().unindent();

		// If the element has no content, then add the new element after it.
		} else if ( element.parent().type() !== 'ListItem' && ! element.content ) {
			var listItemText = new ContentEdit.ListItemText( '' );
			var listItem = new ContentEdit.ListItem();
			listItem.attach( listItemText );
			var list = new ContentEdit.List( this.listTag, {} );
			list.attach( listItem );
			element.parent().attach( list, element.parent().children.indexOf( element ) + 1 );
			listItemText.focus();
			return callback(true);

		} else {
			var ret = proxied.call( this, element, selection, callback );

			// Switching between numbered & bullet list does not refresh the inspector.
			// Trigger a focus on the element to refresh it.
			if ( element.parent() && element.parent().type() === 'ListItem' ) {
				ContentEdit.Root.get().trigger( 'focus', element );
			}

			return ret;
		}
	};
})();

(function() {
	var proxied = ContentTools.Tools.OrderedList.apply;
	ContentTools.Tools.OrderedList.apply = function(element, selection, callback) {
		if ( this.isApplied( element ) ) {
			element.parent().unindent();

		// If the element has no content, then add the new element after it.
		} else if ( element.parent().type() !== 'ListItem' && ! element.content ) {
			var listItemText = new ContentEdit.ListItemText( '' );
			var listItem = new ContentEdit.ListItem();
			listItem.attach( listItemText );
			var list = new ContentEdit.List( this.listTag, {} );
			list.attach( listItem );
			element.parent().attach( list, element.parent().children.indexOf( element ) + 1 );
			listItemText.focus();
			return callback(true);

		} else {
			var ret = proxied.call( this, element, selection, callback );

			// Switching between numbered & bullet list does not refresh the inspector.
			// Trigger a focus on the element to refresh it.
			if ( element.parent() && element.parent().type() === 'ListItem' ) {
				ContentEdit.Root.get().trigger( 'focus', element );
			}

			return ret;
		}
	};
})();


/***************************************************************************
 * Adjust the behavior of preformatted text to be able to be toggled.
 ***************************************************************************/
ContentTools.Tools.Preformatted.canApply = function(element, selection) {
	return ContentTools.Tools.Heading1.canApply( element, selection );
};

(function() {
	var proxied = ContentTools.Tools.Preformatted.apply;
	ContentTools.Tools.Preformatted.apply = function(element, selection, callback) {
		if ( this.isApplied( element ) ) {
			return;
		}

		// If the element has no content, then add the new element after it.
		if ( ! element.content ) {
			var heading = new ContentEdit.Text( this.tagName );
			element.parent().attach( heading, element.parent().children.indexOf( element ) + 1 );
			heading.focus();
			return callback(true);
		}

		return proxied.call( this, element, selection, callback );
	};
})();

ContentTools.Tools.Preformatted.isApplied = function(element) {
	return element.tagName() === this.tagName;
};




/***************************************************************************
 * Change Bold tool. Instead of just adding a `<b>` tag,
 * use font-weight styles.
 ***************************************************************************/
ContentTools.Tools.Bold.canApply = function(element, selection) {
	if ( ! element.content) {
	  return false;
	}
	return selection;
	// return selection && !selection.isCollapsed();
};

ContentTools.Tools.Bold.isApplied = function(element, selection) {
 	var from = 0, to = 0, _ref;
 	if (element.content === void 0 || !element.content.length()) {
 		return false;
 	}
 	if ( selection ) {
 		_ref = selection.get(), from = _ref[0], to = _ref[1];
 	}

 	// If nothing is selected, adjust the whole element
 	if ( from === to ) {
 		from = 0;
 		to = element.content.length();
 	}

 	var styledString = element.content.substring( from, to );
 	var fontWeight = styledString.getStyle( 'font-weight', element );

	// Support if formatted using `strong` & `b` tags.
	if ( styledString.hasTags( 'strong', true ) || styledString.hasTags( 'b', true ) ) {
		return true;
	}

	// Support numbered font-weights.
	var fontWeightNum = parseInt( fontWeight, 10 );
	if ( ! isNaN( fontWeightNum ) ) {
		return fontWeightNum > 400;
	}

 	return fontWeight === 'bold';
};

ContentTools.Tools.Bold.apply = function(element, selection, callback) {
 	this.tagName = 'span';

 	var from = 0, to = 0, _ref;
 	element.storeState();
 	if ( selection ) {
 		_ref = selection.get(), from = _ref[0], to = _ref[1];
 	}

 	// If nothing is selected, adjust the whole element
 	if ( from === to ) {
 		from = 0;
 		to = element.content.length();
 	}

 	// Get the current styles and add a font-weight
 	var styledString = element.content.substring(from, to);

	// Also support if stuff are bolded using `strong` & `b` tags.
	if ( styledString.hasTags( 'strong', true ) ) {
		element.content = element.content.unformat( from, to, new HTMLString.Tag( 'strong' ) );

	} else if ( styledString.hasTags( 'b', true ) ) {
		element.content = element.content.unformat( from, to, new HTMLString.Tag( 'b' ) );

	} else {

	 	var fontWeight = styledString.getStyle('font-weight', element );
	 	if ( ! fontWeight || fontWeight === 'normal' ) {
	 		fontWeight = 'bold';
		// If the font-weight is a number.
		} else if ( ! isNaN( parseInt( fontWeight, 10 ) ) ) {
			if ( parseInt( fontWeight, 10 ) <= 400 ) {
				fontWeight = 'bold';
			} else {
				fontWeight = 'normal';
			}
	 	} else {
	 		fontWeight = 'normal';
	 	}

		// For normal weights, use the original weight value if it's below 0-300.
		if ( fontWeight === 'normal' ) {
			var defaultFontWeight = element.defaultStyle( 'font-weight' );
			if ( ! isNaN( parseInt( defaultFontWeight, 10 ) ) ) {
				if ( parseInt( defaultFontWeight, 10 ) < 400 ) {
					fontWeight = defaultFontWeight;
				}
			}
		}

	 	var newStyle = { 'font-weight': fontWeight };

	 	element.content = element.content.style( from, to, element._tagName, newStyle );

	}

 	element.updateInnerHTML();
 	element.taint();
 	element.restoreState();
 	return callback(true);
};




/***************************************************************************
 * Change Italic tool. Instead of just adding an `<i>` tag,
 * use font-style styles.
 ***************************************************************************/
ContentTools.Tools.Italic.canApply = function(element, selection) {
 	return ContentTools.Tools.Bold.canApply( element, selection );
};

ContentTools.Tools.Italic.isApplied = function(element, selection) {
 	var from = 0, to = 0, _ref;
 	if (element.content === void 0 || !element.content.length()) {
 		return false;
 	}
 	if ( selection ) {
 		_ref = selection.get(), from = _ref[0], to = _ref[1];
 	}

 	// If nothing is selected, adjust the whole element
 	if ( from === to ) {
 		from = 0;
 		to = element.content.length();
 	}

 	var styledString = element.content.substring(from, to);
 	var fontStyle = styledString.getStyle('font-style', element );

	// Support if formatted using `em` & `i` tags.
	if ( styledString.hasTags( 'em', true ) || styledString.hasTags( 'i', true ) ) {
		return true;
	}

 	return fontStyle === 'italic';
};

ContentTools.Tools.Italic.apply = function(element, selection, callback) {
 	this.tagName = 'span';

 	var from = 0, to = 0, _ref;
 	element.storeState();
 	if ( selection ) {
 		_ref = selection.get(), from = _ref[0], to = _ref[1];
 	}

 	// If nothing is selected, adjust the whole element
 	if ( from === to ) {
 		from = 0;
 		to = element.content.length();
 	}

 	// Get the current styles and add a font-weight
 	var styledString = element.content.substring(from, to);

	// Also support if stuff are bolded using `em` & `i` tags.
	if ( styledString.hasTags( 'em', true ) ) {
		element.content = element.content.unformat( from, to, new HTMLString.Tag( 'em' ) );

	} else if ( styledString.hasTags( 'i', true ) ) {
		element.content = element.content.unformat( from, to, new HTMLString.Tag( 'i' ) );

	} else {

	 	var fontStyle = styledString.getStyle('font-style', element );
	 	if ( ! fontStyle || fontStyle === 'normal' ) {
	 		fontStyle = 'italic';
	 	} else {
	 		fontStyle = 'normal';
	 	}
	 	var newStyle = { 'font-style': fontStyle };

	 	element.content = element.content.style( from, to, element._tagName, newStyle );
	}

 	element.updateInnerHTML();
 	element.taint();
 	element.restoreState();
 	return callback(true);
};




/***************************************************************************
 * Fix Link tool.
 * Because we changed the Bold tool above, the link tool gets changed too.
 * Bring it back to the original behavior.
 ***************************************************************************/
ContentTools.Tools.Link.isApplied = function(element, selection) {
 	// From Link.isApplied
 	if (element.constructor.name === 'Image') {
 		return element.a;
 	} else if ( selection ) {

 		// From the original Bold.isApplied
 		var from, to, _ref;
 		if (element.content === void 0 || !element.content.length()) {
 			return false;
 		}
 		_ref = selection.get(), from = _ref[0], to = _ref[1];
 		if (from === to) {
 			to += 1;
 		}
 		return element.content.slice(from, to).hasTags(this.tagName, true);
 	}
};



/***************************************************************************
 * Clicking the paragraph tool when an image is focused adds a paragraph
 * in the Region only, this makes it support divs.
 * @see ContentTools.Tools.Paragraph.apply
 ***************************************************************************/
 (function() {
 	var proxied = ContentTools.Tools.Paragraph.apply;
	ContentTools.Tools.Paragraph.apply = function(element, selection, callback) {
		var app, forceAdd, paragraph, region;
		app = ContentTools.EditorApp.get();
		forceAdd = app.ctrlDown();
		if ( ContentTools.Tools.Heading.canApply(element) && ! forceAdd ) {
		} else {
			if ( element.parent().constructor.name === 'DivCol' || element.parent().constructor.name === 'Div' ) {
				region = element.parent();
				paragraph = new ContentEdit.Text('p');
				region.attach(paragraph, region.children.indexOf(element) + 1);
				paragraph.focus();
				return callback(true);
			}
		}
		return proxied.call( this, element, selection, callback );
	};
})();




/***************************************************************************
 * Add a down hold (click and hold down the button) action for all tools.
 * To use this, you'll need to add a `doHold` function on the tool class.
 * @see line-height tool & margin tools
 ***************************************************************************/
 (function() {
 	var proxied = ContentTools.ToolUI.prototype._onMouseDown;
	ContentTools.ToolUI.prototype._onMouseDown = function(ev) {

		var ret = proxied.call( this, ev );

		if ( ! this.tool.doHold ) {
			return ret;
		}

		clearTimeout( this._holdTimeout );
		clearInterval( this._holdInterval );

		var interval = 30;
		if ( this.tool.holdInterval ) {
			interval = this.tool.holdInterval;
		}

		var element, selection;
		if (this._mouseDown) {
			element = ContentEdit.Root.get().focused();
			if (!(element && element.isMounted())) {
				return;
			}
			selection = null;
			if (element.selection) {
				selection = element.selection();
			}

			this._holdTimeout = setTimeout(function() {
				this._holdInterval = setInterval( function() {
					this.tool.doHold( element, selection );
				}.bind(this), interval );
			}.bind(this), 500);

		}

		return ret;
	};
})();

(function() {
	var proxied = ContentTools.ToolUI.prototype._onMouseUp;
	ContentTools.ToolUI.prototype._onMouseUp = function(ev) {

		clearTimeout( this._holdTimeout );
		clearInterval( this._holdInterval );

		return proxied.call( this, ev );
	};
})();


ContentTools.Tool.refreshTooltip = function( value ) {

	var buttonElement = window.PBSEditor.getToolUI( this.icon )._domElement;

	if ( ! value ) {
		value = '';
	}

	var tooltip;
	if ( window.PBSEditor.isCtrlDown && window.PBSEditor.isShiftDown ) {
		tooltip = this.labelReset.replace( '{0}', value );
	} else if ( window.PBSEditor.isCtrlDown ) {
		tooltip = this.labelDown.replace( '{0}', value );
	} else {
		tooltip = this.label.replace( '{0}', value );
	}

	if ( buttonElement.getAttribute( 'data-tooltip' ) !== tooltip ) {
		buttonElement.setAttribute('data-tooltip', tooltip );
	}

};


/**
 * Hide the table element in lite.
 */
(function() {
	var proxied = ContentTools.Tools.Table.apply;
	ContentTools.Tools.Table.apply = function( element, selection, callback ) {
	};
	ContentTools.Tools.Table.premium = true;
	ContentTools.Tools.Table.buttonName = pbsParams.labels.table;
	ContentTools.Tools.Table.label = pbsParams.labels.table;

})();

/* globals ContentTools, ContentEdit, __extends */

ContentTools.Tools.AddElementButton = (function(_super) {
	__extends(AddElementButton, _super);

	function AddElementButton() {
		return AddElementButton.__super__.constructor.apply(this, arguments);
	}

	AddElementButton.isAddElementButton = true;

	// This is the list that is paired with this button tool.
	AddElementButton.listTool = '';

	AddElementButton.icon = 'add-element-button';

	AddElementButton.canApply = function() {
		return true;
	};

    AddElementButton.isApplied = function() {
		if ( this.listTool ) {
			var tool = window.PBSEditor.getToolUI( this.listTool );
			if ( tool ) {
				return tool._domElement.style.display === 'block';
			}
		}
		return false;
    };

	AddElementButton.apply = function(element, selection, callback) {
		return callback(true);
	};

	return AddElementButton;

})(ContentTools.Tool);



ContentTools.Tools.AddElementList = (function(_super) {
	__extends(AddElementList, _super);

	function AddElementList() {
		return AddElementList.__super__.constructor.apply(this, arguments);
	}

	AddElementList.type = 'design-elements-list';
	AddElementList.icon = 'design-elements-list';
	AddElementList.label = '';

	// Override me
	AddElementList.populateList = function( domToolContainer ) { }; // jshint ignore:line

	// Override me
	AddElementList.addClickedItem = function( domItemClicked, elemFocused ) { }; // jshint ignore:line

	AddElementList.canApply = function() {
		return true;
	};
    AddElementList.isApplied = function() {
		return false;
    };

	AddElementList.toggleList = function() {
		if ( this._ceElement._domElement.style.display ) {
			this.hideList();
		} else {
			this.showList();
		}
	};

	AddElementList.init = function() {
		var toolDomElement = this._ceElement._domElement;
		if ( ! toolDomElement.children.length ) {

			toolDomElement.classList.add( 'pbs-add-element-list' );

			this.populateList( toolDomElement );

			for ( var i = 0; i < toolDomElement.children.length; i++ ) {
				var el = toolDomElement.children[ i ];
				el.classList.add( 'pbs-add-element-list-item' );
				el.setAttribute( 'data-search-terms', el.textContent.trim().toLowerCase() );
				el.addEventListener( 'click', this._onClick.bind( this ) );
			}

			// Create the search field.
			var elem = document.createElement( 'INPUT' );
			elem.setAttribute( 'type', 'search' );
			elem.setAttribute( 'placeholder', 'Type to search...' );
			toolDomElement.insertBefore( elem, toolDomElement.firstChild );
			elem.addEventListener( 'keyup', this._doSearch.bind( this ) );

			// Create the none-found label.
			elem = document.createElement( 'SPAN' );
			elem.classList.add( 'pbs-add-element-list-none-found' );
			elem.innerHTML = 'Nothing found';
			toolDomElement.insertBefore( elem, toolDomElement.firstChild );
		}
	};

	AddElementList._onClick = function(e) {

		// Add the shortcode after the currently selected element
		var root = ContentEdit.Root.get();
		if ( root.focused() ) {

			// The clicked target isn't necessarily the one with data-shortcode,
			// it may be a child of the element, find the data-shortcode.
			var currTarget = e.target;
			while ( ! currTarget.classList.contains( 'pbs-add-element-list-item' ) && currTarget.parentNode ) {
				currTarget = currTarget.parentNode;
			}

			this.addClickedItem( currTarget, root.focused() );
		}

	};

	AddElementList.showList = function() {

		this._ceElement._domElement.style.display = 'block';

		var search = this._ceElement._domElement.querySelector('[type="search"]');
		search.focus();
		search.select();

	};

	AddElementList.hideList = function() {
		this._ceElement._domElement.style.display = '';
	};

	AddElementList._doSearch = function( ev ) {
		var elements,
			searchString = ev.target.value.trim().toLowerCase(),
			noneFoundLabel = this._ceElement._domElement.querySelector( '.pbs-add-element-list-none-found' );

		noneFoundLabel.style.display = 'none';

		if ( searchString === '' ) {
			elements = ev.target.parentNode.querySelectorAll( '[data-search-terms]' );
			Array.prototype.forEach.call( elements, function( el ) {
				el.style.display = '';
			} );
			return;
		}

		elements = ev.target.parentNode.querySelectorAll( '[data-search-terms]' );
		Array.prototype.forEach.call( elements, function( el ) {
			el.style.display = 'none';
		} );
		elements = ev.target.parentNode.querySelectorAll( '[data-search-terms*="' + searchString + '"]' );
		Array.prototype.forEach.call( elements, function( el ) {
			el.style.display = '';
		} );

		if ( ! elements.length ) {
			noneFoundLabel.style.display = 'block';
		}
	};

	return AddElementList;

})(ContentTools.Tool);




// Initialize the tool to create all the buttons inside it upon mounting.
(function() {
	var proxied = ContentTools.ToolboxUI.prototype.mount;
	ContentTools.ToolboxUI.prototype.mount = function() {
		var ret = proxied.call( this );
		for ( var i in this._toolUIs ) {
			if ( ! this._toolUIs.hasOwnProperty( i ) ) {
				continue;
			}
			if ( this._toolUIs[ i ].tool.init ) {
				this._toolUIs[ i ].tool.init();
			}
		}
		return ret;
	};
} )();



// Remove the existing event handlers for the tool. We are going to use our own
(function() {
	var proxied = ContentTools.ToolUI.prototype._addDOMEventListeners;
	ContentTools.ToolUI.prototype._addDOMEventListeners = function() {

		if ( this.tool.__super__ && this.tool.__super__.constructor.name === 'AddElementButton' ) {

			// Cancel the mouse down event to prevent focusing
	        this._domElement.addEventListener('mousedown', function(e) {
				if ( e.target.classList.contains('ct-tool') ) {
					e.preventDefault();
				}
			});

			// Show the element picker on click
	        this._domElement.addEventListener('click', function(e) {
				if ( e.target.classList.contains('ct-tool') ) {
					var tool = window.PBSEditor.getToolUI( this.tool.listTool );
					// var tool = ContentTools.EditorApp.get()._toolbox._toolUIs[ 'design-elements-list' ];
					if ( typeof tool !== 'undefined' ) {
						tool.tool.toggleList();
					}
				}
	        }.bind(this) );

		} else if ( this.tool.__super__ && this.tool.__super__.constructor.name === 'AddElementList' ) {
		// } else if ( this.tool.name === 'DesignElementsList' ) {

			// Cancel the mouse down event to prevent focusing
	        this._domElement.addEventListener('mousedown', function(e) {
				if ( e.target.classList.contains('ct-tool') ) {
					e.preventDefault();
				}
			});

		// Normal process
		} else {
			return proxied.call( this );
		}
	};
})();

/* globals ContentTools, ContentEdit, PBSInspectorOptions, __extends, PBSEditor, pbsParams */

ContentTools.Tools.Shortcode = (function(_super) {
	__extends(Shortcode, _super);

	function Shortcode() {
		return Shortcode.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(Shortcode, 'shortcode');

	Shortcode.label = pbsParams.labels.shortcode;

	Shortcode.icon = 'shortcode';

	Shortcode.tagName = 'shortcode';

	Shortcode.buttonName = pbsParams.labels.shortcode;

	Shortcode.apply = function(element, selection, callback) {

		var parent = null;
		var index = 0;

		var root = ContentEdit.Root.get();
		if ( root.focused() ) {
			parent = root.focused().parent();
			index = parent.children.indexOf( root.focused() ) + 1;
		} else {
			var mainRegion = ContentTools.EditorApp.get().regions()['main-content'];
			if ( mainRegion.children ) {
				parent = mainRegion.children[0].parent();
			}
		}

		this.createNew( parent, index );

		return callback( true );
	};

	Shortcode.createNew = function( parent, index ) {

		PBSEditor.shortcodeFrame.open({
			title: pbsParams.labels.insert_shortcode,
			button: pbsParams.labels.insert_shortcode,
			successCallback: function( view ) {

				var base = view.selected.getAttribute( 'data-shortcode-tag' );
				var shortcodeRaw = this.createInsertedShortcode( base );
				var shortcode = wp.shortcode.next( base, shortcodeRaw, 0 );
				var isMapped = pbsParams.shortcode_mappings[ base ];
				var elem;

				// Insert the RAW shortcode, insert & render the shortcode if it's mapped.
				if ( isMapped ) {
					elem = ContentEdit.Shortcode.createShortcode( shortcode );
				} else {
					elem = new ContentEdit.Text( 'p', {}, shortcode.shortcode.string() );
				}
				parent.attach( elem, index );

				if ( isMapped ) {
					elem.ajaxUpdate( true );
				} else {
					elem.origShortcode = '';
					elem.origInnerHTML = '';
					elem.isShortcodeEditing = true;
				}

				elem.focus();

			}.bind( this )
		});
	};

	Shortcode.createInsertedShortcode = function( base ) {

		// Default data
		var scData = {
			tag: base,
			type: 'closed',
			content: '',
			attrs: {}
		};

		// If there is an existing shortcode mapping, use that.
		if ( typeof PBSInspectorOptions.Shortcode[ base ] === 'undefined' ) {
			if ( typeof pbsParams.shortcode_mappings !== 'undefined' && typeof pbsParams.shortcode_mappings[ base ] !== 'undefined' ) {
				var editor = ContentTools.EditorApp.get();
				if ( editor._toolbox.createShortcodeMappingOptions ) {
					editor._toolbox.createShortcodeMappingOptions( base );
				}
			}
		}

		// Include shortcode API data if it exists
		if ( PBSInspectorOptions.Shortcode[ base ] && PBSInspectorOptions.Shortcode[ base ].options ) {
			for ( var i = 0; i < PBSInspectorOptions.Shortcode[ base ].options.length; i++ ) {
				var option = PBSInspectorOptions.Shortcode[ base ].options[ i ];
				if ( option.id ) {
					if ( option.id === 'content' ) {
						scData.content = option['default'] || '';
					} else {
						scData.attrs[ option.id ] = option['default'] || '';
					}
				}
			}
		}

		// Generate the shortcode
		return new wp.shortcode( scData ).string();
	};

	return Shortcode;

} )( ContentTools.Tools.ElementButton );


/* globals ContentTools, __extends, ContentEdit, pbsParams */

ContentTools.Tools.Heading1 = (function(_super) {
	__extends(Heading1, _super);

	function Heading1() {
		return Heading1.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(Heading1, 'h1');

	Heading1.label = pbsParams.labels.heading_label.replace( '%d', '1' );

	Heading1.icon = 'h1';

	Heading1.tagName = 'h1';

	Heading1.canApply = function(element, selection) {
		if ( element.constructor.name === 'ListItemText' ) {
			return false;
		}
		if ( element.constructor.name === 'TableCellText' ) {
			return false;
		}
		return ContentTools.Tools.Paragraph.canApply( element, selection );
	};

	Heading1.apply = function(element, selection, callback) {
		if ( this.isApplied( element ) ) {
			return;
		}
		// If the element has no content, then add the new element after it.
		if ( ! element.content ) {
			var heading = new ContentEdit.Text( this.tagName );
			element.parent().attach( heading, element.parent().children.indexOf( element ) + 1 );
			heading.focus();
			return callback(true);
		}
		return Heading1.__super__.constructor.apply.call(this, element, selection, callback);
	};

	Heading1.isApplied = function(element) {
		return element.tagName() === this.tagName;
	};

	  return Heading1;

})(ContentTools.Tools.Heading);


ContentTools.Tools.Heading2 = (function(_super) {
	__extends(Heading2, _super);

	function Heading2() {
		return Heading2.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(Heading2, 'h2');

	Heading2.label = pbsParams.labels.heading_label.replace( '%d', '2' );

	Heading2.icon = 'h2';

	Heading2.tagName = 'h2';

	return Heading2;

})(ContentTools.Tools.Heading1);

ContentTools.Tools.Heading3 = (function(_super) {
	__extends(Heading3, _super);

	function Heading3() {
		return Heading3.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(Heading3, 'h3');

	Heading3.label = pbsParams.labels.heading_label.replace( '%d', '3' );

	Heading3.icon = 'h3';

	Heading3.tagName = 'h3';

	return Heading3;

})(ContentTools.Tools.Heading1);


ContentTools.Tools.Heading4 = (function(_super) {
	__extends(Heading4, _super);

	function Heading4() {
		return Heading4.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(Heading4, 'h4');

	Heading4.label = pbsParams.labels.heading_label.replace( '%d', '4' );

	Heading4.icon = 'h4';

	Heading4.tagName = 'h4';

	return Heading4;

})(ContentTools.Tools.Heading1);


ContentTools.Tools.Heading5 = (function(_super) {
	__extends(Heading5, _super);

	function Heading5() {
		return Heading5.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(Heading5, 'h5');

	Heading5.label = pbsParams.labels.heading_label.replace( '%d', '5' );

	Heading5.icon = 'h5';

	Heading5.tagName = 'h5';

	return Heading5;

})(ContentTools.Tools.Heading1);


ContentTools.Tools.Heading6 = (function(_super) {
	__extends(Heading6, _super);

	function Heading6() {
		return Heading6.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(Heading6, 'h6');

	Heading6.label = pbsParams.labels.heading_label.replace( '%d', '6' );

	Heading6.icon = 'h6';

	Heading6.tagName = 'h6';

	return Heading6;

})(ContentTools.Tools.Heading1);

/* globals ContentTools, __extends, pbsParams */

ContentTools.Tools.Blockquote = (function(_super) {
  __extends(Blockquote, _super);

  function Blockquote() {
	return Blockquote.__super__.constructor.apply(this, arguments);
  }

  ContentTools.ToolShelf.stow(Blockquote, 'blockquote');

  Blockquote.label = pbsParams.labels.blockquote;

  Blockquote.icon = 'blockquote';

  Blockquote.tagName = 'blockquote';

  return Blockquote;

})(ContentTools.Tools.Heading1);



/* globals ContentTools, __extends, pbsParams */



ContentTools.Tools.ClearFormatting = (function(_super) {

  __extends(ClearFormatting, _super);



  function ClearFormatting() {

    return ClearFormatting.__super__.constructor.apply(this, arguments);

  }



  ContentTools.ToolShelf.stow(ClearFormatting, 'clear-formatting');



  ClearFormatting.label = pbsParams.labels.clear_formatting;



  ClearFormatting.icon = 'clear-formatting';



  ClearFormatting.tagName = 'span';





  /**

   * Disable the button if there's NO styling applied in the content.

   */

  ClearFormatting.canApply = function(element, selection) {

  	if ( ! ContentTools.Tools.Bold.canApply( element, selection ) ) {

		return false;

	}



	var from = 0, to = 0, _ref;

	if (element.content === void 0 || ! element.content.length()) {

		return false;

	}



	if ( selection ) {

		_ref = selection.get(), from = _ref[0], to = _ref[1];

	}



	// If nothing is selected, adjust the whole element

	if ( from === to ) {

		from = 0;

		to = element.content.length();

	}



	return element.content.hasStyle(from, to);

  };



  ClearFormatting.apply = function(element, selection, callback) {

	  var from, to, _ref;

	  element.storeState();



	  _ref = selection.get(), from = _ref[0], to = _ref[1];



	  // If nothing is selected, adjust the whole element

	  if ( from === to ) {

		  from = 0;

		  to = element.content.length();

	  }



  	  element.content = element.content.removeStyles( from, to );



  	  element.updateInnerHTML();

  	  element.taint();

  	  element.restoreState();

  	  return callback(true);

  };



  return ClearFormatting;



})(ContentTools.Tool);


/* globals ContentTools, HTMLString, __extends, pbsParams */

ContentTools.Tools.Code = (function(_super) {
	__extends(Code, _super);

	function Code() {
		return Code.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(Code, 'code');

	Code.label = pbsParams.labels.code;

	Code.icon = 'code';

	Code.tagName = 'code';

	Code.canApply = function( element, selection ) {
		if ( ! selection ) {
			return false;
		}
		var _ref = selection.get(), from = _ref[0], to = _ref[1];
		return from !== to;
	};

	// This is the original apply function of Bold that ONLY uses tags.
	Code.apply = function(element, selection, callback) {
		var from, to, _ref;
		element.storeState();
		_ref = selection.get(), from = _ref[0], to = _ref[1];
		if (this.isApplied(element, selection)) {
			element.content = element.content.unformat(from, to, new HTMLString.Tag(this.tagName));
		} else {
			element.content = element.content.format(from, to, new HTMLString.Tag(this.tagName));
		}
		element.updateInnerHTML();
		element.taint();
		element.restoreState();
		return callback(true);
	};

	Code.isApplied = function( element, selection ) {
	 	if ( selection ) {

	 		// From the original Bold.isApplied
	 		var from, to, _ref;
	 		if (element.content === void 0 || !element.content.length()) {
	 			return false;
	 		}
	 		_ref = selection.get(), from = _ref[0], to = _ref[1];
	 		if (from === to) {
	 			to += 1;
	 		}
	 		return element.content.slice(from, to).hasTags(this.tagName, true);
	 	}

		return false;
	};

  return Code;

})(ContentTools.Tools.Bold);

/* globals ContentTools, ContentEdit, __extends, pbsParams */

ContentTools.Tools.Color = (function(_super) {
	__extends(Color, _super);

	function Color() {
		return Color.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(Color, 'color');

	Color.label = pbsParams.labels.color;

	Color.icon = 'color';

	Color.tagName = 'span';

	Color.canApply = function(element, selection) {
		// Don't do anything when there's no text
		if ( ! element.content ) {
			return false;
		}

		var from, to;
		var apply = selection && !selection.isCollapsed();
		var color = '';

		// Find the selected text, if nothing's selected, make the whole area selected.
		if ( apply ) {
			var _ref = selection.get();
			from = _ref[0];
			to = _ref[1];
			if (from === to) {
				to += 1;
			}
		} else {
			from = 0;
			to = element.content.length();
		}

		// Find the color from the span
		var selectedContent = element.content.slice(from, to).html();
		var matches = selectedContent.match( /^<span[^>]style[^>]+['"\s;]color:\s?([#().,\w]+)/ );
		if ( matches ) {
			color = matches[1];
		} else {
		}

		// Change the tool's color to the color found
		if ( ! color ) {
			if ( typeof this._defaultBodyTextColor === 'undefined' ) {
				var s = getComputedStyle( document.body );
				this._defaultBodyTextColor = s.color;
			}
			color = this._defaultBodyTextColor;
		}

		if ( this._ceElement._domElement.style.backgroundColor !== color ) {
			this._ceElement._domElement.style.backgroundColor = color;
		}

		if ( color ) {
			window.PBSEditor.getToolUI( this.icon )._domElement.setAttribute('data-tooltip', this.label + ': ' + color );
		} else {
			window.PBSEditor.getToolUI( this.icon )._domElement.setAttribute('data-tooltip', this.label );
		}


		return true;
	};

	Color.isApplied = function() {
		return false;
	};

	Color.apply = function(element, selection, callback) {
		var from, to, _ref;
		element.storeState();

		// When text has been selected before, change that (the text loses focus when manually entering a color, the text is stored here).
		if ( this.rememberedSelection ) {
			selection = this.rememberedSelection;
		}

		_ref = selection.get(), from = _ref[0], to = _ref[1];

		// If nothing is selected, color the whole element
		if ( from === to ) {
			from = 0;
			to = element.content.length();
		}

		// Get the iris color
		var currColor = jQuery(this._ceElement._domElement.querySelector('input')).iris('color');
		if ( this._ceElement._domElement.querySelector('input').value === '' ) {
			currColor = '';
		}

		// Apply the new color
		element.content = element.content.style( from, to, element._tagName, { 'color': currColor } );

		element.updateInnerHTML();
		element.taint();
		element.restoreState();

		wp.hooks.doAction( 'pbs.tool.color.applied', element );

		return callback(true);
	};


	Color._colorPickerMount = function() {
		var _this = this;
		var d = document.createElement('DIV');
		var o = document.createElement('INPUT');

		// When the input field is clicked, remember if we had text selected before since we lose the focus on that one.
		o.addEventListener('mousedown', function() {
			var element = ContentEdit.Root.get().focused();
	        var selection = null;
	        if (element.selection) {
	          selection = element.selection();
	        }
			var _ref = selection.get(), from = _ref[0], to = _ref[1];
			if ( ! ( from === 0 && to === 0 ) ) {
				_this.rememberedSelection = selection;
			}
		});

		// When typing in the input field, trigger the color to be cleared when empty.
		o.addEventListener('keyup', function(e) {
			if ( e.target.value === '' ) {
				_this.selectedColor = e.target.value;
				_this._ceElement._mouseDown = true; // Stop other tool behavior.
				_this._ceElement._onMouseUp();
				jQuery(_this._ceElement._domElement.querySelector('input')).iris('color', _this.selectedColor);
			}
		});

		// Iris colorpicker makes us lose focus in the input field, always bring it back
		o.addEventListener('blur', function() {
			_this._ceElement._domElement.querySelector('input').focus();
		});

		o.classList.add('color-picker');
		o.setAttribute('data-alpha', 'true');
		d.appendChild(o);
		this._ceElement._domElement.appendChild(d);

		// Initialize the color picker
		jQuery(o).iris({
			defaultColor: this._ceElement._domElement.style.backgroundColor,
			change: function(event){
				if ( ! _this._ceElement._justShowedPicker ) {
					_this.selectedColor = event.target.value;
					_this._ceElement._mouseDown = true;
					_this._ceElement._onMouseUp(event);
				}
				_this._ceElement._justShowedPicker = undefined;
			},
			// a callback to fire when the input is emptied or an invalid color (doesn't work)
			clear: function() {},
			// hide the color picker controls on load
			hide: false,
			// Add our own pretty colors
			palettes: [ '#000', '#fff', '#CF000F', '#D2527F', '#F89406', '#F9BF3B', '#2ECC71', '#19B5FE', '#8E44AD' ]
		});

		// Hide the colorpicker when going out of the inspector
		document.querySelector('.ct-toolbox').addEventListener('mouseleave', function() {
			_this.hidePicker();
		});

		// Close popup if other popups open.
		wp.hooks.addAction( 'pbs.tool.popup.open', function() {
			this.hidePicker();
		}.bind(this));

	};


	Color.hidePicker = function() {
		// Hide the colorpicker container.
		this._ceElement._domElement.firstChild.style.display = '';

		// Forget the previously selected text.
		this.rememberedSelection = null;
	};

	return Color;

})(ContentTools.Tool);



// If another element is selected, hide the color picker
ContentEdit.Root.get().bind('blur', function() {
	var tool = window.PBSEditor.getToolUI( 'color' );
	// var tool = ContentTools.EditorApp.get()._toolbox._toolUIs.color;
	if ( typeof tool !== 'undefined' ) {
		tool.tool.hidePicker();
	}
});


// Implement our own mount event handler.
ContentTools.ToolUI.prototype._colorPickerMountOverride = ContentTools.ToolUI.prototype.mount;
ContentTools.ToolUI.prototype.mount = function(domParent, before) {
	var ret = this._colorPickerMountOverride( domParent, before );
	this.tool._ceElement = this;
	if ( typeof this.tool._colorPickerMount !== 'undefined' ) {
		this.tool._colorPickerMount();
	}
	return ret;
};


// Remove the existing event handlers for the color tool. We are going to use our own
ContentTools.ToolUI.prototype._toolColorAddDOMEventListeners = ContentTools.ToolUI.prototype._addDOMEventListeners;
ContentTools.ToolUI.prototype._addDOMEventListeners = function() {
	if ( this.tool.name === 'Color' ) {
		var _this = this;

		// Cancel the mouse down event to prevent focusing
        this._domElement.addEventListener('mousedown', function(e) {
			if ( e.target.classList.contains('ct-tool') ) {
				e.preventDefault();
			}
		});

		// Show the colorpicker on click
        this._domElement.addEventListener('click', function(e) {
			if ( e.target.classList.contains('ct-tool') ) {

				// Set the input field's value
				_this._domElement.querySelector('input').value = _this._domElement.style.backgroundColor;

				// Set the color
				_this._justShowedPicker = true; // Do not implement the selected color when just showing the picker
				jQuery(_this._domElement.querySelector('input')).iris('color', _this._domElement.style.backgroundColor);

				// Let others know that we're going to open a popup.
				if ( _this._domElement.firstChild.style.display === '' ) {
					wp.hooks.doAction( 'pbs.tool.popup.open' );
				}

				// Show the color picker
				_this._domElement.firstChild.style.display = _this._domElement.firstChild.style.display ? '' : 'block';

				// Don't lose the focus when a palette color is clicked
				var elements = _this._domElement.querySelectorAll('.iris-palette');
				Array.prototype.forEach.call(elements, function(el){
					if ( typeof el._pbsInitDone === 'undefined' ) {
						el._pbsInitDone = true;
						el.addEventListener('mousedown', function(e) {
							e.preventDefault();
						});
					}
				});
			}
        });

	// Normal process
	} else {
		return this._toolColorAddDOMEventListeners();
	}
};

/* globals ContentEdit, ContentTools, __extends, pbsParams, PBSEditor */

ContentTools.Tools.TwoColumn = (function(_super) {
	__extends(OneColumn, _super);

	function OneColumn() {
		return OneColumn.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(OneColumn, 'onecolumn');

	OneColumn.label = pbsParams.labels.one_column;

	OneColumn.icon = 'onecolumn';

	OneColumn.tagName = 'onecolumn';

	OneColumn.buttonName = pbsParams.labels.one_column;

	OneColumn.apply = function(element, selection, callback) {
		var index = element.parent().children.indexOf( element ) + 1;
		element.blur();
		this.createNew( element.parent(), index );
		return callback( true );
	};

	OneColumn.createNew = function( parent, index ) {
		var row = new ContentEdit.DivRow('div');
		var col = new ContentEdit.DivCol('div');
		var p = new ContentEdit.Text('p', {}, '');

		parent.attach( row, index );

		row.attach(col);
		col.attach(p);

		p.focus();

		row.showOutline();

		wp.hooks.doAction( 'pbs.tool.row.applied', row );
	};

	return OneColumn;

} )( ContentTools.Tools.ElementButton );


ContentTools.Tools.TwoColumn = (function(_super) {
	__extends(TwoColumn, _super);

	function TwoColumn() {
		return TwoColumn.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(TwoColumn, 'twocolumn');

	TwoColumn.label = pbsParams.labels.two_column;

	TwoColumn.icon = 'twocolumn';

	TwoColumn.tagName = 'twocolumn';

	TwoColumn.buttonName = pbsParams.labels.two_column;

	TwoColumn.apply = function(element, selection, callback) {
		var index = element.parent().children.indexOf( element ) + 1;
		element.blur();
		this.createNew( element.parent(), index );
		return callback( true );
	};

	TwoColumn.createNew = function( parent, index ) {
		var row = new ContentEdit.DivRow('div');
		var col = new ContentEdit.DivCol('div');
		var p = new ContentEdit.Text('p', {}, '');
		parent.attach( row, index );
		row.attach(col);
		col.attach(p);
		p.focus();
		col.style( 'flex-basis', '50%' );
		col = new ContentEdit.DivCol('div');
		p = new ContentEdit.Text('p', {}, '');
		row.attach(col);
		col.attach(p);
		col.style( 'flex-basis', '50%' );
		row.showOutline();
	};

	return TwoColumn;

} )( ContentTools.Tools.ElementButton );


ContentTools.Tools.ThreeColumn = (function(_super) {
	__extends(ThreeColumn, _super);

	function ThreeColumn() {
		return ThreeColumn.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(ThreeColumn, 'threecolumn');

	ThreeColumn.label = pbsParams.labels.three_column;

	ThreeColumn.icon = 'threecolumn';

	ThreeColumn.tagName = 'threecolumn';

	ThreeColumn.buttonName = pbsParams.labels.three_column;

	ThreeColumn.apply = function(element, selection, callback) {
		var index = element.parent().children.indexOf( element ) + 1;
		element.blur();
		this.createNew( element.parent(), index );
		return callback( true );
	};

	ThreeColumn.createNew = function( parent, index ) {
		var row = new ContentEdit.DivRow('div');
		var col = new ContentEdit.DivCol('div');
		var p = new ContentEdit.Text('p', {}, '');
		parent.attach( row, index );
		row.attach(col);
		col.attach(p);
		p.focus();
		col.style( 'flex-basis', '33.33%' );
		col = new ContentEdit.DivCol('div');
		p = new ContentEdit.Text('p', {}, '');
		row.attach(col);
		col.attach(p);
		col.style( 'flex-basis', '33.33%' );
		col = new ContentEdit.DivCol('div');
		p = new ContentEdit.Text('p', {}, '');
		row.attach(col);
		col.attach(p);
		col.style( 'flex-basis', '33.33%' );
		row.showOutline();
	};

	return ThreeColumn;

} )( ContentTools.Tools.ElementButton );


ContentTools.Tools.FourColumn = (function(_super) {
	__extends(FourColumn, _super);

	function FourColumn() {
		return FourColumn.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(FourColumn, 'fourcolumn');

	FourColumn.label = pbsParams.labels.four_column;

	FourColumn.icon = 'fourcolumn';

	FourColumn.tagName = 'fourcolumn';

	FourColumn.buttonName = pbsParams.labels.four_column;

	FourColumn.apply = function(element, selection, callback) {
		var index = element.parent().children.indexOf( element ) + 1;
		element.blur();
		this.createNew( element.parent(), index );
		return callback( true );
	};

	FourColumn.createNew = function( parent, index ) {
		var row = new ContentEdit.DivRow('div');
		var col = new ContentEdit.DivCol('div');
		var p = new ContentEdit.Text('p', {}, '');
		parent.attach( row, index );
		row.attach(col);
		col.attach(p);
		p.focus();
		col.style( 'flex-basis', '25%' );
		col = new ContentEdit.DivCol('div');
		p = new ContentEdit.Text('p', {}, '');
		row.attach(col);
		col.attach(p);
		col.style( 'flex-basis', '25%' );
		col = new ContentEdit.DivCol('div');
		p = new ContentEdit.Text('p', {}, '');
		row.attach(col);
		col.attach(p);
		col.style( 'flex-basis', '25%' );
		col = new ContentEdit.DivCol('div');
		p = new ContentEdit.Text('p', {}, '');
		row.attach(col);
		col.attach(p);
		col.style( 'flex-basis', '25%' );
		row.showOutline();
	};

	return FourColumn;

} )( ContentTools.Tools.ElementButton );

/* globals ContentTools, __extends, pbsParams */

ContentTools.Tools.InsertElement = (function(_super) {
	__extends(InsertElement, _super);

	function InsertElement() {
		return InsertElement.__super__.constructor.apply( this, arguments );
	}

	ContentTools.ToolShelf.stow( InsertElement, 'insertElement' );

	InsertElement.label = '';

	InsertElement.icon = 'insert-element';

	InsertElement.className = '';

	InsertElement.apply = function(element, selection, callback) {
		var editor = ContentTools.EditorApp.get();
		editor._toolboxElements.toggle();
		return callback(true);
	};

	InsertElement.canApply = function() {
		return true;
	};

	return InsertElement;

})(ContentTools.Tool);


/**
 * Add a label in the add element tool.
 */
(function() {
	var proxied = ContentTools.ToolUI.prototype.mount;
	ContentTools.ToolUI.prototype.mount = function( domParent, before ) {
		var ret = proxied.call( this, domParent, before );
		if ( this._domElement.classList.contains( 'ct-tool--insert-element' ) ) {

			// Add the button label.
			this._domElement.innerHTML = '<span>' + pbsParams.labels.add_element + '</span>';

			// Show the toolbar when hovering over the add element button.
			this._toolboxElementsHoverShow = function() {
				ContentTools.EditorApp.get()._toolboxElements.show();
			};
			this._domElement.addEventListener( 'mouseenter', this._toolboxElementsHoverShow );

			// Show the toolbar when mouse moves near the edge of the screen.
			this._toolboxElementsSideMouseEnterHandler = function( ev ) {
				if ( ! window.PBSEditor.isEditing() ) {
					return;
				}
				if ( ev.screenX <= 10 && ev.screenY > 70 ) {
					ContentTools.EditorApp.get()._toolboxElements.show();
				}
			};
			document.body.addEventListener( 'mousemove', this._toolboxElementsSideMouseEnterHandler );

			// Hide the toolbar when mouse moves on the admin bar.
			this._toolboxElementsAdminbarEnterHandler = function() {
				ContentTools.EditorApp.get()._toolboxElements.hide();
			};
			document.querySelector( '#wpadminbar' ).addEventListener( 'mousemove', this._toolboxElementsAdminbarEnterHandler );
		}
		return ret;
	};
})();


( function() {
   var proxied = ContentTools.ToolUI.prototype.unmount;
   ContentTools.ToolUI.prototype.unmount = function( t, e ) {
	   if ( this._domElement.classList.contains( 'ct-tool--insert-element' ) ) {

		   // Removeo all events we added during mount.
		   this._domElement.removeEventListener( 'mouseenter', this._toolboxElementsHoverShow );

		   document.body.removeEventListener( 'mousemove', this._toolboxElementsSideMouseEnterHandler );

		   document.querySelector( '#wpadminbar' ).removeEventListener( 'mousemove', this._toolboxElementsAdminbarEnterHandler );
	   }
	   return proxied.call( this, t, e );
   };
} )();

/* globals ContentTools */

( function() {

	ContentTools.Tools.AlignLeft.className = '';

	ContentTools.Tools.AlignLeft.apply = function( element, selection, callback ) {
		var _ref;
		if ( ( _ref = element.constructor.name ) === 'ListItemText' || _ref === 'TableCellText' ) {
			element = element.parent();
		}

		if ( element.constructor.name === 'Icon' ) {
			if ( element.hasCSSClass( 'alignleft' ) ) {
				element.removeCSSClass( 'alignleft' );
			} else {
				element.removeCSSClass( 'alignleft' );
				element.removeCSSClass( 'alignright' );
				element.removeCSSClass( 'aligncenter' );
				element.removeCSSClass( 'alignnone' );
				element.addCSSClass( 'alignleft' );
			}
			return callback( true );
		}

		element.style( 'textAlign', 'left' );

		return callback( true );
	};

	ContentTools.Tools.AlignLeft.isApplied = function( element ) {
		var _ref;
		if ( ! this.canApply( element ) ) {
			return false;
		}
		if ( ( _ref = element.type() ) === 'ListItemText' || _ref === 'TableCellText' ) {
			element = element.parent();
		}

		if ( element.constructor.name === 'Icon' ) {
			return element.hasCSSClass( 'alignleft' );
		}

		return element.style( 'textAlign' ) === 'left' || element.style( 'textAlign' ) === 'start';
	};

	var proxiedCanApply = ContentTools.Tools.AlignLeft.canApply;
	ContentTools.Tools.AlignLeft.canApply = function( element, selection ) {
		if ( element.constructor.name === 'Icon' ) {
			return true;
		}
		return proxiedCanApply.call( this, element, selection );
	};
} )();

/* globals ContentTools */

( function() {

	ContentTools.Tools.AlignCenter.className = '';

	ContentTools.Tools.AlignCenter.apply = function( element, selection, callback ) {
		var _ref;
		if ( ( _ref = element.constructor.name ) === 'ListItemText' || _ref === 'TableCellText' ) {
			element = element.parent();
		}

		if ( element.constructor.name === 'Icon' ) {
			if ( element.hasCSSClass( 'aligncenter' ) ) {
				element.removeCSSClass( 'aligncenter' );
			} else {
				element.removeCSSClass( 'alignleft' );
				element.removeCSSClass( 'alignright' );
				element.removeCSSClass( 'aligncenter' );
				element.removeCSSClass( 'alignnone' );
				element.addCSSClass( 'aligncenter' );
			}
			return callback( true );
		}

		element.style( 'textAlign', 'center' );

		return callback( true );
	};

	ContentTools.Tools.AlignCenter.isApplied = function( element ) {
		var _ref;
		if ( ! this.canApply( element ) ) {
			return false;
		}
		if ( ( _ref = element.type() ) === 'ListItemText' || _ref === 'TableCellText' ) {
			element = element.parent();
		}

		if ( element.constructor.name === 'Icon' ) {
			return element.hasCSSClass( 'aligncenter' );
		}

		return element.style( 'textAlign' ) === 'center';
	};

	var proxiedCanApply = ContentTools.Tools.AlignCenter.canApply;
	ContentTools.Tools.AlignCenter.canApply = function( element, selection ) {
		if ( element.constructor.name === 'Icon' ) {
			return true;
		}
		return proxiedCanApply.call( this, element, selection );
	};
} )();

/* globals ContentTools */

( function() {

	ContentTools.Tools.AlignRight.className = '';

	ContentTools.Tools.AlignRight.apply = function( element, selection, callback ) {
		var _ref;
		if ( ( _ref = element.constructor.name ) === 'ListItemText' || _ref === 'TableCellText' ) {
			element = element.parent();
		}

		if ( element.constructor.name === 'Icon' ) {
			if ( element.hasCSSClass( 'alignright' ) ) {
				element.removeCSSClass( 'alignright' );
			} else {
				element.removeCSSClass( 'alignleft' );
				element.removeCSSClass( 'alignright' );
				element.removeCSSClass( 'aligncenter' );
				element.removeCSSClass( 'alignnone' );
				element.addCSSClass( 'alignright' );
			}
			return callback( true );
		}

		element.style( 'textAlign', 'right' );

		return callback( true );
	};

	ContentTools.Tools.AlignRight.isApplied = function( element ) {
		var _ref;
		if ( ! this.canApply( element ) ) {
			return false;
		}
		if ( ( _ref = element.type() ) === 'ListItemText' || _ref === 'TableCellText' ) {
			element = element.parent();
		}

		if ( element.constructor.name === 'Icon' ) {
			return element.hasCSSClass( 'alignright' );
		}

		return element.style( 'textAlign' ) === 'right' || element.style( 'textAlign' ) === 'end';
	};

	var proxiedCanApply = ContentTools.Tools.AlignRight.canApply;
	ContentTools.Tools.AlignRight.canApply = function( element, selection ) {
		if ( element.constructor.name === 'Icon' ) {
			return true;
		}
		return proxiedCanApply.call( this, element, selection );
	};
} )();

/* globals ContentTools, __extends, pbsParams */

ContentTools.Tools.AlignJustify = (function(_super) {
	__extends(AlignJustify, _super);

	function AlignJustify() {
		return AlignJustify.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow( AlignJustify, 'align-justify' );

	AlignJustify.label = pbsParams.labels.justify;

	AlignJustify.icon = 'align-justify';

	AlignJustify.className = '';

	AlignJustify.apply = function(element, selection, callback) {
		var _ref;
		if ((_ref = element.constructor.name) === 'ListItemText' || _ref === 'TableCellText') {
			element = element.parent();
		}
		element.style( 'textAlign', 'justify' );
		return callback(true);
	};

	AlignJustify.canApply = function( element, selection ) {
		if ( element.constructor.name === 'Icon' ) {
			return false;
		}
		return AlignJustify.__super__.constructor.canApply.call( this, element, selection );
	};

 	AlignJustify.isApplied = function(element, selection) {
  		var _ref;
		if ( ! this.canApply( element ) ) {
			return false;
		}
		if ( ( _ref = element.type() ) === 'ListItemText' || _ref === 'TableCellText' ) {
			element = element.parent();
		}
		return element.style( 'textAlign' ) === 'justify';
	};

	return AlignJustify;

})(ContentTools.Tools.AlignLeft);

/* globals ContentEdit, ContentTools, __extends, pbsParams */

ContentTools.Tools.Sidebar = (function(_super) {
	__extends(Sidebar, _super);

	function Sidebar() {
		return Sidebar.__super__.constructor.apply( this, arguments );
	}

	ContentTools.ToolShelf.stow( Sidebar, 'sidebar' );

	Sidebar.label = pbsParams.labels.sidebar_or_widget_area;

	Sidebar.icon = 'sidebar';

	Sidebar.tagName = 'sidebar';

	Sidebar.buttonName = pbsParams.labels.sidebar;

	Sidebar.apply = function(element, selection, callback) {
		var index = element.parent().children.indexOf( element ) + 1;
		this.createNew( element.parent(), index );
		return callback(true);
	};

	Sidebar.createNew = function( parent, index ) {
		var defaultSidebar = '';
		for ( var sidebarID in pbsParams.sidebar_list ) {
			if ( sidebarID ) {
				if ( pbsParams.sidebar_list.hasOwnProperty( sidebarID ) ) {
					defaultSidebar = sidebarID;
					break;
				}
			}
		}

		var shortcode = wp.shortcode.next( 'pbs_sidebar', '[pbs_sidebar id="' + defaultSidebar + '"][/pbs_sidebar]', 0 );
		var newElem = ContentEdit.Shortcode.createShortcode( shortcode );

		parent.attach( newElem, index );

		newElem.ajaxUpdate( true );
		newElem.focus();
	};

	return Sidebar;

} )( ContentTools.Tools.ElementButton );


/* globals ContentEdit, ContentTools, __extends, pbsParams */

ContentTools.Tools.Hr = (function(_super) {
	__extends(Hr, _super);

	function Hr() {
		return Hr.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(Hr, 'hr');

	Hr.label = pbsParams.labels.horizontal_rule;

	Hr.icon = 'hr';

	Hr.tagName = 'hr';

	Hr.canApply = function() {
		return true;
	};

	Hr.apply = function(element, selection, callback) {

		var hr = new ContentEdit.Hr('hr');
		var index = element.parent().children.indexOf(element);

		element.parent().attach( hr, index + 1 );

		hr.focus();

		return callback(true);
	};

	return Hr;

})(ContentTools.Tool);

/* globals ContentEdit, ContentTools, __extends, pbsParams, PBSEditor */

ContentTools.Tools.Icon = (function(_super) {
	__extends(Icon, _super);

	function Icon() {
		return Icon.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(Icon, 'icon');

	Icon.label = pbsParams.labels.icon;

	Icon.icon = 'icon';

	Icon.tagName = 'icon';

	Icon.buttonName = pbsParams.labels.icon;

	Icon.apply = function(element, selection, callback) {

		PBSEditor.iconFrame.open({
			title: pbsParams.labels.insert_icon,
			button: pbsParams.labels.use_icon,
			successCallback: function( view ) {
				var newElem = new ContentEdit.Icon( 'div', {}, view.selected.innerHTML );
				var index = element.parent().children.indexOf( element );
				element.parent().attach( newElem, index + 1 );
				newElem.focus();
			}
		});
		return callback( true );
	};

	Icon.createNew = function( parent, index ) {
		PBSEditor.iconFrame.open({
			title: pbsParams.labels.insert_icon,
			button: pbsParams.labels.use_icon,
			successCallback: function( view ) {
				var newElem = new ContentEdit.Icon( 'div', {}, view.selected.innerHTML );
				parent.attach( newElem, index );
				newElem.focus();
			}
		});
		return null;
	};

	return Icon;

} )( ContentTools.Tools.ElementButton );

/* globals ContentTools, wpLink, HTMLString, ContentSelect */


/**
 * Allow links to be placed when nothin is selected for link insertion.
 */
ContentTools.Tools.Link._pbsToolLinkOverrideCanApply = ContentTools.Tools.Link.canApply;
ContentTools.Tools.Link.canApply = function(element, selection) {
	var ret = this._pbsToolLinkOverrideCanApply( element, selection );
	if ( ! ret ) {
		if ( element.content && selection ) {
			var _ref = selection.get(), from = _ref[0], to = _ref[1];
			if ( from === to ) {
				return true;
			}
		}
	}
	return ret;
};


ContentTools.Tools.Link.getSelectedLink = function( element, from, to ) {
	// The start should be the start of the link block if possible.
	if ( from < element.content.characters.length && from >= 0 ) {
		if ( element.content.characters[ from ].hasTags( 'a' ) ) {
			while ( from > 0 ) {
				from--;
				if ( ! element.content.characters[ from ].hasTags( 'a' ) ) {
					from++;
					break;
				}
			}
		}
	}

	// The end should be the end of the link block is possible.
	if ( to < element.content.characters.length && to >= 0 ) {
		if ( element.content.characters[ to ].hasTags( 'a' ) ) {
			while ( to < element.content.characters.length ) {
				if ( ! element.content.characters[ to ].hasTags( 'a' ) ) {
					break;
				}
				to++;
			}
		}
	}

	return { from: from, to: to };
};

/**
 * Open the link dialog when clicking the link tool.
 */
ContentTools.Tools.Link.apply = function(element, selection, callback) {

	if (element.constructor.name === 'Image') {
		element.openMediaManager();
		return;
	}

	// Get the selected text.
	var _ref = selection.get(), from = _ref[0], to = _ref[1];

	var selected = this.getSelectedLink( element, from, to );
	from = selected.from;
	to = selected.to;

	// Adjust the selection since for links we are selecting whole blocks of links.
	selection = new ContentSelect.Range( from, to );

	// Get the details of the link.
	var tag = this.getTag( element, selection );
	var url = '', target = '', text = '', existingClass = '', existingStyles = '';

	if ( tag ) {
		// Editing an existing link
		if ( tag.attr( 'href' ) ) {
			url = tag.attr( 'href' );
		}
		if ( tag.attr( 'target' ) ) {
			target = tag.attr( 'target' );
		}
		if ( tag.attr( 'class' ) ) {
			existingClass = tag.attr( 'class' );
		}
		if ( tag.attr( 'style' ) ) {
			existingStyles = tag.attr( 'style' );
		}
	}

	text = element.content.unformat( from, to, 'a' );
	text = text.slice( from, to );

	// Remember the cursor position.
	if ( element.storeState ) {
		element.storeState();
	}

	// Open the link dialog box.
	// @see http://stackoverflow.com/questions/11812929/use-wordpress-link-insert-dialog-in-metabox
	wpLink.open( 'dummy-wplink-textarea' );

	// If the selected text is plain (without formatting), display the text.
	if ( text.html().trim() === text.text().trim() ) {
		document.querySelector( '#wp-link-wrap' ).classList.add( 'has-text-field' );
		text = text.text();
	} else {
		document.querySelector( '#wp-link-wrap' ).classList.remove( 'has-text-field' );
		text = '';
	}

	// Set the field values.
	// #link-options are backward compatible with 4.1.x.
	document.querySelector('#wp-link-url, #link-options #url-field').value = url;
	document.querySelector('#wp-link-text, #link-options #link-title-field').value = text;
	document.querySelector('#wp-link-target, #link-options #link-target-checkbox').checked = target !== '';

	window._pbsCurrentLink = {
		element: element,
		selection: selection,
		existingClass: existingClass,
		existingStyles: existingStyles,
		type: this.name
	};

	return callback(true);
};


/**
 * Save the link when the link modal save button is clicked.
 */
window.addEventListener( 'DOMContentLoaded', function() {
	document.addEventListener( 'click', function(ev) {
		if ( ev.target.getAttribute( 'id' ) === 'wp-link-submit' ) {

			var element = window._pbsCurrentLink.element,
				selection = window._pbsCurrentLink.selection,
				existingClass = window._pbsCurrentLink.existingClass,
				existingStyles = window._pbsCurrentLink.existingStyles,
				linkType = window._pbsCurrentLink.type;

			// Remove any old links.
			var _ref = selection.get(), from = _ref[0], to = _ref[1];
			// var currentSelection = element.content.substring(from, to);
			// if ( currentSelection.hasTags( 'a' ) ) {
			// 	var tags = currentSelection.charAt(0).tags();
			// 	for ( var i = 0; i < tags.length; i++ ) {
			// 		if ( tags[ i ].name() === 'a' ) {
			// 			if ( tags[ i ].attr( 'class' ) ) {
			// 				existingClass += existingClass ? ' ' : '';
			// 				existingClass += tags[ i ].attr( 'class' );
			// 				break;
			// 			}
			// 		}
			// 	}
			// }
			element.content = element.content.unformat(from, to, 'a');

			// #link-options are backward compatible with 4.1.x.
			var url = document.querySelector('#wp-link-url, #link-options #url-field').value,
				text = document.querySelector('#wp-link-text, #link-options #link-title-field').value,
				target = document.querySelector('#wp-link-target, #link-options #link-target-checkbox').checked;

			if ( url ) {
				var args = {
					href: url
				};
				if ( target ) {
					args.target = '_blank';
				}
				if ( existingClass ) {
					args['class'] = existingClass;
				}
				if ( existingStyles ) {
					args['style'] = existingStyles;
				}

				args = wp.hooks.applyFilters( 'pbs.tool.' + linkType.toLowerCase() + '.args', args );

				// If we CAN edit the text (meaning the text doesn't have fancy formatting),
				// and it's blank, use the URL as the text instead. This is WP's behavior.
				if ( document.querySelector( '#wp-link-wrap' ).classList.contains( 'has-text-field' ) && text.trim() === '' ) {
					text = url;
				}

				if ( text ) {

					// Create the new content.
					var content = new HTMLString.String( text, element.constructor.name === 'PreText' );
					content = content.format( 0, content.characters.length, new HTMLString.Tag( 'a', args ) );

					// Replace the old content with the new one.
					var tip = element.content.substring(0, selection.get()[0]);
					var tail = element.content.substring(selection.get()[1]);
					element.content = tip.concat(content);
					element.content = element.content.concat(tail, false);

					if ( from === to ) {
						to += content.length();
					}

				} else {
					// Just format it.
					element.content = element.content.format( from, to, new HTMLString.Tag( 'a', args ) );
				}

			} else {
				element.content = element.content.unformat( from, to, 'a' );
			}

			delete window._pbsCurrentLink;
			wp.hooks.doAction( 'pbs.tool.' + linkType.toLowerCase() + '.applied', element, from, to );

			element.updateInnerHTML();
			element.taint();

			// Restore the caret position.
			if ( element.restoreState ) {
				element.restoreState();
			}

			// Update the inspector.
			// window.updateInspector();

			wpLink.close();
		}
	} );
} );


/**
 * Originally from Link.getHref, modified to get the Tag object only.
 */
ContentTools.Tools.Link.getTag = function(element, selection) {
  var c, from, selectedContent, tag, to, _i, _j, _len, _len1, _ref, _ref1, _ref2;
  if (element.constructor.name === 'Image') {
	if (element.a) {
	  return element.a;
	}
  } else {
	_ref = selection.get(), from = _ref[0], to = _ref[1];
	selectedContent = element.content.slice(from, to);
	_ref1 = selectedContent.characters;
	for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
	  c = _ref1[_i];
	  if (!c.hasTags('a')) {
		continue;
	  }
	  _ref2 = c.tags();
	  for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
		tag = _ref2[_j];
		if (tag.name() === 'a') {
			return tag;
		}
	  }
	}
  }
  return null;
};

/* globals ContentEdit, ContentTools, __extends, PBSEditor, pbsParams */

ContentTools.Tools.Widget = (function(_super) {
	__extends(Widget, _super);

	function Widget() {
		return Widget.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(Widget, 'widget');

	Widget.label = pbsParams.labels.widget;

	Widget.icon = 'widget';

	Widget.tagName = 'widget';

	Widget.buttonName = pbsParams.labels.widget;

	Widget.apply = function(element, selection, callback) {
		var root = ContentEdit.Root.get();
		var elemFocused = null;
	    if ( root.focused() ) {
			elemFocused = root.focused();
		} else {
			var mainRegion = ContentTools.EditorApp.get().regions()['main-content'];
			if ( mainRegion.children ) {
				elemFocused = mainRegion.children[0];
			}
		}

		var index = elemFocused.parent().children.indexOf( elemFocused ) + 1;
		this.createNew( elemFocused.parent(), index );
		return callback( true );
	};

	Widget.createNew = function( parent, index ) {
		PBSEditor.widgetFrame.open({
			title: pbsParams.labels.insert_widget,
			button: pbsParams.labels.insert_widget,
			successCallback: function( view ) {
				var base = 'pbs_widget';
				var widgetSlug = view.selected.getAttribute( 'data-widget-slug' );
				var shortcodeRaw = '[pbs_widget widget="' + widgetSlug + '" ]';
				var shortcode = wp.shortcode.next( base, shortcodeRaw, 0 );
				var elem = ContentEdit.Shortcode.createShortcode( shortcode );

				parent.attach( elem, index );

				elem.focus();

				setTimeout( function() {
					elem.ajaxUpdate( true );
				}, 20 );
			}
		});
	};

	return Widget;

} )(ContentTools.Tools.ElementButton );

/* globals ContentEdit, ContentTools, __extends, pbsParams */

ContentTools.Tools.Text = ( function( _super ) {
	__extends( Text, _super );

	function Text() {
		return Text.__super__.constructor.apply( this, arguments );
	}

	ContentTools.ToolShelf.stow( Text, 'text' );

	Text.label = pbsParams.labels.text;

	Text.icon = 'text';

	Text.tagName = 'p';

	Text.shortcut = '';

	Text.buttonName = pbsParams.labels.text;

	Text.apply = function( element, selection, callback ) {
		var index = element.parent().children.indexOf( element ) + 1;
		this.createNew( element.parent(), index );
		return callback( true );
	};

	Text.createNew = function( parent, index ) {
		var newElem = new ContentEdit.Text( 'p', {}, '' );
		parent.attach( newElem, index );
		newElem.focus();
	};

	return Text;

} )( ContentTools.Tools.ElementButton );

/* globals ContentEdit, ContentTools, __extends, pbsParams */

ContentTools.Tools.Html = (function(_super) {
	__extends(Html, _super);

	function Html() {
		return Html.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(Html, 'html');

	Html.label = pbsParams.labels.html;

	Html.icon = 'html';

	Html.tagName = 'html';

	Html.buttonName = pbsParams.labels.html;

	Html.apply = function(element, selection, callback) {

		var root = ContentEdit.Root.get();
		var elemFocused = null;
        if ( root.focused() ) {
			elemFocused = root.focused();
		} else {
			var mainRegion = ContentTools.EditorApp.get().regions()['main-content'];
			if ( mainRegion.children ) {
				elemFocused = mainRegion.children[0];
			}
		}

		var dummy = document.createElement( 'DIV' );
		dummy.setAttribute( 'data-ce-tag', 'html' );
		var elem = ContentEdit.Html.fromDOMElement( dummy );
		var index = elemFocused.parent().children.indexOf( elemFocused );
		elemFocused.parent().attach( elem, index + 1 );

		elem.focus();
		elem.openEditor();

		return callback( true );
	};

	Html.createNew = function( parent, index ) {
		var dummy = document.createElement( 'DIV' );
		dummy.setAttribute( 'data-ce-tag', 'html' );
		var elem = ContentEdit.Html.fromDOMElement( dummy );
		parent.attach( elem, index );

		elem.focus();
		elem.openEditor();
	};

	return Html;

} )( ContentTools.Tools.ElementButton );

/* globals ContentEdit, ContentTools, __extends, pbsParams */

ContentTools.Tools.Map = ( function( _super ) {
	__extends( Map, _super );

	function Map() {
		return Map.__super__.constructor.apply( this, arguments );
	}

	ContentTools.ToolShelf.stow( Map, 'map' );

	Map.label = pbsParams.labels.map;

	Map.icon = 'map';

	Map.tagName = 'div';

	Map.shortcut = '';

	Map.buttonName = pbsParams.labels.map;

	// Map.premium = true;

	Map.apply = function( element, selection, callback ) {
		var index = element.parent().children.indexOf( element ) + 1;
		this.createNew( element.parent(), index );
		return callback( true );
	};

	Map.createNew = function( parent, index ) {
		var newElem = ContentEdit.Map.create();
		parent.attach( newElem, index );
		newElem.focus();
	};

	return Map;

} )( ContentTools.Tools.ElementButton );

/* globals ContentEdit, ContentTools, __extends, pbsParams */

ContentTools.Tools.Tabs = ( function( _super ) {
	__extends( Tabs, _super );

	function Tabs() {
		return Tabs.__super__.constructor.apply( this, arguments );
	}

	ContentTools.ToolShelf.stow( Tabs, 'tabs' );

	Tabs.label = pbsParams.labels.tabs;

	Tabs.icon = 'tabs';

	Tabs.tagName = 'tabs';

	Tabs.buttonName = pbsParams.labels.tabs;

	Tabs.apply = function(element, selection, callback) {
		// Don't allow tabs to be created inside tabs, create it after the current tabs.
		if ( window.pbsSelectorMatches( element._domElement, '[data-ce-tag="tabs"] *' ) ) {
			while ( element && element.constructor.name !== 'Tabs' ) {
				element = element.parent();
			}
		}

		var index = element.parent().children.indexOf( element ) + 1;
		this.createNew( element.parent(), index );
		return callback(true);
	};

	Tabs.createNew = function( parent, index ) {

		var hashes = [];
		while ( hashes.length < 4 ) {
			var hash = window.PBSEditor.generateHash();
			if ( document.querySelector( '.pbs-tabs-' + hash ) ) {
				continue;
			}
			if ( document.querySelector( '[id="pbs-tabs-' + hash + '"]' ) ) {
				continue;
			}
			if ( hashes.indexOf( hash ) !== -1 ) {
				continue;
			}
			hashes.push( hash );
		}

		var elem = document.createElement( 'div' );
		elem.classList.add( 'pbs-tabs-' + hashes[0] );
		elem.setAttribute( 'data-ce-tag', 'tabs' );

		/* jshint multistr: true */
		elem.innerHTML =
			'<input class="pbs-tab-state" type="radio" name="pbs-tabs-' + hashes[0] + '" id="pbs-tab-' + hashes[1] + '" data-tab="1" data-ce-tag="tabradio" checked />' +
			'<input class="pbs-tab-state" type="radio" name="pbs-tabs-' + hashes[0] + '" id="pbs-tab-' + hashes[2] + '" data-tab="2" data-ce-tag="tabradio" />' +
			'<input class="pbs-tab-state" type="radio" name="pbs-tabs-' + hashes[0] + '" id="pbs-tab-' + hashes[3] + '" data-tab="3" data-ce-tag="tabradio" />' +
			'<div class="pbs-tab-tabs" data-ce-tag="tabcontainer">' +
		        '<label for="pbs-tab-' + hashes[1] + '" data-ce-tag="tab" class="pbs-tab-active"><span style="font-weight: bold;">Tab 1</span></label>' +
		        '<label for="pbs-tab-' + hashes[2] + '" data-ce-tag="tab"><span style="font-weight: bold;">Tab 2</span></label>' +
		        '<label for="pbs-tab-' + hashes[3] + '" data-ce-tag="tab"><span style="font-weight: bold;">Tab 3</span></label>' +
		    '</div>' +
			'<div class="pbs-tab-panels" data-ce-tag="tabpanelcontainer">' +
				'<div class="pbs-row" data-panel="1"><div class="pbs-col"><p>Tab 1 content</p></div></div>' +
				'<div class="pbs-row" data-panel="2"><div class="pbs-col"><p>Tab 2 content</p></div></div>' +
				'<div class="pbs-row" data-panel="3"><div class="pbs-col"><p>Tab 3 content</p></div></div>' +
			'</div>';

		var newElem = ContentEdit.Tabs.fromDOMElement( elem );
		parent.attach( newElem, index );
		newElem.focus();
	};

	return Tabs;

} )( ContentTools.Tools.ElementButton );


/* globals ContentTools, ContentEdit, ContentSelect, __extends, pbsParams */

// The Media Manager window needs to know our post ID so that Insert from URL will work.
if ( wp.media.view.settings.post ) {
	wp.media.view.settings.post.id = pbsParams.post_id;
}

ContentTools.Tools.pbsMedia = (function(_super) {
	__extends(pbsMedia, _super);

	function pbsMedia() {
		return pbsMedia.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(pbsMedia, 'pbs-media');

	pbsMedia.label = pbsParams.labels.media;

	pbsMedia.icon = 'image';

	pbsMedia.buttonName = pbsParams.labels.media;

	pbsMedia.apply = function(element, selection) {
		if ( this._isOpen() ) {
			return;
		}

		var root = ContentEdit.Root.get();
		var elem = root.focused();

        ContentSelect.Range.query(elem._domElement);
        selection = ContentSelect.Range.query(elem._domElement);
		window._tempSelection = selection;

		this._attachToParent = elem.parent();
		this._attachIndex = elem.parent().children.indexOf( elem ) + 1;

		// We override the insert function to make this insert in CT.
		window._pbsAddMediaOrigInsert = wp.media.editor.insert;
		wp.media.editor.insert = this.pbsAddMediaOverrideInsert.bind( this );

		wp.media.editor.open();
	};

	pbsMedia.createNew = function( parent, index ) {
		this._attachToParent = parent;
		this._attachIndex = index;

		// We override the insert function to make this insert in CT.
		window._pbsAddMediaOrigInsert = wp.media.editor.insert;
		wp.media.editor.insert = this.pbsAddMediaOverrideInsert.bind( this );

		wp.media.editor.open();
	};

	pbsMedia._isOpen = function() {
		// The editor is not present at the start.
		if ( ! wp.media.editor.get() ) {
			return false;
		}

		// Check if the media manager window is visible.
		var el = wp.media.editor.get().el;
		return ! ( el.offsetWidth === 0 && el.offsetHeight === 0 );
	};

	pbsMedia.pbsAddMediaOverrideInsert = function( html ) {

	    var index, newElem, root = ContentEdit.Root.get();

		// Blur the currently selected element.
	    if ( root.focused() ) {

			// If adding an image, add an Image Element.
			var addedImage = false;
			if ( ! html.match( /^\[/ ) ) {
				var dummy = document.createElement('p');
				dummy.innerHTML = html;
				newElem = ContentEdit.Image.fromDOMElement( dummy.firstChild );
				if ( newElem ) {
					this._attachToParent.attach( newElem, this._attachIndex );
					addedImage = true;
					newElem.focus();
				}

			} else {

				var base = html.match( /^\[(\w+)/ );
				base = base[1];
				var shortcode = wp.shortcode.next( base, html, 0 );
				newElem = ContentEdit.Shortcode.createShortcode( shortcode );
				this._attachToParent.attach( newElem, this._attachIndex );

				newElem.ajaxUpdate( true );
				newElem.focus();

			}
	    }

		// Revert to the original insert function.
		wp.media.editor.insert = window._pbsAddMediaOrigInsert;
		delete window._pbsAddMediaOrigInsert;
	};


	return pbsMedia;

} )( ContentTools.Tools.ElementButton );


/**
 * Open the media tool when an image gets dragged into the screen.
 */
(function() {
	var dragEnterHandler = function() {

		// Don't open ANOTHER media manager when there's one open already.
		var mediaModals = document.querySelectorAll( '[tabindex="0"] .media-modal' );
		var allModalsHidden = true;
		Array.prototype.forEach.call( mediaModals, function( el ) {
			if ( el.offsetHeight !== 0 ) {
				allModalsHidden = false;
			}
		} );
		if ( ! allModalsHidden ) {
			return;
		}

		// Open the media manager.
		var root = ContentEdit.Root.get();
		var elem = root.focused();
		if ( elem ) {
			window.PBSEditor.getToolUI( 'pbs-media' ).apply( elem, null );
		}
	};

	window.addEventListener( 'DOMContentLoaded', function() {
		var editor = ContentTools.EditorApp.get();
		editor.bind('start', function() {
			document.addEventListener('dragenter', dragEnterHandler);
		});
		editor.bind('stop', function() {
			document.removeEventListener('dragenter', dragEnterHandler);
		});
	});
})();

/* globals ContentTools */

( function() {
	ContentTools.Tools.Table.canApply = function() {
		return true;
	};
} )();


( function() {
	ContentTools.Tools.Table.createNew = function( parent, index ) {
		var app, dialog, modal, table;
		app = ContentTools.EditorApp.get();
		modal = new ContentTools.ModalUI();
		table = null;
		dialog = new ContentTools.TableDialog(table);
		dialog.bind('cancel', (function(_this) {
		  return function() {
			dialog.unbind('cancel');
			modal.hide();
			dialog.hide();
			return;
		  };
		})(this));
		dialog.bind('save', (function(_this) {
		  return function(tableCfg) {
			dialog.unbind('save');
			  table = _this._createTable(tableCfg);
			  parent.attach(table, index);
			  table.firstSection().children[0].children[0].children[0].focus();
			modal.hide();
			dialog.hide();
			return;
		  };
		})(this));
		app.attach(modal);
		app.attach(dialog);
		modal.show();
		return dialog.show();
	};
} )();

/* globals ContentTools, __extends, pbsParams */

ContentTools.Tools.Underline = (function(_super) {
  __extends(Underline, _super);

  function Underline() {
    return Underline.__super__.constructor.apply(this, arguments);
  }

  ContentTools.ToolShelf.stow(Underline, 'underline');

  Underline.label = pbsParams.labels.underline;

  Underline.icon = 'underline';

  Underline.tagName = 'span';

  Underline.shortcut = 'ctrl+u';

  Underline.canApply = function(element, selection) {
  	return ContentTools.Tools.Bold.canApply( element, selection );
  };

  Underline.isApplied = function(element, selection) {
  	var from = 0, to = 0, _ref;
  	if (element.content === void 0 || !element.content.length()) {
  		return false;
  	}
  	if ( selection ) {
  		_ref = selection.get(), from = _ref[0], to = _ref[1];
  	}

  	// If nothing is selected, adjust the whole element
  	if ( from === to ) {
  		from = 0;
  		to = element.content.length();
  	}

	return element.content.substring(from, to).getStyle('text-decoration', element ) === 'underline';
  };

  Underline.apply = function(element, selection, callback) {
	  var from, to, _ref;
	  element.storeState();

	  _ref = selection.get(), from = _ref[0], to = _ref[1];

	  // If nothing is selected, adjust the whole element
	  if ( from === to ) {
		  from = 0;
		  to = element.content.length();
	  }

	  var style = element.content.substring(from, to).getStyle('text-decoration', element );
	  if ( ! style || style === 'none' || style === 'line-through' ) {
		  style = 'underline';
	  } else {
		  style = 'none';
	  }
	  var newStyle = { 'text-decoration': style };

	  element.content = element.content.style( from, to, element._tagName, newStyle );

	  element.updateInnerHTML();
	  element.taint();
	  element.restoreState();
	  return callback(true);
  };

  return Underline;

})(ContentTools.Tool);

/* globals ContentTools, ContentEdit, __extends, pbsParams */
ContentTools.Tools.paragraphPicker = (function(_super) {
	__extends(paragraphPicker, _super);

	function paragraphPicker() {
		return paragraphPicker.__super__.constructor.apply(this, arguments);
	}

	ContentTools.ToolShelf.stow(paragraphPicker, 'paragraphPicker');

	paragraphPicker.label = pbsParams.labels.text_style;

	paragraphPicker.icon = 'paragraph-picker';

	paragraphPicker.tagName = 'p';

	paragraphPicker.types = {
		p: { className: 'Paragraph', label: pbsParams.labels.paragraph },
		h1: { className: 'Heading1', label: pbsParams.labels.heading_1 },
		h2: { className: 'Heading2', label: pbsParams.labels.heading_2 },
		h3: { className: 'Heading3', label: pbsParams.labels.heading_3 },
		h4: { className: 'Heading4', label: pbsParams.labels.heading_4 },
		h5: { className: 'Heading5', label: pbsParams.labels.heading_5 },
		h6: { className: 'Heading6', label: pbsParams.labels.heading_6 },
		blockquote: { className: 'Blockquote', label: '"' + pbsParams.labels.blockquote + '"' },
		pre: { className: 'Preformatted', label: pbsParams.labels.preformatted }
	};

	paragraphPicker.canApply = function(element) {
		if ( this.types.hasOwnProperty( element.tagName() ) ) {
			for ( var tag in this.types ) {
				if ( ! this.types.hasOwnProperty( tag ) ) {
					continue;
				}
				if ( element.tagName() === tag ) {
					continue;
				}
				if ( this._ceElement._domElement.classList.contains( 'pbs-paragraph-picker-type-' + tag ) ) {
					this._ceElement._domElement.classList.remove( 'pbs-paragraph-picker-type-' + tag );
				}
			}
			if ( ! this._ceElement._domElement.classList.contains( 'pbs-paragraph-picker-type-' + element.tagName() ) ) {
				this._ceElement._domElement.classList.add( 'pbs-paragraph-picker-type-' + element.tagName() );
				this._ceElement._domElement.firstChild.textContent = this.types[ element.tagName() ].label;
			}
		}
		if ( element._domElement.tagName === 'LABEL' ) {
			return false;
		}
  		return element !== void 0;
	};

	paragraphPicker.isApplied = function() {
		return ! this._ceElement._domElement.classList.contains( 'pbs-paragraph-picker-type-p' );
	};

	paragraphPicker.apply = function(element, selection, callback) {
		return this.applyTag( element, this._selectedType, selection, callback );
	};


	paragraphPicker.applyTag = function(element, tag, selection, callback) {
		var app, forceAdd, paragraph, region;
		app = ContentTools.EditorApp.get();
		forceAdd = app.ctrlDown();

		// Reset some styles.

		if ( ContentTools.Tools.Bold.isApplied( element, selection ) ) {
			ContentTools.Tools.Bold.apply( element, selection, function() {} );
		}

		if ( ContentTools.Tools.Heading.canApply( element ) && ! forceAdd ) {
			return ContentTools.Tools[ paragraphPicker.types[ tag ].className ].apply( element, selection, callback );
		} else {
		  if (element.parent().type() !== 'Region') {
			element = element.closest(function(node) {
			  return node.parent().type() === 'Region';
			});
		  }
		  region = element.parent();
		  paragraph = new ContentEdit.Text( tag );
		  region.attach(paragraph, region.children.indexOf(element) + 1);
		  paragraph.focus();
		  return callback(true);
		}
	};


	paragraphPicker._paragraphPickerMount = function() {
		var _this = this;
		var d = document.createElement('DIV');
		for ( var tag in this.types ) {
			if ( ! this.types.hasOwnProperty( tag ) ) {
				continue;
			}

			var label = document.createElement( tag );
			label.innerHTML = this.types[ tag ].label;
			label.setAttribute( 'data-tag', tag );
			label.setAttribute( 'data-class', this.types[ tag ].className );
			d.appendChild( label );

			label.addEventListener( 'mousedown', function(ev) {
				ev.preventDefault();
				this._selectedType = ev.target.getAttribute( 'data-tag' );
				this._selectedClass = ev.target.getAttribute( 'data-class' );
				this._ceElement._mouseDown = true;
				this._ceElement._onMouseUp();

				this.hidePicker();
			}.bind( this ) );

		}

		this._ceElement._domElement.innerHTML = pbsParams.labels.paragraph;
		this._ceElement._domElement.appendChild(d);

		// Hide the paragraphpicker when going out of the inspector
		document.querySelector('.ct-toolbox').addEventListener('mouseleave', function() {
			_this.hidePicker();
		});

		// Close popup if other popups open.
		wp.hooks.addAction( 'pbs.tool.popup.open', function() {
			this.hidePicker();
		}.bind(this));
	};


	paragraphPicker.hidePicker = function() {
		// Hide the paragraphpicker container.
		this._ceElement._domElement.querySelector('div').style.display = '';

		// Forget the previously selected text.
		this.rememberedSelection = null;
	};

	return paragraphPicker;

})(ContentTools.Tool);



// If another element is selected, hide the paragraph picker
ContentEdit.Root.get().bind('blur', function() {
	var tool = window.PBSEditor.getToolUI( 'paragraph' );
	// var tool = ContentTools.EditorApp.get()._toolbox._toolUIs.paragraph;
	if ( typeof tool !== 'undefined' ) {
		tool.tool.hidePicker();
	}
});


// Implement our own mount event handler.
(function() {
	var proxied = ContentTools.ToolUI.prototype.mount;
	ContentTools.ToolUI.prototype.mount = function(domParent, before) {
		var ret = proxied.call( this, domParent, before );
		this.tool._ceElement = this;
		if ( typeof this.tool._paragraphPickerMount !== 'undefined' ) {
			this.tool._paragraphPickerMount();
		}
		return ret;
	};
})();


// Remove the existing event handlers for the paragraph tool. We are going to use our own
(function() {
	var proxied = ContentTools.ToolUI.prototype._addDOMEventListeners;
 	ContentTools.ToolUI.prototype._addDOMEventListeners = function() {
		if ( this.tool.name === 'paragraphPicker' ) {
			var _this = this;

			// Cancel the mouse down event to prevent focusing
	        this._domElement.addEventListener('mousedown', function(e) {
				if ( e.target.classList.contains('ct-tool') ) {
					e.preventDefault();
				}
			});

			// Show the paragraphpicker on click
	        this._domElement.addEventListener('click', function(e) {
				if ( e.target.classList.contains('ct-tool') ) {

					// Let others know that we're going to open a popup.
					if ( _this._domElement.querySelector('div').style.display === '' ) {
						wp.hooks.doAction( 'pbs.tool.popup.open' );
					}

					// Show the paragraph picker
					_this._domElement.querySelector('div').style.display = _this._domElement.querySelector('div').style.display ? '' : 'block';

				}
	        });

		// Normal process
		} else {
			return proxied.call( this );
		}
	};
})();

/* globals ContentTools, __extends, pbsParams */

ContentTools.Tools.Strikethrough = (function(_super) {
  __extends(Strikethrough, _super);

  function Strikethrough() {
    return Strikethrough.__super__.constructor.apply(this, arguments);
  }

  ContentTools.ToolShelf.stow(Strikethrough, 'strikethrough');

  Strikethrough.label = pbsParams.labels.strikethrough;

  Strikethrough.icon = 'strikethrough';

  Strikethrough.tagName = 'span';

  Strikethrough.canApply = function(element, selection) {
  	return ContentTools.Tools.Bold.canApply( element, selection );
  };

  Strikethrough.isApplied = function(element, selection) {
  	var from = 0, to = 0, _ref;
  	if (element.content === void 0 || !element.content.length()) {
  		return false;
  	}
  	if ( selection ) {
  		_ref = selection.get(), from = _ref[0], to = _ref[1];
  	}

  	// If nothing is selected, adjust the whole element
  	if ( from === to ) {
  		from = 0;
  		to = element.content.length();
  	}

	return element.content.substring(from, to).getStyle('text-decoration', element ) === 'line-through';
  };

  Strikethrough.apply = function(element, selection, callback) {
	  var from, to, _ref;
	  element.storeState();

	  _ref = selection.get(), from = _ref[0], to = _ref[1];

	  // If nothing is selected, adjust the whole element
	  if ( from === to ) {
		  from = 0;
		  to = element.content.length();
	  }

	  var style = element.content.substring(from, to).getStyle('text-decoration', element );
	  if ( ! style || style === 'none' || style === 'underline' ) {
		  style = 'line-through';
	  } else {
		  style = 'none';
	  }
	  var newStyle = { 'text-decoration': style };

	  element.content = element.content.style( from, to, element._tagName, newStyle );

	  element.updateInnerHTML();
	  element.taint();
	  element.restoreState();
	  return callback(true);
  };

  return Strikethrough;

})(ContentTools.Tool);



/* globals PBSEditor, ContentTools, ContentEdit, pbsParams */



/**

 * All shortcut keys are defined here.

 */

PBSEditor.shortcuts = {

	'ctrl+r': function( element, selection, callback ) {

		if ( ContentTools.Tools.AlignRight.canApply( element, selection ) ) {

			ContentTools.Tools.AlignRight.apply( element, selection, callback );

		}

	},

	'ctrl+u': function( element, selection, callback ) {

		if ( ContentTools.Tools.Underline.canApply( element, selection ) ) {

			ContentTools.Tools.Underline.apply( element, selection, callback );

		}

	},

	'ctrl+e': function( element, selection, callback ) {

		if ( ContentTools.Tools.AlignCenter.canApply( element, selection ) ) {

			ContentTools.Tools.AlignCenter.apply( element, selection, callback );

		}

	},

	'ctrl+l': function( element, selection, callback ) {

		if ( ContentTools.Tools.AlignLeft.canApply( element, selection ) ) {

			ContentTools.Tools.AlignLeft.apply( element, selection, callback );

		}

	},

	'ctrl+j': function( element, selection, callback ) {

		if ( ContentTools.Tools.AlignJustify.canApply( element, selection ) ) {

			ContentTools.Tools.AlignJustify.apply( element, selection, callback );

		}

	},

	'ctrl+i': function( element, selection, callback ) {

		if ( ContentTools.Tools.Italic.canApply( element, selection ) ) {

			ContentTools.Tools.Italic.apply( element, selection, callback );

		}

	},

	'ctrl+b': function( element, selection, callback ) {

		if ( ContentTools.Tools.Bold.canApply( element, selection ) ) {

			ContentTools.Tools.Bold.apply( element, selection, callback );

		}

	},

	'ctrl+k': function( element, selection, callback ) {

		if ( ContentTools.Tools.Link.canApply( element, selection ) ) {

			ContentTools.Tools.Link.apply( element, selection, callback );

		}

	},

	'ctrl+shift+k': function( element, selection, callback ) {

		if ( ContentTools.Tools.Button.canApply( element, selection ) ) {

			ContentTools.Tools.Button.apply( element, selection, callback );

		}

	},

	'ctrl+p': function( element, selection, callback ) {

		ContentTools.Tools.paragraphPicker.applyTag( element, 'p', selection, callback );

	},

	'ctrl+1': function( element, selection, callback ) {

		ContentTools.Tools.paragraphPicker.applyTag( element, 'h1', selection, callback );

	},

	'ctrl+2': function( element, selection, callback ) {

		ContentTools.Tools.paragraphPicker.applyTag( element, 'h2', selection, callback );

	},

	'ctrl+3': function( element, selection, callback ) {

		ContentTools.Tools.paragraphPicker.applyTag( element, 'h3', selection, callback );

	},

	'ctrl+4': function( element, selection, callback ) {

		ContentTools.Tools.paragraphPicker.applyTag( element, 'h4', selection, callback );

	},

	'ctrl+.': function( element, selection, callback ) {

		if ( ContentTools.Tools.UnorderedList.canApply( element, selection ) ) {

			ContentTools.Tools.UnorderedList.apply( element, selection, callback );

		}

	},

	'ctrl+/': function( element, selection, callback ) {

		if ( ContentTools.Tools.OrderedList.canApply( element, selection ) ) {

			ContentTools.Tools.OrderedList.apply( element, selection, callback );

		}

	},

	'ctrl+=': function( element, selection, callback ) {

		if ( ContentTools.Tools.FontUp.canApply( element, selection ) ) {

			ContentTools.Tools.FontUp.apply( element, selection, callback, 'up' );

		}

	},

	'ctrl+-': function( element, selection, callback ) {

		if ( ContentTools.Tools.FontUp.canApply( element, selection ) ) {

			ContentTools.Tools.FontUp.apply( element, selection, callback, 'down' );

		}

	},

	'ctrl+o': function( element, selection, callback ) {

		if ( ContentTools.Tools.Code.canApply( element, selection ) ) {

			ContentTools.Tools.Code.apply( element, selection, callback );

		}

	},

	'ctrl+z': function() {

		ContentTools.Tools.Undo.apply( null, null, function() {} );

	},

	'ctrl+m': function( element, selection, callback ) {

		ContentTools.Tools.pbsMedia.apply( element, selection, callback );

	}

};

var redoKey = navigator.appVersion.indexOf('Mac') !== -1 ? 'ctrl+shift+z' : 'ctrl+y';

PBSEditor.shortcuts[ redoKey ] = function() {

	ContentTools.Tools.Redo.apply( null, null, function() {} );

};





/**

 * Adjust the toolbar labels from here.

 */

ContentTools.Tools.paragraphPicker.label += ' (ctrl+p/1/2/3)';

ContentTools.Tools.Bold.label += ' (ctrl+b)';

ContentTools.Tools.Italic.label += ' (ctrl+i)';

ContentTools.Tools.Underline.label += ' (ctrl+u)';

ContentTools.Tools.Link.label += ' (ctrl+k)';

ContentTools.Tools.AlignLeft.label += ' (ctrl+l)';

ContentTools.Tools.AlignCenter.label += ' (ctrl+e)';

ContentTools.Tools.AlignRight.label += ' (ctrl+r)';

ContentTools.Tools.AlignJustify.label += ' (ctrl+j)';


ContentTools.Tools.Code.label += ' (ctrl+o)';

ContentTools.Tools.UnorderedList.label += ' (ctrl+.)';

ContentTools.Tools.OrderedList.label += ' (ctrl+/)';

ContentTools.Tools.Undo.label += ' (ctrl+z)';

ContentTools.Tools.Redo.label += ' (' + redoKey + ')';





/**

 * Fix the shortcuts so that we can get the keycode combination.

 */

PBSEditor._shortcuts = {};

for ( var code in PBSEditor.shortcuts ) {

	if ( PBSEditor.shortcuts.hasOwnProperty( code ) ) {



		// Split into modifier + key.

		var matches = code.match( /(^.*\+)([^+]*)$/ );

		if ( ! matches.length ) {

			continue;

		}



		// "Ctrl+" or "ctrl+shift".

		var key = matches[1];



		// The key.

		var sc = matches[2];

		if ( sc === 'space' ) {

			sc = 32;

		} else if ( sc === 'up' ) {

			sc = 38;

		} else if ( sc === 'right' ) {

			sc = 39;

		} else if ( sc === 'down' ) {

			sc = 40;

		} else if ( sc === 'left' ) {

			sc = 37;

		} else if ( sc === 'tab' ) {

			sc = 9;

		} else if ( sc === 'enter' ) {

			sc = 13;

		} else if ( sc === '.' ) {

			sc = 190;

		} else if ( sc === '/' ) {

			sc = 191;

		} else if ( sc === '=' ) {

			sc = 187;

		} else if ( sc === '-' ) {

			sc = 189;

		} else if ( sc === 'delete' ) {

			sc = 8;

		}

		if ( typeof sc === 'number' ) {

			key += sc;

		} else {

			sc = sc.match( /[a-z]/ ) ? sc.toUpperCase() : sc;

			key += sc.charCodeAt(0);

		}



		PBSEditor._shortcuts[ key ] = PBSEditor.shortcuts[ code ];

	}

}

PBSEditor.shortcuts = PBSEditor._shortcuts;

PBSEditor._shortcuts = null;





(function() {



	var getShortcutKey = function( ev ) {

		var key = '';

		if ( ev.metaKey || ev.ctrlKey ) {

			key += 'ctrl';

		}

		if ( ev.shiftKey ) {

			key += key ? '+' : '';

			key += 'shift';

		}

		if ( ! key ) {

			return;

		}

		key += '+' + ev.keyCode;



		return key;

	};



	var shortcutListener = function(ev) {



		var key = getShortcutKey( ev );

		var element = ContentEdit.Root.get().focused();



		if ( wp.hooks.applyFilters( 'pbs.shortcuts', false, key, element ) ) {

			ev.preventDefault();

			return;

		}



		if ( ! element ) {

			return;

		}



		if ( PBSEditor.shortcuts[ key ] ) {



			var selection = null;

			if ( element.selection ) {

				selection = element.selection();

			}



			ev.preventDefault();



			PBSEditor.shortcuts[ key ]( element, selection, function() {} );



			ev.preventDefault();

			ev.stopPropagation();

			return;

		}

	};





	// Because we're listening on the document keydown event, some shortcuts will might

	// not trigger correctly and might continue with their default behavior (e.g. navigating columns),

	// this fixes this by handling the call from the Text Element level.

	// var elementKeyDownProxy = ContentEdit.Text.prototype._onKeyDown;

	// ContentEdit.Text.prototype._onKeyDown = function( ev ) {

	// 	shortcutListener( ev );

	//

	// 	elementKeyDownProxy.call( this, ev );

	// };





	var addDomEventListenersProxy = ContentTools.ToolboxBarUI.prototype._addDOMEventListeners;

	ContentTools.ToolboxBarUI.prototype._addDOMEventListeners = function() {

		document.addEventListener( 'keydown', shortcutListener );

		return addDomEventListenersProxy.call( this );

	};



	var removeDomEventListenersProxy = ContentTools.ToolboxBarUI.prototype._removeDOMEventListeners;

	ContentTools.ToolboxBarUI.prototype._removeDOMEventListeners = function() {

		document.removeEventListener( 'keydown', shortcutListener );

		return removeDomEventListenersProxy.call( this );

	};

})();





/**

 * Adminbar shortcuts.

 */

window.addEventListener( 'DOMContentLoaded', function() {

	document.addEventListener( 'keydown', function(ev) {

		if ( ! window.PBSEditor.isEditing() ) {



			// Edit.

			if ( ( ev.metaKey || ev.ctrlKey ) && ev.keyCode === 69 ) {

				document.querySelector( '#wp-admin-bar-gambit_builder_edit' ).dispatchEvent( new CustomEvent( 'click' ) );

				ev.preventDefault();

			}



		} else {



			if ( ( ev.metaKey || ev.ctrlKey ) && ( ev.keyCode === 83 || ev.keyCode === 27 ) ) {

				ev.preventDefault();



				var element = ContentEdit.Root.get().focused();

				if ( element ) {

					element.blur();

				}



				// Save.

				if ( ev.keyCode === 83 ) {

					document.querySelector( '#wp-admin-bar-gambit_builder_save' ).dispatchEvent( new CustomEvent( 'click' ) );



				// Cancel.

				} else {

					document.querySelector( '#wp-admin-bar-gambit_builder_cancel' ).dispatchEvent( new CustomEvent( 'click' ) );

				}



			} else if ( ( ev.metaKey || ev.ctrlKey ) && ev.shiftKey && ev.keyCode === 82 ) {



				// New reload shortcut.

				ev.preventDefault();

				location.reload();



			}

		}

	});

} );




/**

 * Click handler for the "Get Premium" Admin bar button.

 */

document.addEventListener( 'DOMContentLoaded', function() {

	var goPremiumButton = document.querySelector( '#wp-admin-bar-pbs_go_premium' );

	if ( goPremiumButton ) {



		goPremiumButton.addEventListener( 'click', function() {



			// Create the modal.

			var div = document.createElement( 'DIV' );

			div.innerHTML = wp.template( 'pbs-learn-premium' )();

			div.setAttribute( 'id', 'pbs-learn-premium-wrapper' );

			document.body.appendChild( div );



			// Play the entrance animation.

			setTimeout( function() {

				div.classList.add( 'pbs-shown' );

			}, 50 );



			// Close handler.

			document.querySelector( '#pbs-learn-premium-wrapper .pbs-tour-close' ).addEventListener( 'click', function() {

				document.body.removeChild( div );

			} );



			/**

			 * All these below are for the feature carousel.

			 */

			var carousel = document.querySelector( '.pbs-learn-carousel' );

			var speed = 7000; // 5 seconds



			function carouselHide(num) {

			    indicators[num].setAttribute('data-state', '');

			    slides[num].setAttribute('data-state', '');



			    slides[num].style.opacity=0;

			}



			function carouselShow(num) {

			    indicators[num].checked = true;

			    indicators[num].setAttribute('data-state', 'active');

			    slides[num].setAttribute('data-state', 'active');



			    slides[num].style.opacity=1;

			}



			function setSlide(slide) {

			    return function() {

			        // Reset all slides

			        for (var i = 0; i < indicators.length; i++) {

			            indicators[i].setAttribute('data-state', '');

			            slides[i].setAttribute('data-state', '');



			            carouselHide(i);

			        }



			        // Set defined slide as active

			        indicators[slide].setAttribute('data-state', 'active');

			        slides[slide].setAttribute('data-state', 'active');

			        carouselShow(slide);



			        // Stop the auto-switcher

			        clearInterval(switcher);

			    };

			}



			function switchSlide() {

			    var nextSlide = 0;



			    // Reset all slides

			    for (var i = 0; i < indicators.length; i++) {

			        // If current slide is active & NOT equal to last slide then increment nextSlide

			        if ( ( indicators[i].getAttribute('data-state') === 'active' ) && ( i !== (indicators.length-1))) {

			            nextSlide = i + 1;

			        }



			        // Remove all active states & hide

			        carouselHide(i);

			    }



			    // Set next slide as active & show the next slide

			    carouselShow(nextSlide);

			}



			if (carousel) {

			    var slides = carousel.querySelectorAll('.pbs-learn-slide');

			    var indicators = carousel.querySelectorAll('.pbs-learn-indicators label');



			    var switcher = setInterval(function() {

			        switchSlide();

			    }, speed);



			    for (var i = 0; i < indicators.length; i++) {

			        indicators[i].querySelector( 'input' ).addEventListener( 'click', setSlide(i));

			    }

			}



		} );

	}

} );


/* globals pbsParams, ContentTools */


/**
 * Plays the tour. Should be only called when the editor is running.
 */
window.pbsPlayTour = function() {

	// If the tour has started before, possible from another page, don't show it again.
	// Helpful for the PBS demo site.
	if ( localStorage ) {
		if ( localStorage.getItem( 'pbs_did_intro' ) ) {
			return;
		}
		localStorage.setItem( 'pbs_did_intro', 1 );
	}

	var tourModalWrapper = document.createElement( 'DIV' );
	tourModalWrapper.classList.add( 'pbs-tour-modal-wrapper' );

	var tourModal = document.createElement( 'DIV' );
	tourModal.classList.add( 'pbs-tour-modal' );
	tourModalWrapper.appendChild( tourModal );

	var closeButton = document.createElement( 'DIV' );
	closeButton.classList.add( 'pbs-tour-close' );
	tourModal.appendChild( closeButton );

	closeButton.addEventListener( 'click', function() {
		tourModalWrapper.classList.remove( 'pbs-tour-shown' );
		setTimeout( function() {
			document.body.removeChild( tourModalWrapper );
		}, 400 );
	} );

	var iframe = document.createElement( 'IFRAME' );
	iframe.setAttribute( 'src', 'https://www.youtube.com/embed/dSU2l1Vhp50?rel=0&autoplay=1&showinfo=0&autohide=1&controls=0' );
	iframe.setAttribute( 'width', '800' );
	iframe.setAttribute( 'height', '450' );
	iframe.setAttribute( 'frameborder', '0' );
	iframe.setAttribute( 'allowfullscreen', '1' );
	tourModal.appendChild( iframe );

	document.body.appendChild( tourModalWrapper );

	setTimeout( function() {
		tourModalWrapper.classList.add( 'pbs-tour-shown' );
	}, 100 );

	var editor = ContentTools.EditorApp.get();
	editor.unbind( 'start', window.pbsPlayTour );
};


/**
 * Start the tour if it's the first time playing.
 */
wp.hooks.addAction( 'pbs.ct.ready', function() {
	if ( ! pbsParams.do_intro ) {
		return;
	}

	var editor = ContentTools.EditorApp.get();
	editor.bind( 'start', window.pbsPlayTour );
});

/* globals pbsParams */

/**
 * Asks the user to rate PBS.
 */
window.addEventListener( 'DOMContentLoaded', function() {

 	// Send out heartbeat stuff.
 	jQuery( document ).on( 'heartbeat-send', function( e, data ) {

 		// Only do this when editing.
 		if ( ! window.PBSEditor.isEditing() ) {
 			return;
 		}

		data.tracking_interval = wp.heartbeat.interval();
	} );

	// Handle heartbeat responses.
	jQuery( document ).on( 'heartbeat-tick', function( e, data ) {

		// Only do this when editing.
		if ( ! window.PBSEditor.isEditing() ) {
			return;
		}

		if ( data.ask_for_rating ) {
			document.querySelector( '#pbs-rate-desc' ).innerHTML = data.ask_for_rating;
			document.querySelector( '#wp-admin-bar-pbs_rate' ).classList.remove( 'pbs-hidden' );
			document.querySelector( '#pbs-rate-no' ).addEventListener( 'click', function( ev ) {
				ev.preventDefault();
				document.querySelector( '#wp-admin-bar-pbs_rate' ).classList.add( 'pbs-hidden' );
			} );
			document.querySelector( '#pbs-rate-go' ).addEventListener( 'click', function( ev ) {
				ev.preventDefault();
				document.querySelector( '#wp-admin-bar-pbs_rate' ).classList.add( 'pbs-hidden' );

				var payload = new FormData();
				payload.append( 'action', 'pbs_ask_rating_rated' );
				payload.append( 'nonce', pbsParams.nonce );

				var xhr = new XMLHttpRequest();
				xhr.open( 'POST', pbsParams.ajax_url );
				xhr.send( payload );
			} );
		}
	} );
} );

/**
 * Send usage stats to PBS.com if opted in.
 *
 * @since 2.11
 * @since 3.2 Now uses Freemius instead of our own opt-in modal.
 *
 * @see class-stats-tracking.php
 */

/* globals pbsParams */

window.addEventListener( 'DOMContentLoaded', function() {

	if ( pbsParams.tracking_opted_in ) {
		wp.hooks.addAction( 'pbs.save.payload.post', function( payload ) {
		    var xhrTracking = new XMLHttpRequest();
		    xhrTracking.open( 'POST', pbsParams.ajax_url );
			payload.append( 'action', 'pbs_save_content_tracking' );
		    xhrTracking.send( payload );
		} );
	}
} );

/**
 * Fix for scenario:
 * Some themes, such as "eighties" don't open the Media Manager (or any modal view),
 * in the frontend. This can be tested by running the command: `wp.media.editor.open()`
 * in the browser console.
 *
 * Cause:
 * The cause of this is in the Modal open function in media-views.js. The line that
 * checks for visibility: `if ( $el.is(':visible') )` returns TRUE, even though the element
 * isn't visible yet - a false positive.
 *
 * Fix:
 * An unobtrusive & least conflicting fix is to override jQuery's `is` method ONLY
 * when checking the visibility of a Modal, and replace it with a working visibility check:
 * http://stackoverflow.com/a/33456469/174172
 *
 * It seems that the modal is always `<div tabindex="0"></div>`.
 */
(function() {
	var proxied = jQuery.fn.is;
	jQuery.fn.is = function( selector ) {
		var ret = proxied.call( this, selector );
		if ( ret ) {
			var elem = this[0];
			if ( elem.outerHTML === '<div tabindex="0"></div>' ) {
				return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
			}
		}
		return ret;
	};
})();

/* globals ContentTools, pbsParams */

window.addEventListener( 'DOMContentLoaded', function() {

	if ( ! wp.heartbeat ) {
		return;
	}

	// Set heartbeat to the slowest at the beginning because we cannot disable it.
	wp.heartbeat.interval( 120 );

	// Listen in to when the modal login form closes.
	var lastAutosave = +new Date();
	var loginListenerInterval = null;
	var loginListener = function() {
		var authCheckWrapper = document.querySelector( '#wp-auth-check-wrap' );
		if ( ! authCheckWrapper ) {
			clearInterval( loginListenerInterval );
			modalIsOpen = false;
		} else if ( authCheckWrapper.classList.contains( 'hidden' ) ) {
			clearInterval( loginListenerInterval );
			modalIsOpen = false;
			wp.heartbeat.connectNow();
		}
	};
	var startLoginListener = function() {
		clearInterval( loginListenerInterval );
		loginListenerInterval = setInterval( loginListener, 500 );
	};

	// When a modal is open, this should be true. When a modal is open,
	// don't show takeover or post lock modals.
	var modalIsOpen = false;

	// Send out heartbeat stuff.
	jQuery( document ).on( 'heartbeat-send', function( e, data ) {

		// Only do this when editing.
		if ( ! window.PBSEditor.isEditing() ) {
			return;
		}

		// Refresh nonces when possible.
		data['wp-refresh-post-nonces'] = {
			post_id: pbsParams.post_id
		};

		// Refresh our own nonce regularly.
		data.pbs_nonce = pbsParams.nonce;

		// Refresh our media manager nonce (this is difference from our pbs nonce).
		data.media_manager_editor_nonce = wp.media.view.settings.nonce.sendToEditor;

		// Needed for nonces and post locking.
		data.post_id = pbsParams.post_id;

		if ( modalIsOpen ) {
			return;
		}

		// Autosave from time to time.
		var autosaveDiff = ( ( +new Date() ) - lastAutosave ) / 1000;
		var autosaveInterval = 15;
		if ( pbsParams.autosave_interval ) {
			autosaveInterval = parseInt( pbsParams.autosave_interval, 10 ) * 60;
		}
		if ( autosaveDiff > autosaveInterval ) {
			lastAutosave = +new Date();

			// Get the content & do the normal filters.
			data.content = ContentTools.EditorApp.get().regions()['main-content'].html();
			data.content = wp.hooks.applyFilters( 'pbs.save', data.content );
		}
	} );

	// Handle heartbeat responses.
	jQuery( document ).on( 'heartbeat-tick', function( e, data ) {

		// Only do this when editing.
		if ( ! window.PBSEditor.isEditing() ) {
			return;
		}

		// If logged out, the modal form will automatically appear, start
		// listening when the modal disappears, it means we logged in or closed it.
		if ( data['wp-auth-check'] === false ) {
			modalIsOpen = true;
			startLoginListener();
			return;
		}

		// Update our nonces if invalid already.
		if ( data['wp-refresh-post-nonces'] ) {
			var nonces = data['wp-refresh-post-nonces'];

			// Update the Heartbeat API nonce.
			if ( nonces.heartbeatNonce ) {
				window.heartbeatSettings.nonce = nonces.heartbeatNonce;
			}

			// Update the PBS nonce if invalid already.
			if ( nonces.pbs_nonce_new ) {
				pbsParams.nonce = nonces.pbs_nonce_new;
			}

			// Refresh our media manager nonce (this is difference from our pbs nonce).
			if ( data.media_manager_editor_nonce_new ) {
				wp.media.view.settings.nonce.sendToEditor = data.media_manager_editor_nonce_new;
			}
		}

		// Update the PBS nonce if invalid already.
		if ( data.pbs_nonce_new ) {
			pbsParams.nonce = data.pbs_nonce_new;
		}

		// Refresh our media manager nonce (this is difference from our pbs nonce).
		if ( data.media_manager_editor_nonce_new ) {
			wp.media.view.settings.nonce.sendToEditor = data.media_manager_editor_nonce_new;
		}

		if ( modalIsOpen ) {
			return;
		}

		// There is a post lock, do an autosave and show the modal.
		if ( data.has_post_lock ) {

			// Display a post lock modal & autosave.
			if ( ! document.querySelector( '#pbs-post-locked-dialog' ) ) {

				// Autosave.
				doAutosave();

				// Display the "post was locked" modal.
				var templateData = {
					avatar: data.post_lock_avatar,
					avatar2x: data.post_lock_avatar2x,
					author_name: data.post_lock_author_name
				};
				var div = document.createElement( 'DIV' );
				div.innerHTML = wp.template( 'pbs-heartbeat-takeover' )( templateData );
				div.setAttribute( 'id', 'pbs-post-locked-dialog' );
				document.body.appendChild( div );
				modalIsOpen = true;

				// If main button was clicked, reload the page.
				document.querySelector( '.pbs-post-takeover-refresh' ).addEventListener( 'click', function( ev ) {
					ev.preventDefault();
					modalIsOpen = false;
					doRemovePostLock = false;
					ContentTools.EditorApp.get().stop();
					window.location.reload();
					div.parentNode.removeChild( div );
				} );
			}
		}
	} );

	// When this is true, the post lock is removed when the editor is stopped.
	var doRemovePostLock = true;

	// When the editor starts...
	ContentTools.EditorApp.get().bind( 'start', function() {

		// Start the heartbeat API.
		wp.heartbeat.interval( 15 );

		// Check post lock & check nonce.
		checkHeartbeat();
		doRemovePostLock = true;
	} );

	// When the editor stops...
	ContentTools.EditorApp.get().bind( 'stop', function() {

		// Stop the heartbeat API.
		wp.heartbeat.interval( 120 );

		// Remove the post lock if needed (only when we are the one who locked it).
		if ( doRemovePostLock ) {
			removePostLock();
		}
	} );


	/**
	 * Triggers a post lock check & PBS nonce check.
	 */
	function checkHeartbeat() {
	    var payload = new FormData();
		payload.append( 'action', 'pbs_heartbeat_check' );
		payload.append( 'post_id', pbsParams.post_id );
		payload.append( 'nonce', pbsParams.nonce );
		payload.append( 'media_manager_editor_nonce', wp.media.view.settings.nonce.sendToEditor );

	    var xhr = new XMLHttpRequest();

	   	xhr.onload = function() {
	   		if ( xhr.status >= 200 && xhr.status < 400 ) {
				var response = JSON.parse( xhr.responseText );
				if ( response ) {

					// There is an existing post lock, display the takeover modal.
					if ( response.post_lock ) {

						var data = {
							avatar: response.post_lock_avatar,
							avatar2x: response.post_lock_avatar2x,
							author_name: response.post_lock_author_name
						};
						var div = document.createElement( 'DIV' );
						div.innerHTML = wp.template( 'pbs-heartbeat-locked' )( data );
						div.setAttribute( 'id', 'pbs-post-locked-dialog' );
						document.body.appendChild( div );
						modalIsOpen = true;

						// Cancel / back handler.
						document.querySelector( '.pbs-post-locked-back' ).addEventListener( 'click', function( ev ) {
							ev.preventDefault();
							modalIsOpen = false;
							doRemovePostLock = false;
							document.querySelector( '#wp-admin-bar-gambit_builder_cancel' ).dispatchEvent( new CustomEvent( 'click' ) );
							div.parentNode.removeChild( div );
						} );

						// Takeover handler.
						document.querySelector( '.pbs-post-locked-takeover' ).addEventListener( 'click', function( ev ) {
							ev.preventDefault();
							modalIsOpen = false;
							overridePostLock();
							div.parentNode.removeChild( div );
						} );
					}

					// Update the PBS nonce if given.
					if ( response.nonce ) {
						pbsParams.nonce = response.nonce;
					}

					// Update the Media Manager nonce if given.
					if ( response.media_manager_editor_nonce ) {
						wp.media.view.settings.nonce.sendToEditor = response.media_manager_editor_nonce;
					}
				}
	   		}
	   	}.bind( this );

		xhr.onerror = function() {
		};

	    xhr.open( 'POST', pbsParams.ajax_url );
	    xhr.send( payload );
	}


	/**
	 * Trigger a removal of the post lock.
	 */
	function removePostLock() {
	    var payload = new FormData();
		payload.append( 'action', 'pbs_remove_post_lock' );
		payload.append( 'post_id', pbsParams.post_id );
		payload.append( 'nonce', pbsParams.nonce );

	    var xhr = new XMLHttpRequest();
	    xhr.open( 'POST', pbsParams.ajax_url );
	    xhr.send( payload );
	}


	/**
	 * Trigger a take over of an existing post lock.
	 */
	function overridePostLock() {
	    var payload = new FormData();
		payload.append( 'action', 'pbs_override_post_lock' );
		payload.append( 'post_id', pbsParams.post_id );
		payload.append( 'nonce', pbsParams.nonce );

	    var xhr = new XMLHttpRequest();
	    xhr.open( 'POST', pbsParams.ajax_url );
	    xhr.send( payload );
	}


	/**
	 * Manually trigger an autosave.
	 */
	function doAutosave() {
	    var payload = new FormData();
		payload.append( 'action', 'pbs_autosave' );
		payload.append( 'post_id', pbsParams.post_id );
		payload.append( 'nonce', pbsParams.nonce );

		// Get the content & do the normal filters.
		var content = ContentTools.EditorApp.get().regions()['main-content'].html();
		content = wp.hooks.applyFilters( 'pbs.save', content );
		payload.append( 'content', content );

	    var xhr = new XMLHttpRequest();
	    xhr.open( 'POST', pbsParams.ajax_url );
	    xhr.send( payload );
	}

} );

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


/***************************************************************************
 * These are the tools in the inspector, overriding the defaults of CT.
 ***************************************************************************/
window.PBSEditor.formattingTools = [[]];
window.PBSEditor.formattingTools[0].push(
	'insertElement',
	'paragraphPicker',
	'|',
	'color',
	// 'remove',
	'bold',
	'italic',
	'underline',
	'strikethrough',
	'link',
	// 'unlink',
	// 'blockquote',
	'|',
	'align-left',
	'align-center',
	'align-right',
	'align-justify',
	'|',
	'hr'
);
window.PBSEditor.formattingTools[0].push(
	'code',
	'|',
	'unordered-list',
	'ordered-list',
	'indent',
	'unindent',
	'|',
	'clear-formatting',
	'undo', 'redo'				// These are automatically moved into the admin bar.
);
window.PBSEditor.insertElements = [[]];
window.PBSEditor.insertElements[0].push(
	'onecolumn',
	'twocolumn',
	'threecolumn',
	'fourcolumn',
	'text',
	'pbs-media',
	'shortcode'
);
window.PBSEditor.insertElements[0].push(
	'widget',
	'sidebar',
	'icon'
);
window.PBSEditor.insertElements[0].push(
	'html',
	'map',
	'tabs'
);

// We're not using CT's default tools.
ContentTools.DEFAULT_TOOLS = [[]];

// No longer needed.
window.PBSEditor.toolHeadings = [];

// window.PBSEditor.advancedTools = [
// 	'h3', 'h4', 'h5', 'h6', 'table', 'preformatted', 'indent', 'unindent', 'code', 'align-justify', 'uppercase', 'strikethrough',
// 	'pbs-advanced-formatting-group',
// 	'pbs-shortcodes-group'
// 	//, 'pbs-rows-columns-group'
// ];

window.addEventListener( 'DOMContentLoaded', function() {
	// new PBSEditor.MarginBottom();
	// new PBSEditor.MarginTop();
	// new PBSEditor.MarginBottomContainer();
	// new PBSEditor.MarginTopContainer();
	// new PBSEditor.OverlayColumnWidth();
	// new PBSEditor.OverlayColumnWidthRight();
	// new PBSEditor.OverlayColumnWidthLabels();
	new PBSEditor.OverlayColumn();
	new PBSEditor.OverlayRow();
	new PBSEditor.OverlayElement();
	// new PBSEditor.OverlayResize();

	new PBSEditor.ToolbarElement();
	new PBSEditor.ToolbarImage();
	new PBSEditor.ToolbarHtml();
	new PBSEditor.ToolbarIframe();
	new PBSEditor.ToolbarEmbed();
	new PBSEditor.ToolbarMap();
	new PBSEditor.ToolbarIcon();
	new PBSEditor.ToolbarShortcode();
	new PBSEditor.ToolbarRow();
	new PBSEditor.ToolbarColumn();
	new PBSEditor.ToolbarNewsletter();
	new PBSEditor.ToolbarList();
	new PBSEditor.ToolbarTabContainer();
	new PBSEditor.ToolbarTable();
	new PBSEditor.ToolbarTitle();
	if ( ! pbsParams.is_lite ) {

	}

	new PBSEditor.TooltipLink();
	new PBSEditor.TooltipButton();
	new PBSEditor.TooltipInput();
	new PBSEditor.TooltipTab();
});
