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
      value = (value) ? '.actions-list__handle' : value;
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
  var mainList = $('#selectable-list'),
  logContainer = $('#log-screen');

  $('.b-methods').click( function (e) {
    var target = e.target;

    if ( target.tagName === 'BUTTON' ) {
      e.stopImmediatePropagation();
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
        demo.log( '<div class=\"eventLog__space\"><div>', logContainer );

        $.each( res, function(index, val) {
          var value = ( action === 'getSelectedId' ) ? ('#' + val) : $( val ).find('.actions-list__title').html();
          demo.log( value, logContainer );
        });
      }
    }
  });

})(jQuery, window);



// LOG
(function($) {
  'use strict';

  var delay = 3000;

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
  var mainList = $('#selectable-list');

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
  logContainer = $('#log-screen'),
  mainList = $('#selectable-list').selectonic({
    
    // autoScroll: '#scrollable-list',
    autoScroll: true,

    create: function() {
      demo.log( 'create', logContainer );
    },
    before:   function( event ) {
      if ( event && event.target.tagName === 'BUTTON' ) {
        this.selectonic('cancel');
      }
      demo.log( number() + 'before<div class=\"eventLog__space\"></div>', logContainer );
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
  var selectInput = $('.b-select');
  selectInput.mySelect();
  selectInput.mySelect('disable');
  
  var $window     = $(window),
  example         = {},
  enabled         = {},
  navHeight       = $('#navbar').height(),
  active          = null,
  isSelectStopped = false;

  example.select  = $('#example1');
  example.list    = $('#example-list');
  example.sandbox = $('#sandbox');
  
  $.each( example, function(key) {
    enabled[key] = true;
  });

  function disable ( elem ) {
    elem.addClass('disabled');
    if ( elem === example.select ) {
      selectInput.mySelect('disable');
    } else {
      elem
        .find('.b-example:not(.scrollSpy-clone) .j-selectable')
        .selectonic('disable');
    }
  }

  function enable ( elem ) {
    if ( active === elem ) { return; }
    elem.removeClass('disabled');
    if ( elem === example.select ) {
      selectInput.mySelect('enable');
    } else {
      elem
        .find('.b-example:not(.scrollSpy-clone) .j-selectable')
        .selectonic('enable');
    }
    
    active = elem;
    $.each( example, function(key, val) {
      if ( val !== active && enabled[key] ) {
        disable( val );
      }
    });
  }

  example.list.find('.b-example').scrollSpy({
    box: example.list.find('.example-body')[0],
    offset: navHeight
  });

  example.select.find('.b-example').scrollSpy({
    box: example.select.find('.example-body')[0],
    offset: navHeight,
    stop: function() {
      isSelectStopped = true;
      enable( example.sandbox );
    },
    move: function() {
      isSelectStopped = false;
    },
    visible: function(params) {
      if ( isSelectStopped ) { return; }
      // console.log('visible');
      if ( params.window.scrollTop + params.window.height >= params.box.top + params.item.topInBox + params.item.height ) {
        enable( example.select );
      } else if ( params.window.scrollTop + params.window.height < params.box.top + params.item.topInBox + params.item.height ) {
        enable( example.list );
      }
    },
    clone: function( clone, elem ) {
      console.log('clone');
      elem.css({
        zIndex: '15'
      });
    }
  });

  example.sandbox.find('.b-example')
    .css( 'height', $window.outerHeight() - navHeight )
    .scrollSpy({
      box: example.sandbox.find('.example-body')[0],
      offset: navHeight,
      clone: function( clone ) {
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

