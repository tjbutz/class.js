(function() {
   "use strict";
   var Class = this.Class || exports;
   var _ = Class.root._;

   Class.definition.push("mixins");
   Class.mixins = function(clazz, mixins) {
     _.each(mixins, function(obj) {
       var obj = _.isFunction(obj) ? obj.prototype : obj;
       _.extend(clazz.prototype, obj);
     });
   };
 }).call(this);