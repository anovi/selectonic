var demo = demo || {};


/*
*
* Wellcome hole
*
*/
(function($,window) {
  'use strict';

  function setMargin ( height ) {
    wrapper.css( 'margin-top', height );
  }

  var wellcome = $('#wellcome'),
  height = wellcome.height(),
  wrapper = $('.l-wrapper'),
  $window = $(window),
  timeout;

  setMargin( height );

  $window.on('resize', function() {
    if ( timeout ) {
      clearTimeout( timeout );
      timeout = null;
    }
    timeout = setTimeout(function() {
      height = wellcome.height();
      setMargin( height );
    }, 100);
  });
})(jQuery, window);



/*
*
* Sandbox optioins
*
*/
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



/*
*
* Sandbox Methods buttons
*
*/
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



/*
*
* Events log
*
*/
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



/*
*
* Scenarios
*
*/
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



/*
*
* Attach plugin
*
*/
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



/*
*
* Examples
*
*/
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

  // List with actions
  example.list.find('.b-example').scrollSpy({
    box: example.list.find('.example-body')[0],
    offset: navHeight,
    visible: function( params ) {
      if (
        example.select.fromItemBottomOffset === void 0 ||
        params.window.scrollTop + params.window.height < example.select.fromItemBottomOffset
      ) {
        enable( example.list );
      }
    }
  });

  // Select input example
  example.select.find('.b-example').scrollSpy({
    box: example.select.find('.example-body')[0],
    offset: navHeight,
    visible: function(params) {
      if ( isSelectStopped ) { return; }
      example.select.fromItemBottomOffset = params.box.top + params.item.topInBox + params.item.height;
      example.select.fromBoxBottomOffset  = params.box.top + params.box.height;
      example.select.itemHeight           = params.item.height;
      
      if (
        params.window.scrollTop + params.window.height >= example.select.fromItemBottomOffset &&
        example.select.fromBoxBottomOffset - params.window.scrollTop > params.item.height + navHeight
      ) {
        enable( example.select );
      }
    },
    clone: function( clone, elem ) {
      elem.css({
        zIndex: '15'
      });
    }
  });

  // Sandbox example
  example.sandbox.find('.b-example')
    .css( 'height', $window.outerHeight() - navHeight )
    .scrollSpy({
      box: example.sandbox.find('.example-body')[0],
      offset: navHeight,
      visible: function( params ) {
        if (
          example.select.fromBoxBottomOffset === void 0 ||
          example.select.itemHeight === void 0 ||
          example.select.fromBoxBottomOffset - params.window.scrollTop < example.select.itemHeight + navHeight
        ) {
          enable( example.sandbox );
        }
      },
      clone: function( clone ) {
        clone.find( '#selectable-list' ).attr( 'id', null );
      }
    });

})(jQuery, window);



/*
*
* Navbar Anchors #
*
*/
(function($,window) {
  'use strict';
  var navbar = $('#navbar'),
  $window = $(window),
  offset = -navbar.height();
  
  navbar.on('click', 'a', function(event) {
    event.preventDefault();
    var id = $(event.target).attr('href'),
    target = $( id ),
    top = target.offset().top;
    $window.scrollTop( top + offset );
  });

})(jQuery, window);

