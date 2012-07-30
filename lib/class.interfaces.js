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