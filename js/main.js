var demo = demo || {};

// Options
(function($, window) {

	demo.options = {
		event:			[ "mousedown", "click" ],
		multi:			"boolean",
		mouseMode:		[ "select", "toggle" ],
		focusBlur:		"boolean",
		selectionBlur:	"boolean",
		keyboardInput:	"boolean",
		loop:			"boolean"
	};

	// Handle
	function checkboxHandle (e) {

		var target = $(e.target),
			attr, value;

		switch ( target[0].type ) {
		case "checkbox":
				attr = target.attr("id");
				value = target.is(":checked");
				break;

		case "radio":
				attr = target.attr("name");
				value = target.next().html();
				break;
		}

		if ( attr === "handle" ) {
			value = (value) ? "li>.list-item-handle" : value;
			mainList.toggleClass( "handle", value);
			mainList.multiSelectable( "option", attr, value );

		} else {
			mainList.multiSelectable( "option", attr, value );
		}


	}

	// Attache handlers
	$(".b-options").change( checkboxHandle );

	$(".b-list").on( "selectstart", function(e) {
		e.preventDefault();
	});

})(jQuery, window);


// Methods
(function($, window) {

	$('.b-methods').click( function (e) {
		e.preventDefault();
		var target = e.target;

		if ( target.tagName === "BUTTON" ) {
			var action = $( target ).attr("data-action"),
				res;

			if ( !action ) { return; }

			switch (action) {
				case "getSelected":
					res = mainList.multiSelectable( action );
					break;
				case "getSelectedId":
					res = mainList.multiSelectable( action );
					break;
				default:
					mainList.multiSelectable( action );
					break;
			}

			if ( res ) {
				demo.log( "<div class='hr'><div>", logContainer );

				$.each( res, function(index, val) {
					var value = ( action === "getSelectedId" ) ? ("#" + val) : $( val ).find(".list-item-title").html();
					demo.log( value, logContainer );
				});
			}
		}
	});

})(jQuery, window);


// LOG
(function($, window) {

	var delay = 3000,
		panel = $('.l-plugin'),
		log = $(".b-event-log"),
		togglePanel = panel.find('.b-but-pipka'),
		container = $('.plugin-log');

	log.click( function (e) {
		e.preventDefault();

		// If panel expanded and collapse button was clicked
		if ( !panel.hasClass("j-minimized") && $(e.target).is(togglePanel) ) {
			panel.addClass("j-minimized");

		} else if ( panel.hasClass("j-minimized") ) {
			panel.removeClass("j-minimized");
		}
	});

	demo.log = function( message, container ) {

		var elem;

		elem = $( "<div>" + message + "</div>" )
				.css( "display", "none" )
				.prependTo( container )
				.slideDown( 100 );

		// ставим функцию удаления на таймер
		setTimeout(function() {

			elem.fadeOut( 500, function() {
				elem.remove();
			} );

		}, delay);
	};

})(jQuery, window);



// Scenarios
(function($, window) {

	demo.scenarios = {

		chooseEven: function() {
			mainList.multiSelectable(":even");
		},

		chooseThird: function() {
			mainList.multiSelectable("li:eq(3)");
		}
	};

	$('#chooseEven').click( demo.scenarios.chooseEven );
	$('#chooseThird').click( demo.scenarios.chooseThird );

})(jQuery, window);


