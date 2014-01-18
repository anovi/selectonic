(function(window) {
  'use strict';

  function Options ( schema, initial ) {
    if ( typeof schema !== 'object' ) { throw new TypeError('First argument must be an object with scheme of default options.'); }
    this._schema    = schema;
    this._options   = {};
    this._callbacks = {};
    this.set( initial, true );
    return this;
  }

  Options.extend = function() {
    var target = arguments[0],
    args = Array.prototype.slice.call(arguments), source;
    args.shift();
    for (var i = 0; i < args.length; i++) {
      source = args[i];
      for ( var key in source ) { target[key] = source[key]; }
    }
    return target;
  };

  Options.prototype.set = function( obj, isNew ) {
    var schema = this._schema,
    newOptions = {},
    defaults = {},
    option, callback;
    obj = obj || {};

    // Check options
    for ( option in obj ) {
      var val = obj[ option ],
      defOption = schema[ option ],
      isSameType = typeof val === defOption.type || (val === null && defOption.nullable);

      if ( defOption !== void 0 ) {
        // unchangeable
        if ( defOption.unchangeable && !isNew ) {
          throw new Error( 'Option \"' + option + '\" could be setted once at the begining.' );
        }
        // wrong type
        if ( !isSameType ) {
          var msg = 'Option \"' + option + '\" must be ' + defOption.type + (defOption.nullable ? ' or null.' : '.');
          throw new TypeError( msg );
        }
        // out of values
        if ( defOption.values && defOption.values.indexOf(val) < 0 ) {
          throw new RangeError( 'Option \"' + option + '\" only could be in these values: \"' + defOption.values.join('\", \"') + '\".' );
        }
      }
    }
    // Create new options object
    for ( option in schema ) {
      if ( schema[option].default !== void 0 ) { defaults[option] = schema[option].default; }
    }
    newOptions = isNew ? Options.extend( newOptions, defaults, obj ) : Options.extend( newOptions, obj );
    // Callbacks
    for ( option in newOptions ) {
      if ( (callback = this._callbacks[option]) ) {
        newOptions[option] = callback.call( this, newOptions[option] );
      }
    }
    this._options = newOptions;
  };

  Options.prototype.get = function( opt ) {
    return opt ? this._options[ opt ] : Options.extend( {}, this._options );
  };

  Options.prototype.on = function( option, cb ) {
    this._callbacks[ option ] = cb;
  };

  Options.prototype.off = function( option ) {
    if ( this._callbacks[ option ] ) { delete this._callbacks[option]; }
  };


  window.SuperOptions = Options;

})(window);