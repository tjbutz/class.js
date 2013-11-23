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