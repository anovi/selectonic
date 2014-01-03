(function( $, Benchmark ) {


  var $results = $("#results"),


  // say = function( text ) {
  //   var row = $('<div>');
  //   row.html( text );
  //   $results.append( row );
  // },


  watch = function( benchmark) {
    var box = $('<div id=' + benchmark.id + '>'), cycles;

    box.html( '<h2>' + benchmark.name + '</h2>' );
    box.append('<div class=\"cycles\"></div>');
    cycles = box.find('.cycles');
    $results.append( box );

    benchmark.on( 'start', function( ) {
      box.append( '<div>Starting...</div>' );
    });

    benchmark.on( 'complete', function( event ) {
      box.append( String(event.target) );
      box.append( '<div>Complete!</div>' );
    });
    
    benchmark.on( 'cycle', function() {
      // cycles.html( 'Cycles ran: ' +  this.cycle );
    });

    benchmark.setFastest = function() {
      box.find('h2').append('<span class=fastest>Fastest</span>');
    };
  };


  var Suite = Benchmark.Suite;
  Benchmark.Suite = function() {
    var args = Array.prototype.slice.call( arguments ),
    suite = Suite.apply( Benchmark, args );
    
    suite.on('complete', function() {
      this.filter('fastest').forEach( function( testCase ) {
        testCase.setFastest();
      });
    });

    return suite;
  };


  var _run = Suite.prototype.run;
  Suite.prototype.run = function() {
    var args = Array.prototype.slice.call(arguments);
    this.forEach( function( testCase ) {
      watch( testCase );
    });

    return _run.apply( this, args );
  };



})( jQuery, Benchmark  );