(function( $, Benchmark, _selectonic ) {


  /*
  *
  * Replace plugin methods for benchmarking
  *
  */
  var bindEventsA = function() {
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
    this._mousemoveEvent = function(e) {
      if( _this._isEnable && _this.options.hoverFocus ) { _this._mousemoveHandler.call(_this, e); }
    };

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

  var prepareA = function() {
    _selectonic.prototype._bindEvents = bindEventsA;
    $mainList.selectonic( options );
  };


  /*
  *
  * Replace plugin methods for benchmarking
  *
  */
  var bindEventsB = function() {
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
    this._mousemoveEvent = function(e) {
      if( _this._isEnable && _this.options.hoverFocus ) { _this._mousemoveHandler.call(_this, e); }
    };

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
    this.$el.on(
      'mousemove' + '.' + this._name,
      this._mousemoveEvent
    );
  };
  
  var mousemoveHandlerB = function( e ) {
    var params = {}, target;

    target = this._getTarget( e );
    if (target) {
      // this._checkMouseOut( e );
      delete this._solidInitialElem;
      if ( target !== this.ui.focus ) {
        params.target = target;
        this._controller( e, params );
        this._mouseOut();
      }
    } else {
      this._controller( e, params );
    }
  };

  var checkMouseOutB = function( e ) {
    var _this = this, x = e.pageX, y = e.pageY;
    this._isListHovered = true;
    
    if ( this._focusHoverTimeout ) {
      clearTimeout( this._focusHoverTimeout );
      delete this._focusHoverTimeout;
    }

    this._focusHoverTimeout = setTimeout( function() {
      if ( x !== _selectonic.lastMousePos.x || y !== _selectonic.lastMousePos.y ) { _this._mouseOut(); }
    }, 0);
  };

  var mouseOutB = function() {
    delete this._isListHovered;
    delete this._focusHoverTimeout;
    this._controller( null, {} );
  };

  var scrollB = function() {
    if (this.ui.focus) {
      if ( this._scrolledElem ) { this._refreshBoxScroll( this._scrolledElem ); }
      this._refreshBoxScroll( window );
    }
  };

  var prepareB = function() {
    _selectonic.lastMousePos = { x:0, y:0 };
    $document.on(
      'mousemove.selectonic',
      function(e) {
        _selectonic.lastMousePos.x = e.pageX;
        _selectonic.lastMousePos.y = e.pageY;
      }
    );
    _selectonic.prototype._bindEvents = bindEventsB;
    _selectonic.prototype._mousemoveHandler = mousemoveHandlerB;
    _selectonic.prototype._checkMouseOut = checkMouseOutB;
    _selectonic.prototype._mouseOut = mouseOutB;
    _selectonic.prototype.scroll = scrollB;
    $mainList.selectonic( options );
  };



  /*
  *
  * Prepare DOM
  *
  */
  (function() {
    var box, str = '', res;
    for (var a = 0; a < 20; a++) { 
      str += a === 19 ? '<div id="deepDiv">' : '<div>';
    }
    str +='<ul id=\"sublist\"></ul>';
    for (a = 0; a < 20; a++) { str += '</div>'; }
    res = $( str );

    box = res.find( '#sublist' );
    for (var i = 0; i < 20; i++) {
      str = '<li id=\"elem' + i + '\">';
      for (var c = 0; c < 20; c++) { str += '<span>'; }

      str += '<span class=\"handle\"><input type=\"checkbox\"></span>' +
          '<span class=\"text\">Item ' + i + '</span>';
      
      for (var x = 0; x < 20; x++) { str += '</span>'; }
      str += '</li>';
      box.append( str );
    }
    $('#list').append( res );
  })();



  /*
  *
  * Define helpers
  *
  */
  var
  $mainList = $("#list #sublist"),
  $elem     = $('li:eq(0) .text'),
  $deepDiv  = $('#deepDiv'),
  deepDiv   = $deepDiv[0],
  elem      = $elem[0],
  elemX     = $elem.offset().left + 1,
  elemY     = $elem.offset().top + 1,
  $body     = $('body'),
  body      = $body[0],
  $document = $( window.document ),
  done      = function() {},
  options   = {
    mouseMode:      'select',
    event:          'mousedown',
    hoverFocus:     true, /* testing */
    autoScroll:     null,
    multi:          false,
    focusBlur:      true,
    selectionBlur:  false,
    keyboard:       false,
    focusLost:      function() {
      done();
      // console.log('focusLost')
    }
  },
  
  // Helpers
  moveOnElem = function( target, catcher ) {
    var e = $.Event( "mousemove" );
    e.pageX = elemX;
    e.pageY = elemY;
    e.target = target;
    catcher.trigger( e );
  },

  moveOnBody = function( target, catcher ) {
    var e = $.Event( "mousemove" );
    e.pageX = 2;
    e.pageY = 2;
    e.target = target;
    catcher.trigger( e );
  };

  // prepareA();
  // moveOnElem( elem, $document );
  // moveOnBody( body, $document );

  // prepareB();
  // moveOnElem( elem, $elem );
  // moveOnBody( body, $document );



  /*
  *
  * Define test suite
  *
  */
  var suite = new Benchmark.Suite();

  suite
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  });



  /*
  *
  * Test with global per instance mousemove handler
  *
  */
  suite.add('GlobalPerInstanceMousemove#test', {
    'defer': true,
    'fn': function( deferred ) {
      done = function() { deferred.resolve(); };
      moveOnElem( elem, $document );
      moveOnBody( deepDiv, $document );
    },
    onStart: function() {
      console.log('Starting - ' + this.name );
      prepareA();
    },
    onComplete: function() {
      $mainList.selectonic( 'destroy' );
    }
  });



  /*
  *
  * Test with list's element per instance mousemove handler
  * and one global mousemove handler
  *
  */
  suite.add('LocalPerInstanceMousemove#test', {
    'defer': true,
    'fn': function( deferred ) {
      done = function() { deferred.resolve(); };
      moveOnElem( elem, $mainList );
      moveOnBody( deepDiv, $document );
    },
    onStart: function() {
      console.log('Starting - ' + this.name );
      prepareB();
    },
    onComplete: function() {
      $mainList.selectonic( 'destroy' );
    }
  });



  // run
  // suite.run({ 'async': true });
  suite.run();




})( jQuery, Benchmark, _selectonic );