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