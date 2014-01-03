(function( $, Benchmark ) {



  /*
  *
  * Prepare DOM
  *
  */
  (function() {
    var box, str = '', res;
    for (var a = 0; a < 20; a++) { 
      str += a === 19 ? '<div id="deepDiv">' : '<div>';
    }
    str +='<ul id=\"sublist\" class="j-selectable"></ul>';
    for (a = 0; a < 20; a++) { str += '</div>'; }
    res = $( str );

    box = res.find( '#sublist' );
    for (var i = 0; i < 20; i++) {
      str = '<li id=\"elem' + i + '\">';
      for (var c = 0; c < 20; c++) { str += '<span>'; }

      str += '<span class=\"handle\"><input type=\"checkbox\"></span>' +
          '<span class=\"text\">Item ' + i + '</span>';
      
      for (var x = 0; x < 20; x++) { str += '</span>'; }
      str += '</li>';
      box.append( str );
    }
    $('#list').append( res );
  })();



  /*
  *
  * Define helpers
  *
  */
  var
  $mainList = $("#list #sublist"),
  mainList = $("#list #sublist")[0],
  el        = $('li:eq(0) .text')[0];

  /*
  *
  * Define test suite
  *
  */
  var suite = new Benchmark.Suite();

  suite.add('.parentNode every loop.', {
    'fn': function( ) {
      var elem = el,
        handle = null,
        $elem, target, handleElem;

      // While plugin's element or top of the DOM is achieved
      while ( elem !== null && elem !== mainList ) {
        $elem = $(elem);
        // Set context, because old (< 1.10.0) versions of jQuery gives wrong result.
        $elem.context = window.document;

        // If item matches to selector
        if( $elem.is( '.j-selectable > *' ) ) {
          target = elem;
        }
        // If handle option is ON and that elem match to handle's selector
        if( handle && $elem.is( handle ) ) {
          handleElem = elem;
        }
        // Get parent element
        elem = elem.parentNode;
      }

      // If handle option is ON and it was found
      // and item of this list was clicked
      if( handle && elem && handleElem ) {
        return target;

      // If achieved $el of this instance of plugin's object
      } else if( !handle && elem ) {
        return target;
      }
      // has not clicked any selectable items of a list
      return null;
    }
  });


  suite.add('.parent() every loop', {
    'fn': function( ) {
      var elem = el,
        handle = null,
        $elem = $(elem),
        target, handleElem;
        // Set context, because old (< 1.10.0) versions of jQuery gives wrong result.
        $elem.context = window.document;

      // While plugin's element or top of the DOM is achieved
      while ( $elem !== null && $elem.length > 0 && !$elem.is(mainList) ) {

        // If item matches to selector
        if( $elem.is( '.j-selectable > *' ) ) {
          target = $elem[0];
        }
        // If handle option is ON and that elem match to handle's selector
        if( handle && $elem.is( handle ) ) {
          handleElem = $elem[0];
        }
        // Get parent element
        $elem = $elem.parent();
      }

      // If handle option is ON and it was found
      // and item of this list was clicked
      if( handle && elem && handleElem ) {
        return target;

      // If achieved $el of this instance of plugin's object
      } else if( !handle && elem ) {
        return target;
      }
      // has not clicked any selectable items of a list
      return null;
    }
  });


  suite.add('all .parents() before loop', {
    'fn': function( ) {
      var 
        handle = null,
        elem = el,
        $elem = $(elem),
        $parents = $elem.parents(),
        length = $parents.length,
        target, handleElem, x = 0;
        // Set context, because old (< 1.10.0) versions of jQuery gives wrong result.
        $elem.context = window.document;
        
      // While plugin's element or top of the DOM is achieved
      while ( x < length && !$elem.is(mainList) ) {

        // If item matches to selector
        if( $elem.is( '.j-selectable > *' ) ) {
          target = $elem[0];
        }
        // If handle option is ON and that elem match to handle's selector
        if( handle && $elem.is( handle ) ) {
          handleElem = $elem[0];
        }
        $elem = $parents.eq( x );
        ++x;
      }

      // If handle option is ON and it was found
      // and item of this list was clicked
      if( handle && elem && handleElem ) {
        return target;

      // If achieved $el of this instance of plugin's object
      } else if( !handle && elem ) {
        return target;
      }
      // has not clicked any selectable items of a list
      return null;
    }
  });



  suite.run({ 'async': true });




})( jQuery, Benchmark );