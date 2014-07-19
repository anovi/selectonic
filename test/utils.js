(function( $, QUnit ) {

  var body = $(window.document);

  // For IE compatibility
  if (typeof Array.prototype.indexOf === 'undefined') {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
      if (!this) { throw new TypeError(); }
      fromIndex = isNaN( fromIndex = +fromIndex ) ? 0 : fromIndex;

      var length = this.length;
      if ( length === 0 || fromIndex >= length ) { return -1; }
      if ( fromIndex < 0 ) { fromIndex += length; }

      while (fromIndex < length) {
        if ( this[fromIndex] === searchElement ) { return fromIndex; }
        ++fromIndex;
      }
      return -1;
    };
  }

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
    e.which = 1;
    if (mode === 'meta' || mode === 'ctrl') { e.metaKey = true; } else if (mode === 'shift') { e.shiftKey = true; }
    this.trigger( e );
    return this;
  };

  $.fn.triggerMouseup = function(mode) {
    var e = $.Event( "mouseup" );
    e.which = 1;
    if (mode === 'meta' || mode === 'ctrl') { e.metaKey = true; } else if (mode === 'shift') { e.shiftKey = true; }
    this.trigger( e );
    return this;
  };

  jQuery.fn.triggerClick = function() {
    this.triggerMousedown();
    this.triggerMouseup();
    var e = $.Event( "click" );
    e.which = 1;
    this.trigger( e );
    return this;
  };


  // Keyboard keys triggers
  var keys = {
    "up"        : 38,
    "down"      : 40,
    "page-up"   : 33,
    "page-down" : 34,
    "home"      : 36,
    "end"       : 35,
    "shift"     : 16,
    "space"     : 32,
    "enter"     : 13,
    "ctrl"      : 17,
    "a"         : 65
  };

  var type = function (str) {
    var e = $.Event( "keydown" ), keyEvn;
    var tokens = str.match( /([a-z]|-)+/ig ), k;
    for (var i = 0; i < tokens.length; i++) {
      k = tokens[i];
      if ( ['shift', 'ctrl'].indexOf(k) >= 0 ) {
        type.modes[k] = true;
        keyEvn = $.Event( "keydown" );
        keyEvn.which = keys[k];
        body.trigger(keyEvn);
      } else if ('shift-up' === k) {
        delete type.modes.shift;
        keyEvn = $.Event( "keyup" );
        keyEvn.which = 16;
        body.trigger(keyEvn);
      } else if ('ctrl-up' === k) {
        delete type.modes.ctrl;
        keyEvn = $.Event( "keyup" );
        keyEvn.which = 17;
        body.trigger(keyEvn);
      } else {
        if (type.modes.ctrl) { e.ctrlKey = true; }
        if (type.modes.shift) { e.shiftKey = true; }
        if (keys[k] === void 0) {throw new Error('There is no such key: ' + k);}
        e.which = keys[k];
        body.trigger(e);
      }
    }
  };

  type.modes = {};


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
  _Utils.type             = type;

  window._Utils = _Utils;
  return _Utils;

}(jQuery, QUnit));