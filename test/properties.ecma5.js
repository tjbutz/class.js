if (this.__defineSetter__) {
  
  if (typeof exports !== "undefined") {
    var Class = require("../class");
    QUnit.module("properties ECMA5", {
      setup : function() {
        Class.ECMA5 = true;
      },
      teardown: function() {
        Class.ECMA5 = false;
      }
    });
  } else {
    module("properties ECMA5", {
      setup : function() {
        Class.ECMA5 = true;
      },
      teardown: function() {
        Class.ECMA5 = false;
      }
    });  
  }



  test("Properties basic", function () {
    var MyType = function() {};

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
  });


  test("Properties init", function () {
    var MyClass = Class.define({
      properties : {
        foo : {
          type : "String",
          init : "Hello"
        },
        bar : {
          type : "Boolean",
          init : "true"
        }
      }
    });

    var obj = new MyClass();

    equal(obj.foo, "Hello", "Init value works fine");
    throws(function() {
      var bar = obj.bar;
    }, "Init value with wrong intial value fails");
  });
  
  test("Properties get/set visibility", function () {
    var applyCalled = false;
    var initValue = null;
    
    var MyClass = Class.define({
      properties : {
        foo : {
          type : "Boolean",
          set : false,
          get : false,
          apply : "_applyFoo",
          init : true
        }
      },
      
      members : {
        _applyFoo : function(value, old) {
          applyCalled = true;
        }
      }
    });


    var obj = new MyClass();
    
    
    initValue = obj._foo;
    obj._foo = false;

    ok(initValue, "private getter availabe");
    ok(applyCalled, "private setter availabe");
    
    obj.foo = "public not available";
    var value = obj.foo;

    equal(value, "public not available", "public getter & setter not available");
  });
  
  
  test("Generic set", function () {
    var MyClass = Class.define({
      properties : {
        foo : {
          type : "String",
          init : "Hello"
        },
        bar : {
          type : "Boolean",
          init : true
        }
      }
    });

    var obj = new MyClass();

    obj.set({
      foo : "Hi",
      bar : false
    });

    equal(obj.foo, "Hi", "Generic setter for string");
    equal(obj.bar, false, "Generic setter for boolean");
    
    throws(function() {
      obj.set({
        some : "Hi"
      });    
    }, "No setter found");

    obj.set("bar", true);
    equal(obj.bar, true, "Generic key, value setter works");
  });

}