/**
 * class.js v0.2.1-pre
 * https://github.com/tjbutz/class.js
 *
 * (c) 2012 Tino Butz
 * class.js may be freely distributed under the MIT license.
 *
 * License: https://github.com/tjbutz/class.js/LICENSE
 */
(function() {
  var root = this;

  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  var _Class = root.Class;

  var Class;
  if (typeof exports !== 'undefined') {
    Class = exports;
  } else {
    Class = root.Class = {};
  }

  Class.VERSION = '0.2.1-pre';
  Class.root = root;

  Class.noConflict = function() {
    root.Class = _Class;
    return this;
  };


  var tempConstructor = function() {};

  _.extend(Class, {
    
    definition : {},

    types : {
      "String" : _.isString,
      "Number" : _.isNumber,
      "Boolean" : _.isBoolean,
      "Array" : _.isArray,
      "Function" : _.isFunction,
      "Object" : _.isObject,
      "Element" : _.isElement,
      "Regex" : _.isRegExp
    },

    _extend : function(definition) {
      return Class.define(this, definition);
    },


    define : function(superClass, definition) {
      if (!_.isFunction(superClass)) {
        definition = superClass;
        superClass = null;
      }

      // constructor
      var constructor = definition && definition.hasOwnProperty("constructor") ? definition.constructor : null;
      var clazz = function() {
        if (!(this instanceof clazz)) {
          throw new Error("Use new keyword to create a new instance or call/apply class with right scope");
        }
        if (constructor) {
          constructor.apply(this, arguments);
        } else if (superClass) {
          superClass.apply(this, arguments);
        }
      };

      // inheritance
      if (superClass) {
        // use the temp constr to avoid cunstructor call of super class
        tempConstructor.prototype = superClass.prototype;
        // inherit
        clazz.prototype = new tempConstructor();
        // fix the constructor
        clazz.constructor = clazz;
        // remember the super class for calls in overridden methods
        clazz.prototype.__super__ = superClass.prototype;
      }

      // add error handler
      clazz.prototype.$$error = Class.error;

      // add definition
      for (var key in definition) {
        if (typeof this.definition[key] !== "undefined") {
          this.definition[key].call(this, clazz, definition[key]);
        } else {
          throw new Error("Unknown key in definition: " + key + ". Allowed keys are: " + _.keys(this.definition).join(", "));
        }
      }

      // provide extend method for inheritance
      clazz.extend = this._extend;

      // provide instance of check
      clazz.prototype.instanceOf = this._instanceOf;

      return clazz;
    },


    error : function(error) {
      throw error;
    },
    
    
    _forProto : function(clazz, definition, handler, scope) {
      _.each(definition, function(obj) {
        var obj = _.isFunction(obj) ? obj.prototype : obj;
        handler.call(scope, obj);
      });
    },
    
    
    _instanceOf : function(obj) {
      return this instanceof obj;
    }
  });

}).call(this);

// =====================================
//  PLUGINS
// =====================================
//  You can customize this file by
//  removing plugins below this section
// =====================================


// =====================================
//  NAMESPACE PLUGIN
// =====================================
(function() {
  var root = this;
  var _ = root._;
  var Class = root.Class;

  Class.definition["namespace"] = Class.namespace = function(clazz, namespace) {
    if (_.isString(clazz)) {
      var tempClass = namespace;
      namespace = clazz;
      clazz = tempClass;
    };
    namespace = namespace.split(".");
    var root = this.root;
    if (namespace.length > 0) {
      var className = namespace.pop();
      for (var i=0, l = namespace.length; i < l; i++) {
        var part = namespace[i];
        root = root[part] = root[part] || {};
      }
      root[className] = clazz;
    }
    return clazz;
 };
}).call(this);


// =====================================
//  SINGLETON PLUGIN
// =====================================
(function() {
  var root = this;
  var _ = root._;
  var Class = root.Class;

  Class.definition["singleton"] = Class.singleton = function(clazz, isSingleton) {
    if (isSingleton) {
      clazz.$$instance = null;
      clazz.getInstance = function() {
        return this.$$instance || (this.$$instance = new this());
      };
    }
  };
}).call(this);


// =====================================
//  MIXINS PLUGIN
// =====================================
(function() {
  var root = this;
  var _ = root._;
  var Class = root.Class;

  Class.definition["mixins"] = Class.mixins = function(clazz, mixins) {
    this._forProto(clazz, mixins, function(mixin) {
      _.extend(clazz.prototype, mixin);
    });
  };
}).call(this);


// =====================================
//  INTERFACES PLUGIN
// =====================================
(function() {
  var root = this;
  var _ = root._;
  var Class = root.Class;

  Class.definition["interfaces"] = Class.interfaces = function(clazz, interfaces) {
    this._forProto(clazz, interfaces, function(inter) {
      for (var member in inter) {
        if (!clazz.prototype[member]) {
          throw new Error('The Class does not implement the interface member "' + member + '"');
        }
      }
    });
  };
}).call(this);


// =====================================
//  MEMBERS PLUGIN
// =====================================
(function() {
  var root = this;
  var _ = root._;
  var Class = root.Class;

  Class.definition["members"] = Class.members = function(clazz, members) {
    _.extend(clazz.prototype, members);
  };
}).call(this);


// =====================================
//  STATICS PLUGIN
// =====================================
(function() {
  var root = this;
  var _ = root._;
  var Class = root.Class;

  Class.definition["statics"] = Class.statics = function(clazz, statics) {
    _.extend(clazz, statics);
  };
}).call(this);


