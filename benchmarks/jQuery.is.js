(function( $, Benchmark ) {

  $('#list').selectonic({
    filter: 'li:odd'
  });

  var suite = new Benchmark.Suite();
  var res, elem;

  suite.add('Wraped elem with context setted.', {
    'fn': function( ) {
      elem = $( document.getElementsByTagName("li")[1] );
      elem.context = window.document;
      res = res && elem.is('.j-selectable li:odd');
    },
    onStart: function() {
      res = true;
    }
  });

  suite.add('Wraped elem without context.', {
    'fn': function( ) {
      elem = $( document.getElementsByTagName("li")[1] );
      res = res && elem.is('.j-selectable li:odd');
    },
    onStart: function() {
      res = true;
    }
  });

  suite.add('Selector with context setted.', {
    'fn': function( ) {
      elem = $( 'li:eq(1)' );
      elem.context = window.document;
      res = res && elem.is('.j-selectable li:odd');
    },
    onStart: function() {
      res = true;
    }
  });

  suite.add('Selector without context setted.', {
    'fn': function( ) {
        elem = $( 'li:eq(1)' );
        res = res && elem.is('.j-selectable li:odd');
    },
    onStart: function() {
      res = true;
    }
  });


  suite.run({ 'async': true });



})( jQuery, Benchmark );