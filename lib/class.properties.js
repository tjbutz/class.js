(function() {
  "use strict";
  var Class = this.Class || exports;
  var _ = this._;

  Class.ECMA5 = false;

  Class.types = {
    "String" : _.isString,
    "Number" : _.isNumber,
    "Boolean" : _.isBoolean,
    "Array" : _.isArray,
    "Function" : _.isFunction,
    "Object" : _.isObject,
    "Element" : _.isElement,
    "Date" : _.isDate,
    "Regex" : _.isRegExp
  };

  Class.definition.push("properties");
  Class.properties = function(clazz, properties) {
    for (var property in properties) {
      createProperty(clazz, property, properties[property]);
    }

    // add batch property set method
    var proto = clazz.prototype;
    proto.set = createGenericSetter("");
    proto._set = createGenericSetter("_");
  };


  var createGenericSetter = function(visibility) {
    return function(properties, value) {
      if (_.isString(properties)) {
        var property = properties;
        properties = {};
        properties[property] = value;
      }
      for (var property in properties) {
        var setter = getPropertyMethodName("set", property, visibility);
        if (!_.isUndefined(this[setter])) {
          set(this, setter, properties[property]);
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
      };
    }

    // add setter & getter
    var setter = getPropertyMethodName("set", property, getPropertyVisibility("set", definition));
    var getter = getPropertyMethodName("get", property, getPropertyVisibility("get", definition));

    var proto = clazz.prototype;
    if (!Class.ECMA5) {
      proto[setter] = createSetter(property, definition, getter, setter);
      proto[getter] = createGetter(property, definition, getter, setter);
    } else {
      proto.__defineSetter__(setter, createSetter(property, definition, getter, setter));  
      proto.__defineGetter__(getter, createGetter(property, definition, getter, setter));
    }

    // add "is" function for boolean
    if (definition.type === "Boolean") {
      var is = getPropertyMethodName("is", property, getPropertyVisibility(definition, "is"));
      proto[is] = createIs(getter);
    }
  };


  var getPropertyMethodName = function(method, property, visibility) {
    return (!Class.ECMA5 || method === "is") ? (visibility + method + firstUp(property)) : (visibility + property);
  };
  

  var getPropertyVisibility = function(method, definition) {
    return definition[method === "is" ? "get" : method] === false ? "_" : "";
  };


  var createGetter = function(property, definition, getter, setter) {
    return function() {
      this.$$properties = this.$$properties || {};

      if (!_.isUndefined(definition.init)) {
        var init = definition.init;
        delete definition.init;
        set(this, setter, init);
      }

      return this.$$properties[property];
    };
  };

  var set = function(obj, setter, value) {
    !Class.ECMA5 ? obj[setter](value) : (obj[setter] = value);
  };

  var get = function(obj, getter) {
    return !Class.ECMA5 ? obj[getter]() : obj[getter];
  };

  var createSetter = function(property, definition, getter, setter) {
    return function(value) {
      
      var old = get(this, getter);

      // add format function
      if (definition.format) {
        var format = getMethod(this, definition.format);
        if (format) {
          value = format.call(this, value, old, property);
        } else {
          throw new Error('Format method "' + definition.format + '" for property "' + property + '" not available.');
        }
      }

      // Do not set the same value twice
      if (old === value) {
        return;
      }

      // add type check
      var type = definition.type;
      var skip = _.isNull(value) && definition.nullable === true;
      if (!skip && type) {
        var assert = _.isFunction(type) ? instanceOf : Class.types[type];
        if (assert) {
          if (!assert.call(this, value)) {

            var msg = 'Wrong type for property "' + property + '". Expected value "' + value + '" to be of type "' + type + '" but found: ' + (typeof value);
            msg += '. Allowed keys are: ' + _.keys(Class.types).join(", ");
            throw new Class.TypeError(msg, property, value, type);
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
          validator = getMethod(this, validator);
          if (validator) {
            var check = validator.call(this, value, old, property);
            // Feature: when a string is returned, validation is failed and we use it as the error message
            var isString = _.isString(check);
            if (!check || isString) {
              var msg = isString ? check : 'Validation for property "' + property + '" with value "' + value + '" failed';
              throw new Class.ValidationError(msg, property, value);
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
        var apply = getMethod(this, definition.apply);
        if (apply) {
          apply.call(this, value, old, property);
        } else {
          throw new Error('Apply method "' + definition.apply + '" for property "' + property + '" not available.');
        }
      }

      // add event
      if (definition.event) {
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


  var getMethod = function(obj, method) {
    return _.isString(method) ? obj[method] : method;
  };


  var createIs = function(getter) {
    return function() {
      return get(this, getter);
    };
  };

  var ValidationError = Class.ValidationError = Class.define("ValidationError", Error, {
    constructor : function(message, property, value) {
      this.name = "ValidationError";
      this.message = message || "Validation Error";
      this.property = property;
      this.value = value;
    }
  });


  var TypeError = Class.TypeError = ValidationError.extend("TypeError", {
    constructor : function(message, property, value, type) {
      ValidationError.apply(this, arguments);

      this.name = "TypeError";
      this.message = message || "Type Error";
      this.type = type;
    }
  });

  var instanceOf = function(obj) {
    return this instanceof obj;
  };

  var firstUp = function(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
  };
}).call(this);