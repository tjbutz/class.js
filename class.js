/*! class.js v0.8.0 https://github.com/tjbutz/class.js | License: https://github.com/tjbutz/class.js/blob/master/LICENSE */

(function() {
  "use strict";
  var root = this;

  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) root._ = _ = require('underscore');

  var _Class = root.Class;

  var Class;
  if (typeof exports !== 'undefined') {
    Class = exports;
  } else {
    Class = root.Class = {};
  }

  Class.VERSION = '0.8.0';
  Class.root = root;
  Class.useName = true;

  Class.noConflict = function() {
    root.Class = _Class;
    return this;
  };

  var TempConstructor = function() {};
  var invalidName = /\(/g;

  _.extend(Class, {
    
    // Extension point for the class definition
    definition : [],

    define : function(name, superClass, definition) {
      
      // map params
      if (name && !_.isString(name)) {
        if (_.isFunction(name)) {
          definition = superClass;
          superClass = name;
        } else {
          definition = name;
        }
        name = null;
      }

      if (superClass && !_.isFunction(superClass)) {
        definition = superClass;
        superClass = null;
      }

      Class.onBeforeClassDefine && Class.onBeforeClassDefine(superClass, definition);

      // constructor
      var constructor = null;
      if (definition && definition.hasOwnProperty("constructor")) {
        constructor =  definition.constructor;
        delete definition.constructor;
      }

      // use clazz instead of class as it is a reserved keyword
      var clazz = function() {
        if (!(this instanceof clazz)) {
          throw new Error("Use new keyword to create a new instance or call/apply class with right scope");
        }
        Class.onBeforeInstantiation && Class.onBeforeInstantiation(this);
        
        // remember the current super property
        var temp = this.__super__;
        // set the right super class prototype
        this.__super__ = superClass;

        // call the right constructor
        if (constructor) {
          constructor.apply(this, arguments);
        } else if (superClass) {
          superClass.apply(this, arguments);
        }
        // reset the current super property
        this.__super__ = temp;
        Class.onAfterInstantiation && Class.onAfterInstantiation(this);
      };

      // if it is a named class we need a trick to get a named function
      // clazz.name = name does not work
      if (name && Class.useName) {
        // Check for a valid name so that no one can abuse the name...
        if (!name.match(invalidName)) {
          // create a named function that wraps the constructor 
          // and call it directly with the constructor as argument.
          clazz = new Function("constructor", "return function " + name + "() { constructor.apply(this, arguments); };")(clazz);  
        } else {
          throw new Error("Wrong name for class: " + name);
        }
      }

      // inheritance
      if (superClass) {
        // use the temp constr to avoid cunstructor call of super class
        TempConstructor.prototype = superClass.prototype;
        // inherit
        clazz.prototype = new TempConstructor();
        // fix the constructor
        clazz.prototype.constructor = clazz;
        // remember the super class for calls in overridden methods
        clazz.prototype.__super__ = superClass.prototype;
      }

      // add definition
      // definitons are called in order they were added
      if (definition) {
        _.each(this.definition, function(key) {
          if (!_.isUndefined(definition[key])) {
            this[key].call(this, clazz, definition[key]);
            delete definition[key]; // Clean up memory
          }
        }, this);
        if (_.keys(definition).length !== 0) {
          throw new Error("Unknown key in definition: " + _.keys(definition).join(", ") + ". Allowed keys are: " + this.definition.join(", ")); 
        }     
      }

      // wrap functions to set the right super property
      if (superClass) {
        var proto = clazz.prototype;
        for (var name in proto) {
          var func = proto[name];
          var superFunc = superClass.prototype[name];
          if (_.isFunction(func) && _.isFunction(superFunc)) {
            proto[name] = (function(name, func) {
              return function() {
                // remember the current super property
                var temp = this.__super__;
                // set the right super class prototype
                this.__super__ = superClass.prototype;
                var value = func.apply(this, arguments);
                // reset the current super property
                this.__super__ = temp;
                return value;
              };
            })(name, func);
          }
        }
      }

      // provide extend method for inheritance
      clazz.extend = this._extend;

      Class.onAfterClassDefine && Class.onAfterClassDefine(clazz);

      return clazz;
    },
    
    
    _extend : function(name, definition) {
      return Class.define(name, this, definition);
    }
  });

}).call(this);
(function() {
  "use strict";
  var Class = this.Class || exports;
  var _ = this._;

  Class.definition.push("namespace");
  Class.namespace = function(clazz, namespace, context) {
    if (_.isString(clazz)) {
      var tempClass = namespace;
      namespace = clazz;
      clazz = tempClass;
    }
    namespace = namespace.split(".");
    var root = context || this.root;
    if (namespace.length > 0) {
      var className = namespace.pop();
      _.each(namespace, function(part) {
        root = root[part] = root[part] || {};        
      });
      root[className] = clazz;
    }
    return clazz;
 };
}).call(this);
(function() {
  "use strict";
  var Class = this.Class || exports;
  var _ = this._;

  Class.definition.push("singleton");
  Class.singleton = function(clazz, isSingleton) {
   if (isSingleton) {
     clazz.$$instance = null;
     clazz.getInstance = function() {
       return this.$$instance || (this.$$instance = new this());
     };
   }
  };
}).call(this);
(function() {
  "use strict";
  var Class = this.Class || exports;
  var _ = this._;

  Class.definition.push("statics");
  Class.statics = function(clazz, statics) {
   _.extend(clazz, statics);
  };
}).call(this);
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
(function() {
  "use strict";
  var Class = this.Class || exports;
  var _ = this._;

  Class.definition.push("mixins");
  Class.mixins = function(clazz, mixins) {
    _.each(mixins, function(obj) {
      var obj = _.isFunction(obj) ? obj.prototype : obj;
      _.extend(clazz.prototype, obj);
    });
  };
 }).call(this);
(function() {
  "use strict";
  var Class = this.Class || exports;
  var _ = this._;

  Class.definition.push("members");
  Class.members = function(clazz, members) {
   _.extend(clazz.prototype, members);
  };
}).call(this);
(function() {
  "use strict";
  var Class = this.Class || exports;
  var _ = this._;

  Class.definition.push("interfaces");
  Class.interfaces = function(clazz, interfaces) {
   _.each(interfaces, function(inter) {
     var inter = _.isFunction(inter) ? inter.prototype : inter;
     for (var name in inter) {
       var method = clazz.prototype[name];
       if (_.isUndefined(method) || !_.isFunction(method)) {
         throw new Error('The Class does not implement the interface method "' + method + '"');
       } else if (_.isFunction(inter[name])) {
         clazz.prototype[name] = wrap(inter[name], method);
       }        
     }
   });
  };

  var wrap = function(inter, method) {
    return function() {
      inter.apply(this, arguments);
      return method.apply(this, arguments);
    };
  };
}).call(this);