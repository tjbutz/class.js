if (typeof exports !== "undefined") {
  var Class = require("../class");
  QUnit.module("statics");
} else {
  module("statics");
}


test("Singleton definition", function () {
  var MyClass = Class.define({
    singleton : true,

    statics : {
      foo : function() {
        return "bar";
      }
    }
  });

  ok(MyClass.foo, "Static function is set");
  equal(MyClass.foo(), "bar", "Static function returns the right value");
});


test("Do not inherit statics", function () {
  var MyClass = Class.define({
    singleton : true,

    statics : {
      foo : function() {
        return "bar";
      }
    }
  });
  
  var MyClass2 = MyClass.extend();

  equal(MyClass2.foo, null, "Statics are not inherited");
});