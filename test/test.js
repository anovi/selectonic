(function( $ ) {

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
  elems            = _Utils.elems,
  selectable,

  initOptions = {
    listClass:      ( 'selectable' ),
    focusClass:     ( 'focused' ),
    selectedClass:  ( 'selected' ),
    disabledClass:  ( 'disabled' ),

    filter:        '> *',
    mouseMode:     'standard',
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
      case 'Toggle mouseMode':
        $.extend( advanced, { mouseMode: 'toggle' });
        break;
      case 'Mouseup mouseMode':
        $.extend( advanced, { mouseMode: 'mouseup' });
        break;
      case 'Blurable mouseup':
        $.extend( advanced, { mouseMode: 'mouseup', focusBlur:true });
        break;
      case 'Filter odd mousedown':
      case 'Filter odd up/down':
        $.extend( advanced, { filter: 'li:nth-child(odd)', selectionBlur: true });
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
    selectable = createList( res );
  });

  QUnit.testDone( function () {
    var box = getBox();
    if (box.hasClass('selectable')) {
      selectable.destroy();
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
    selectable.destroy();
    ok( !getBox().hasClass('selectable'), "Destroyed" );
  });


  /*
  *
  * Mouse suite
  *
  */
  module("Mouse");

  test( 'Select click', 4, function() {
    var elem = getBox().find('li:eq(3)'),
    secElem = getBox().find('li:eq(10)');

    elem.triggerClick();
    assert.selectedFocus( elem );

    secElem.triggerClick();
    secElem.triggerClick();
    assert
      .selectedFocus( secElem )
      .notSelected( elem )
      .notFocused( elem );
  });

  test( 'Multi-select mousedown', 6, function() {
    var
    box       = getBox(),
    elem      = box.find('li:eq(3)'),
    secElem   = box.find('li:eq(5)');

    elem.triggerClick();
    ok( elem.hasClass('selected'), "Selected" );
    ok( elem.hasClass('focused'), "Focused" );

    secElem.metaMousedown();
    assert
      .selected( elem )
      .selectedFocus( secElem );

    elem.triggerClick();
    elem.metaMousedown();
    assert
      .notSelected( elem )
      .focused( elem );
  });

  test( 'Range-select mousedown', 6, function() {
    var
    box        = getBox(),
    elem       = box.find('li:eq(3)'),
    midElem    = box.find('li:eq(4)'),
    secElem    = box.find('li:eq(5)');

    elem.triggerClick();
    assert.selectedFocus( elem );

    secElem.shiftMousedown();
    assert
      .selected( elem )
      .selected( midElem )
      .selectedFocus( secElem );

    midElem.triggerClick();
    assert
      .selectedFocus( midElem )
      .selectedCount(1);
  });

  test( 'Blurable mousedown', 3, function() {
    var elem = getBox().find('li:eq(3)');

    elem.triggerClick();
    assert.selectedFocus( elem );

    $('body').triggerClick();
    assert.notSelected( elem );
    assert.notFocused( elem );
  });

  test( 'Standard mouseMode', 2, function() {
    var el = elems();

    el(3).triggerClick();
    el(5).shiftMousedown();
    el(4).triggerMousedown();
    assert.selectedFocus( el(5) );
    assert.selectedCount(3);
  });

  test( 'Mouseup mouseMode', 6, function() {
    var el = elems();
    el(3).triggerMouseup();
    el(5).triggerMousedown();
    assert.selectedFocus( el(3) );

    el(5).triggerMouseup('shift');
    assert
      .selectedFocus( el(5) )
      .selectedCount(3);

    el(4).triggerMousedown();
    assert.selectedCount(3);

    el(4).triggerMouseup();
    assert
      .selectedFocus( el(4) )
      .selectedCount(1);
  });

  test( 'Blurable mouseup', 3, function() {
    var el = elems();
    el(3).triggerMouseup();
    assert.selectedFocus( el(3) );

    $('body').triggerMousedown();
    assert
      .selected( el(3) )
      .notFocused( el(3) );
  });

  test( 'Toggle mouseMode', 4, function() {
    var el = _Utils.elems();

    el(3).triggerClick();
    el(5).triggerClick();
    assert
      .selected( el(3) )
      .selectedFocus( el(5) );

    el(3).triggerClick();
    assert
      .notSelected( el(3) )
      .focused( el(3) );
  });

  test( 'Filter odd mousedown', 4, function() {
    var
    box        = getBox(),
    elem       = box.find('li:eq(2)'),
    midElem    = box.find('li:eq(3)'),
    secElem    = box.find('li:eq(4)');

    elem.triggerClick();
    secElem.shiftMousedown();
    assert
      .selected( elem )
      .selectedFocus( secElem )
      .notSelected( midElem );

    midElem.triggerClick();
    assert.selectedCount(0);
  });

  test( 'Handled items mousedown', 2, function() {
    var elem = getBox().find('li:eq(3)');

    elem.triggerClick();
    assert.selectedCount(0);

    elem.find('.handle').triggerClick();
    assert.selected( elem );
  });

  test( 'Text selection', 1, function() {
    var
    box = getBox(),
    elem = box.find('li:eq(3)'),
    secElem = box.find('li:eq(5)');

    clearSelection();

    elem.triggerClick();
    secElem.shiftMousedown();
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
    secElem = box.find('li:eq(5)');

    selectable.select('li:nth-child(4)');
    selectable.disable();
    var isEnabled = selectable.isEnabled();
    ok( !isEnabled, 'Is diabled!' );

    secElem.triggerClick();
    assert
      .selected( elem )
      .selectedCount( 1 );

    selectable.enable();
    isEnabled = selectable.isEnabled();
    ok( isEnabled, 'Is enabled!' );
  });

  test( 'blur', 6, function() {
    var
    box = getBox(),
    el  = elems();

    // box.selectonic('select', el(3));
    el(3).triggerClick();

    assert
      .selectedFocus( el(3) )
      .selectedCount( 1 );

    selectable.option('selectionBlur', true );
    selectable.blur();

    assert
      .focused( el(3) )
      .selectedCount( 0 );

    el(3).triggerClick();
    // .selectonic('select', el(3))
    selectable.option('focusBlur', true);
    selectable.blur();

    assert
      .notFocused( el(3) )
      .selectedCount( 0 );
  });

  test( 'getSelected', 4, function() {
    var
    box     = getBox(),
    elem    = box.find('li:eq(3)'),
    secElem = box.find('li:eq(5)'),
    selected;

    elem.triggerClick();
    secElem.shiftMousedown();

    assert
      .selectedFocus( secElem )
      .selectedCount( 3 );

    selectable.option('selectionBlur', true);
    selected = selectable.getSelected();
    assert.selectedCount( 3 );

    $('body').triggerClick();

    selected = selectable.getSelected();
    assert.selectedCount( 0 );
  });

  test( 'getSelectedId', 5, function() {
    var
    box     = getBox(),
    elem    = box.find('li:eq(3)'),
    secElem = box.find('li:eq(5)'),
    selected;

    elem.triggerClick();
    secElem.shiftMousedown();

    assert
      .selectedFocus( secElem )
      .selectedCount( 3 );
    // debugger;
    selectable.option('selectionBlur', true);
    selected = selectable.getSelectedId();
    ok( $.isArray(selected), 'Is array' );
    equal( selected.length, 3, "Is 3 selected" );
    equal( selected[0], elem.attr('id'), "Id's match" );
  });

  test( 'getSelectedId', 2, function() {
    var
    box     = getBox(),
    elem    = box.find('li:eq(3)'),
    selected;

    elem.triggerClick();
    selectable.option('focusBlur', true);
    selected = selectable.focus();
    ok( $(selected).is( elem ) , 'Items match' );

    $('body').triggerClick();
    selected = selectable.focus();
    ok( selected === null, 'No focus' );
  });

  test( 'select', 4, function() {
    var
    box = getBox(),
    el = elems();

    selectable.select( el(3)[0] );
    assert.selected( el(3) );

    selectable.select( el(4)[0] );
    assert.selected( el(4) );
    assert.selectedCount(2);

    selectable.select('li:nth-child(odd)' );
    assert.selectedCount( 11 );
  });

  test( 'unselect method', 9, function() {
    var
    box = getBox(),
    el = elems(),
    res = [];

    // Foir testing of triggering callbacks for the method
    selectable.option({
      before:       function() { res.push( 'before' );       },
      focusLost:    function() { res.push( 'focusLost' );    },
      select:       function() { res.push( 'select' );       },
      unselect:     function() { res.push( 'unselect' );     },
      unselectAll:  function() { res.push( 'unselectAll' );  },
      stop:         function() { res.push( 'stop' );         },
      destroy:      function() { res.push( 'destroy' );      }
    });

    // Select one item
    selectable.select( el(3)[0] );
    ok((
      res[0] === 'before' &&
      res[1] === 'select' &&
      res[2] === 'stop'
    ), 'Callbacks right!');

    // Select more
    selectable.select( el(4)[0] );
    selectable.select( el(5)[0] );
    selectable.select( el(6)[0] );
    assert.selectedCount(4);

    // Set focus
    ok( selectable.focus() === null, 'Focus is null' );
    selectable.focus( el(3)[0] );

    // Unselect one item
    res = [];
    selectable.unselect( el(4)[0] );
    ok((
      res[0] === 'before' &&
      res[1] === 'unselect' &&
      res[2] === 'stop'
    ), 'Callbacks right!');

    assert.notSelected( el(4) );
    assert.selectedCount(3);

    // Unselect all tems
    res = [];
    selectable.unselect();
    ok((
      res[0] === 'before' &&
      res[1] === 'unselect' &&
      res[2] === 'unselectAll' &&
      res[3] === 'stop'
    ), 'Callbacks right!');

    assert.selectedCount(0);
    // Sure that focus has not been changed
    ok( el(3).is(selectable.focus()), 'Focus is elem 3' );
  });

  test( 'refresh', 4, function() {
    var
    box   = getBox(),
    elem  = box.find('li:eq(0)'),
    check = true;

    selectable.select( elem[0] )
    selectable.option( { unselectAll: function() {check = false;} });

    assert.selectedCount( 1 );

    elem.remove();
    selectable.refresh();
    assert.selectedCount( 0 );
    ok( !selectable.focus(), 'Focus cleared.' );

    selectable.blur();
    ok( check, 'There was no unselectAll callback!' );
  });

  test( 'cancel', 10, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(1)'),
    sec = box.find('li:eq(5)'),
    focus;

    selectable.select('li:nth-child(odd)');
    selectable.option({
      stop: function() {
        selectable.cancel();
      }
    });
    selectable.select(elem[0]);

    assert.selectedCount( 10 );
    assert.notSelected( elem );

    // Cancel in before callback
    selectable.option( 'stop', null );
    elem.triggerClick();
    focus = selectable.focus();
    selectable.option({
      before: function() {
        selectable.cancel();
      }
    });
    sec.shiftMousedown();
    assert.selectedCount( 1 );
    assert.selectedFocus( elem );

    // Second cancel in stop callback
    selectable.option( 'stop', function() {
      selectable.cancel();
    });
    sec.shiftMousedown();
    assert.selectedCount( 1 );
    assert.selectedFocus( elem );

    // First cancel in select and second in stop
    selectable.option({
      before: null,
      select: function() {
        selectable.cancel();
      }
    });
    sec.shiftMousedown();
    assert.selectedCount( 1 );
    assert.selectedFocus( elem );

    // Only in stop
    selectable.option( 'select', null );
    // Try click outside
    $('body').triggerClick();
    assert.selectedCount( 1 );
    assert.selectedFocus( elem );
  });

  test( 'option', 7, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(0)'),
    sec  = box.find('li:eq(2)'),
    res  = [],
    options;

    // Set options
    selectable.option({
      before:       function() { res.push( 'before' );       },
      focusLost:    function() { res.push( 'focusLost' );    },
      select:       function() { res.push( 'select' );       },
      unselect:     function() { res.push( 'unselect' );     },
      unselectAll:  function() { res.push( 'unselectAll' );  },
      stop:         function() { res.push( 'stop' );         },
      destroy:      function() { res.push( 'destroy' );      },

      filter:        'li:nth-child(odd)',
      mouseMode:     'toggle',
      event:         'hybrid',
      handle:        '.handle',

      multi:         false,
      autoScroll:    false,
      preventInputs: false,

      focusBlur:     true,
      selectionBlur: true,
      keyboard:      true,
      loop:          true
    });

    // Check getting options object
    options = selectable.option();
    ok((
      options.filter        === 'li:nth-child(odd)' &&
      options.mouseMode     === 'toggle' &&
      options.event         === 'hybrid' &&
      options.handle        === '.handle' &&
      options.multi         === false &&
      options.autoScroll    === false &&
      options.preventInputs === false &&
      options.focusBlur     === true &&
      options.selectionBlur === true &&
      options.keyboard      === true &&
      options.loop          === true ),
    'Options assigned!');

    // Click
    elem.find('.handle').triggerClick();
    ok((
      res[0] === 'before' &&
      res[1] === 'select' &&
      res[2] === 'stop'
    ), 'Click on list without any selection.');

    // Click outside list
    res = [];
    $('body').triggerClick();
    ok((
      res[0] === 'before' &&
      res[1] === 'unselect' &&
      res[2] === 'unselectAll' &&
      res[3] === 'focusLost' &&
      res[4] === 'stop'
    ), 'Click outside list');

    // Click outside sec
    res = [];
    $('body').triggerClick();
    ok((res[0] === 'before' && res[1] === 'stop'), 'Click outside second');

    // Select item
    elem.find('.handle').triggerClick();
    res = [];
    // Select another item
    sec.find('.handle').triggerClick();
    ok((
      res[0] === 'before' &&
      res[1] === 'unselect' &&
      res[2] === 'select' &&
      res[3] === 'stop'
    ), 'Select another item');

    // Disable handle
    selectable.option('handle', null);
    // Select item
    elem.triggerClick();
    ok((
      res[0] === 'before' &&
      res[1] === 'unselect' &&
      res[2] === 'select' &&
      res[3] === 'stop'
    ), 'Select item without handle');

    // Destroing plugin
    res = [];
    selectable.destroy();
    ok( res[0] === 'destroy', 'Plugin destroied!' );
  });

  test( 'before arguments', 20, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(0)'),
    sec  = box.find('li:eq(2)');

    // Set options
    selectable.option( {
      filter:        'li:nth-child(odd)',
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
    elem.triggerClick();

    // Select another item
    selectable.option( {
      before: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( ui.target, 'ui.target' );
        ok( ui.focus, 'focus' );
        ok( !ui.items, 'items' );
      }
    });
    sec.find('.handle').triggerClick();

    // Click outside list
    selectable.option( {
      before: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( !ui.target, 'No ui.target' );
        ok( ui.focus, 'focus' );
        ok( !ui.items, 'No items' );
      }
    });
    $('body').triggerClick();

    // Click outside second time
    selectable.option( {
      before: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( !ui.target, 'No ui.target' );
        ok( !ui.focus, 'No focus' );
        ok( !ui.items, 'No items' );
      }
    });
    $('body').triggerClick();
    selectable.option( 'before', null );
  });


  test( 'select arguments', 11, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(1)'),
    sec  = box.find('li:eq(3)');

    // Set options
    selectable.option( {
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
    elem.triggerClick();

    // Multi selection
    selectable.option( {
      select: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( ui.target, 'target' );
        ok( ui.focus, 'focus' );
        ok( ui.items, 'items' );
        ok( ui.items.length === 2, '2 items' );
      }
    });
    sec.shiftMousedown();

    // Click outside list
    $('body').triggerClick();
  });


  test( 'unselect arguments', 12, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(1)'),
    sec  = box.find('li:eq(3)');

    // Set options
    selectable.option( {
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
    elem.triggerClick();
    sec.shiftMousedown();
    // Select one
    elem.triggerClick();

    // Click outside list
    sec.shiftMousedown();
    selectable.option( {
      unselect: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( !ui.target, 'No target' );
        ok( ui.focus, 'focus' );
        ok( ui.items, 'items' );
        ok( ui.items.length === 3, '3 items' );
      }
    });
    $('body').triggerClick();
    $('body').triggerClick();
  });


  test( 'unselectAll arguments', 18, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(1)'),
    sec  = box.find('li:eq(3)');

    // Set options
    selectable.option( {
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
    elem.triggerClick();
    sec.shiftMousedown();
    elem.shiftMousedown();

    // Click outside list
    sec.shiftMousedown();
    selectable.option( {
      unselectAll: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( !ui.target, 'No target' );
        ok( ui.focus, 'focus' );
        ok( ui.items, 'items' );
        ok( ui.items.length === 3, '3 items' );
      }
    });
    $('body').triggerClick();
    $('body').triggerClick();

    // Unselect one item without focuss loss
    selectable.option( {
      unselectAll: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( ui.target, 'target' );
        ok( ui.focus, 'focus' );
        ok( ui.items, 'items' );
        ok( ui.items.length === 1, '1 items' );
      }
    });
    elem.triggerClick();
    elem.metaMousedown();
  });


  test( 'focusLost arguments', 5, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(0)');

    // Set options
    selectable.option( {
      filter:        'li:nth-child(odd)',
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
    elem.triggerClick();

    // Click outside list
    $('body').triggerClick();
    $('body').triggerClick();
  });


  test( 'stop arguments', 34, function() {
    var
    box  = getBox(),
    elem = box.find('li:eq(1)'),
    sec  = box.find('li:eq(3)'),
    third = box.find('li:eq(5)');

    // Set options
    selectable.option( {
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
    elem.triggerClick();

    // Range
    selectable.option( 'stop', function( e, ui ) {
      ok( e, 'event' );
      ok( ui, 'ui' );
      ok( ui.target, 'target' );
      ok( ui.focus, 'focus' );
      ok( ui.items, 'items' );
      ok( ui.items.length === 2, '2 items' );
    });
    sec.shiftMousedown();

    // Click unselected item
    selectable.option( 'stop', function( e, ui ) {
      ok( e, 'event' );
      ok( ui, 'ui' );
      ok( ui.target, 'target' );
      ok( ui.focus, 'focus' );
      ok( ui.items, 'items' );
      ok( ui.items.length === 4, '4 items' );
    });
    third.triggerClick();

    // Select and call `cancel` method
    selectable.option( {
      select: function( e, ui ) {
        ok( e, 'event' );
        ok( ui, 'ui' );
        ok( ui.target, 'target' );
        ok( ui.focus, 'focus' );
        ok( ui.items, 'items' );
        ok( ui.items.length === 4, '4 items' );
        selectable.cancel();
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
    selectable.option( 'stop', function( e, ui ) {
      ok( e, 'event' );
      ok( ui, 'ui' );
      ok( !ui.target, 'No target' );
      ok( !ui.focus, 'No focus' );
      ok( ui.items, 'items' );
      ok( ui.items.length === 1, '1 item' );
    });
    $('body').triggerClick();
  });


  test( 'API exceptions', 6, function() {
    var box = getBox();
    try {
      selectable.option( false );
    } catch (err) {
      ok( err.message.match(/Format.*option.*/), 'Wrong option format' );
    }
    try {
      selectable.option( 'mouseMode', 'superlalala' );
    } catch (err) {
      ok( err.message.match(/Option.*values.*/), 'Option only allowed values' );
    }
    try {
      selectable.option( 'listClass', 'superlalala' );
    } catch (err) {
      ok( err.message.match(/.*listClass.*once/), 'Is not allowed to change classnames' );
    }
    try {
      selectable.option( 'before', 'superlalala' );
    } catch (err) {
      ok( err.message.match(/Option.*function.*/), 'Should be a function' );
    }
    try {
      selectable.option( 'autoScroll', '#superlalala' );
    } catch (err) {
      ok( err.message.match(/elements.*selector.*/), 'No elems matches selector for autoScroll' );
    }
    try {
      selectable.select();
    } catch (err) {
      ok( err.message.match(/select/), 'Should pass DOM element or selector!' );
    }
  });


  test( 'Call select on empty list', 1, function() {
    var res, res2,
    box = getBox();
    box.html(''); //clear box
    res = selectable.select('li');
    res2 = selectable.getSelected().length;

    ok( res2 === 0, 'getSelected returned 0' );
    // ok( res.jquery, 'Nothing happend, it is ok!' );
  });


}(jQuery));