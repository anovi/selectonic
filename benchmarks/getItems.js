(function( $, Benchmark ) {

var _getItems = function( params, target, elem ) {
    var items;

    switch( target ) {
    case 'next':
    case 'prev':
      var
      item = elem.jquery ? elem : $( elem ),
      find = $.fn[target];

      while (true) {
        item = find.call( item );
        if ( item.length === 0 ) { break; }
        // Set context, because old (< 1.10.0) versions of jQuery gives wrong result.
        item.context = window.document;
        if ( item.is(this.options.parentSelector) ) { return item; }
      }
      return null;
    
    case 'pageup':
    case 'pagedown':
      var
        box           = this._scrolledElem || this.el,
        boxViewHeight = box.clientHeight,
        winViewHeight = $( window ).outerHeight(),
        $current      = $( elem ),
        isBoxBigger   = boxViewHeight > winViewHeight,
        pageHeight    = isBoxBigger ? winViewHeight : boxViewHeight,
        itemHeight    = $current.outerHeight(),
        currentHeight = itemHeight,
        itemsHeight   = itemHeight,
        direction     = (target === 'pageup') ? 'prev' : 'next',
        $candidate, candHeight;

      while( true ) {
        $candidate = this._getItems( params, direction, $current );
        if ( !$candidate && $current.is( elem ) ) { break; } else if ( !$candidate ) { return $current; }
        
        candHeight = $candidate.outerHeight();
        itemsHeight = itemsHeight + candHeight;
        
        if ( itemsHeight > pageHeight ) {
          // If two items bigger than page than it just will give next item
          if ( currentHeight + candHeight > pageHeight ) { return $candidate; }
          return $current;
        }
        currentHeight = candHeight;
        $current = $candidate;
      }
      return null;

    default:
      items = params.allItems ? params.allItems : this.$el.find( this.options.filter );
      params.allItems = items;
      return items;
    }
  };

var _getItemsB = function( params, target, elem ) {
    var items;

    switch( target ) {
    case 'pageup':
    case 'pagedown':
      var
        box           = this._scrolledElem || this.el,
        boxViewHeight = box.clientHeight,
        winViewHeight = $( window ).outerHeight(),
        $current      = $( elem ),
        isBoxBigger   = boxViewHeight > winViewHeight,
        pageHeight    = isBoxBigger ? winViewHeight : boxViewHeight,
        itemHeight    = $current.outerHeight(),
        currentHeight = itemHeight,
        itemsHeight   = itemHeight,
        direction     = (target === 'pageup') ? -1 : 1,
        allItems      = this._getItems( params ),
        $candidate, candHeight, currentIndex, elemIndex, cand;

        elemIndex = currentIndex = allItems.index( elem );
        params.rangeStart = elemIndex;

      while( true ) {
        currentIndex = currentIndex + direction;
        cand = currentIndex >= 0 ? allItems.eq( currentIndex ) : null;
        $candidate = cand && cand.length > 0 ? cand : null;

        if ( !$candidate && $current.is( elem ) ) { break; } else if ( !$candidate ) {
          params.rangeEnd = currentIndex - direction;
          return $current;
        }
        
        candHeight = $candidate.outerHeight();
        itemsHeight = itemsHeight + candHeight;
        
        if ( itemsHeight > pageHeight ) {
          // If two items bigger than page than it just will give next item
          if ( currentHeight + candHeight > pageHeight ) {
            params.rangeEnd = currentIndex;
            return $candidate;
          }
          params.rangeEnd = currentIndex - direction;
          return $current;
        }
        currentHeight = candHeight;
        $current = $candidate;
      }
      return null;

    default:
      items = params.allItems ? params.allItems : this.$el.find( this.options.filter );
      params.allItems = items;
      return items;
    }
  };



  /*
  *
  * Prepare DOM
  *
  */
  (function() {
    var items = 50,
    listWrappers = 20,
    inItemWrappers = 20;

    var box, str = '', res;
    for (var a = 0; a < listWrappers; a++) { 
      str += a === listWrappers-1 ? '<div id="deepDiv">' : '<div>';
    }
    str +='<ul id=\"sublist\" class="j-selectable scrollable"></ul>';
    for (a = 0; a < listWrappers; a++) { str += '</div>'; }
    res = $( str );

    box = res.find( '#sublist' );
    for (var i = 0; i < items; i++) {
      str = '<li id=\"elem' + i + '\">';
      for (var c = 0; c < inItemWrappers; c++) { str += '<span>'; }

      str += '<span class=\"handle\"><input type=\"checkbox\"></span>' +
          '<span class=\"text\">Item ' + i + '</span>';
      
      for (var x = 0; x < inItemWrappers; x++) { str += '</span>'; }
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
  mainList = $mainList[0],
  elem = $('li:eq(0)')[0],
  dummy = {
    _scrolledElem: mainList,
    options: {
      parentSelector: '.j-selectable > *',
      filter: '> *'
    },
    el: mainList,
    $el: $mainList,
    _getItems: _getItems
  };
  $mainList.context = window.document;

  // console.log( _getItemsB.call( dummy, {}, 'pagedown', elem ) );


  /*
  *
  * Define test suite
  *
  */
  var suite = new Benchmark.Suite();

  suite.add('pageDown with getItems next', {
    'fn': function() {
      _getItems.call( dummy, {}, 'pagedown', elem );
    }
  });

  suite.add('pageDown with getItems all', {
    'fn': function() {
      _getItemsB.call( dummy, {}, 'pagedown', elem );
    }
  });

  suite.run({ 'async': true });




})( jQuery, Benchmark );