(function( $ ) {
  'use strict';

  var $el = $('#actions-list'),
  actions = $el.find('.actions-list__actionbar'),
  list    = $el.find('.actions-list__group');

  // Attach selectonic 
  list
    .selectonic({
      multi: true,
      keyboard: true,
      focusBlur: false,
      selectionBlur: false,


      // Before any changes
      before: function(e) {
        if (e.target === actions[0] || $(e.target).is('button.actions-list__button')) {
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
    })
    .selectonic('disable');

  $el
    .on('focusin', function (e) {
      list.selectonic('enable');
    })
    .on('focusout', function() {
      list.selectonic('disable');
    });


  actions.on('click', 'button', function() {
    // Get selected items from list
    doAction( list.selectonic('getSelected') );
  });


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