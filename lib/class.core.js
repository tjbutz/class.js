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

  Class.VERSION = '0.6.2';
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
          if (!_.isUndefined(definition[key])) {
            this[key].call(this, clazz, definition[key]);
            delete definition[key]; // Clean up memory
          }
        }, this);
        if (_.keys(definition).length !== 0) {
          throw new Error("Unknown key in definition: " + _.keys(definition).join(", ") + ". Allowed keys are: " + this.definition.join(", ")); 
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