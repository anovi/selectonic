(function( $ ) {

  /*
  *
  * Helpers
  *
  */
  var
  assert = QUnit.assert,
  getBox = _Utils.getBox,
  elems  = _Utils.elems,
  type   = _Utils.type,
  // getSelectionText = _Utils.getSelectionText,
  // clearSelection   = _Utils.clearSelection,

  initOptions = {
    listClass:   ( 'selectable' ),
    focusClass:     ( 'focused' ),
    selectedClass:  ( 'selected' ),
    disabledClass:  ( 'disabled' ),

    filter:        '> *',
    mouseMode:     'standard',
    handle:        null,
    textSelection: false,

    multi:         true,
    scrolledElem:  true,
    preventInputs: true,
    
    focusBlur:     false,
    selectionBlur: false,
    keyboard:      true,
    loop:          false
  },

  // Helpers
  createList = function( options ) {
    var res, box, str;
    res = $('<div id=\"list\"><ul id=\"sublist\" class=\"scrollable\"></ul></div>');
    box = res.find('#sublist');
    for (var i = 0; i < 20; i++) {
      str = '<li id=\"elem' + i + '\"><span class=\"handle\"></span><span class=\"text\">Item ' + i +  '</span></li>';
      box.append( str );
    }
    $('#qunit-fixture').html( res );
    box.selectonic( options );
  };

  /*
  *
  * Config
  *
  */
  QUnit.testStart( function (info) {
    var res  = $.extend( {}, initOptions ),
    advanced = {};  
    if (info.module === 'Toggle mode') { advanced.keyboardMode = 'toggle'; }

    switch ( info.name ) {
      case 'Filter odd up/down':
        $.extend( advanced, { filter: 'li:odd', selectionBlur: true });
        break;
      case 'Loop':
        $.extend( advanced, { loop: true });
        break;
      case 'Select by Enter':
        $.extend( advanced, { multi: false });
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
  * Keyboard suite
  *
  */
  module("Basic");

  test( 'Up/down and shift', 8, function() {
    var el = elems();
    
    type( '[down]' );
    type( '[down]' );
    type( '[down]' );
    type( '[down]' );
    assert
      .selected( el(3) )
      .selectedCount(1);

    type( '[shift]' );
    type( '[down]' );
    type( '[down]' );
    type( '[shift-up]' );
    assert
      .selected( el(3) )
      .selected( el(4) )
      .selectedFocus( el(5) )
      .selectedCount(3);
    
    type( '[shift]' );
    type( '[up]' );
    type( '[up]' );
    type( '[up]' );
    type( '[shift-up]' );
    assert
      .selected( el(3) )
      .selectedCount(2);
  });

  test( 'Jump with down-shift', 3, function() {
    var el = elems();
    el(3).metaMousedown();
    el(2).metaMousedown();
    el(0).metaMousedown();

    type( '[shift]' );
    type( '[down]' );
    type( '[down]' );
    type( '[shift-up]' );
    assert
      .selected( el(0) )
      .selectedFocus( el(4) )
      .selectedCount( 5 );
  });

  test( 'Ctrl+A', 2, function() {
    var
    box   = getBox(),
    first = box.find('li').first();
    
    type( '[ctrl]a' );
    type( '[ctrl-up]' );
    assert
      .selectedFocus( first )
      .selectedCount(20);
  });

  test( 'Loop', 5, function() {
    var
    box   = getBox(),
    first = box.find('li').first(),
    last  = box.find('li').last();
    
    type( '[down]' );
    type( '[shift][up]' );
    type( '[shift-up]' );
    assert
      .selectedFocus( last )
      .selected( first )
      .selectedCount(2);

    type( '[down]' );
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
    
    type( '[down]' );
    assert.selectedFocus( first );
    
    type( '[shift][down]' );
    type( '[down]' );
    type( '[shift-up]' );
    assert
      .selectedFocus( last )
      .selected( sec )
      .selectedCount( 3 );

    type( '[ctrl]a' );
    type( '[ctrl-up]' );
    assert.selectedCount( 10 );
  });

  test( 'Selet by Enter', 4, function( ) {
    var
    el = elems();

    type( '[down]' );
    type( '[down]' );
    type( '[down]' );
    type( '[enter]' );
    assert
      .selectedCount( 1 )
      .selectedFocus( el(2) );

    type( '[down]' );
    type( '[down]' );
    type( '[enter]' );
    assert
      .selectedCount( 1 )
      .selectedFocus( el(4) );
  });



  module("Massive");

  test( 'Home/End and shift', 9, function( ) {
    var
    el = elems();
    
    type( '[down]' );
    type( '[down]' );
    type( '[shift][end]' );
    assert
      .selectedFocus( el(19) )
      .selectedCount( 19 );
    type( '[home]' );
    type( '[shift-up]' );
    assert
      .selectedFocus( el(0) )
      .selected( el(1) )
      .selectedCount(2);

    el(6).triggerClick();
    el(3).metaMousedown();
    type( '[shift][home]' );
    type( '[shift-up]' );
    assert
      .selectedFocus( el(0) )
      .selectedCount( 4 );

    el(6).triggerClick();
    el(6).metaMousedown();
    type( '[shift][end]' );
    type( '[shift-up]' );
    assert
      .selectedFocus( el(6) )
      .selectedCount( 1 );
  });

  test( 'PageUp/Down shift', 6, function( ) {
    var
    el = elems();
    
    type( '[down]' );
    type( '[shift][page-down]' );
    type( '[shift-up]' );
    assert
      .selectedFocus( el(4) )
      .selectedCount( 5 );

    type( '[shift][page-down]' );
    type( '[shift-up]' );
    assert
      .selectedFocus( el(8) )
      .selectedCount( 9 );

    type( '[shift][up]' );
    type( '[up]' );
    type( '[page-down]' );
    type( '[shift-up]' );
    assert
      .selectedFocus( el(10) )
      .selectedCount( 11 );
  });

  test( 'New solid range', 2, function( ) {
    var
    el = elems();
    
    el(0).triggerClick();
    el(2).metaMousedown();
    el(10).metaMousedown();
    el(4).metaMousedown();

    type( '[shift][page-down]' );
    type( '[shift-up]' );
    assert
      .selectedFocus( el(8) )
      .selectedCount( 5 );
  });

  test( 'Initial elem in solid range', 8, function( ) {
    var
    el = elems();
    
    el(5).triggerClick();
    type( '[shift][up]' );
    type( '[up]' );
    type( '[up]' );
    type( '[shift-up]' );

    type( '[shift][page-down]' );
    type( '[shift-up]' );
    assert
      .selected( el(5) )
      .selectedFocus( el(6) )
      .selectedCount( 2 );

    type( '[shift][down]' );
    type( '[down]' );
    type( '[down]' );
    type( '[shift-up]' );
    type( '[shift][page-up]' );
    type( '[shift-up]' );
    assert
      .selectedFocus( el(5) )
      .selectedCount( 1 );
    
    el(5).triggerClick();
    el(4).metaMousedown().metaMousedown();
    type( '[shift][page-up]' );
    type( '[page-up]' );
    type( '[shift-up]' );
    assert
      .notSelected( el(5) )
      .selectedFocus( el(0) )
      .selectedCount( 5 );
  });



  module("Toggle mode");

  test( 'Toggle', 5, function( ) {
    var
    el = elems();

    type( '[down]' );
    type( '[shift][page-down]' );
    type( '[shift-up]' );
    assert.selectedCount( 0 );

    type( '[space]' );
    assert
      .selectedCount( 1 )
      .selectedFocus( el(4) );
    type( '[space]' );

    type( '[down]' );
    type( '[down]' );
    type( '[space]' );
    type( '[down]' );
    type( '[space]' );
    assert
      .selectedCount( 2 )
      .selectedFocus( el(7) );
  });




}(jQuery));