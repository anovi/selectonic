(function( $, window, Options ) {
  'use strict';

  var defaults = {
    box:    { type: 'object' },
    offset: { default:0, type:'number' },
    // Callbacks
    clone:        { default:null, type:'function', isNullable:true },
    cloneRemove:  { default:null, type:'function', isNullable:true },
    move:         { default:null, type:'function', isNullable:true },
    stop:         { default:null, type:'function', isNullable:true },
    over:         { default:null, type:'function', isNullable:true },
    out:          { default:null, type:'function', isNullable:true },
    visible:      { default:null, type:'function', isNullable:true }
  },
  $window = $( window );

  var Plugin = function(el, options) {
    this.options = new Options( defaults, options );
    this.$el = el;
    this.box = this.options.get('box');
    this._initState = {
      position: this.$el.css('position'),
      top:      this.$el.css('top'),
    };
    this._called = {};
    this.$el.data( 'scrollSpy', this );
    this._bindEvents();
  };


  Plugin.prototype._bindEvents = function() {
    var _this = this;
    $( window ).on('scroll', function() { _this._refreshBoxScroll( _this.box ); });
  };


  /*
  Used by _keyHandler or public scroll method
  Recalculate scroll position, if focused item is not visible in container viewport
  */
  Plugin.prototype._refreshBoxScroll = function( box ) {
    var
      offset        = this.options.get('offset'),
      $box          = $( box ),
      isWindow      = box === window,
      boxViewHeight = isWindow ? $box.outerHeight() : box.clientHeight,
      boxScrollTop  = $box.scrollTop(),
      boxWindowY    = isWindow ? 0 : $box.offset().top,

      windowViewHeight = $window.outerHeight(),
      windowScrollTop = $window.scrollTop(),

      item       = this.$el,
      itemHeight = item.outerHeight(),
      itemInBoxY = isWindow ? item.offset().top : ( item.offset().top - boxWindowY + boxScrollTop );

    if ( windowScrollTop + windowViewHeight > boxWindowY && boxWindowY + boxViewHeight > windowScrollTop) {
      this._callEvent('over');
      this._callEvent('visible', {
        window: { height: windowViewHeight, scrollTop: windowScrollTop },
        item:   { height: itemHeight,       topInBox:  itemInBoxY      },
        box:    { height: boxViewHeight,    top:       boxWindowY      }
      });
    } else {
      this._callEvent('out');
    }

    if ( boxWindowY > windowScrollTop + offset) {
      item.css({
        position: this._initState.position,
        top: this._initState.top,
      });
      this._cutClone();
    
    } else if ( windowScrollTop > boxViewHeight + boxWindowY - itemHeight - offset ) {
      // set item to bottom box edge
      this._setClone();
      item.css({
        position:'absolute',
        top: boxViewHeight + boxWindowY - itemHeight
      });
      this._callEvent('stop');
    
    } else {
      this._setClone();
      item.css({
        position: 'fixed',
        top: 0 + this.options.get('offset')
      });
      this._callEvent('move');
    }
  };


  Plugin.prototype._setClone = function() {
    if ( this._clone ) { return; }
    this._clone = this.$el
      .clone()
      .css({ opacity: 0 })
      .attr('id', null);

    this._clone.addClass('scrollSpy-clone');
    this._callEvent('clone');
    this._clone.insertBefore( this.$el );
  };


  Plugin.prototype._cutClone = function() {
    if (this._clone) {
      this._callEvent('cloneRemove');
      this._clone.remove();
      delete this._clone;
    }
  };


  Plugin.prototype._callEvent = function( name, params ) {
    var cb = this.options.get( name ), args = [],
    noCallback = !cb || !$.isFunction(cb);

    switch (name) {
    case 'move':
      this._called.stop = false;
      break;

    case 'visible':
      if ( noCallback ) { return; }
      args.push( params );
      break;

    case 'clone':
      if ( noCallback ) { return; }
      args.push( this._clone );
      args.push( this.$el );
      break;
      
    case 'out':
    case 'over':
      if ( this._called[name] ) {
        return;
      } else {
        this._called[name] = true;
        this._called[ ( name === 'out' ? 'over' : 'out' ) ] = false;
      }
      break;

    case 'stop':
      if ( this._called.stop ) { return; }
      this._called.stop = true;
      break;
    }
    if ( noCallback ) { return; }
    cb.apply( this, args );
  };


  // What does the scrollSpy plugin do?
  $.fn.scrollSpy = function( options ) {

    if (!this.length) { return this; }

    this.each(function(index,el) {
      var $el = $(el);
      new Plugin( $el, options );
    });

    return this;
  };

})( jQuery, window, window.SuperOptions );


