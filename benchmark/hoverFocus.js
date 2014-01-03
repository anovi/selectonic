(function( $, Benchmark, _selectonic ) {


  /*
  *
  * Replace plugin methods for benchmarking
  *
  */
  var bindEventsA = function() {
    var _this = this;
    // Handler for mousemove
    this._mousemoveEvent = function(e) {
      if( _this._isEnable && _this.options.hoverFocus ) { _this._mousemoveHandler.call(_this, e); }
    };
    $document.on(
      'mousemove_selectonic',
      this._mousemoveEvent
    );
  };

  var unbindEventsA = function() {
    $document.off(
      'mousemove_selectonic',
      this._mousemoveEvent
    );
  };

  var prepareA = function() {
    _selectonic.prototype._bindEvents = bindEventsA;
    _selectonic.prototype._unbindEvents = unbindEventsA;
    $mainList.selectonic( options );
  };


  /*
  *
  * Replace plugin methods for benchmarking
  *
  */
  var bindEventsB = function() {
    var _this = this;
    // Handler for mousemove
    this._mousemoveEvent = function(e) {
      if( _this._isEnable && _this.options.hoverFocus ) { _this._mousemoveHandler.call(_this, e); }
    };

    this.$el.on(
      'mousemove_selectonic',
      this._mousemoveEvent
    );
  };

  var unbindEventsB = function() {
    this.$el.on(
      'mousemove_selectonic',
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
      }
      this._mouseOut();
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
      'mousemove_selectonic',
      function(e) {
        _selectonic.lastMousePos.x = e.pageX;
        _selectonic.lastMousePos.y = e.pageY;
      }
    );
    _selectonic.prototype._bindEvents = bindEventsB;
    _selectonic.prototype._unbindEventsB = unbindEventsB;
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
  var beforeCalled,
  $results = $("#results"),
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
    before:         function() {
      beforeCalled += 1;
    },
    focusLost:      function() {
      done();
      // console.log('focusLost')
    }
  },
  
  // Helpers
  moveOnElem = function( target, catcher ) {
    var e = $.Event( 'mousemove_selectonic' );
    e.pageX = elemX;
    e.pageY = elemY;
    e.target = target;
    catcher.trigger( e );
  },

  moveOnBody = function( target, catcher ) {
    var e = $.Event( 'mousemove_selectonic' );
    e.pageX = 2;
    e.pageY = 2;
    e.target = target;
    catcher.trigger( e );
  },

  say = function( text ) {
    var row = $('<div>');
    row.html( text );
    $results.append( row );
  },

  watch = function( benchmark) {
    var box = $('<div id=' + benchmark.id + '>'), cycles;

    box.html( '<h2>' + benchmark.name + '</h2>' );
    box.append('<div class=\"cycles\"></div>');
    cycles = box.find('.cycles');
    $results.append( box );

    benchmark.on( 'start', function( ) {
      box.append( '<div>Starting...</div>' );
    });

    benchmark.on( 'complete', function( event ) {
      box.append( String(event.target) );
      box.append( '<div>Complete!</div>' );
    });
    
    benchmark.on( 'cycle', function() {
      // cycles.html( 'Cycles ran: ' +  this.cycle );
    });

    benchmark.setFastest = function() {
      box.find('h2').append('<span class=fastest>Fastest</span>');
    };
  };

  // prepareA();
  // beforeCalled = 0;
  // moveOnElem( elem, $document );
  // moveOnBody( deepDiv, $document );
  // console.log( beforeCalled );

  // prepareB();
  // beforeCalled = 0;
  // moveOnElem( elem, $mainList );
  // moveOnBody( deepDiv, $document );
  // console.log( beforeCalled );
  
  console.log( Benchmark.platform );


  /*
  *
  * Define test suite
  *
  */
  var suite = new Benchmark.Suite();

  suite
  .on('complete', function() {
    this.filter('fastest').forEach( function( testCase ) {
      testCase.setFastest();
    });
  });



  /*
  *
  * Test with global per instance mousemove handler
  *
  */
 suite.add('Document Mousemove per ins.', {
    'defer': true,
    'fn': function( deferred ) {
      done = function() { deferred.resolve(); };
      moveOnElem( elem, $document );
      moveOnBody( deepDiv, $document );
    },
    onStart: function() {
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
  suite.add('List Mousemove per ins.', {
    'defer': true,
    'fn': function( deferred ) {
      done = function() { deferred.resolve(); };
      moveOnElem( elem, $mainList );
      // moveOnBody( deepDiv, $document );
    },
    onStart: function() {
      prepareB();
    },
    onComplete: function() {
      $mainList.selectonic( 'destroy' );
    }
  });


  suite.forEach( function( testCase ) {
    watch( testCase );
  });
  // run
  suite.run({ 'async': true });
  // suite.run();




})( jQuery, Benchmark, _selectonic );