/*
  TODO: more apppropriate test for mouseMode option
  TODO: test for scrolledElem option
*/

/*
*
* Helpers
*
*/
var
testBox = $('#qunit-fixture'),
assert = QUnit.assert,

initOptions = {
  wrapperClass:   ( 'selectable' ),
  focusClass:     ( 'focused' ),
  selectedClass:  ( 'selected' ),
  disabledClass:  ( 'disabled' ),

  filter:        '> *',
  mouseMode:     'select',
  event:         'mousedown',
  handle:        null,

  multi:         true,
  scrolledElem:  true,
  preventInputs: true,
  
  focusBlur:     false,
  selectionBlur: false,
  keyboardInput: false,
  loop:          false
},

createList = function( options ) {
  var res, box, str;
  res = $('<div id=\"list\"><ul id=\"sublist\"></ul></div>');
  box = res.find('#sublist');
  for (var i = 0; i < 20; i++) {
    str = '<li id=\"elem' + i + '\"><span class=\"handle\"><input type=\"checkbox\"></span><span class=\"text\">Item ' + i +  '</span></li>';
    box.append( str );
  }
  testBox.html( res );
  box.multiSelectable( options );
},

getBox = function () {
  return testBox.find('#sublist');
};

QUnit.assert.selected = function( elem ) {
  var actual = elem.hasClass('selected');
  QUnit.push(actual, actual, true, 'Selected');
  return QUnit.assert;
};

QUnit.assert.focused = function( elem ) {
  var actual = elem.hasClass('focused');
  QUnit.push(actual, actual, true, 'Focused');
  return QUnit.assert;
};

QUnit.assert.notSelected = function( elem ) {
  var actual = !elem.hasClass('selected');
  QUnit.push(actual, actual, true, 'Not selected!');
  return QUnit.assert;
};

QUnit.assert.notFocused = function( elem ) {
  var actual = !elem.hasClass('focused');
  QUnit.push(actual, actual, true, 'Not focused!');
  return QUnit.assert;
};

QUnit.assert.selectedFocus = function( elem ) {
  var actual = elem.hasClass('focused') && elem.hasClass('selected');
  QUnit.push(actual, actual, true, 'Focused and selected!');
  return QUnit.assert;
};

QUnit.assert.selectedCount = function( count ) {
  var selected = getBox().find('.selected');
  var actual = selected.length === count;
  QUnit.push(actual, actual, true, 'Is ' + count + ' selected!');
  return QUnit.assert;
};


