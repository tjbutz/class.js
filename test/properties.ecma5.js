if (typeof exports !== "undefined") {
  var Class = require("../class");
  QUnit.module("properties ECMA5");
} else {
  module("properties ECMA5");  
}

test("Properties basic", function () {

  if (this.__defineSetter__) {

    Class.ECMA5 = true;

    var MyType = function() {
  
    };

    var MyClass = Class.define({
      properties : {
        foo : {
          type : "Object"
        },
        bar : "Boolean",
        myType : MyType,
        noType : {}
      }
    });

    var obj = new MyClass();

    throws(function() {
      obj.bar = "jojo";
    }, Class.TypeError, "Wrong type throws an error");

    var value = {};
    obj.foo = value;
    equal(obj.foo, value, "Defining type directly in literal");

    obj.bar = true;
    equal(obj.bar, true, "Defining type directly");

    var myType = new MyType();
    obj.myType = myType;
    equal(obj.myType, myType, "Defining custom type");

    obj.noType = myType;
    equal(obj.noType, myType, "Defining no type");
  
    Class.ECMA5 = false;
  
  } else {
    ok(true, "ECMA5 getter/setter not supported");
  }
});

