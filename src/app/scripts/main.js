var demo = demo || {};

// Options
(function($) {
  'use strict';

  // Handler
  function checkboxHandle (e) {
    var target = $(e.target),
      mainList = $('#selectable-list'),
      attr, value;

    switch ( target[0].type ) {
    case 'checkbox':
      attr = target.attr('id');
      value = target.is(':checked');
      break;

    case 'radio':
      attr = target.attr('name');
      value = target.next().html();
      break;
    }

    if ( attr === 'handle' ) {
      value = (value) ? 'li>.list-item-handle' : value;
      mainList.toggleClass( 'handle', value);
      mainList.selectonic( 'option', attr, value );

    } else {
      mainList.selectonic( 'option', attr, value );
    }
  }

  // Attache handlers
  $('.b-options').change( checkboxHandle );
  $('.b-list').on( 'selectstart', function( e ) {
    e.preventDefault();
  });

})(jQuery, window);


// Methods
(function( $ ) {
  'use strict';
  var mainList = $('.b-list .list-wrapper'),
  logContainer = $('.b-event-log .event-log-wrapper');

  $('.b-methods').click( function (e) {
    var target = e.target;

    if ( target.tagName === 'BUTTON' ) {
      e.preventDefault();
      var action = $( target ).attr('data-action'),
      res;

      if ( !action ) { return; }

      switch (action) {
      case 'getSelected':
        res = mainList.selectonic( action );
        break;
      case 'getSelectedId':
        res = mainList.selectonic( action );
        break;
      default:
        mainList.selectonic( action );
        break;
      }

      if ( res ) {
        demo.log( '<div class=\"hr\"><div>', logContainer );

        $.each( res, function(index, val) {
          var value = ( action === 'getSelectedId' ) ? ('#' + val) : $( val ).find('.list-item-title').html();
          demo.log( value, logContainer );
        });
      }
    }
  });

})(jQuery, window);



// LOG
(function($) {
  'use strict';

  var delay     = 3000,
    panel       = $('#sandbox .example-example'),
    log         = $('.b-event-log'),
    togglePanel = panel.find('.b-but-pipka');

  log.click( function (e) {
    e.preventDefault();

    // If panel expanded and collapse button was clicked
    if ( !panel.hasClass('j-minimized') && $(e.target).is(togglePanel) ) {
      panel.addClass('j-minimized');

    } else if ( panel.hasClass('j-minimized') ) {
      panel.removeClass('j-minimized');
    }
  });

  demo.log = function( message, container ) {
    var elem;
    elem = $( '<div>' + message + '</div>' )
        .css( 'display', 'none' )
        .prependTo( container )
        .slideDown( 100 );

    // ставим функцию удаления на таймер
    setTimeout(function() {
      elem.fadeOut( 500, function() {
        elem.remove();
      } );
    }, delay);
  };

})(jQuery, window);



// Scenaries
(function($) {
  'use strict';
  var mainList = $('.b-list .list-wrapper');

  demo.scenarios = {
    chooseEven: function() {
      mainList.selectonic('select',':even');
    },
    chooseThird: function() {
      mainList.selectonic('select','li:eq(3)');
    }
  };

  $('#chooseEven').click( demo.scenarios.chooseEven );
  $('#chooseThird').click( demo.scenarios.chooseThird );

})(jQuery, window);



// Attach plugin
(function($) {
  'use strict';
  var couter = -1,
  number = function() {
    return '<span class=\"log-number\">' + (++couter) + '.</span> ';
  },
  logContainer = $('.b-event-log .event-log-wrapper'),
  mainList = $('#selectable-list').selectonic({
    
    autoScroll: '#scrollable-list',

    create: function() {
      demo.log( 'create', logContainer );
    },
    before:   function( event ) {
      if ( event && event.target.tagName === 'BUTTON' ) {
        this.selectonic('cancel');
      }
      demo.log( number() + 'before<div class=\"hr\"></div>', logContainer );
    },
    focusLost: function() {
      demo.log( number() + 'focusLost', logContainer );
    },
    select: function() {
      demo.log( number() + 'select', logContainer );
    },
    unselect: function() {
      demo.log( number() + 'unselect', logContainer );
    },
    unselectAll: function() {
      demo.log( number() + 'unselectAll', logContainer );
    },
    stop: function() {
      demo.log( number() + 'stop', logContainer );
      couter = -1;
    },
    destroy: function() {
      demo.log( 'destroy', logContainer );
    }
  });

  mainList.selectonic( $('li').first() );

  $([
    'multi',
    'focusBlur',
    'selectionBlur',
    'keyboard',
    'loop',
    'focusOnHover'
  ]).each(function( index, item ) {
    $( '#' + item ).prop( 'checked', mainList.selectonic( 'option', item ) );
  });

  $([
    'mouseMode',
    'keyboardMode'
  ]).each(function( index, item ) {
    var value = mainList.selectonic( 'option', item );
    $('input[name=' + item + '][data-option=' + value + ']').prop( 'checked', true );
  });

})(jQuery, window);



// Examples
(function($) {
  'use strict';
  $('.b-select').mySelect();
  
  var $window = $(window),
  example1    = $('#example1'),
  exampleList = $('#example-list'),
  sandbox     = $('#sandbox'),
  navHeight   = $('#navbar').height();

  exampleList.find('.b-example').scrollSpy({
    box: exampleList.find('.example-body')[0],
    offset: navHeight
  });

  example1.find('.b-example').scrollSpy({
    box: example1.find('.example-body')[0],
    offset: navHeight
  });

  sandbox.find('.b-example')
    .css( 'height', $window.outerHeight() - navHeight )
    .scrollSpy({
      box: sandbox.find('.example-body')[0],
      offset: navHeight,
      clone: function(clone) {
        clone.find( '#scrollable-list' ).attr( 'id', null );
        clone.find( '#selectable-list' ).attr( 'id', null );
      }
    });

})(jQuery, window);



// Navbar Anchors #
(function($) {
  'use strict';
  var navbar = $('#navbar'),
  offset = -navbar.height();
  
  navbar.on('click', 'a', function(event) {
    event.preventDefault();
    var id = $(event.target).attr('href'),
    target = $( id ),
    top = target.offset().top;
    $('body').scrollTop( top + offset );
  });

})(jQuery, window);

