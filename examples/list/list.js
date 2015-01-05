(function( $ ) {
  'use strict';

  var $el = $('#actionsList'),
  actions = $el.find('.actionsList__actionbar'),
  list    = $el.find('.actionsList__group');

  // Attach selectonic 
  list
    .selectonic({
      multi: true,
      keyboard: false,
      focusBlur: false,
      selectionBlur: false,


      // Before any changes
      before: function(e) {
        if (e.target === actions[0] || $(e.target).is('button.actionsList__button')) {
          this.selectonic('cancel');
        }
      },


      // When one or more items selectes
      select: function() {
        toggleActions(false);
        this.selectonic('option', 'keyboard', true);
      },


      // When all items clears selection
      unselectAll: function() { toggleActions(true); }
    });

  $el
    .on('focusin', onFocusin)
    .on('focusout', onFocusout);


  actions.on('click', 'button', function() {
    // Get selected items from list
    doAction( list.selectonic('getSelected') );
  });


  function onFocusin () {
    list.selectonic('option', 'keyboard', true);
    $el.addClass('focused');
  }


  function onFocusout () {
    list.selectonic('option', 'keyboard', false);
    $el.removeClass('focused');
  }


  function toggleActions (state) {
    if (state === void 0) {
      actions.toggleClass('disabled');
    } else {
      actions.toggleClass( 'disabled', state );
    }
  }


  function doAction (items) {
    items.each(function(index, el) {
      var $el = $(el);
      $el.addClass('animate');
      setTimeout(function() {
        $el.removeClass('animate');
      }, 300);
    });
  }


  toggleActions(true);

})( jQuery );