(function( $, Syn ) {
  
  /*
    TODO: more apppropriate test for mouseMode option
    TODO: test for autoScroll option
    TODO: test situation when items are not direct chilren of container
    TODO: several lists on the page
  */

  /*
  *
  * Helpers
  *
  */
  var
  assert           = QUnit.assert,
  createList       = _Utils.createList,
  getBox           = _Utils.getBox,
  getSelectionText = _Utils.getSelectionText,
  clearSelection   = _Utils.clearSelection,

  initOptions = {
    listClass:   ( 'selectable' ),
    focusClass:     ( 'focused' ),
    selectedClass:  ( 'selected' ),
    disabledClass:  ( 'disabled' ),

    filter:        '> *',
    mouseMode:     'select',
    event:         'mousedown',
    handle:        null,
    textSelection: true,

    multi:         true,
    autoScroll:    true,
    preventInputs: true,
    
    focusBlur:     false,
    selectionBlur: false,
    keyboard:      false,
    loop:          false
  };


  /*
  *
  * Config
  *
  */
  QUnit.testStart( function (info) {
    var res  = $.extend( {}, initOptions ),
    advanced = {};

    if (info.module === 'Keyboard') {
      $.extend( advanced, { multi: true, keyboard: true });
    }
    
    switch ( info.name ) {
      case 'Blurable mousedown':
      case 'cancel':
        $.extend( advanced, { focusBlur: true, selectionBlur: true });
        break;
      case 'Toggle mousedown':
        $.extend( advanced, { mouseMode: 'toggle' });
        break;
      case 'Hybrid mouse':
        $.extend( advanced, { event: 'hybrid' });
        break;
      case 'Filter odd mousedown':
      case 'Filter odd up/down':
        $.extend( advanced, { filter: 'li:odd', selectionBlur: true });
        break;
      case 'Handled items mousedown':
        $.extend( advanced, { handle: '.handle', selectionBlur: true });
        break;
      case 'Loop':
        $.extend( advanced, { loop: true });
        break;
      case 'refresh':
        $.extend( advanced, { selectionBlur: true, focusBlur: true });
        break;
      case 'Text selection':
        $.extend( advanced, { textSelection: false });
        break;
    }

    res = $.extend( res, advanced );
    createList( res );
  });

  QUnit.testDone( function () {
    var box = getBox();
    if (box.hasClass('selectable')) {
      box.selectonic('destroy');
    }
  });

  /*
  *
  * Basic suite
  *
  */
  module("Basic");

  test( 'Plugin created', 1, function() {
    ok( getBox().hasClass('selectable'), "Ok, plugin attached" );
  });

  test( 'Test destroy', 1, function() {
    getBox().selectonic('destroy');
    ok( !getBox().hasClass('selectable'), "Destroyed" );
  });


  /*
  *
  * Mouse suite
  *
  */
  module("Mouse");

  test( 'Select mousedown', 4, function() {
    var elem = getBox().find('li:eq(3)'),
    secElem = getBox().find('li:eq(10)');
    
    elem.trigger('mousedown');
    assert.selectedFocus( elem );
    
    secElem.trigger('mousedown');
    assert
      .selectedFocus( secElem )
      .notSelected( elem )
      .notFocused( elem );
  });

  test( 'Multi-select mousedown', 6, function() {
    var
    box       = getBox(),
    elem      = box.find('li:eq(3)'),
    secElem   = box.find('li:eq(5)'),
    e         = $.Event( "mousedown" );
    e.metaKey = true;
    
    elem.trigger('mousedown');
    ok( elem.hasClass('selected'), "Selected" );
    ok( elem.hasClass('focused'), "Focused" );

    secElem.trigger( e );
    assert
      .selected( elem )
      .selectedFocus( secElem );

    elem.trigger('mousedown');
    e = $.Event( "mousedown" );
    e.metaKey = true;
    elem.trigger( e );
    assert
      .notSelected( elem )
      .focused( elem );
  });

  test( 'Range-select mousedown', 6, function() {
    var
    box        = getBox(),
    elem       = box.find('li:eq(3)'),
    midElem    = box.find('li:eq(4)'),
    secElem    = box.find('li:eq(5)'),
    e          = $.Event( "mousedown" );
    e.shiftKey = true;
    
    elem.trigger('mousedown');
    assert.selectedFocus( elem );

    secElem.trigger( e );
    assert
      .selected( elem )
      .selected( midElem )
      .selectedFocus( secElem );

    midElem.trigger('mousedown');
    assert
      .selectedFocus( midElem )
      .selectedCount(1);
  });

  test( 'Blurable mousedown', 3, function() {
    var elem = getBox().find('li:eq(3)');
    
    elem.trigger('mousedown');
    assert.selectedFocus( elem );

    $('body').trigger('mousedown');
    assert.notSelected( elem );
    assert.notFocused( elem );
  });

  test( 'Toggle mousedown', 4, function() {
    var el = _Utils.elems();
    
    el(3).trigger('mousedown');
    el(5).trigger('mousedown');
    assert
      .selected( el(3) )
      .selectedFocus( el(5) );
    
    el(3).trigger('mousedown');
    assert
      .notSelected( el(3) )
      .focused( el(3) );
    // el(5).trigger('mousedown');

    // box.selectonic('option', 'multi', false);
    // el(6).trigger('mousedown');
    // el(6).trigger('mousedown');
    // assert
    //   .notSelected( el(6) )
    //   .focused( el(6) );
  });

  asyncTest( 'Hybrid mouse', 3, function() {
    var
    box        = getBox(),
    elem       = box.find('li:eq(3)'),
    midElem    = box.find('li:eq(4)'),
    secElem    = box.find('li:eq(5)'),
    e          = $.Event( "mousedown" );
    e.shiftKey = true;
    
    elem.trigger('mousedown');
    assert.selectedFocus( elem );

    secElem.trigger( e );
    
    Syn.click( {}, midElem, function () {
      assert
        .selectedFocus( midElem )
        .selectedCount(1);
      start();
    });
    
    // setTimeout(function() {
    //   console.log('is focused?');
    //   ok( !midElem.hasClass('focused'), "Not focused" );
    // }, 500);

    // var pos = midElem.offset();

    // Syn.drag( {
    //   from:     {pageX: pos.x+1, pageY: pos.y+1},
    //   to:       {pageX: pos.x+10, pageY: pos.y+1},
    // }, midElem, function () {
    //   console.log('is selected?');
    //   ok( midElem.hasClass('selected'), "Selected" );
    //   ok( midElem.hasClass('focused'), "Focused" );
    //   selected = box.find('.selected');
    //   equal( selected.length, 1, "1 selected" );
    //   start();
    // });
  });

  test( 'Filter odd mousedown', 4, function() {
    var
    box        = getBox(),
    elem       = box.find('li:eq(3)'),
    midElem    = box.find('li:eq(4)'),
    secElem    = box.find('li:eq(5)'),
    e          = $.Event( "mousedown" );
    e.shiftKey = true;
    
    elem.trigger('mousedown');
    secElem.trigger( e );
    assert
      .selected( elem )
      .selectedFocus( secElem )
      .notSelected( midElem );
    
    midElem.trigger('mousedown');
    assert.selectedCount(0);
  });

  test( 'Handled items mousedown', 2, function() {
    var elem = getBox().find('li:eq(3)');
    
    elem.trigger('mousedown');
    assert.selectedCount(0);

    elem.find('.handle').trigger('mousedown');
    assert.selected( elem );
  });

  test( 'Text selection', 1, function() {
    var 
    box = getBox(),
    elem = box.find('li:eq(3)'),
    secElem = box.find('li:eq(5)');

    clearSelection();

    Syn.click( {}, elem );
    Syn.type('[shift]', box);
    Syn.click( {}, secElem );
    Syn.type('[shift-up]', box);

    ok( getSelectionText() === '', 'There are no text selection.' );
  });



  /*
  *
  * API suite
  *
  */
  module("API");

  test( 'Disable/enable', 4, function() {
    var
    box     = getBox(),
    elem    = box.find('li:eq(3)'),
    secElem = box.find('li:eq(5)'),
    
    isEnabled = box
      .selectonic('select','li:eq(3)')
      .selectonic('disable')
      .selectonic('isEnabled');
    ok( !isEnabled, 'Is diabled!' );
    
    secElem.trigger('mousedown');
    assert
      .selectedFocus( elem )
      .selectedCount( 1 );
    
    isEnabled = box.selectonic('enable').selectonic('isEnabled');
    ok( isEnabled, 'Is enabled!' );
  });

  test( 'blur', 6, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(3)');
    
    box.selectonic('select','li:eq(3)');
    assert
      .selectedFocus( elem )
      .selectedCount( 1 );
    box
      .selectonic( 'option', 'selectionBlur', true )
      .selectonic( 'blur' );
    assert
      .focused( elem )
      .selectedCount( 0 );
    box
      .selectonic('select','li:eq(3)')
      .selectonic( 'option', 'focusBlur', true )
      .selectonic( 'blur' );
    assert
      .notFocused( elem )
      .selectedCount( 0 );
  });

  test( 'getSelected', 4, function() {
    var
    box     = getBox(),
    elem    = box.find('li:eq(3)'),
    secElem = box.find('li:eq(5)'),
    selected;
    
    Syn.click( {}, elem );
    Syn.type('[shift]', box);
    Syn.click( {}, secElem );
    Syn.type('[shift-up]', box);

    assert
      .selectedFocus( secElem )
      .selectedCount( 3 );
    
    selected = box
      .selectonic('option', 'selectionBlur', true)
      .selectonic('getSelected');
    equal( selected.length, 3, "3 selected" );

    $('body').trigger('mousedown');

    selected = box.selectonic('getSelected');
    equal( selected.length, 0, "0 selected" );
  });

  test( 'getSelectedId', 5, function() {
    var
    box     = getBox(),
    elem    = box.find('li:eq(3)'),
    secElem = box.find('li:eq(5)'),
    selected;
    
    Syn.click( {}, elem );
    Syn.type('[shift]', box);
    Syn.click( {}, secElem );
    Syn.type('[shift-up]', box);

    assert
      .selectedFocus( secElem )
      .selectedCount( 3 );
    
    selected = box
      .selectonic('option', 'selectionBlur', true)
      .selectonic('getSelectedId');
    ok( $.isArray(selected), 'Is array' );
    equal( selected.length, 3, "Is 3 selected" );
    equal( selected[0], elem.attr('id'), "Id's match" );
  });

  test( 'getSelectedId', 2, function() {
    var
    box     = getBox(),
    elem    = box.find('li:eq(3)'),
    selected;
    
    Syn.click( {}, elem );
    selected = box
      .selectonic( 'option', 'focusBlur', true )
      .selectonic( 'getFocused' );
    ok( $(selected).is( elem ) , 'Items match' );

    $('body').trigger('mousedown');
    selected = box.selectonic( 'getFocused' );
    ok( selected === null, 'No focus' );
  });

  test( 'select', 2, function() {
    var
    box = getBox(),
    elem = box.find('li:eq(3)');
    
    box.selectonic( 'select', elem );
    assert.selected( elem );
    
    box.selectonic( 'select','li:odd' );
    assert.selectedCount( 10 );
  });

  test( 'refresh', 4, function() {
    var
    box   = getBox(),
    elem  = box.find('li:eq(0)'),
    check = true;
    
    box
      .selectonic( 'select', elem )
      .selectonic( 'option', { unselectAll: function() {check = false;} });
    
    assert.selectedCount( 1 );

    elem.remove();
    box.selectonic('refresh');
    assert.selectedCount( 0 );
    ok( !box.selectonic('getFocused'), 'Focus cleared.' );

    box.selectonic('blur');
    ok( check, 'There was no unselectAll callback!' );
  });

  test( 'cancel', 10, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(0)'),
    sec = box.find('li:eq(5)'),
    focus;
    
    box
      .selectonic( 'select','li:odd' )
      .selectonic( 'option', {
        stop: function() {
          this.selectonic( 'cancel' );
        }
      })
      .selectonic( elem );

    assert.selectedCount( 10 );
    assert.notSelected( elem );

    // Cancel in before callback
    box.selectonic( 'option', 'stop', null );
    Syn.click( {}, elem );
    focus = box.selectonic('getFocused');
    box.selectonic( 'option', {
      before: function() {
        this.selectonic('cancel');
      }
    });
    sec.shiftMousedown();
    assert.selectedCount( 1 );
    assert.selectedFocus( elem );

    // Second cancel in stop callback
    box.selectonic( 'option', 'stop', function() {
      this.selectonic('cancel');
    });
    sec.shiftMousedown();
    assert.selectedCount( 1 );
    assert.selectedFocus( elem );

    // First cancel in select and second in stop
    box.selectonic( 'option', {
      before: null,
      select: function() {
        this.selectonic('cancel');
      }
    });
    sec.shiftMousedown();
    assert.selectedCount( 1 );
    assert.selectedFocus( elem );

    // Only in stop
    box.selectonic( 'option', 'select', null );
    // Try click outside
    Syn.click( {}, $('body') );
    assert.selectedCount( 1 );
    assert.selectedFocus( elem );
  });

  test( 'option', 7, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(1)'),
    sec  = box.find('li:eq(3)'),
    res  = [],
    options;
    
    // Set options
    box
      .selectonic( 'option', {
        before:       function() { res.push( 'before' );       },
        focusLost:    function() { res.push( 'focusLost' );    },
        select:       function() { res.push( 'select' );       },
        unselect:     function() { res.push( 'unselect' );     },
        unselectAll:  function() { res.push( 'unselectAll' );  },
        stop:         function() { res.push( 'stop' );         },
        destroy:      function() { res.push( 'destroy' );      },
        
        filter:        'li:odd',
        mouseMode:     'toggle',
        event:         'hybrid',
        handle:        '.handle',

        multi:         false,
        autoScroll:  false,
        preventInputs: false,
        
        focusBlur:     true,
        selectionBlur: true,
        keyboard:      true,
        loop:          true
      });

    // Check getting options object
    options = box.selectonic( 'option' );
    ok((
      options.filter        === 'li:odd' &&
      options.mouseMode     === 'toggle' &&
      options.event         === 'hybrid' &&
      options.handle        === '.handle' &&
      options.multi         === false &&
      options.autoScroll  === false &&
      options.preventInputs === false &&
      options.focusBlur     === true &&
      options.selectionBlur === true &&
      options.keyboard      === true &&
      options.loop          === true ),
    'Options assigned!');

    // Click
    Syn.click( {}, elem.find('.handle') );
    ok((
      res[0] === 'before' &&
      res[1] === 'select' &&
      res[2] === 'stop'
    ), 'Click on list without any selection.');

    // Click outside list
    res = [];
    Syn.click( {}, $('body') );
    ok((
      res[0] === 'before' &&
      res[1] === 'unselect' &&
      res[2] === 'unselectAll' &&
      res[3] === 'focusLost' &&
      res[4] === 'stop'
    ), 'Click outside list');

    // Click outside sec
    res = [];
    Syn.click( {}, $('body') );
    ok((res[0] === 'before' && res[1] === 'stop'), 'Click outside second');

    // Select item
    Syn.click( {}, elem.find('.handle') );
    res = [];
    // Select another item
    Syn.click( {}, sec.find('.handle') );
    ok((
      res[0] === 'before' &&
      res[1] === 'unselect' &&
      res[2] === 'select' &&
      res[3] === 'stop'
    ), 'Select another item');

    // Disable handle
    box.selectonic('option', 'handle', null);
    // Select item
    Syn.click( {}, elem );
    ok((
      res[0] === 'before' &&
      res[1] === 'unselect' &&
      res[2] === 'select' &&
      res[3] === 'stop'
    ), 'Select item without handle');

    // Destroing plugin
    res = [];
    box.selectonic( 'destroy' );
    ok( res[0] === 'destroy', 'Plugin destroied!' );
  });

  test( 'before arguments', 20, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(1)'),
    sec  = box.find('li:eq(3)');
    
    // Set options
    box.selectonic( 'option', {
      filter:        'li:odd',
      mouseMode:     'toggle',
      event:         'hybrid',
      // handle:        '.handle',

      multi:         true,
      autoScroll:  false,
      preventInputs: false,
      
      focusBlur:     true,
      selectionBlur: true,
      keyboard:      true,
      loop:          true,

      before: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( ui.target, 'ui.target' );
        ok( !ui.focus, 'No focus' );
        ok( !ui.items, 'No items' );
      },
      focusLost: function() { },
      select: function() { },
      unselect: function() { },
      unselectAll: function() { },
      stop: function() { },
      destroy: function() { }
    });
    
    // Click
    Syn.click( {}, elem );

    // Select another item
    box.selectonic( 'option', {
      before: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( ui.target, 'ui.target' );
        ok( ui.focus, 'focus' );
        ok( !ui.items, 'items' );
      }
    });
    Syn.click( {}, sec.find('.handle') );

    // Click outside list
    box.selectonic( 'option', {
      before: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( !ui.target, 'No ui.target' );
        ok( ui.focus, 'focus' );
        ok( !ui.items, 'No items' );
      }
    });
    Syn.click( {}, $('body') );

    // Click outside second time
    box.selectonic( 'option', {
      before: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( !ui.target, 'No ui.target' );
        ok( !ui.focus, 'No focus' );
        ok( !ui.items, 'No items' );
      }
    });
    Syn.click( {}, $('body') );
    box.selectonic( 'option', 'before', null );
  });


  test( 'select arguments', 11, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(1)'),
    sec  = box.find('li:eq(3)');
    
    // Set options
    box.selectonic( 'option', {
      multi:         true,
      focusBlur:     true,
      selectionBlur: true,
      keyboard:      true,

      select: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( ui.target, 'target' );
        ok( !ui.focus, 'focus' );
        ok( ui.items, 'items' );
      }
    });
    
    // Click
    Syn.click( {}, elem );

    // Multi selection
    box.selectonic( 'option', {
      select: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( ui.target, 'target' );
        ok( ui.focus, 'focus' );
        ok( ui.items, 'items' );
        ok( ui.items.length === 2, '2 items' );
      }
    });
    var e = $.Event( "mousedown" );
    e.shiftKey = true;
    sec.trigger( e );

    // Click outside list
    Syn.click( {}, $('body') );
  });


  test( 'unselect arguments', 12, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(1)'),
    sec  = box.find('li:eq(3)');
    
    // Set options
    box.selectonic( 'option', {
      multi:         true,
      focusBlur:     true,
      selectionBlur: true,
      keyboard:      true,

      unselect: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( ui.target, 'target' );
        ok( ui.focus, 'focus' );
        ok( ui.items, 'items' );
        ok( ui.items.length === 2, '2 items' );
      }
    });
    
    // Multi selection
    Syn.click( {}, elem );
    sec.shiftMousedown();
    // Select one
    Syn.click( {}, elem );

    // Click outside list
    sec.shiftMousedown();
    box.selectonic( 'option', {
      unselect: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( !ui.target, 'No target' );
        ok( ui.focus, 'focus' );
        ok( ui.items, 'items' );
        ok( ui.items.length === 3, '3 items' );
      }
    });
    Syn.click( {}, $('body') );
    Syn.click( {}, $('body') );
  });


  test( 'unselectAll arguments', 18, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(1)'),
    sec  = box.find('li:eq(3)');
    
    // Set options
    box.selectonic( 'option', {
      multi:         true,
      focusBlur:     true,
      selectionBlur: true,
      keyboard:      true,

      unselectAll: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( ui.target, 'target' );
        ok( ui.focus, 'focus' );
        ok( ui.items, 'items' );
        ok( ui.items.length === 3, '3 items' );
      }
    });
    // Unselect all items without focuss loss
    Syn.click( {}, elem );
    sec.shiftMousedown();
    elem.shiftMousedown();

    // Click outside list
    sec.shiftMousedown();
    box.selectonic( 'option', {
      unselectAll: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( !ui.target, 'No target' );
        ok( ui.focus, 'focus' );
        ok( ui.items, 'items' );
        ok( ui.items.length === 3, '3 items' );
      }
    });
    Syn.click( {}, $('body') );
    Syn.click( {}, $('body') );

    // Unselect one item without focuss loss
    box.selectonic( 'option', {
      unselectAll: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( ui.target, 'target' );
        ok( ui.focus, 'focus' );
        ok( ui.items, 'items' );
        ok( ui.items.length === 1, '1 items' );
      }
    });
    Syn.click( {}, elem );
    elem.metaMousedown();
  });


  test( 'focusLost arguments', 5, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(1)');
    
    // Set options
    box.selectonic( 'option', {
      filter:        'li:odd',
      mouseMode:     'toggle',
      event:         'hybrid',
      // handle:        '.handle',

      multi:         true,
      autoScroll:  false,
      preventInputs: false,
      
      focusBlur:     true,
      selectionBlur: true,
      keyboard:      true,
      loop:          true,

      focusLost: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( !ui.target, 'No ui.target' );
        ok( ui.focus, 'focus' );
        ok( !ui.items, 'No items' );
      }
    });
    
    // Click
    Syn.click( {}, elem );

    // Click outside list
    Syn.click( {}, $('body') );
    Syn.click( {}, $('body') );
  });


  test( 'stop arguments', 34, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(1)'),
    sec  = box.find('li:eq(3)'),
    third = box.find('li:eq(5)');
    
    // Set options
    box.selectonic( 'option', {
      multi:         true,
      autoScroll:  false,
      preventInputs: false,
      
      focusBlur:     true,
      selectionBlur: true,
      keyboard:      true,
      loop:          true,

      stop: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( ui.target, 'target' );
        ok( ui.focus, 'focus' );
        ok( ui.items, 'items' );
      }
    });
    
    // Click
    Syn.click( {}, elem );

    // Range
    box.selectonic( 'option', 'stop', function( e, ui ) {
      ok( e, 'event' );
      ok( ui, 'ui' );
      ok( ui.target, 'target' );
      ok( ui.focus, 'focus' );
      ok( ui.items, 'items' );
      ok( ui.items.length === 2, '2 items' );
    });
    sec.shiftMousedown();

    // Click unselected item
    box.selectonic( 'option', 'stop', function( e, ui ) {
      ok( e, 'event' );
      ok( ui, 'ui' );
      ok( ui.target, 'target' );
      ok( ui.focus, 'focus' );
      ok( ui.items, 'items' );
      ok( ui.items.length === 4, '4 items' );
    });
    Syn.click( {}, third );

    // Select and call `cancel` method
    box.selectonic( 'option', {
      select: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( ui.target, 'target' );
        ok( ui.focus, 'focus' );
        ok( ui.items, 'items' );
        ok( ui.items.length === 4, '4 items' );
        this.selectonic('cancel');
      },
      stop: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( ui.target, 'target' );
        ok( ui.focus, 'focus' );
        ok( !ui.items, 'items' );
      }
    });
    elem.shiftMousedown();

    // Click outside list
    box.selectonic( 'option', 'stop', function( e, ui ) {
      ok( e, 'event' );
      ok( ui, 'ui' );
      ok( !ui.target, 'No target' );
      ok( !ui.focus, 'No focus' );
      ok( ui.items, 'items' );
      ok( ui.items.length === 1, '1 item' );
    });
    Syn.click( {}, $('body') );
  });


  test( 'API exceptions', 6, function() {
    var box = getBox();
    try {
      box.selectonic( 'option', false );
    } catch (err) {
      ok( err.message.match(/Format.*option.*/), 'Wrong option format' );
    }
    try {
      box.selectonic( 'option', 'mouseMode', 'superlalala' );
    } catch (err) {
      ok( err.message.match(/Option.*values.*/), 'Option only allowed values' );
    }
    try {
      box.selectonic( 'option', 'listClass', 'superlalala' );
    } catch (err) {
      ok( err.message.match(/change.*class.*/), 'Is not allowed change classnames' );
    }
    try {
      box.selectonic( 'option', 'before', 'superlalala' );
    } catch (err) {
      ok( err.message.match(/Option.*function.*/), 'Should be a function' );
    }
    try {
      box.selectonic( 'option', 'autoScroll', '#superlalala' );
    } catch (err) {
      ok( err.message.match(/elements.*selector.*/), 'No elems matches selector for autoScroll' );
    }
    try {
      $('#list').selectonic( 'option', 'autoScroll', '#superlalala' );
    } catch (err) {
      ok( err.message.match(/plugin/), 'Elem has no plugin attached' );
    }
  });




}(jQuery, Syn));
