if (typeof exports !== "undefined") {
  var Class = require("../class");
  QUnit.module("members");
} else {
  module("members");
}


test("Members definition", function () {
  var SuperClass = Class.define({
    members : {
      _id : 0,

      superMethod : function() {
        return true;
      }
    }
  });
  
  var obj = new SuperClass();
  ok(obj.superMethod, "Super method is set");
  equal(obj.superMethod(), true, "Super method returns the right value");
});


test("Extends members", function () {
  var SuperClass = Class.define({
    members : {
      superMethod : function() {
        return true;
      },

      superMethod2 : function() {
        return true;
      }
    }
  });
  
  var MyClass = SuperClass.extend({
    members : {
      superMethod : function() {
        return false;
      },

      superMethod2 : function() {
        return this.__super__.superMethod2.apply(this, arguments);
      }      
    }
  });
  
  var obj = new MyClass();

  ok(obj.superMethod, "Super method is set");
  equal(obj.superMethod(), false, "Super method returns the right value");
  
  ok(obj.superMethod2, "Super method 2 is set");
  equal(obj.superMethod2(), true, "Super method 2 returns the right value");
});
