(function() {
  "use strict";
  var Class = this.Class || exports;
  var _ = this._;

  Class.definition.push("statics");
  Class.statics = function(clazz, statics) {
   _.extend(clazz, statics);
  };
}).call(this);