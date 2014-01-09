(function($, window, undefined) {
  'use strict';

  // For IE compatibility
  if (typeof Array.prototype.indexOf === 'undefined') {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
      if (!this) { throw new TypeError(); }
      fromIndex = isNaN( fromIndex = +fromIndex ) ? 0 : fromIndex;

      var length = this.length;
      if ( length === 0 || fromIndex >= length ) { return -1; }
      if ( fromIndex < 0 ) { fromIndex += length; }

      while (fromIndex < length) {
        if ( this[fromIndex] === searchElement ) { return fromIndex; }
        ++fromIndex;
      }
      return -1;
    };
  }


  // From Underscore library – http://underscorejs.org/#throttle
  var _throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options = options || {};
    var later = function() {
      previous = options.leading === false ? 0 : new Date();
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date();
      if (!previous && options.leading === false) { previous = now; }
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  },

  $document = $( window.document );


  /* 
  Constructor
  element – html element
  options – plugin initial options
  */
  function Plugin( element, options ) {
    this._name      = Plugin.pluginName;
    this.el         = element;
    this.$el        = $( element );
    this.ui         = {};   // Object for DOM elements
    this._selected  = 0;    // Amount of selected items
    this._isEnable  = true; // Flag that plugin is enabled - used by handlers
    this._keyModes  = {};   // to saving holding keys
    this.options    = {};
    
    var initialOptions = $.extend( {}, Plugin.defaults, (options || {}) );
    this._setOptions( initialOptions );
    this._init();
  }

  Plugin.pluginName     = 'selectonic';
  Plugin.keyCode        = { DOWN:40, UP:38, SHIFT:16, END:35, HOME:36, PAGE_DOWN:34, PAGE_UP:33, A:65, SPACE:32, ENTER:13 };
  Plugin.optionsEvents  = ['create','before','focusLost','select','unselect','unselectAll','stop','destroy'];
  Plugin.optionsStrings = ['filter','mouseMode','event','keyboardMode','listClass','focusClass','selectedClass','disabledClass','handle'];
  Plugin.defaults       = {
    // Base
    filter:         '> *',
    multi:          true,
    // Mouse
    mouseMode:      ['select','toggle'],
    event:          ['mousedown','click','hybrid'],
    focusBlur:      false,
    selectionBlur:  false,
    handle:         null, /* String | null */
    textSelection:  false,
    hoverFocus:     false,
    // Keyboard
    keyboard:       false,
    keyboardMode:   ['select','toggle'],
    autoScroll:     true, /* String | false | true */
    loop:           false,
    preventInputs:  true,
    // Classes
    listClass:      'j-selectable',
    focusClass:     'j-focused',
    selectedClass:  'j-selected',
    disabledClass:  'j-disabled',
    // Callbacks
    create:         null,
    before:         null,
    focusLost:      null,
    select:         null,
    unselect:       null,
    unselectAll:    null,
    stop:           null,
    destroy:        null
  };

  // Get plugin's data object:
  Plugin.getDataObject = function( el ) {
    return $( el ).data( 'plugin_' + Plugin.pluginName );
  };



  /* ==============================================================================

  Core

  */
  Plugin.prototype._init = function() {
    this.$el.addClass( this.options.listClass );           // Add class to box
    this._bindEvents();                                    // Attach handlers6
    this.$el.data( 'plugin_' + Plugin.pluginName, this );  // Save plugin's instance
    this._callEvent('create');                             // Callback
  };


  Plugin.prototype._setOptions = function() {
    var option, newOptions, isFunction, options = {}, self = this;
    
    if ( arguments.length === 2 ) {
      // First arg is name of option and a second is a value
      options[arguments[ 0 ]] = arguments[1];
    } else {
      // options hash
      if ( $.isPlainObject(options) ) {
        options = arguments[0];
      } else {
        throw new Error('Format of \"option\" could be: \"option\" or \"option\",\"name\" or \"option\",\"name\",val or \"option\",{}');
      }
    }

    // Ensure that actions are strings
    $.each( Plugin.optionsStrings, function(index, name) {
      option = options[ name ];
      if( option ) {
        var pos = ['mouseMode','event','keyboardMode'].indexOf( name );
        
        // default option
        if ( $.isArray( option ) && pos >= 0 && option === Plugin.defaults[name] ) {
          options[ name ] = option[0];

        // string option with finite values
        } else if ( pos >= 0) {
          var values = Plugin.defaults[ name ];
          if ( values.indexOf( $.trim(String(option)) ) < 0 ) {
            throw new RangeError( 'Option \"' + name + '\" only could be in these values: \"' + values.join('\", \"') + '\".' );
          }

        } else {
          options[ name ] = $.trim( String(option) );
        }
        // If it's working list and is attempt to change classes
        if ( self.options.parentSelector &&
          (name === 'listClass' ||
           name === 'focusClass' ||
           name === 'selectedClass' ||
           name === 'disabledClass')
        ) { throw new Error( 'Sorry, it\'s not allowed to dynamically change classnames!' ); }
      }
    });

    // Ensure that callbacks options are functions
    $.each( Plugin.optionsEvents, function(index, name) {
      option = options[name];
      if( void 0 === option ) { return; }
      isFunction = $.isFunction( option );
      if ( !isFunction && null !== option ) {
        throw new TypeError( 'Option \"' + name + '\" should be a function or \"null\"!' );
      }
    });

    newOptions = $.extend( {}, this.options, options );
    // Cache items selector to compare it with clicked elements
    // Plugin's class name + Item selector
    newOptions.parentSelector = '.' + newOptions.listClass + ' ' + newOptions.filter;

    // Set scrollable containter
    if ( options.autoScroll !== void 0 ) { this._setScrolledElem( options.autoScroll ); }
    this.options = newOptions;
  };


  Plugin.prototype._destroy = function() {
    this._callEvent('destroy');
    this._unbindEvents();
    if ( this._focusHoverTimeout ) { clearTimeout(this._focusHoverTimeout); }
    // remove class and property
    if( this.ui.focus ) {
      $(this.ui.focus).removeClass( this.options.focusClass );
      delete this.ui.focus;
    }
    // find items and remove class
    if( this._selected > 0 ) {
      this.getSelected().removeClass( this.options.selectedClass );
    }
    this.$el.removeClass( this.options.disabledClass );
    this.$el.removeClass( this.options.listClass );
    delete this._scrolledElem;
    delete this._solidInitialElem;
  };


  Plugin.prototype._setScrolledElem = function( selector ) {
    var elem;

    if ( null === selector || false === selector ) {
      delete this._scrolledElem;
      return;
    }
    if ( typeof selector === "string" ) {
      elem = $( selector );
      if (elem.length > 0) {
        this._scrolledElem = elem[0];
      } else {
        throw new Error('There are no elements that matches to selector - \"' + selector + '\"');
      }
      return;
    }
    this._scrolledElem = this.el;
  };


  Plugin.prototype._cancel = function( e, params ) {
    if ( params.wasCancelled ) { return; }
    params.isCancellation = this._isPrevented = true;
    var _this = this;

    // Restores items states for each changed item
    $.each(
      $(params.changedItems),
      function( index, item ) {
        // there is boolean value in array prevItemsStates
        // with same index that item has in _changedItems
        if ( params.prevItemsStates[ index ] ) {
          _this._select( e, params, $(item), true );
        } else {
          _this._unselect( e, params, $(item), true );
        }
      }
    );
    // Restore old focus
    if ( params.prevFocus ) { this._setFocus( params.prevFocus ); }
    delete params.isCancellation;
    params.wasCancelled = true;
  };

  
  // Attath handlers
  Plugin.prototype._bindEvents = function() {
    var _this = this;

    // Handler for mouse events
    this._mouseEvent = function(e) {
      if ( _this._isEnable ) { _this._mouseHandler.call(_this, e); }
      return e;
    };
    // Handler for keyboard events
    this._keyboardEvent = function(e) {
      if( _this.options.keyboard && _this._isEnable ) { _this._keyHandler.call(_this, e); }
    };
    // Handler for selection start
    this._selectstartEvent = function() {
      if ( !_this.options.textSelection ) { return false; }
    };
    // Handler for mousemove
    this._mousemoveEvent = _throttle( function(e) {
      if( _this._isEnable && _this.options.hoverFocus ) { _this._mousemoveHandler.call(_this, e); }
    }, 20);

    $document.on(
      'click' + '.' + this._name + ' ' + 'mousedown' + '.' + this._name,
      this._mouseEvent
    );
    $document.on(
      'keydown' + '.' + this._name + ' ' + 'keyup' + '.' + this._name,
      this._keyboardEvent
    );
    this.$el.on(
      'selectstart' + '.' + this._name,
      this._selectstartEvent
    );
    $document.on(
      'mousemove' + '.' + this._name,
      this._mousemoveEvent
    );
  };

  
  // Detach handlers
  Plugin.prototype._unbindEvents = function() {
    $document.off(
      'click' + '.' + this._name + ' ' + 'mousedown' + '.' + this._name,
      this._mouseEvent
    );
    $document.off(
      'keydown' + '.' + this._name + ' ' + 'keyup' + '.' + this._name,
      this._keyboardEvent
    );
    this.$el.off(
      'selectstart' + '.' + this._name,
      this._selectstartEvent
    );
    $document.off(
      'mousemove' + '.' + this._name,
      this._mousemoveEvent
    );
  };


  // Get item, that was clicked
  // or null, if click was not on an item
  Plugin.prototype._getTarget = function( e ) {
    var elem = e.target,
      handle = this.options.handle,
      $elem, target, handleElem;

    // While plugin's element or top of the DOM is achieved
    while ( elem !== null && elem !== this.el ) {
      $elem = $(elem);
      // Set context, because old (< 1.10.0) versions of jQuery gives wrong result.
      $elem.context = window.document;

      // If item matches to selector
      if( $elem.is(this.options.parentSelector) ) {
        target = elem;
      }
      // If handle option is ON and that elem match to handle's selector
      if( handle && $elem.is( handle ) ) {
        handleElem = elem;
      }
      // Get parent element
      elem = elem.parentNode;
    }

    // If handle option is ON and it was found
    // and item of this list was clicked
    if( handle && elem && handleElem ) {
      return target;

    // If achieved $el of this instance of plugin's object
    } else if( !handle && elem ) {
      return target;
    }
    // has not clicked any selectable items of a list
    return null; 
  };


  Plugin.prototype._getSelected = function( getIds ) {
    var arr, res, items;

    if( getIds ) {
      arr = [];
      items = this.$el.children( '.' + this.options.selectedClass );

      // Iterate through collection and return id or null
      $.each( items, function(index, elem) {
        arr.push( $(elem).attr('id') || null );
      });
      res = arr.length > 0 ? arr : null;

    } else {
      res = this.$el.children( '.' + this.options.selectedClass );
    }
    return res;
  };


  Plugin.prototype._getItems = function( params, target, elem ) {
    var items;

    switch( target ) {
    case 'next':
    case 'prev':
      var
      item = elem.jquery ? elem : $( elem ),
      find = $.fn[target];

      while (true) {
        item = find.call( item );
        if ( item.length === 0 ) { break; }
        // Set context, because old (< 1.10.0) versions of jQuery gives wrong result.
        item.context = window.document;
        if ( item.is(this.options.parentSelector) ) { return item; }
      }
      return null;

    case 'pageup':
    case 'pagedown':
    /*
    * There are two versions of algorithm for searching target depending from page height.
    * Page's height is window's or _scrolledElem's height ( which is smaller ).
    * Both algorithms runs loop until total item's height reaches maximum possible value,
    * but lower than page height. But first version gets from DOM one next element every cycle,
    * and second version gets all items at the beginning and then iterates through them.
    * And it set allItems and rangeStart and rangeEnd for params. So second version used only 
    * for Shift+pageUp/Down cases for performance and can be enabled by flag params.isShiftPageRange.
    */ 
      var
        _isOptimized  = params.isShiftPageRange, 
        box           = this._scrolledElem || this.el,
        boxViewHeight = box.clientHeight,
        winViewHeight = $( window ).outerHeight(),
        $current      = $( elem ),
        isBoxBigger   = boxViewHeight > winViewHeight,
        pageHeight    = isBoxBigger ? winViewHeight : boxViewHeight,
        itemHeight    = $current.outerHeight(),
        currentHeight = itemHeight,
        itemsHeight   = itemHeight,
        direction     = (target === 'pageup') ? 'prev' : 'next',
        $candidate, candHeight, currentIndex, allItems, cand;

        if ( _isOptimized ) {
          direction = (target === 'pageup') ? -1 : 1;
          allItems = this._getItems( params );
          params.rangeStart = currentIndex = allItems.index( elem );
        }

      while( true ) {
        if ( _isOptimized ) {
          currentIndex = currentIndex + direction;
          cand = currentIndex >= 0 ? allItems.eq( currentIndex ) : null;
          $candidate = cand && cand.length > 0 ? cand : null;
        } else {
          $candidate = this._getItems( params, direction, $current );  
        }
        
        if ( !$candidate && $current.is( elem ) ) {
          break;
        } else if ( !$candidate  ) {
          if ( _isOptimized ) { params.rangeEnd = currentIndex - direction; }
          return $current;
        }
        
        candHeight = $candidate.outerHeight();
        itemsHeight = itemsHeight + candHeight;
        
        if ( itemsHeight > pageHeight ) {
          // If two items bigger than page than it just will give next item
          if ( currentHeight + candHeight > pageHeight ) {
            if ( _isOptimized ) { params.rangeEnd = currentIndex; }
            return $candidate;
          }
          
          if ( _isOptimized ) { params.rangeEnd = currentIndex - direction; }
          return $current;
        }
        currentHeight = candHeight;
        $current = $candidate;
      }
      return null;

    case 'first':
      items = params.allItems ? params.allItems : this.$el.find( this.options.filter );
      params.allItems = items;
      return items.first();

    case 'last':
      items = params.allItems ? params.allItems : this.$el.find( this.options.filter );
      params.allItems = items;
      return items.last();

    default:
      items = params.allItems ? params.allItems : this.$el.find( this.options.filter );
      params.allItems = items;
      return items;
    }
  };


  // Creates ui object and calls a callback from the options
  Plugin.prototype._callEvent = function( name, event, params ) {
    var ui, cb = this.options[name];
    if ( !cb ) { return; }
    if ( name === 'create' || name === 'destroy' ) {
      return cb.call( this.$el );
    }
    ui = {};
    if ( params.target ) { ui.target = params.target; }
    if ( this.ui.focus ) { ui.focus  = this.ui.focus; }

    switch ( name ) {
      case 'select':      ui.items = params.selected; break;
      case 'unselectAll':
      case 'unselect':    ui.items = params.unselected; break;
      case 'stop':        if ( !params.wasCancelled ) { ui.items = params.changedItems; } break;
    }
    // Pass to callback: elem, event object and new ui object
    cb.call( this.$el, event || null, ui );
  };


  // Control the state of a list.
  // It can be called from _keyHandler, _mouseHandler or API
  // and does list's changes depending from reseived params.
  Plugin.prototype._controller = function( e, params ) {
    var method;
    params.changedItems = [];
    params.prevItemsStates = [];
    delete this._isPrevented;
    this._callEvent('before', e, params);

    // If cancel flag is true any changes will be prevented
    if( this._isPrevented ) {
      this._cancel( e, params );
      this._stop( e, params );
      return;
    }

    // Flag - if there was any selected items before changes
    params.wasSelected = ( this._selected > 0 );

    // Flag - if target was selectedl before changes
    if ( params.target && params.isTargetWasSelected === undefined ) {
      params.isTargetWasSelected = this._getIsSelected( params.target );
    }
    
    // If it is range selection
    // and target is selected and equal to focus
    if (
      params.isRangeSelect && 
      params.isTargetWasSelected && 
      params.target === this.ui.focus
    ) {
      // do nothing

    // Range
    } else if ( params.isRangeSelect ) {
      this._perfomRangeSelect( e, params);

    // Multi
    } else if ( params.isMultiSelect ) {
      method = params.isTargetWasSelected ? this._unselect : this._select;
      method.call( this, e, params, params.items );

    // Moving focus be mouse
    } else if ( params.target && !params.items && e.type === 'mouseover' ) {
      // do nothing - focus will be set

    // Single selection
    } else if ( params.target && params.items ) {

      // If there is one selected item and it is focused
      if ( this._selected && this._selected === 1 && this._getIsSelected(this.ui.focus) ) {
        /* It is case, when user moves cursor by keys or chooses single items by mouse 
        — need just clear selection from focus — no need run go whole DOM of list */
        this._unselect( e, params, this.ui.focus, params.isTargetWasSelected );

      } else if (this._selected) {
        this._unselectAll( e, params );
      }
      // Select item. Callback 'select' calls only if target was selected
      this._select( e, params, params.items, params.isTargetWasSelected );

    // if there are selected items and 'selectionBlur' option is true
    } else if ( !params.target && this._selected > 0 && this.options.selectionBlur ) { 
      this._unselectAll( e, params );
    }

    if( !this._selected && params.wasSelected ) {
      this._callEvent('unselectAll', e, params);
    }
    
    // Cache old focus
    params.prevFocus = ( this.ui.focus ) ? this.ui.focus : null;

    // it is not item of list was clicked and 'focusBlur' option is ON
    if ( !params.target && this.options.focusBlur ) {
      this._blur(e, params);
    // or set new
    } else if ( params.target && !params.wasCancelled ) { this._setFocus( params.target ); }
    
    // End of the cycle
    this._stop( e, params );
  };


  Plugin.prototype._perfomRangeSelect = function( e, params ) {
    var method, items, initial, beforeStart, afterStart, beforeEnd, afterEnd,

    endAfterStart = params.rangeStart < params.rangeEnd,
    allItems      = this._getItems( params ),
    top           = ( endAfterStart ) ? params.rangeStart : params.rangeEnd,
    bot           = ( endAfterStart ) ? params.rangeEnd : params.rangeStart;

    // New solid selectioin
    if ( params.isNewSolidSelection ) {
      // Get items from top to first range item (not include)
      items = allItems.slice( 0, top );
      // Add items from last range item (not include) to the end of list
      items = items.add( allItems.slice( bot + 1 ) );
      this._unselect( e, params, items );
      this._select( e, params, params.items );
    
    // Existing Solid selection and target is not selected
    // and initial selection's elem is in current range
    } else if (
      this._solidInitialElem &&
      !params.isTargetWasSelected &&
      (initial = params.items.index( this._solidInitialElem )) >= 0
    ) {
      // Need to unselect items from start to initial elem and select from initial elem to the end
      initial     = ( endAfterStart ) ? params.rangeStart + initial : params.rangeEnd + initial;
      beforeStart = initial < params.rangeStart;
      afterStart  = params.rangeStart < initial;
      beforeEnd   = initial < params.rangeEnd;
      afterEnd    = params.rangeEnd < initial;

      if (( !beforeEnd && beforeStart ) || ( !afterEnd && afterStart)) {
        // Items from range start to initial solid selection elem (but not include)
        items = afterStart ? allItems.slice( top, initial ) : allItems.slice( initial+1, bot+1 );
        if (items.length > 0) {
          this._unselect( e, params, items );
        }
      }
      if (( afterEnd && !afterStart ) || ( beforeEnd && !beforeStart )) {
        // Items from range end to initial selection elem (but not include)
        items = afterEnd ? allItems.slice( top, initial ) : allItems.slice( initial+1, bot+1 );
        if (items.length > 0) {
          this._select( e, params, items );
        }
      }

    // Common range select
    } else {
      method = params.isTargetWasSelected ? this._unselect : this._select;
      method.call( this, e, params, params.items );
    }
  };


  Plugin.prototype._changeItemsStates = function( items, delta, params ) {
    /*
    'delta' is number to modifying selection counter
    above zero 'delta' from _select/ sub zero 'delta' from _unselect
    */
    var
      aboveZero = delta > 0,
      changedItems = [],
      self = this;

    // For each of items calls function in scope plugin's object instance
    $( items ).each( function( index, item ) {

      var
        isSelected = self._getIsSelected( item ),
        // Condition - if item is not selected (_select) or items is selected (_unselect)
        selectedCondition = ( aboveZero ) ? !isSelected : isSelected,
        // if the item is target and is selected
        isSelectedTarget = ( item === params.target && params.isTargetWasSelected );

      /*  If it's unselecting and item is selected target,
        and is not 'multi' or 'range' select mode
        — do nothing because state of selected target should not change
        – it is just unselecting other items  */
      if (
        isSelectedTarget &&
        !aboveZero &&
        !params.isMultiSelect &&
        !params.isRangeSelect
      ) { return; }

      if( selectedCondition ) {
        // it is not cancellation
        if( !params.isCancellation ) {
          changedItems.push( item );
          params.prevItemsStates.push( isSelected );
        }
        self._selected += delta;
      }

      // Finally add/remove class to item
      $( item ).toggleClass( self.options.selectedClass, aboveZero );

    });

    // If it is not cancellation
    if( !params.isCancellation ) {
      params[ (aboveZero?'selected':'unselected') ] = $( changedItems );

      // Add items of this iteration to array of changed elements
      params.changedItems = params.changedItems.concat( changedItems );
    }
  };


  Plugin.prototype._select = function( e, params, items, silent ) {
    this._changeItemsStates( items, 1, params);
    if ( !silent ) { this._callEvent('select', e, params); }
    if( this._isPrevented && !params.isCancellation ) { this._cancel( e, params ); }
  };


  Plugin.prototype._unselect = function( e, params, items, silent ) {
    this._changeItemsStates( items, -1, params );
    if ( !silent ) { this._callEvent('unselect', e, params); }
    if( this._isPrevented && !params.isCancellation ) { this._cancel( e, params ); }
  };


  Plugin.prototype._unselectAll = function( e, params ) {
    var isOnlyTargetSelected, items;
    if( !this._selected || this._selected === 0 ) { return; }

    // Get all items
    items = this._getItems( params );
    // target was only selected item ( flag used for preventing callback )
    isOnlyTargetSelected = params.target && params.isTargetWasSelected && this._selected === 1;

    this._unselect( e, params, items, isOnlyTargetSelected );
  };


  Plugin.prototype._multiSelect = function( params ) {
    params.isMultiSelect = true;
    return $( params.target );
  };


  Plugin.prototype._rangeSelect = function( params ) {
    params.isRangeSelect = true;

    // If target is focused item - do nothing
    if( params.target === this.ui.focus ) { return $( params.target ); }

    // Detect position of target and focus in the list
    var arr = params.allItems ? params.allItems : this._getItems( params ),
      x = arr.index( params.target ),
      y = arr.index( this.ui.focus ),

    // Get array of items between focus and target
    subArr =     ( x < y ) ? arr.slice( x, y ) : arr.slice( y, x );
    subArr.push( ( x < y ) ? arr[ y ]          : arr[ x ] );

    params.allItems = arr;
    params.rangeStart = y;
    params.rangeEnd = x;
    return subArr;
  };


  Plugin.prototype._getIsSelected = function( target ) {
    var options = this.options;
    
    // If was get one item or nothing
    if( $(target).length <= 1 ) {
      return $( target ).hasClass( options.selectedClass );
    }
    // Return array of boolean values
    return $.map( $(target), function( item ) {
      return $( item ).hasClass( options.selectedClass );
    });
  };


  Plugin.prototype._blur = function( e, params, silent ) {
    // If is not silent mode and focus exists
    if( !silent && this.ui.focus ) {
      // Callback of focus lost
      this._callEvent('focusLost', e, params);
    }
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


  Plugin.prototype._stop = function( e, params ) {
    this._callEvent('stop', e, params);
    if( this._isPrevented ) { this._cancel( e, params ); }
  };

  

  /* ==============================================================================

  Keyboard

  */
  Plugin.prototype._keyHandler = function( e ) {

    if ( !this.options.keyboard ) { return; }
    if ( this.options.preventInputs && e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') { return; }
    var key = e.which, params = {}, target, isAllSelect, direction, page;

    // Key is released
    if (e.type === 'keyup') {
      if ( key === Plugin.keyCode.SHIFT ) {
        delete this._shiftModeAction; // while SHIFT is held
        delete this._keyModes.shift; // arrow key (UP,DOWN) which pressed first in SHIFT mode
      }
      return;
    }
    // If CTRL+A or CMD+A pressed and multi option is true
    if ( key === Plugin.keyCode.A && (e.metaKey || e.ctrlKey) && this.options.multi ) {
      target = this._getItems( params );
      isAllSelect = true; // flag that is all items is selected

    } else {
      // Choose direction and try to find targeted item
      switch ( key ) {
      case Plugin.keyCode.DOWN:
        direction = 'next';
        target = this._findNextTarget( 'next', params );
        break;
      case Plugin.keyCode.UP:
        direction = 'prev';
        target = this._findNextTarget( 'prev', params );
        break;
      case Plugin.keyCode.HOME:
        direction = 'prev';
        target = this._getItems( params, 'first');
        break;
      case Plugin.keyCode.END:
        direction = 'next';
        target = this._getItems( params, 'last');
        break;
      case Plugin.keyCode.PAGE_DOWN:
      case Plugin.keyCode.PAGE_UP:
        var isDown = key === Plugin.keyCode.PAGE_DOWN;
        direction  = isDown ? 'next' : 'prev';
        page       = isDown ? 'pagedown' : 'pageup';
        params.isShiftPageRange = this.options.multi && e.shiftKey && !isAllSelect;
        target = this._findNextTarget( page, params );
        break;
      case Plugin.keyCode.SPACE:
        target = $( this.ui.focus );
        break;
      case Plugin.keyCode.ENTER:
        if ( !this.options.multi ) { target = $( this.ui.focus ); }
        break;
      }
    }
    // If target has found, that one of the arrows was pressed
    if ( target && target.length > 0 ) {
      // Disable default window scroll by arrow keys
      e.preventDefault();

      // Set target to found target item
      params.target = target[0];
      params.items = target;

      // Toggle mode
      if ( this.options.keyboardMode === 'toggle' ) {
        if (
          key !== Plugin.keyCode.SPACE &&
          !(key === Plugin.keyCode.ENTER && !this.options.multi)
        ) {
          delete params.items;
        }
        if ( this.options.multi ) { params.isMultiSelect = true; }
        delete this._solidInitialElem;

      // SHIFT mode
      } else if (
        this.ui.focus && 
        this.options.multi && 
        e.shiftKey && 
        !isAllSelect
      ) {
        // Call multiVariator or rangeVariator – 
        // it set all needed params depends from arguments
        if (
          key === Plugin.keyCode.END     || key === Plugin.keyCode.HOME ||
          key === Plugin.keyCode.PAGE_UP || key === Plugin.keyCode.PAGE_DOWN
        ) {
          this._rangeVariator( params );
        } else {
          this._multiVariator( params, key, direction, target );
        }

        // Set solid selection
        if ( !this._solidInitialElem && params.target !== this.ui.focus ) {
          this._solidInitialElem = this.ui.focus;
          params.isNewSolidSelection = true;
        }

        // Set selection mode
        if ( !this._shiftModeAction ) { this._shiftModeAction = 'select'; }
        if ( !this._keyModes.shift  ) { this._keyModes.shift  = key;      }

      } else {
        delete this._solidInitialElem;
      }

      // There are all necessary attributes now
      this._controller( e, params );

      // Recalculate plugin's box and window's scrolls
      this.scroll();
    }
    return e;
  };


  Plugin.prototype._rangeVariator = function( params ) {
    var
      isFocusSelected = void 0 === params.isFocusSelected ? this._getIsSelected( this.ui.focus ) : params.isFocusSelected,
      isTargetSelected = params.isTargetWasSelected = this._getIsSelected( params.target );

    if ( !isFocusSelected && !isTargetSelected ) {
      // Only target will be selected
      params.target = params.items = this.ui.focus;
      params.isMultiSelect = true;
    } else {
      // Range will be selected
      params.items = this._rangeSelect( params );
      // Cut target from end or begin because we do not want to unselect it
      if ( isTargetSelected ) {
        params.items = params.rangeStart < params.rangeEnd ? (
        params.items.slice(0, params.items.length-1)
        ) : (params.items.slice(1) );
      }
    }
  };


  /*  FOR SHIFT MODE ONLY
  *   - turns on shift mode flags
  *   - solves different situations with shift+arrows selection
  */
  Plugin.prototype._multiVariator = function( params, key, direction, target ) {
    var
      // Check if focus or target is selected
      isFocusSelected       = void 0 === params.isFocusSelected ? this._getIsSelected( this.ui.focus ) : params.isFocusSelected,
      isTargetSelected      = this._getIsSelected( params.target ),
      // Search for next target in the same direction
      afterTarget           = this._getItems( params, direction, target ),
      // Check if second target is selected (flag)
      isSelectedAfterTarget = this._getIsSelected( afterTarget ),
      prevItem;

    // If another arrow was pressed that means the direction was changed
    if ( this._keyModes.shift && this._keyModes.shift !== key ) {
      this._keyModes.shift = this._shiftModeAction = null;
    }

    if ( this._keyModes.shift && this._shiftModeAction === 'select' && isTargetSelected ) {
      /* When user select range of items by holding SHIFT and presses arrow key, there are already can be
      selected items — focus should jump through these selected items to first unselected item */

      // While first unselected item will be found or edge of the list will be reached
      while( this._getIsSelected(params.items) && params.items.length > 0 ) {
        // get next item in the same direction
        prevItem = params.items;
        params.items = this._getItems( params, direction, params.items );
      }
      // If unselected item was found it becomes target item
      // target will be selected and get the focus
      params.target = params.items ? params.items : prevItem;

    } else if ( isTargetSelected && isFocusSelected && !isSelectedAfterTarget ) {
      /* Sitiation is possible when user unselect items by arrow key with holding SHIFT */

      // Clear flags of serial selection by SHIFT
      this._keyModes.shift = this._shiftModeAction = null;
      params.items = this.ui.focus;
      // Selection will be clear on the focus, focus will be set on target item

    } else if ( isFocusSelected && isTargetSelected ) {
      params.items = this.ui.focus;
      // If there is no SHIFT action (first pressing arrow key with holding SHIFT)
      // Set mode of selection
      if ( !this._shiftModeAction ) { this._shiftModeAction = 'unselect'; }
      // Selection will be clear on the focus, focus will be set on target item

    } else if ( !isFocusSelected ) {
      // Focus will be selected
      params.target = params.items = this.ui.focus;
    }
    params.isMultiSelect = true;
  };


  /*
  Used by _keyHandler
  when UP, DOWN, PageUp, PageDown keys has pressed — find target or first/last element of the list
  */
  Plugin.prototype._findNextTarget = function( direction, params ) {
    var edge = ( direction === 'next' || direction === "pagedown" ) ? 'first' : 'last', // extreme item of the list
      // If there is the focus - try to find next sibling
      // else get first|last item of the list — depends from direction
      res = ( this.ui.focus ) ? this._getItems( params, direction, this.ui.focus ) : this._getItems( params, edge );

    // If has not found any items and loop option is ON
    if ( (res === null || res.length === 0) && this.options.loop ) {
      // find extreme item
      res = this._getItems( params, edge );
    }
    return res;
  };


  /*
  Used by _keyHandler or public scroll method
  Recalculate scroll position, if focused item is not visible in container viewport
  */
  Plugin.prototype._refreshBoxScroll = function( box ) {
    var
      $box          = $( box ),
      isWindow      = box === window,
      boxViewHeight = isWindow ? $box.outerHeight() : box.clientHeight,
      boxScrollTop  = $box.scrollTop(),
      boxWindowY    = isWindow ? 0 : $box.offset().top,

      $item         = $( this.ui.focus ),
      itemHeight    = $item.outerHeight(),
      itemBoxTop    = isWindow ? $item.offset().top : ( $item.offset().top - boxWindowY + boxScrollTop );

    if ( itemBoxTop < boxScrollTop ) {
      // Scroll to top edge of elem
      $box.scrollTop( itemBoxTop );
    
    } else if ( (itemBoxTop + itemHeight) > (boxScrollTop + boxViewHeight) ) {
      // Scroll to bottom edge of elem - 
      // bottom edges of item and viewport will be on the same Y
      $box.scrollTop( itemBoxTop + itemHeight - boxViewHeight );
    }
  };



  /* ==============================================================================

  Mouse

  */
  // Mouse events handler - set necessary paramaters and calls _controller
  Plugin.prototype._mouseHandler = function( e ) {
    var options = this.options,
    params = {};

    // If hybrid mode
    if ( options.event === 'hybrid' ) {

      // It is click and mouse was not pressed on item
      if ( e.type === 'click' && !this._mouseDownMode ) { return; }

      params.target = this._getTarget(e);

      if ( params.target && e.type === 'mousedown' ) {

        params.isTargetWasSelected = this._getIsSelected( params.target );
        if ( params.isTargetWasSelected ) {
          this._mouseDownMode = true;
          return;
        }
      }

      // If mouse down mode
      if ( this._mouseDownMode ) { delete this._mouseDownMode; }

    // if type of event do not match
    } else if ( e.type !== options.event ) {
      return;

    // Get target
    } else { params.target = this._getTarget(e); }

    // If multi options is true and target exists
    if( options.multi && params.target ) {

      // Range select
      if ( (e.shiftKey || e.shiftKey && e.ctrlKey) && this.ui.focus ) {
        params.items = this._rangeSelect( params );

      // Add/subtract to selection
      } else if( e.ctrlKey || e.metaKey || options.mouseMode === 'toggle' ) {
        params.items = this._multiSelect( params );
      }
    }

    if ( params.target && !params.items ) { params.items = $( params.target ); }
    delete this._solidInitialElem;
    this._controller( e, params );
  };


  // Tries to find target under cursor when mouse moves
  Plugin.prototype._mousemoveHandler = function( e ) {
    if ( this._isHoverFocusPrevented ) { return; }
    var params = {}, target;

    target = this._getTarget( e );
    if ( target ) {
      delete this._solidInitialElem;
      this._isHovered = true;
      if ( target !== this.ui.focus ) {
        params.target = target;
        this._controller( e, params );
      }
    } else if ( this._isHovered ) {
      this._isHovered = false;
      this._controller( e, params );
    }
  };


  // Prevent changing focus under cursor when user moves focus by keyboard
  // and list's element changes scroll position
  Plugin.prototype._preventMouseMove = function() {
    var _this = this;
    this._isHoverFocusPrevented = true;
    
    if ( this._focusHoverTimeout ) {
      clearTimeout( this._focusHoverTimeout );
      delete this._focusHoverTimeout;
    }

    this._focusHoverTimeout = setTimeout( function() {
      delete _this._isHoverFocusPrevented;
      delete _this._focusHoverTimeout;
    }, 250);
  };



  /* ==============================================================================

  Public API

  */
  Plugin._callPublicMethod = function( options ) {
    var
      _this = Plugin.getDataObject( this ),
      publicMethod, args;

    if( null === _this || void 0 === _this ) {
      throw new Error( 'Element ' + this[0] + ' has no plugin ' + Plugin.pluginName );
    }
    // Try to find method
    if ( _this[options] && $.isFunction(_this[options]) ) {
      publicMethod = _this[options];
    }
    // If method exists and it is not private – call him
    if ( publicMethod && $.isFunction( publicMethod ) && options.charAt(0) !== '_' ) {
      args = Array.prototype.slice.call( arguments );
      args.shift();
      return publicMethod.apply( _this, args );
    }
    // Nothing has found
    throw new Error( 'Plugin \"' + Plugin.pluginName + '\" has no method \"' + options + '\"' );
  };


  Plugin.prototype.isEnabled = function() {
    return this._isEnable;
  };


  Plugin.prototype.option = function( option, value ) {
    var args = arguments.length;

    // Received string
    if( args > 0 && typeof option === 'string' ) {
      // Received strings and any argument
      if( args > 1 ) {
        this._setOptions( option, value );
        return this.$el;
      }
      // Return value of option
      return this.options[ option ];
    }
    // Received object
    if( args > 0 && $.isPlainObject( option ) ) {
      this._setOptions( option );
      return this.$el;
    }
    // Return whole options object
    if ( args === 0 ) {
      return $.extend({}, this.options);
    } else {
      throw new Error('Format of \"option\" could be: \"option\" or \"option\",\"name\" or \"option\",\"name\",val or \"option\",{}');
    }
  };


  Plugin.prototype.destroy = function() {
    this._destroy();
    this.$el.removeData( 'plugin_' + Plugin.pluginName );
    this.$el = null;
    return;
  };


  Plugin.prototype.select = function( selector ) {
    var $elem;

    // If received DOM $element
    if ( selector && (selector.jquery || selector.nodeType) ) {
      // Filter received elements through cached selecter
      selector = selector.jquery ? selector : $( selector );
      $elem = selector.filter( this.options.parentSelector );
      $elem = $elem.length > 0 ? $elem : null;
    
    } else if (typeof selector === 'string') {
      // Test for selector
      $elem = this.$el
        .find( selector ) // Try to find
        .filter( this.options.parentSelector ); // Filter found $elements
      $elem = ( $elem.jquery && $elem.length > 0 ) ? $elem : null;
    } else {
      throw new Error( 'You shold pass DOM element or selector to \"select\" method.' );
    }

    if ( $elem ) {
      delete this._solidInitialElem;
      this._controller( null, {
        items:  ( $elem.addClass ) ? $elem : $( $elem ),
        target: $elem[0] || $elem
      });
    }
    return this.$el;
  };


  Plugin.prototype.blur = function() {
    // Call _controller with null instead of event object
    this._controller( null, { target: null } );
    return this.$el;
  };


  Plugin.prototype.getSelected = function() {
    return this._getSelected();
  };


  Plugin.prototype.getSelectedId = function() {
    return this._getSelected( true );
  };


  Plugin.prototype.getFocused = function() {
    if (this.ui.focus) { return this.ui.focus; } else { return null; }
  };


  Plugin.prototype.scroll = function() {
    this._preventMouseMove();
    if (this.ui.focus) {
      if ( this._scrolledElem ) { this._refreshBoxScroll( this._scrolledElem ); }
      this._refreshBoxScroll( window );
    }
  };


  Plugin.prototype.enable = function() {
    this._isEnable = true;
    this.$el.removeClass( this.options.disabledClass );
    return this.$el;
  };


  Plugin.prototype.disable = function() {
    this._isEnable = false;
    this._isHovered = false;
    this.$el.addClass( this.options.disabledClass );
    return this.$el;
  };


  Plugin.prototype.cancel = function() {
    this._isPrevented = true;
    return this.$el;
  };


  Plugin.prototype.refresh = function() {
    var focus = this.ui.focus;

    // Check if focus is visible
    if ( focus && !$(focus).is(':visible') ) { delete this.ui.focus; }

    // Recalculate amount of selected items
    this._selected = ( this.getSelected() ).length;
    return this.$el;
  };



  /* ==============================================================================

  Method of jQuery.fn

  */
  $.fn[Plugin.pluginName] = function( options ) {

    // If string passed
    if( options && options.charAt ) {
      return Plugin._callPublicMethod.apply( this, arguments );
    }
    // Create instances
    return this.each( function(key, elem) {
      if ( !Plugin.getDataObject(elem) ) { new Plugin( elem, options ); }
    });
  };





  /* DEVELOPMENT */
  /* DO NOT CHANGE THIS!
  All code below DEVELOPMENT line ( except closing function wrapper )
  will be automatically removed for production by grunt replace task */
  window[ '_' + Plugin.pluginName ] = Plugin;





}(jQuery, window));