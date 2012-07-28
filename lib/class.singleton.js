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