// =====================================
//  PROPERTIES PLUGIN
// =====================================
(function() {
  var root = this;
  var _ = root._;
  var Class = root.Class;

  Class.definition["properties"] = Class.properties = function(clazz, properties) {
    for (var property in properties) {
      createProperty(clazz, property, properties[property]);
    }

    // add batch property set method
    clazz.prototype.set = createGenericSetter("set");
    clazz.prototype._set = createGenericSetter("_set");
  };


  var createGenericSetter = function(prefix) {
    return function(properties, value, fireEvent) {
      if (_.isString(properties)) {
        var property = properties;
        properties = {};
        properties[property] = value;
      } else {
        fireEvent = fireEvent || value;
      }
      for (var property in properties) {
        var prop = firstUp(property);
        var setter = prefix + prop;
        if (this[setter]) {
          this[setter](properties[property], fireEvent);
        } else {
          throw new Error('No public set method for property "' + property + '" found.');
        }

      }
      return this;
    };
  };


  var createProperty = function(clazz, property, definition) {
    // When the definition is not an object it is a type definition
    if (!_.isObject(definition)) {
      definition = {
        type : definition
      }
    }

    var setter = getPropertyMethodName(property, definition, "set");
    var getter = getPropertyMethodName(property, definition, "get");

    // add setter
    clazz.prototype[setter] = createSetter(property, definition, getter, setter);

    // add getter
    clazz.prototype[getter] = createGetter(property, definition, getter, setter)

    // add "is" function for boolean
    if (definition.type === "Boolean") {
      var is = getPropertyMethodName(property, definition, "is");
      clazz.prototype[is] = createIs(property, definition, getter, setter);
    }
  };


  var getPropertyMethodName = function(property, definition, method) {
    var prop = firstUp(property);

     // define getter function name
     name = method + prop;
     if (definition[method === "is" ? "get" : method] === false) {
       name = "_" + name;
     }

     return name;
   };


  var createGetter = function(property, definition, getter, setter) {
    return function() {
      this.$$properties = this.$$properties || {};

      if (typeof definition.init !== "undefined") {
        var init = definition.init;
        delete definition.init;
        this[setter](init);
      }

      return this.$$properties[property];
    };
  };


  var createSetter = function(property, definition, getter, setter) {
    return function(value, fireEvent) {
      fireEvent = fireEvent === false ? false : true;

      var old = this[getter]();

      // add format function
      if (definition.format) {
        var func = _.isString(definition.format) ? this[definition.format] : definition.format;
        if (func) {
          value = func.call(this, value, old, property);
        } else {
          throw new Error('Format method "' + definition.format + '" for property "' + property + '" not available.');
        }
      }

      // add type check
      var type = definition.type;
      var skip = _.isNull(value) && definition.nullable === true
      if (!skip && type) {
        var assert = _.isFunction(type) ? this.instanceOf : Class.types[type];
        if (assert) {
          if (!assert.call(this, value)) {
            var msg = 'Wrong type for property "' + property + '". Expected value "' + value + '" to be of type "' + type + '" but found: ' + (typeof value);
            msg += '. Allowed keys are: ' + _.keys(Class.types).join(", ");
            var error = new Class.TypeError(msg, property, value, type);
            this.$$error.call(this, error);
            return;
          }
        } else {
          throw new Error('Unknown type "' + type +'" for property "' + property + '".');
        }
      }

      // add validate function
      var validate = definition.validate;
      if (validate) {
        // Autobox validate
        if (!_.isArray(validate)) {
          validate = [validate];
        }

        _.each(validate, function(validator) {
          validator = _.isString(validator) ? this[validator] : validator;
          if (validator) {
            var check = validator.call(this, value, old, property);
            // Feature: when a string is returned, validation is failed and we use it as the error message
            var isString = _.isString(check);
            if (!check || isString) {
              var msg = isString ? check : 'Validation for property "' + property + '" with value "' + value + '" failed';
              this.$$error.call(this, new Class.ValidationError(msg, property, value));
              return;
            }
          } else {
            throw new Error('Validation method "' + definition.validate + '" for property "' + property + '" not available.');
          }
        }, this);
      }

      // set value
      this.$$properties[property] = value;

      // add apply method
      if (definition.hasOwnProperty("apply")) {
        var func = _.isString(definition.apply) ? this[definition.apply] : definition.apply;
        if (func) {
          func.call(this, value, old, property);
        } else {
          throw new Error('Apply method "' + definition.apply + '" for property "' + property + '" not available.');
        }
      }

      // add event
      if (definition.event && fireEvent) {
        var emit = this.trigger || this.emit;
        if (emit) {
          emit.call(this, definition.event, {
            target : this,
            value : value,
            old : old,
            property : property
          });
        } else {
          throw new Error("Object does not support events");
        }
      }
      return value;
    };
  };

  var createIs = function(property, definition, getter, setter) {
    return function() {
      return this[getter]();
    };
  };

  var ValidationError = Class.ValidationError = Class.define(Error, {
    constructor : function(message, property, value) {
      this.name = "ValidationError";
      this.message = message || "Validation Error";
      this.property = property;
      this.value = value;
    }
  });


  var TypeError = Class.TypeError = ValidationError.extend({
    constructor : function(message, property, value, type) {
      ValidationError.apply(this, arguments);

      this.name = "TypeError";
      this.message = message || "Type Error";
      this.type = type;
    }
  });
  
  
  var firstUp = function(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
  };
}).call(this);