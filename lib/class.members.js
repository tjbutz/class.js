(function() {
  "use strict";
  var Class = this.Class || exports;
  var _ = this._;

  Class.definition.push("members");
  Class.members = function(clazz, members) {
   _.extend(clazz.prototype, members);
  };
}).call(this);