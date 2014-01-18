(function( $, window, Options ) {
  'use strict';

  var defaults = {
    box: { type: 'object' }
  },
  $window = $( window );

  var Plugin = function($el, options) {
    this.options = new Options( defaults, options );
    this.$el = $el;
    this.box = this.options.get('box');
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
      $box          = $( box ),
      isWindow      = box === window,
      boxViewHeight = isWindow ? $box.outerHeight() : box.clientHeight,
      // boxScrollTop  = $box.scrollTop(),
      boxWindowY    = isWindow ? 0 : $box.offset().top,

      // windowViewHeight = $window.outerHeight(),
      windowScrollTop  = $window.scrollTop(),

      item       = this.$el,
      itemHeight = item.outerHeight();
      // itemInBoxY = isWindow ? item.offset().top : ( item.offset().top - boxWindowY + boxScrollTop );

    if ( boxWindowY > windowScrollTop) {
      item.css({
        position:'static',
      });
      this._cutClone();
    
    } else if ( windowScrollTop > boxViewHeight + boxWindowY - itemHeight ) {
      // set item to bottom box edge
      item.css({
        position:'absolute',
        top: boxViewHeight + boxWindowY - itemHeight
      });
    
    } else {
      this._setClone();
      item.css({
        position:'fixed',
        top: 0
      });
    }
  };


  Plugin.prototype._setClone = function() {
    if ( this._clone ) { return; }
    this._clone = this.$el
      .clone()
      .css({ opacity: 0 })
      .insertAfter( this.$el );
  };


  Plugin.prototype._cutClone = function() {
    if (this._clone) {
      this._clone.remove();
      delete this._clone;
    }
  };


  // What does the scrollSpy plugin do?
  $.fn.scrollSpy = function( options ) {

    if (!this.length) { return this; }

    this.each(function() {
      var $this = $(this);
      new Plugin( $this, options );
    });

    return this;
  };

})( jQuery, window, window.SuperOptions );


