(function( $, Syn ) {

  /*
  *
  * Helpers
  *
  */
  var
  assert           = QUnit.assert,
  getBox           = _Utils.getBox,
  elems            = _Utils.elems,
  // getSelectionText = _Utils.getSelectionText,
  // clearSelection   = _Utils.clearSelection,

  initOptions = {
    listClass:   ( 'selectable' ),
    focusClass:     ( 'focused' ),
    selectedClass:  ( 'selected' ),
    disabledClass:  ( 'disabled' ),

    filter:        '> *',
    mouseMode:     'select',
    event:         'mousedown',
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
    var box = getBox(),
    el = elems();
    
    Syn.type( '[down]', box );
    Syn.type( '[down]', box );
    Syn.type( '[down]', box );
    Syn.type( '[down]', box );
    assert
      .selected( el(3) )
      .selectedCount(1);

    Syn.type( '[shift]', box );
    Syn.type( '[down]', box );
    Syn.type( '[down]', box );
    Syn.type( '[shift-up]', box );
    assert
      .selected( el(3) )
      .selected( el(4) )
      .selectedFocus( el(5) )
      .selectedCount(3);
    
    Syn.type( '[shift]', box );
    Syn.type( '[up]', box );
    Syn.type( '[up]', box );
    Syn.type( '[up]', box );
    Syn.type( '[shift-up]', box );
    assert
      .selected( el(3) )
      .selectedCount(2);
  });

  test( 'Jump with down-shift', 3, function() {
    var box = getBox(),
    el = elems();
    el(3).metaMousedown();
    el(2).metaMousedown();
    el(0).metaMousedown();

    Syn.type( '[shift]', box );
    Syn.type( '[down]', box );
    Syn.type( '[down]', box );
    Syn.type( '[shift-up]', box );
    assert
      .selected( el(0) )
      .selectedFocus( el(4) )
      .selectedCount( 5 );
  });

  test( 'Ctrl+A', 2, function() {
    var
    box   = getBox(),
    first = box.find('li').first();
    
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



  module("Massive");

  test( 'Home/End and shift', 9, function( ) {
    var
    box = getBox(),
    el = elems();
    
    Syn.type( '[down]', box );
    Syn.type( '[down]', box );
    Syn.type( '[shift][end]', box );
    assert
      .selectedFocus( el(19) )
      .selectedCount( 19 );
    Syn.type( '[home]', box );
    Syn.type( '[shift-up]', box );
    assert
      .selectedFocus( el(0) )
      .selected( el(1) )
      .selectedCount(2);

    Syn.click( {}, el(6) );
    el(3).metaMousedown();
    Syn.type( '[shift][home]', box );
    Syn.type( '[shift-up]', box );
    assert
      .selectedFocus( el(0) )
      .selectedCount( 4 );

    Syn.click( {}, el(6) );
    el(6).metaMousedown();
    Syn.type( '[shift][end]', box );
    Syn.type( '[shift-up]', box );
    assert
      .selectedFocus( el(6) )
      .selectedCount( 1 );
  });

  test( 'PageUp/Down shift', 6, function( ) {
    var
    box = getBox(),
    el = elems();
    
    Syn.type( '[down]', box );
    Syn.type( '[shift][page-down]', box );
    Syn.type( '[shift-up]', box );
    assert
      .selectedFocus( el(4) )
      .selectedCount( 5 );

    Syn.type( '[shift][page-down]', box );
    Syn.type( '[shift-up]', box );
    assert
      .selectedFocus( el(8) )
      .selectedCount( 9 );

    Syn.type( '[shift][up]', box );
    Syn.type( '[up]', box );
    Syn.type( '[page-down]', box );
    Syn.type( '[shift-up]', box );
    assert
      .selectedFocus( el(10) )
      .selectedCount( 11 );
  });

  test( 'New solid range', 2, function( ) {
    var
    box = getBox(),
    el = elems();
    
    Syn.click( {}, el(0));
    el(2).metaMousedown();
    el(10).metaMousedown();
    el(4).metaMousedown();

    Syn.type( '[shift][page-down]', box );
    Syn.type( '[shift-up]', box );
    assert
      .selectedFocus( el(8) )
      .selectedCount( 5 );
  });

  test( 'Initial elem in solid range', 8, function( ) {
    var
    box = getBox(),
    el = elems();
    
    Syn.click( {}, el(5));
    Syn.type( '[shift][up]', box );
    Syn.type( '[up]', box );
    Syn.type( '[up]', box );
    Syn.type( '[shift-up]', box );

    Syn.type( '[shift][page-down]', box );
    Syn.type( '[shift-up]', box );
    assert
      .selected( el(5) )
      .selectedFocus( el(6) )
      .selectedCount( 2 );

    Syn.type( '[shift][down]', box );
    Syn.type( '[down]', box );
    Syn.type( '[down]', box );
    Syn.type( '[shift-up]', box );
    Syn.type( '[shift][page-up]', box );
    Syn.type( '[shift-up]', box );
    assert
      .selectedFocus( el(5) )
      .selectedCount( 1 );
    
    Syn.click( {}, el(5));
    el(4).metaMousedown().metaMousedown();
    Syn.type( '[shift][page-up]', box );
    Syn.type( '[page-up]', box );
    Syn.type( '[shift-up]', box );
    assert
      .notSelected( el(5) )
      .selectedFocus( el(0) )
      .selectedCount( 5 );
  });



  module("Toggle mode");

  test( 'Toggle', 5, function( ) {
    var
    box = getBox(),
    el = elems();

    Syn.type( '[down]', box );
    Syn.type( '[shift][page-down]', box );
    Syn.type( '[shift-up]', box );
    assert.selectedCount( 0 );

    Syn.type( '[space]', box );
    assert
      .selectedCount( 1 )
      .selectedFocus( el(4) );
    Syn.type( '[space]', box );

    Syn.type( '[down]', box );
    Syn.type( '[down]', box );
    Syn.type( '[space]', box );
    Syn.type( '[down]', box );
    Syn.type( '[space]', box );
    assert
      .selectedCount( 2 )
      .selectedFocus( el(7) );
  });




}(jQuery, Syn));