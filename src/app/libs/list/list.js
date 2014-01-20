(function( $, window ) {
  'use strict';

  var
  $el     = $('.b-select'),
  list    = $el.find('.select-group'),
  actions = $el.find('.actionbar');

  list.selectonic({
    multi: true,
    keyboard: true,
    focusBlur: true,
    selectionBlur: true,

    before: function(e) {
      if (e.target === actions[0] || $(e.target).is('.actionbar button')) {
        this.selectonic('cancel');
      }
    },
    select: function() {
      toggleActions(false);
    },
    unselectAll: function() {
      toggleActions(true);
    }

  });

  actions.on('click', 'button', function(event) {
    event.preventDefault();
    doAction( list.selectonic('getSelected') );
    this.blur();
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

})( jQuery, window );




