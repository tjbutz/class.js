/*!
 * class.js v0.5.0
 * https://github.com/tjbutz/class.js
 *
 * (c) 2012 Tino Butz
 * class.js may be freely distributed under the MIT license.
 *
 * License: https://github.com/tjbutz/class.js/LICENSE
 */
(function() {
  "use strict";
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

  Class.VERSION = '0.5.0';
  Class.root = root;

  Class.noConflict = function() {
    root.Class = _Class;
    return this;
  };

  var tempConstructor = function() {};

  _.extend(Class, {
    
    // Extension point for the class definition
    definition : [],

    define : function(superClass, definition) {
      if (!_.isFunction(superClass)) {
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
        if (constructor) {
          constructor.apply(this, arguments);
        } else if (superClass) {
          superClass.apply(this, arguments);
        }
        Class.onAfterInstantiation && Class.onAfterInstantiation(this);
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

      // add definition
      // definitons are called in order they were added
      if (definition) {
        _.each(this.definition, function(key) {
          if (typeof definition[key] !== "undefined") {
            this[key].call(this, clazz, definition[key]);
            delete definition[key]; // Clean up memory
          }
        }, this);
        if (_.keys(definition).length != 0) {
          throw new Error("Unknown key in definition: " + key + ". Allowed keys are: " + this.definition.join(", ")); 
        }     
      }
      

      // provide extend method for inheritance
      clazz.extend = this._extend;

      Class.onAfterClassDefine && Class.onAfterClassDefine(clazz);

      return clazz;
    },
    
    
    _extend : function(definition) {
      return Class.define(this, definition);
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
(function(Class) {
  "use strict";
  var _ = Class.root._;

  Class.definition.push("namespace");
  Class.namespace = function(clazz, namespace) {
    if (_.isString(clazz)) {
      var tempClass = namespace;
      namespace = clazz;
      clazz = tempClass;
    };
    namespace = namespace.split(".");
    var root = this.root;
    if (namespace.length > 0) {
      var className = namespace.pop();
      _.each(namespace, function(part) {
        root = root[part] = root[part] || {};        
      });
      root[className] = clazz;
    }
    return clazz;
 };
})(Class);


// =====================================
//  SINGLETON PLUGIN
// =====================================
(function(Class) {
  "use strict";
  var _ = Class.root._;

  Class.definition.push("singleton");
  Class.singleton = function(clazz, isSingleton) {
    if (isSingleton) {
      clazz.$$instance = null;
      clazz.getInstance = function() {
        return this.$$instance || (this.$$instance = new this());
      };
    }
  };
})(Class);


// =====================================
//  MIXINS PLUGIN
// =====================================
(function(Class) {
  "use strict";
  var _ = Class.root._;

  Class.definition.push("mixins");
  Class.mixins = function(clazz, mixins) {
    _.each(mixins, function(obj) {
      var obj = _.isFunction(obj) ? obj.prototype : obj;
      _.extend(clazz.prototype, obj);
    });
  };
})(Class);


// =====================================
//  STATICS PLUGIN
// =====================================
(function(Class) {
  "use strict";
  var _ = Class.root._;

  Class.definition.push("statics");
  Class.statics = function(clazz, statics) {
    _.extend(clazz, statics);
  };
})(Class);


// =====================================
//  PROPERTIES PLUGIN
// =====================================
(function(Class) {
  "use strict";
  var _ = Class.root._;

  Class.error = Class.error || function(error) {
    throw error;
  };

  Class.ECMA5 = false;

  Class.types = {
    "String" : _.isString,
    "Number" : _.isNumber,
    "Boolean" : _.isBoolean,
    "Array" : _.isArray,
    "Function" : _.isFunction,
    "Object" : _.isObject,
    "Element" : _.isElement,
    "Regex" : _.isRegExp
  };

  Class.definition.push("properties");
  Class.properties = function(clazz, properties) {
    for (var property in properties) {
      createProperty(clazz, property, properties[property]);
    }

    // add batch property set method
    var proto = clazz.prototype;
    proto.set = createGenericSetter("set");
    proto._set = createGenericSetter("_set");
  };


  var createGenericSetter = function(prefix) {
    return function(properties, value) {
      if (_.isString(properties)) {
        var property = properties;
        properties = {};
        properties[property] = value;
      }
      for (var property in properties) {
        var prop = firstUp(property);
        var setter = prefix + prop;
        if (this[setter]) {
          this[setter](properties[property]);
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
    
    var proto = clazz.prototype;

    var setter = getPropertyMethodName(property, definition, "set");
    var getter = getPropertyMethodName(property, definition, "get");

    // add setter & getter
    if (!Class.ECMA5) {
      proto[setter] = createSetter(property, definition, getter, setter);
      proto[getter] = createGetter(property, definition, getter, setter);
    } else {
      proto.__defineSetter__(property, createSetter(property, definition, getter, setter));  
      proto.__defineGetter__(property, createGetter(property, definition, getter, setter));
    }

    // add "is" function for boolean
    if (definition.type === "Boolean") {
      var is = getPropertyMethodName(property, definition, "is");
      proto[is] = createIs(property, definition, getter, setter);
    }
  };


  var getPropertyMethodName = function(property, definition, method) {
    var prop = firstUp(property);

     // define getter function name
     var name = method + prop;
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
        if (!Class.ECMA5) {
          this[setter](init);          
        } else {
          this[property] = init;
        }
      }

      return this.$$properties[property];
    };
  };


  var createSetter = function(property, definition, getter, setter) {
    return function(value) {
      
      var old;
      if (!Class.ECMA5) {
        old = this[getter]();        
      } else {
        old = this[property];
      }

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
        var assert = _.isFunction(type) ? instaneOf : Class.types[type];
        if (assert) {
          if (!assert.call(this, value)) {

            var msg = 'Wrong type for property "' + property + '". Expected value "' + value + '" to be of type "' + type + '" but found: ' + (typeof value);
            msg += '. Allowed keys are: ' + _.keys(Class.types).join(", ");
            Class.error(new Class.TypeError(msg, property, value, type));
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
              Class.error(new Class.ValidationError(msg, property, value));
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

  var instaneOf = function(obj) {
    return this instanceof obj;
  };

  var firstUp = function(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
  };
})(Class);


// =====================================
//  MEMBERS PLUGIN
// =====================================
(function(Class) {
  "use strict";
  var _ = Class.root._;

  Class.definition.push("members");
  Class.members = function(clazz, members) {
    _.extend(clazz.prototype, members);
  };
})(Class);


// =====================================
//  INTERFACES PLUGIN
// =====================================
(function(Class) {
  "use strict";
  var _ = Class.root._;

  Class.definition.push("interfaces");
  Class.interfaces = function(clazz, interfaces) {
    _.each(interfaces, function(inter) {
      var inter = _.isFunction(inter) ? inter.prototype : inter;
      for (var name in inter) {
        var method = clazz.prototype[name];
        if (typeof method === 'undefined' || !_.isFunction(method)) {
          throw new Error('The Class does not implement the interface method "' + method + '"');
        }          
      }
    });
  };
})(Class);