var demo = demo || {};

// Options
(function($) {
  'use strict';

  // var handler = $('.')
  demo.options = {
    event:         ['mousedown','click'],
    multi:         'boolean',
    mouseMode:     ['select','toggle'],
    focusBlur:     'boolean',
    selectionBlur: 'boolean',
    keyboard:      'boolean',
    keyboardMode:   ['select','toggle'],
    loop:          'boolean'
    // autoScroll:     true, /* String | false | true */
  };
  // filter:         '> *',
  // multi:          true,
  // // Mouse
  // mouseMode:      ['select','toggle'],
  // event:          ['mousedown','click','hybrid'],
  // focusBlur:      false,
  // selectionBlur:  false,
  // handle:         null, /* String | null */
  // textSelection:  false,
  // // Keyboard
  // keyboard:       false,
  // keyboardMode:   ['select','toggle'],
  // autoScroll:     true, /* String | false | true */
  // loop:           false,
  // preventInputs:  true,
  // // Classes
  // listClass:      'j-selectable',
  // focusClass:     'j-focused',
  // selectedClass:  'j-selected',
  // disabledClass:  'j-disabled',
  // // Callbacks
  // create:         null,
  // before:         null,
  // focusLost:      null,
  // select:         null,
  // unselect:       null,
  // unselectAll:    null,
  // stop:           null,
  // destroy:        null

  // Handler
  function checkboxHandle (e) {
    var target = $(e.target),
      mainList = $('.b-list .list-wrapper'),
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
    e.preventDefault();
    var target = e.target;

    if ( target.tagName === 'BUTTON' ) {
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

  var delay = 3000,
    panel = $('.l-plugin'),
    log = $('.b-event-log'),
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
      mainList.selectonic(':even');
    },
    chooseThird: function() {
      mainList.selectonic('li:eq(3)');
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
  mainList = $('.b-list .list-wrapper').selectonic({
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
    'keyboardInput',
    'loop'
  ]).each(function( index, item ) {
    $( '#' + item ).prop( 'checked', mainList.selectonic( 'option', item ) );
  });

  $([
    'mouseMode',
    'event',
    'keyboardMode'
  ]).each(function( index, item ) {
    var value = mainList.selectonic( 'option', item );
    $('input[name=' + item + '][data-option=' + value + ']').prop( 'checked', true );
  });

})(jQuery, window);