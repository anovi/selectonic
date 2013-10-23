/*  ======================================
*
*   MultiSelectable
*	Author: Alexey Novichkov
*	Version: 1.0
*/

(function($, window, undefined) {

	var pluginName = "multiSelectable",
		document = window.document,
		defaults = {

            filter:           "> *",
            mouseMode:		"select",
            event:			"mousedown",
            multi:          true,
            focusBlur:		false,
            selectionBlur:	false,
            keyboardInput:	false,
            preventInputs:	true,
            loop:			false,
            handle:			null,

            // CSS classes
            wrapperClass:   ( "j-" + pluginName ),
            focusClass:		( "j-" + pluginName + "-focused" ),
            selectedClass:	( "j-" + pluginName + "-selected" ),
            disabledClass:	( "j-" + pluginName + "-disabled" ),

            //Callbacks in the order which they calls
            create:         function() {},
            beforeSelect:   function( event, ui ) {},
            focusLost:      function( event, ui ) {},
            select:         function( event, ui ) {},
            unSelect:       function( event, ui ) {},
            unSelectAll:    function( event, ui ) {},
            stop:           function( event, ui ) {},
            destroy:        function() {}
		},

		keyCode = {
			DOWN: 40,
			UP: 38,
			SHIFT: 16,
			END: 35,
			HOME: 36,
			PAGE_DOWN: 34,
			PAGE_UP: 33,
			A: 65
		};

	function Plugin( element, options ) {
		this._name =			pluginName;
		this.options =			setOptions.apply( this, arguments ); // Set options
		this.el =				element; // Plugin's element
		this.$el =				$( element ); // $cached Plugin's element
        this.ui =				{}; // Object for DOM elements
        this._selected =		0;  // Amount of selected items
        this._changedItems =	[]; // Elements that was changed in current cycle
        this._prevItemsState =	[]; // States of changed items before they will be changed
        this._isEnable =		true; // Flag that plugin is enabled - used by handlers
        this._keyModes =		{}; // to saving holding keys

        // Cache items selector to compare it with clicked elements
        // Plugin's class name + Item selector
        this.options.parentSelector = "." + this.options.wrapperClass + " " + this.options.filter;

		this._init();
	}

	// Get or set plugin's object to data:
	function dataObject( el, object ) {
		if ( object ) {
			return $( el ).data( "plugin_" + pluginName, object );
		} else {
			return $( el ).data( "plugin_" + pluginName );
		}
	}

	// Extending options object
    function setOptions( elem, options ) {

        // Если передали опции
        if( options ) {
			// Проходимся по переданному объекту параметров
			$.each(
				// Проверяем параметры которые должны быть строкой
				[ "item", "wrapperClass", "focusClass", "selectedClass", "handle" ],
				function(index, val) {
					// На всякий случай преобразуем в строку и обрезаем пробелы по краям
					if( options[val] != null ) {
						options[val] = $.trim( String(options[val]) );
					}
				}
			);
		}

        // Return final object with options
        return $.extend( {}, defaults, (options || {}) );
    }


    /* ==============================================================================

    Plugin's API

    */

    function command( options ) {

		var pluginObject = dataObject( this ),
			API_Method,
			selector;

		if( pluginObject === undefined ) {
			throw new Error( "Element " + this[0] + " has no plugin " + pluginName );
		}

		// Try to find method
		if ( pluginObject[options] && $.isFunction(pluginObject[options]) ) {
			API_Method = pluginObject[options];
		}

		// If method exists and it is not private
		if ( API_Method && options.charAt(0) !== "_" ) {
			// Call
			return API_Method.apply( pluginObject, arguments );
		}

		// If received DOM element
		if ( options && options.addClass || options.nodeType ) {
			return pluginObject.select(
				// Filter received elements through cached selecter
				$( options ).filter( pluginObject.options.parentSelector )
			);
		}

		// Test for selector:
		selector = this.find( options )
                    // Filter found elements
                    .filter( pluginObject.options.parentSelector );

        // If there are any elements:
		if( selector && selector.length > 0 ) {
			// Call select method and give him elements
			return pluginObject.select( selector );
		}

        // Nothing has found
        throw new Error( "Plugin " + pluginName + " has no method \"" + options + "\"" );
	}

	Plugin.prototype.option = function() {

		var secArg = arguments[1],
			arg = arguments.length;

		// Received two strings
		if( arg > 1 && secArg.charAt ) {
			// Received two strings and any argument
			if( arg > 2 ) {
				this.options[secArg] = arguments[2];
				return;
			}
			// Return value of option
			return this.options[secArg];
		}

		// Received string and object
		if( arg > 1 && $.isPlainObject( secArg ) ) {
			$.extend( this.options, secArg );
			return;
		}

		// Return whole options object
		return this.options;
	};

    Plugin.prototype.destroy = function() {
        this._destroy();
        this.$el.removeData( "plugin_" + pluginName );
        this.$el = null;
        return;
    };

    Plugin.prototype.select = function( elem ) {

		// Set params for _controller method:
		this._items = ( elem.addClass ) ? elem : $( elem );
		this.ui.target = elem[0] || elem;

		// Call _controller with null instead of event object
		this._controller( null );
        return;
    };

    Plugin.prototype.blur = function() {
		// If target is not exist, _blur will be called
        this.ui.target = null;
        // Call _controller with null instead of event object
        this._controller( null );
        return;
    };

    Plugin.prototype.getSelected = function() {
        return this._getSelected();
    };

    Plugin.prototype.getFocused = function() {
    	if (this.ui.focus) {
    		return this.ui.focus;
    	} else {
    		return null
    	}
    };

    Plugin.prototype.getSelectedId = function() {
        return this._getSelected( true );
    };

    Plugin.prototype.enable = function() {
        this._isEnable = true;
        this.$el.removeClass( this.options.disabledClass );
        return;
    };

    Plugin.prototype.disable = function() {
        this._isEnable = false;
        this.$el.addClass( this.options.disabledClass );
        return;
    };

    Plugin.prototype.cancel = function() {
        this._prevent();
        return;
    };

	Plugin.prototype.refresh = function() {

		var focus = this.ui.focus;

		// Check if focus is visible
		if ( focus && !$(focus).is(":visible") ) {
			delete this.ui.focus;
		}

		// Recalculate amount of selected items
		this._selected = ( this.getSelected() ).length;
		return;
	};



    /* ==============================================================================

    Private methods

    */

    Plugin.prototype._init = function() {
        // Adding classes
        this.$el.addClass( this.options.wrapperClass );
        // Attach handlers
        this._onHandler();
        // Save plugin's object instance
        dataObject( this.$el, this );
		// Callback
        this.options.create.call( this.$el );
    };

    Plugin.prototype._destroy = function() {

        // Callback before removing plugin data
        this.options.destroy.call( this.$el );

        // Detach handlers
        this._offHandler();

        // If focus exists
        if( this.ui.focus ) {
			// remove class and property
            $(this.ui.focus).removeClass( this.options.focusClass );
            delete this.ui.focus;
        }

        // If there are selected items
        if( this._selected > 0 ) {
			// find items and remove class
			this.getSelected().removeClass( this.options.selectedClass );
		}

        // Remove classes
        this.$el.removeClass( this.options.disabledClass );
        this.$el.removeClass( this.options.wrapperClass );
    };

    Plugin.prototype._prevent = function() {
        this._isPrevented = true;
    };

    Plugin.prototype._cancel = function( e ) {

		this._isCancellation = true;

        // Restore items states
        $.each(
			// for each changed item
			$(this._changedItems),
			$.proxy(
				function( index, item ) {
					// there is boolean value in array _prevItemsState
					// with same index that item have in _changedItems
					if ( this._prevItemsState[ index ] ) {
						this._select( e, $(item), true );
					} else {
						this._unselect( e, $(item), true );
					}
				}, this
			)
        );

        // Restore old focus
        // this._setFocus( this._prevFocus );

        delete this._isCancellation;
        delete this._isPrevented;
    };

    // Attath handlers
    Plugin.prototype._onHandler = function() {
		var e = ( this.options.event === "click" ) ? "click" : "mousedown";

		// Handler for mouse events
		this._mouseEventHandler = $.proxy( function(e) {
			if ( this._isEnable ) {
				this._mouseHandler(e);
			}
			return e
		}, this );

		// Handler for keyboard events
		this._keyEventHandler = $.proxy( function(e) {
			if( this.options.keyboardInput && this._isEnable ) {
				this._keyHandler(e);
			}
			return e
		}, this );

		$( document ).on(
			"click" + "." + this._name + " " + "mousedown" + "." + this._name,
			this._mouseEventHandler
		);

		$( document ).on(
			"keydown" + "." + this._name + " " + "keyup" + "." + this._name,
			this._keyEventHandler
		);
	};

    // Detach handlers
    Plugin.prototype._offHandler = function() {
		var e = ( this.options.event === "click" ) ? "click" : "mousedown";

		$( document ).off(
			( e + "." + this._name ),
			this._mouseEventHandler
        );

        $( document ).off(
			"keydown" + "." + this._name + " " + "keyup" + "." + this._name,
			this._keyEventHandler
		);
    };

	// Handler of keyboard events
	Plugin.prototype._keyHandler = function( e ) {

		if ( !this.options.keyboardInput ) { return; }
		// If options for preventing plugin in html inputs and e.target is input, than return
		if ( this.options.preventInputs && e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') { return; }

		var key = e.which,		// pressed key
			sibling,			// sibling found element
			isAllSelect,		// flag that is all items is selected
			direction;			// next or previous (depends from pressed arrow up|down)

		// Key is released
		if (e.type === "keyup") {

			if ( key === keyCode.SHIFT ) {
				// Delete flags, that has been needed while SHIFT was held
				delete this._shiftModeAction; // while SHIFT is held
				delete this._keyModes.shift; // arrow key (UP,DOWN) which pressed first in SHIFT mode
			}
			// There no more handling for keyUp
			return;
		}

		// If CTRL+A or CMD+A pressed and multi option is true
		if ( key === keyCode.A && (e.metaKey || e.ctrlKey) && this.options.multi ) {

			/* Prevent — bacause it's strange and annoying behavior 
			when first select all items in the list, and after that 
			if hold ctrl+A longer — select all text on tha page */
			e.preventDefault();

			// Get all items
			sibling = this._getItems();
			// Set flag, that all items selected
			isAllSelect = true;

		} else {

			switch ( key ) {
			// HOME button – move to the begin of the list
			case keyCode.HOME:
					direction = "prev";
					sibling = this._getItems( "first");
					break;

			// END button – move to the end
			case keyCode.END:
					direction = "next";
					sibling = this._getItems( "last");
					break;

			// DOWN arrow — move next
			case keyCode.DOWN:
					direction = "next";
					sibling = this._findNextSibling( "next" );
					break;

			// UP arrow - move previous
			case keyCode.UP:
					direction = "prev";
					sibling = this._findNextSibling( "prev" );
					break;
			}
		}

		// If sibling has found, that one of the arrows was pressed
		if ( sibling && sibling.length > 0 ) {

			// Disable default window scroll by arrow keys
			e.preventDefault();

			// Set target to found sibling item
			this.ui.target = sibling[0];
			this._items = sibling;

			// ------------------------------------------------------------
			// SHIFT - MODE START
			// If focus exists and SHIFT pressed and multi option is ON
			if ( this.ui.focus && this.options.multi && e.shiftKey && !isAllSelect ) {

				// Check if focus or target is selected
				var isFocusSelected = this._getIsSelected( this.ui.focus ),
					isTargetSelected = this._getIsSelected( this.ui.target ),

					// Search for next sibling in the same direction
					secSibling = this._getItems( direction, sibling ),

					// Check if second sibling is selected (flag)
					isSelectedSecSibling = this._getIsSelected( secSibling );

				// If another arrow was pressed
				// that mean the direction was changed
				if ( this._keyModes.shift && this._keyModes.shift !== key ) {
					this._keyModes.shift = null;
					this._shiftModeAction = null;
				}

				// --------------------------
				// CHAIN OF CONDITIONS
				// TODO: do chain of conditions more clear and readable

				// Focus is not selected, target is selected and selected items more than one
				if ( !isFocusSelected && isTargetSelected && this._selected > 1 ) {
					// Nothing to do:
					// - Focus and target already exist
					// - After this chain _rangeSelect or _isMultiSelect mode will be set

				// If it serial selection of items by arrow key and target is already selected
				} else if ( this._keyModes.shift && this._shiftModeAction === "select" && isTargetSelected ) {

					/* When user select range of items by holding SHIFT and presses arrow key,
					there are already can be selected items — than focus will jump 
					through these selected items to first unselected item */

					// While first unselected item will be found or edge of the list will be reached
					while( this._getIsSelected(this._items) && this._items.length > 0 ) {
						// get next item in the same direction
						this._items = this._getItems( direction, this._items );
					}

					// If unselected item was found
					if ( this._items.length > 0 ) {
						// it becomes target item
						this.ui.target = this._items;
						// target will be selected and get the focus
					}

				// If target and focus is selected, but next item to the target is not:
				} else if ( isTargetSelected && isFocusSelected && !isSelectedSecSibling ) {
					/* Sitiation is possible when user unselect items 
					by arrow key with holding SHIFT */

					// Clear flags of serial selection by SHIFT
					this._keyModes.shift = null;
					this._shiftModeAction = null;
					this._items = this.ui.focus;
					// Selection will be clear on the focus
					// focus will be set on target item

				// The focus and target is selected
				} else if ( isFocusSelected && isTargetSelected ) {
					this._items = this.ui.focus;

					// If there is no SHIFT action (first pressing arrow key with holding SHIFT)
					if ( !this._shiftModeAction ) {
						// Set mode of selection
						this._shiftModeAction = "unselect";
					}
					// Selection will be clear on the focus
					// focus will be set on target item

				// Only target selected
				} else if ( !isFocusSelected && isTargetSelected ) {
					this._items = this.ui.focus;
					this._isTargetWasSelected = false;
					// The focus will be selected
					// The focus will be set on target item

				// Nothing is selected
				} else if ( !isFocusSelected && !isTargetSelected ) {
					this.ui.target = this.ui.focus;
					this._items = this.ui.focus;
					// Focus will be selected
				}
				// END THE CHAIN OF CONDITIONS
				// ---------------------------

				// If there is no SHIFT action (first pressing arrow key with holding SHIFT)
				if ( !this._shiftModeAction ) {
					// Set mode of selection
					this._shiftModeAction = "select";
				}

				// If there is no SHIFT key mode (first pressing arrow key with holding SHIFT)
				if ( !this._keyModes.shift ) {
					// Set pressed arrow key
					this._keyModes.shift = key;
				}

				if ( key === keyCode.END || key === keyCode.HOME ) {
					// Get range of items
					// and turn on range select mode
					this._items = this._rangeSelect();
				} else {
					// Mode of multimpy selection
					this._isMultiSelect = true;
				}
			}
			// SHIFT - MODE END
			// ------------------------------------------------------------

			// There are all necessary attributes now
			// Call _controller
			this._controller( e );

			// Recalculate plugin's element scroll and window's scroll
			this._scrollCalcElem( this.el );
			this._scrollCalcElem( window );
		}
	},

	// Used by _keyHandler
	// when UP or DOWN keys was pressed — find next item or first/last of the list
	// direction – next|prev
	Plugin.prototype._findNextSibling = function( direction ) {

		var edge = ( direction === "next" ) ? "first" : "last", // extreme item of the list
			// If there is the focus - try to find next sibling
			// else get first|last item of the list — depends from direction
			res = ( this.ui.focus ) ? this._getItems( direction, this.ui.focus ) : this._getItems( edge );

		// If has not found any items and loop option is ON
		if ( res.length === 0 && this.options.loop ) {
			// find extreme item
			res = this._getItems( edge );
		}

		return res;
	},

	// Used by _keyHandler
	// Recalculate scroll position, if if focused item is not visible in container viewport
	Plugin.prototype._scrollCalcElem = function( elem ) {

		var oldPosition =	( elem === window ) ? null : $( elem ).css( "position" ),
			elemHeight =	$( this.ui.focus ).outerHeight(),
			parentScroll =	$( elem ).scrollTop(),
			viewHeight =	( elem === window ) ? $( elem ).outerHeight() : elem.clientHeight,
			elemY;

		// If elem is not positioned and it is not the window
		if ( elem !== window && oldPosition !== "fixed" && oldPosition !== "absolute" && oldPosition !== "relative" ) {

			// Position elem to get focused items's position relative to positioned parent
			$( elem ).css( "position", "relative" );

			//WARN: there is can be a trouble if any parent before plugin's containter is positioned 
			elemY = $( this.ui.focus ).position().top + parentScroll;
			$( elem ).css( "position", oldPosition );

		} else {
			// Coordinate Y of focused item relative the window or another parent container
			elemY = ( elem === window ) ? $( this.ui.focus ).offset().top : ( $( this.ui.focus ).position().top + parentScroll );
		}

		if ( elemY < parentScroll ) {
			// Scroll to top edge of elem
			$( elem ).scrollTop( elemY );
		} else if ( (elemY + elemHeight) > (parentScroll + viewHeight) ) {
			// Scroll to bottom edge of elem - bottom edges of item and viewport will be on the same Y
			$( elem ).scrollTop( elemY + elemHeight - viewHeight );
		}
	};

    // Get item, that was clicked
    // or null, if click was not on an item
    Plugin.prototype._getTarrget = function(e) {

        var elem = e.target,
			handle = this.options.handle,
			target;

        // While plugin's element or top of the DOM is achieved
		while ( elem !== null && elem !== this.el ) {

			// If item match to cached selector
			if( $(elem).is(this.options.parentSelector) ) {
				target = elem;
			}

			// If handle option is ON and that elem match to handle's selector
			if( handle && $(elem).is(handle) ) {
				this.ui.handle = elem;
			}

			// Get parent element
			elem = elem.parentNode;
		}

        // If handle option is ON and it was found
        // and item of this list was clicked
        if( handle && elem && this.ui.handle ) {
			return target;

		// If achieved $el of this instance of plugin's object
        } else if( !handle && elem ) {
			return target;
        }

		return null; // was not clicked any selectable items of a list
	};

    Plugin.prototype._getSelected = function( getIds ) {

        if( getIds ) {
            return $.map(
                this.$el.children( "." + this.options.selectedClass ),
                function( elem ) {
                    return $( elem ).attr("id");
				}
			);
		}

        return this.$el.children( "." + this.options.selectedClass );
    };

    Plugin.prototype._getSelectedId = function() {
		return this._getSelected( true );
    };

	Plugin.prototype._getItems = function( selection, elem ) {

		switch( selection ) {
			case "next":
				return $( elem ).next( this.options.parentSelector );

			case "prev":
				return $( elem ).prev( this.options.parentSelector );

			case "first":
				return this.$el.find( this.options.filter ).first();

			case "last":
				return this.$el.find( this.options.filter ).last();

			default:
				return this.$el.find( this.options.filter );
		}
	};

    // Mouse events handler - set necessary paramaters and calls _controller
    Plugin.prototype._mouseHandler = function( e ) {

		var options = this.options;

		// If hybrid mode
		if ( options.event === "hybrid" ) {

			// It is click and mouse was not pressed on item
			if ( e.type === "click" && !this._mouseDownMode ) {
				return;
			}

			// Get target
			this.ui.target = this._getTarrget(e);

			// If mouse press down on item
			if ( this.ui.target && e.type === "mousedown" ) {

				this._isTargetWasSelected = this._getIsSelected( this.ui.target );

				// If target is selected
				if ( this._isTargetWasSelected ) {
					this._mouseDownMode = true;
					return;
				}
			}

			// If mouse down mode
			if ( this._mouseDownMode ) {
				delete this._mouseDownMode;
			}

		// if type of event do not match
		} else if ( e.type !== options.event ) {
			return;

		} else {
			// Get target
			this.ui.target = this._getTarrget(e);
        }


        // If multi options is true and target exists
        if( options.multi && this.ui.target ) {

			// Range select
            if ( (e.shiftKey || e.shiftKey && e.ctrlKey) && this.ui.focus ) {
                this._items = this._rangeSelect();

			// Add/subtract to selection
			} else if( e.ctrlKey || e.metaKey || options.mouseMode === "toggle" ) {
				this._items = this._multiSelect();
			}
		}

        if ( this.ui.target && !this._items ) {
			this._items = $( this.ui.target );
		}

        this._controller( e );
    };

    // Control the state of a list
    // this method calls from _keyHandler and _mouseHandler or API
    // and do changets depending on input parameters 
    Plugin.prototype._controller = function( e ) {

		// Callback
        this.options.beforeSelect.call( this.$el, e, this.ui ); // Коллбэк

        // If cancel flag is true any changes will be prevented
        if( this._isPrevented ) {
			this._cancel( e ); // cancellation
			this._stop( e );
			return;
		}

        /* Set necessary variables */
		// Set old focus
        this._prevFocus = ( this.ui.focus ) ? this.ui.focus : null;

		// Flag - if there was any selected items before changes
        this._isWasSelected = ( this._selected > 0 );

		// Flag - if target was selectedl before changes
		if ( this.ui.target && this._isTargetWasSelected === undefined ) {
			this._isTargetWasSelected = this._getIsSelected( this.ui.target );
		}

		// If it is range selection
		// and target is selected and equal to focus
		if ( this._isRangeSelect && this._isTargetWasSelected && this.ui.target === this.ui.focus ) {
			// nothing to do
		}
		// For range selections and multi-selection
		else if ( this._isRangeSelect || this._isMultiSelect ) {
            if ( this._isTargetWasSelected ) {
				this._unselect( e, this._items );
            } else {
				this._select( e, this._items );
            }
		}
		// Single selection
		else if ( this.ui.target ) {

			// If thre are selected
			if ( this._selected ) {

				// If there is one selected item and it is focused
				if ( this._selected === 1 && this._getIsSelected(this.ui.focus) ) {
					/* It is case, when user moves cursor by keys or chooses single items by mouse 
					— need just clear selection from focus — no need run go whole DOM of list */
					this._unselect( e, this.ui.focus, this._isTargetWasSelected );

				} else {
					this._unselectAll( e );
				}
			}

            // Select item. Callback "select" calls only if target was selected
			this._select( e, this._items, this._isTargetWasSelected );

		} else {

			// it is not item of list was clicked and "focusBlur" option is ON
			if ( this.options.focusBlur ) {
				this._blur(e);
			}
			// if there is selected and "selectionBlur" option is ON
			if ( this._selected > 0 && this.options.selectionBlur ) {
				this._unselectAll( e );
			}
		}

		// Set new focus
		this._setFocus( this.ui.target );

		// End of the cycle
		this._stop( e );
    };

    Plugin.prototype._forEachItem = function( items, delta ) {

		// "delta" is number to modifying selection counter
		// above zero "delta" from _select/ sub zero "delta" from _unselect
		var aboveZero = delta > 0,
			changedItems = [],
			self = this;

		// For each of items calls function in scope plugin's object instance
		$( items ).each( function( index, item ) {

			// Is item is selected
			var isSelected = self._getIsSelected( item ),
				// Condition - if item is not selected (_select) or items is selected (_unselect)
				selectedCondition = ( aboveZero ) ? !isSelected : isSelected,
				// if the item is target and is selected
				isSelectedTarget = ( item === self.ui.target && self._isTargetWasSelected );

			/*	If it's unselecting and item is selected target,
				and is not "multi" or "range" select mode
				— do nothing because state of selected target should not change
				– it is just unselecting from remaining items  */
            if (
				isSelectedTarget &&
				!aboveZero &&
				!self._isMultiSelect &&
				!self._isRangeSelect
			) { return; }

			// If condition ( selected or not )
            if( selectedCondition ) {
				// it is not cancellation
				if( !self._isCancellation ) {
					changedItems.push( item );
					self._prevItemsState.push( isSelected );
				}
				self._selected += delta;
            }

            // Finally add/remove class to item
            $( item ).toggleClass( self.options.selectedClass, aboveZero );

		});

		// If it is not cancellation
		if( !this._isCancellation ) {
			this.ui.items = $( changedItems );

			// Add items of this iteration to array of changed elements
			this._changedItems = this._changedItems.concat( changedItems );
		}
    };

    Plugin.prototype._select = function( e, items, silent ) {

		this._forEachItem( items, 1 );

		if ( !silent ) {
			this.options.select.call( this.$el, e, this.ui ); // Callback
		}

		if( this._isPrevented && !this._isCancellation ) { this._cancel( e ); } // cancel
	};

    Plugin.prototype._unselect = function( e, items, silent ) {

		// Перебираем все полученные методом элементы
		this._forEachItem( items, -1 );

		if ( !silent ) {
			this.options.unSelect.call( this.$el, e, this.ui ); // Callback
		}

		if( this._isPrevented && !this._isCancellation ) { this._cancel( e ); } // Cancel
    };

    Plugin.prototype._unselectAll = function( e ) {

		if( !this._selected || this._selected === 0 ) { return; }

		// Get all items
		var items = this._getItems();

			// target was only selected item ( flag used for preventing callback )
			isOnlyTargetSelected = this.ui.target && this._isTargetWasSelected && this._selected === 1;

		this.ui.items = null;

		this._unselect( e, items, isOnlyTargetSelected );
	};

    Plugin.prototype._multiSelect = function() {
        this._isMultiSelect = true;
        return $( this.ui.target );
    };

    Plugin.prototype._rangeSelect = function() {

        this._isRangeSelect = true;

        // If target is focused item - do nothing
        if( this.ui.target === this.ui.focus ) { return $(this.ui.target); }

        // Detect position of target and focus in the list
		var arr = this._getItems(),
			x = arr.index( this.ui.target ),
			y = arr.index( this.ui.focus ),

		// Get array of items between focus and target
		subArr =		( x < y ) ? arr.slice( x, y )	: arr.slice( y, x );
		subArr.push(	( x < y ) ? arr[ y ]			: arr[ x ] );

		return subArr;
    };

    Plugin.prototype._getIsSelected = function( target ) {

		// If was get one item or nothing
		if( $(target).length <= 1 ) {
			return $( target ).hasClass( this.options.selectedClass );
		}

        var options = this.options;

        // Return array of boolean values
        return $.map( $(target), function( item ) {
            return $( item ).hasClass( options.selectedClass );
        });
    };

    Plugin.prototype._blur = function( e, silent ) {

        // If is not silent mode and focus exists
        if( !silent && this.ui.focus ) {
			this.options.focusLost.call( this.$el, e, this.ui ); // Коллбэк потери фокуса
		}

        // If "selectionBlur" option is true and there are selected items — unselect all
		if( this.options.selectionBlur && this._selected ) { this._unselectAll( e ); }

		if( this.ui.focus ) {
			// remove class from focus
			$( this.ui.focus ).removeClass( this.options.focusClass );
			delete this.ui.focus;
		}
    };

    Plugin.prototype._setFocus = function( target ) {

        if( !target ) { return; }

        if( this.ui.focus ) {
			// remove class from old focused item
			$(this.ui.focus).removeClass( this.options.focusClass );
        }

        this.ui.focus = target; // set new focus
        $( this.ui.focus ).addClass( this.options.focusClass );

        return this.ui.focus;
    };

    Plugin.prototype._stop = function( e ) {

        // If there is no selected, but was selected before changes
        if( !this._selected && this._isWasSelected ) {

			// Need to pass old focus to callback
			// WARN - ugly solution
			if( this._prevFocus ) {

				// Temporary cache the focus
				var focus = this.ui.focus;
				this.ui.focus = this._prevFocus;

				// Callback of full lost of selection
				this.options.unSelectAll.call( this.$el, e, this.ui );
				this.ui.focus = focus;

			} else {
				// Callback of full lost of selection
				this.options.unSelectAll.call( this.$el, e, this.ui );
			}
		}

		// Stop callback
		this.ui.items = this._changedItems;
		this.options.stop.call( this.$el, e, this.ui );

		// If cancellation is true
		if( this._isPrevented ) { this._cancel( e ); } //отменяем

        // Clear variables that need only during work of cycle
        this._changedItems = [];
        this._prevItemsState = [];
        delete this.ui.items;
        delete this.ui.target;
        delete this.ui.handle;
        delete this._items;
        delete this._isRangeSelect;
        delete this._isMultiSelect;
        delete this._isTargetWasSelected;
        delete this._isWasSelected;
    };


    /* ==============================================================================

    Method of fn object

    */

	$.fn[pluginName] = function( options ) {

        // If string was got
        if( options && options.charAt ) {
			// Do the command
            var res = command.apply( this, arguments );
            // Return result or "this" for chaining
            return (res !== undefined) ? res : this;
        }

        // DOM element was got
        else if ( options && options.addClass || options.parentNode ) {
            return command.call( this, options );
        }

        // Create object's instances
        return this.each( function() {
            if ( !dataObject(this) ) {
				new Plugin( this, options );
            }
        });
	};

}(jQuery, window));

