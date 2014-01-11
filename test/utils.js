(function( $, QUnit ) {

  var _Utils = {},

  // Helpers
  createList = function( options ) {
    var res, box, str;
    res = $('<div id=\"list\"><ul id=\"sublist\"></ul></div>');
    box = res.find('#sublist');
    for (var i = 0; i < 20; i++) {
      str = '<li id=\"elem' + i + '\"><span class=\"handle\"><input type=\"checkbox\"></span><span class=\"text\">Item ' + i +  '</span></li>';
      box.append( str );
    }
    $('#qunit-fixture').html( res );
    box.selectonic( options );
  },

  
  getBox = function () {
    return $('#qunit-fixture').find('#sublist');
  },

  
  getSelectionText = function() {
    var txt = '';
    if (txt = window.getSelection) {
      // Not IE, use getSelection
      txt = window.getSelection().toString();
    } else {
      // IE, use object selection
      txt = document.selection.createRange().text;
    }
    return txt;
  },


  clearSelection = function() {
    if ( window.getSelection ) {
      // Normal browsers
      window.getSelection().removeAllRanges();
    } else {
      // IE<9
      document.selection.clear();
    }
  },

  
  elems = function() {
    var elems = getBox().find('li');
    return function( eq ) {
      return elems.eq( eq );
    };
  };


  // jQuery
  $.fn.shiftMousedown = function() {
    this.triggerMousedown('shift');
    return this;
  };

  $.fn.metaMousedown = function() {
    this.triggerMousedown('meta');
    return this;
  };

  $.fn.triggerMousedown = function(mode) {
    var e = $.Event( "mousedown" );
    if (mode === 'meta' || mode === 'ctrl') { e.metaKey = true; } else if (mode === 'shift') { e.shiftKey = true; }
    this.trigger( e );
    return this;
  };

  $.fn.triggerMouseup = function(mode) {
    var e = $.Event( "mouseup" );
    if (mode === 'meta' || mode === 'ctrl') { e.metaKey = true; } else if (mode === 'shift') { e.shiftKey = true; }
    this.trigger( e );
    return this;
  };

  jQuery.fn.triggerClick = function() {
    this.trigger('mousedown');
    this.trigger('mouseup');
    this.trigger('click');
    return this;
  };


  // QUnit
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


  _Utils.createList       = createList;
  _Utils.getBox           = getBox;
  _Utils.getSelectionText = getSelectionText;
  _Utils.clearSelection   = clearSelection;
  _Utils.elems            = elems;

  window._Utils = _Utils;
  return _Utils;

}(jQuery, QUnit));