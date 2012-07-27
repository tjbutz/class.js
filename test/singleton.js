if (typeof exports !== "undefined") {
  var Class = require("../class");
  QUnit.module("singleton");
} else {
  module("singleton");
}

test("Singleton definition", function () {
  var MyClass = Class.define({
    singleton : true,

    members : {
      foo : function() {
        return true;
      }
    }
  });

  var obj = MyClass.getInstance();
  var obj2 = MyClass.getInstance();
  equal(obj2, obj, "Both objects are the same");
  equal(obj2.foo(), true, "Method foo defined and returns the right value");
});
