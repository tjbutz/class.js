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

  Class.noConflict = function() {
    root.Class = _Class;
    return this;
  };
  

  var tempConstructor = function() {};

  _.extend(Class, {

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
          throw new Error("Use new keyword to create a new instance");
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

      // add definition
      if (definition) {

        // singleton
        if (definition.singleton) {
          clazz.$$instance = null;
          clazz.getInstance = function() {
            return this.$$instance || (this.$$instance = new this());
          };
        }

        // add mixins
        var mixins = definition.mixins;
        if (mixins) {
          for (var i=0, l=mixins.length; i < l; i++) {
            var mixin = _.isFunction(mixins[i]) ? mixins[i].prototype : mixins[i];
            _.extend(clazz.prototype, mixin);
          }
        }

        // add properties
        var properties = definition.properties;
        if (properties) {
          for (var property in properties) {
            Class._createProperty(clazz, property, properties[property]);
          }
        }

        // add batch property set method
        clazz.prototype.set = function(properties) {
          for (var property in properties) {
            var prop = firstUp(property);
            var setter = "set" + prop;
            if (this[setter]) {
              this[setter](properties[property]);
            } else {
              throw new Error('No public set method for property "' + property + '" found.');
            }

          }
          return this;
        }

        // add members & statics
        _.extend(clazz.prototype, definition.members);
        _.extend(clazz, definition.statics);

        // interfaces
        var interfaces = definition.interfaces;
        if (interfaces) {
          for (var i=0, l=interfaces.length; i < l; i++) {
            var inter = _.isFunction(interfaces[i]) ? interfaces[i].prototype : interfaces[i];
            for (var member in inter) {
              if (!clazz.prototype[member]) {
                throw new Error('The Class does not implement the interface member "' + member + '"');   
              }
            }
          }
        }

        // add error handler
        var error = Class.error;
        if (definition.error) {
           error = _.isString(definition.error) ? clazz.prototype[definition.error] : definition.error;
        }
        clazz.prototype.$$error = error;
      }
      

      // provide extend method for inheritance
      clazz.extend = Class._extend;
      
      // provide instance of check
      clazz.prototype.instanceOf = Class._instanceOf;

      return clazz;
    },


    _instanceOf : function(obj) {
      return this instanceof obj;
    },

    error : function(error) {
      throw error;
    },


    _createProperty : function(clazz, property, definition) {
       var prop = firstUp(property);
       
       // define getter function name
       var getter = "get" + prop;
       if (definition.get === false) {
         getter = "_" + getter;
       }

       // add set method
       var setter = "set" + prop;
       if (definition.set === false) {
         setter = "_" + setter;
       }

       clazz.prototype[setter] = function(value, fireEvent) {
         fireEvent = fireEvent === true ? true : false;

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
               this.$$error.call(this, new ValidationError(msg, property, value));
               return;
             }          
           } else {
             throw new Error('Unknown type "' + type +'" for property "' + property + '".');
           }
         }

         // add validate function
         if (definition.validate) {
           var func = _.isString(definition.validate) ? this[definition.validate] : definition.validate;
           if (func) {
             if (!func.call(this, value, old, property)) {
               var msg = 'Validation for property "' + property + '" with value "' + value + '" failed';
               this.$$error.call(this, new TypeError(msg, property, value, type));
               return;
             }
           } else {
             throw new Error('Validation method "' + definition.validate + '" for property "' + property + '" not available.');
           }
         }

         // set value
         this.$$properties[property] = value;

         // add apply method
         if (definition.apply) {
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

       // add getter
       clazz.prototype[getter] = function() {
         this.$$properties = this.$$properties || {};

         if (typeof definition.init !== "undefined") {
           this.$$properties[property] = definition.init;
           delete definition.init;
         }
         return this.$$properties[property];
       };


       // add is function for boolean
       if (definition.type === "Boolean") {
         var is = "is"+prop;
         if (definition.get === false) {
           is = "_" + is;
         }
         clazz.prototype[is] = function() {
           return this[getter]();
         };
       }
     },

     ValidationError : ValidationError,
     TypeError : TypeError
  });

  var ValidationError = Class.define(Error, {
    constructor : function(message, property, value) {
      this.name = "ValidationError";
      this.message = message || "Validation Error";
      this.property = property;
      this.value = value;
    }
  });

  var TypeError = ValidationError.extend({
    constructor : function(message, property, value, type) {
      this.__super__.apply(arguments);

      this.name = "TypeError";
      this.message = message || "Type Error";
      this.type = type;
    }
  });

  
  var firstUp = function(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
  };

}).call(this);