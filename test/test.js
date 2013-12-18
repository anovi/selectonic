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
};

QUnit.assert.focused = function( elem ) {
  var actual = elem.hasClass('focused');
  QUnit.push(actual, actual, true, 'Focused');
};

QUnit.assert.notSelected = function( elem ) {
  var actual = !elem.hasClass('selected');
  QUnit.push(actual, actual, true, 'Not selected!');
};

QUnit.assert.notFocused = function( elem ) {
  var actual = !elem.hasClass('focused');
  QUnit.push(actual, actual, true, 'Not focused!');
};

QUnit.assert.selectedFocus = function( elem ) {
  var actual = elem.hasClass('focused') && elem.hasClass('selected');
  QUnit.push(actual, actual, true, 'Focused and selected!');
};

QUnit.assert.selectedCount = function( count ) {
  var selected = getBox().find('.selected');
  var actual = selected.length === count;
  QUnit.push(actual, actual, true, 'Is ' + count + ' selected!');
};


/*
*
* Configure
*
*/
QUnit.testStart( function (info) {
  var res  = $.extend( {}, initOptions ),
  advanced = {};
  
  switch ( info.name ) {
    case 'Blurable mousedown':
      advanced = { focusBlur: true, selectionBlur: true };
      break;
    case 'Toggle mousedown':
      advanced = { mouseMode: 'toggle' };
      break;
    case 'Hybrid mouse':
      advanced = { event: 'hybrid' };
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
  assert.selectedFocus( secElem );
  assert.notSelected( elem );
  assert.notFocused( elem );
});

test( 'Multi-select mousedown', 6, function() {
  var
  elem          = getBox().find('li:eq(3)'),
  secElem       = getBox().find('li:eq(5)'),
  e             = $.Event( "mousedown" );
  e.metaKey     = true;
  
  elem.trigger('mousedown');
  ok( elem.hasClass('selected'), "Selected" );
  ok( elem.hasClass('focused'), "Focused" );

  secElem.trigger( e );
  assert.selected( elem );
  assert.selectedFocus( secElem );

  elem.trigger('mousedown');
  e = $.Event( "mousedown" );
  e.metaKey = true;
  elem.trigger( e );
  assert.notSelected( elem );
  assert.focused( elem );
});

test( 'Range-select mousedown', 6, function() {
  var
  selected,
  elem       = getBox().find('li:eq(3)'),
  midElem    = getBox().find('li:eq(4)'),
  secElem    = getBox().find('li:eq(5)'),
  e          = $.Event( "mousedown" );
  e.shiftKey = true;
  
  elem.trigger('mousedown');
  assert.selectedFocus( elem );

  secElem.trigger( e );
  assert.selected( elem );
  assert.selected( midElem );
  assert.selectedFocus( secElem );

  midElem.trigger('mousedown');
  assert.selectedFocus( midElem );
  assert.selectedCount(1);
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
  selected,
  elem       = getBox().find('li:eq(3)'),
  midElem    = getBox().find('li:eq(4)'),
  secElem    = getBox().find('li:eq(5)'),
  e          = $.Event( "mousedown" );
  e.shiftKey = true;
  
  elem.trigger('mousedown');
  secElem.trigger('mousedown');
  assert.selected( elem );
  assert.selectedFocus( secElem );
  
  elem.trigger('mousedown');
  assert.notSelected( elem );
  assert.focused( elem );
});

asyncTest( 'Hybrid mouse', 3, function() {
  var
  selected,
  elem       = getBox().find('li:eq(3)'),
  midElem    = getBox().find('li:eq(4)'),
  secElem    = getBox().find('li:eq(5)'),
  e          = $.Event( "mousedown" );
  e.shiftKey = true;
  
  elem.trigger('mousedown');
  assert.selectedFocus( elem );

  secElem.trigger( e );
  
  Syn.click( {}, midElem, function () {
    assert.selectedFocus( midElem );
    assert.selectedCount(1);
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
  //   selected = getBox().find('.selected');
  //   equal( selected.length, 1, "1 selected" );
  //   start();
  // });
});



/*
Options:
  filter
  mouseMode
  multi
  event
  handle
  preventInputs
  focusBlur
  selectionBlur
  keyboardInput
  loop
  scrolledElem

  wrapperClass
  focusClass
  selectedClass
  disabledClass

  create
  beforeSelect
  focusLost
  select
  unSelect
  unSelectAll
  stop
  destroy

Public methods:
  isEnabled
  option
  destroy
  select
  blur
  getSelected
  getSelectedId
  getFocused
  enable
  disable
  cancel
  refresh
*/