/*
*
* Config
*
*/
QUnit.testStart( function (info) {
  var res  = $.extend( {}, initOptions ),
  advanced = {};

  if (info.module === 'Keyboard')
    $.extend( advanced, { multi: true, keyboardInput: true });
  
  switch ( info.name ) {
    case 'Blurable mousedown':
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
  }

  res = $.extend( res, advanced );
  createList( res );
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
  getBox().multiSelectable('destroy');
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
  var
  box        = getBox(),
  elem       = box.find('li:eq(3)'),
  midElem    = box.find('li:eq(4)'),
  secElem    = box.find('li:eq(5)'),
  e          = $.Event( "mousedown" );
  e.shiftKey = true;
  
  elem.trigger('mousedown');
  secElem.trigger('mousedown');
  assert
    .selected( elem )
    .selectedFocus( secElem );
  
  elem.trigger('mousedown');
  assert
    .notSelected( elem )
    .focused( elem );
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


/*
*
* Keyboard suite
*
*/
module("Keyboard");

test( 'Up/down and shift', 6, function() {
  var
  box     = getBox(),
  elem    = box.find('li:eq(3)'),
  midElem = box.find('li:eq(4)'),
  secElem = box.find('li:eq(5)');
  
  Syn.type( '[down]', box );
  Syn.type( '[down]', box );
  Syn.type( '[down]', box );
  Syn.type( '[down]', box );
  assert
    .selected( elem )
    .selectedCount(1);

  Syn.type( '[shift]', box );
  Syn.type( '[down]', box );
  Syn.type( '[down]', box );
  Syn.type( '[shift-up]', box );
  assert
    .selected( elem )
    .selected( midElem )
    .selectedFocus( secElem )
    .selectedCount(3);
});

test( 'PageUp/PageDown and shift', 4, function() {
  var
  box   = getBox(),
  first = box.find('li').first(),
  last  = box.find('li').last();
  
  Syn.type( '[down]', box );
  Syn.type( '[shift][end]', box );
  Syn.type( '[shift-up]', box );
  assert
    .selectedFocus( last )
    .selectedCount(20);

  Syn.type( '[shift][home]', box );
  Syn.type( '[shift-up]', box );
  assert
    .focused( first )
    .selectedCount(0);
});

test( 'Ctrl+A', 2, function() {
  var
  box   = getBox(),
  first = box.find('li').first(),
  last  = box.find('li').last();
  
  Syn.type( '[ctrl]a', box );
  Syn.type( '[ctrl-up]', box );
  assert
    .selectedFocus( first )
    .selectedCount(20);
});

test( 'Loop', 5, function() {
  var
  box   = getBox(),
  first = box.find('li').first(),
  last  = box.find('li').last();
  
  Syn.type( '[down]', box );
  Syn.type( '[shift][up]', box );
  Syn.type( '[shift-up]', box );
  assert
    .selectedFocus( last )
    .selected( first )
    .selectedCount(2);

  Syn.type( '[down]', box );
  assert
    .selectedFocus( first )
    .selectedCount(1);
});

test( 'Filter odd up/down', 5, function() {
  var
  box   = getBox(),
  first = box.find('li:eq(1)'),
  sec   = box.find('li:eq(3)'),
  last  = box.find('li:eq(5)');
  
  Syn.type( '[down]', box );
  assert.selectedFocus( first );
  
  Syn.type( '[shift][down]', box );
  Syn.type( '[down]', box );
  Syn.type( '[shift-up]', box );
  assert
    .selectedFocus( last )
    .selected( sec )
    .selectedCount( 3 );

  Syn.type( '[ctrl]a', box );
  Syn.type( '[ctrl-up]', box );
  assert.selectedCount( 10 );
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
    .multiSelectable('li:eq(3)')
    .multiSelectable('disable')
    .multiSelectable('isEnabled');
  ok( !isEnabled, 'Is diabled!' );
  
  secElem.trigger('mousedown');
  assert
    .selectedFocus( elem )
    .selectedCount( 1 );
  
  isEnabled = box.multiSelectable('enable').multiSelectable('isEnabled');
  ok( isEnabled, 'Is enabled!' );
});

test( 'blur', 6, function() {
  var
  box     = getBox(),
  elem    = box.find('li:eq(3)'),
  secElem = box.find('li:eq(5)');
  
  box.multiSelectable('li:eq(3)');
  assert
    .selectedFocus( elem )
    .selectedCount( 1 );
  box
    .multiSelectable( 'option', 'selectionBlur', true )
    .multiSelectable( 'blur' );
  assert
    .focused( elem )
    .selectedCount( 0 );
  box
    .multiSelectable('li:eq(3)')
    .multiSelectable( 'option', 'focusBlur', true )
    .multiSelectable( 'blur' );
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
    .multiSelectable('option', 'selectionBlur', true)
    .multiSelectable('getSelected');
  equal( selected.length, 3, "3 selected" );

  $('body').trigger('mousedown');

  selected = box.multiSelectable('getSelected');
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
    .multiSelectable('option', 'selectionBlur', true)
    .multiSelectable('getSelectedId');
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
    .multiSelectable( 'option', 'focusBlur', true )
    .multiSelectable( 'getFocused' );
  ok( $(selected).is( elem ) , 'Items match' );

  $('body').trigger('mousedown');
  selected = box.multiSelectable( 'getFocused' );
  ok( selected === null, 'No focus' );
});

test( 'select', 2, function() {
  var
  box     = getBox(),
  elem    = box.find('li:eq(3)');
  
  box.multiSelectable( elem );
  assert.selected( elem );
  
  box.multiSelectable( 'li:odd' );
  assert.selectedCount( 10 );
});

test( 'refresh', 3, function() {
  var
  box   = getBox(),
  elem  = box.find('li:eq(0)'),
  check = true;
  
  box
    .multiSelectable( elem )
    .multiSelectable( 'option', { unSelectAll: function(e, ui) {check = false;} });
  
  assert.selectedCount( 1 );

  elem.remove();
  box
    .multiSelectable('refresh')
    .multiSelectable('blur');

  assert.selectedCount( 0 );
  ok( check, 'There was no unSelectAll callback!' );
});

test( 'cancel', 2, function() {
  var
  box  = getBox(),
  elem = box.find('li:eq(0)');
  
  box
    .multiSelectable( 'li:odd' )
    .multiSelectable( 'option', {
      stop: function( e, ui ) {
        this.multiSelectable( 'cancel' );
      }
    })
    .multiSelectable( elem );

  assert.selectedCount( 10 );
  assert.notSelected( elem );
});

test( 'option', 6, function() {
  var
  box  = getBox(),
  elem = box.find('li:eq(1)'),
  sec  = box.find('li:eq(3)'),
  res  = [],
  options;
  
  box
    .multiSelectable( 'option', {
      beforeSelect: function(e, ui) { res.push( 'beforeSelect' ); },
      focusLost:    function(e, ui) { res.push( 'focusLost' );    },
      select:       function(e, ui) { res.push( 'select' );       },
      unSelect:     function(e, ui) { res.push( 'unSelect' );     },
      unSelectAll:  function(e, ui) { res.push( 'unSelectAll' );  },
      stop:         function(e, ui) { res.push( 'stop' );         },
      destroy:      function(e, ui) { res.push( 'destroy' );      },
      
      filter:        'li:odd',
      mouseMode:     'toggle',
      event:         'hybrid',
      handle:        '.handle',

      multi:         false,
      scrolledElem:  false,
      preventInputs: false,
      
      focusBlur:     true,
      selectionBlur: true,
      keyboardInput: true,
      loop:          true
    });

  options = box.multiSelectable( 'option' );
  ok((
    options.filter        === 'li:odd' &&
    options.mouseMode     === 'toggle' &&
    options.event         === 'hybrid' &&
    options.handle        === '.handle' &&
    options.multi         === false &&
    options.scrolledElem  === false &&
    options.preventInputs === false &&
    options.focusBlur     === true &&
    options.selectionBlur === true &&
    options.keyboardInput === true &&
    options.loop          === true ),
  'Options assigned!');

  Syn.click( {}, elem.find('.handle') );
  ok((
    res[0] === 'beforeSelect' &&
    res[1] === 'select' &&
    res[2] === 'stop'
  ));

  res = [];
  Syn.click( {}, $('body') );
  ok((
    res[0] === 'beforeSelect' &&
    res[1] === 'focusLost' &&
    res[2] === 'unSelect' &&
    res[3] === 'unSelectAll' &&
    res[4] === 'stop'
  ));

  res = [];
  Syn.click( {}, $('body') );
  ok((res[0] === 'beforeSelect' && res[1] === 'stop'));

  Syn.click( {}, elem.find('.handle') );
  res = [];
  Syn.click( {}, sec.find('.handle') );
  ok((
    res[0] === 'beforeSelect' &&
    res[1] === 'unSelect' &&
    res[2] === 'select' &&
    res[3] === 'stop'
  ));

  res = [];
  box.multiSelectable( 'destroy' );
  ok( res[0] === 'destroy' );
});


