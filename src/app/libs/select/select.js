(function( $, window ) {
  'use strict';

  var keyCode = { UP:38, DOWN:40, ESCAPE:27, ENTER:13, SPACE:32 },

  Select = function( elem ) {
    this.$el     = $( elem );
    this.button  = this.$el.find('.select-trigger');
    this.title   = this.button.find('.select-title');
    this.list    = this.$el.find('.select-group');
    this.isOpend = false;
    this.isEnabled = true;
    this.init();
  };


  Select.prototype.init = function() {
    var _this = this;
    
    this.button.on('blur', function( e ) {
      if ( !_this.isEnabled ) { return; }
      _this.close.call( _this, e );
    })
    .on('mouseup', function(e) {
      e.stopPropagation();
    });

    this.$el
      .on('keydown', function( e ) {
        if ( !_this.isEnabled ) { return; }
        _this.keyHandler.call( _this, e );
      })
      .on('mousedown', function(e) {
        if ( !_this.isEnabled ) { return; }
        var isOnButton = _this.button[0] === e.target ||
          _this.title[0] === e.target;
        
        if ( isOnButton ) {
          if (!_this.isOpend) {
            e.stopPropagation();
            _this.open.call( _this );
          } else {
            _this.close.call( _this );
          }
          return;
        }
        e.preventDefault();
      });


    // attach selectionc with options
    this.list.selectonic({
      multi: false,
      keyboard: true,
      keyboardMode: 'toggle',
      mouseMode: 'mouseup',
      focusOnHover: true,
      selectionBlur: false,
      focusBlur: true,
      
      // After plugin's initialisation
      create: function() {
        // we don't want to list reaction on keyboard in closed state
        this.selectonic('disable');
      },
      // When item of list has been selected
      select: function( e, ui ) {
        e.preventDefault();
        _this.selected = ui.target;
        _this.setValue( ui.items.html() );
        _this.close();
      },
      // After each works cycle
      stop: function( e, ui ) {
        e.preventDefault();
        if ( (e.which === keyCode.ENTER && _this.isOpend) || !ui.target ) {
          _this.close();
        }
      }
    });
  };


  Select.prototype.keyHandler = function( e ) {
    var key = e.which;
    if ( !this.isOpend &&
      (key === keyCode.UP || key === keyCode.DOWN || key === keyCode.SPACE )
    ) {
      e.stopPropagation();
      e.preventDefault();
      this.open();
    }
    if ( this.isOpend && key === keyCode.ESCAPE ) {
      this.close();
      e.stopPropagation();
    }
  };


  Select.prototype.open = function() {
    this.$el.addClass('opend');
    // Enable selectonic on the list
    this.list.selectonic('enable');

    if ( this.selected ) {
      this.list
        // Set focus on selected element
        .selectonic('focus', this.selected)
        // and scroll to it
        .selectonic('scroll');
    }
    this.isOpend = true;
  };


  Select.prototype.close = function() {
    this.$el.removeClass('opend');
    // Disable plugin on the list
    this.list.selectonic('disable');
    this.isOpend = false;
  };


  Select.prototype.setValue = function( val ) {
    this.title.html( val );
  };


  Select.prototype.disable = function() {
    if ( this.isOpend ) { this.close(); }
    this.list.selectonic('disable');
    this.isEnabled = false;
    this.$el.addClass('disabled');
  };

  
  Select.prototype.enable = function() {
    if ( this.isOpend ) { this.list.selectonic('enable'); }
    this.isEnabled = true;
    this.$el.removeClass('disabled');
  };


  $.fn.mySelect = function( options ) {
    if (!this.length) { return this; }
    var obj;
    if ( options && typeof options === 'string' ) {
      obj = this.data('plugin_select');
      obj[options].call( obj );
    } else {
      this.each(function() {
        var $this = $(this);
        obj = new Select(this);
        $this.data('plugin_select', obj);
      });
    }
    return $(this);
  };

})( jQuery, window );
