if (typeof exports !== "undefined") {
  var Class = require("../class");
  QUnit.module("properties");
} else {
  module("properties");
}

// validation (+ error msg)

test("Properties basic", function () {
  
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
    obj.setBar("true");
  }, Class.TypeError, "Wrong type throws an error");
  
  var value = {};
  obj.setFoo(value);
  equal(obj.getFoo(), value, "Defining type directly in literal");

  obj.setBar(true);
  equal(obj.getBar(), true, "Defining type directly");
  
  var myType = new MyType();
  obj.setMyType(myType);
  equal(obj.getMyType(), myType, "Defining custom type");

  obj.setNoType(myType);
  equal(obj.getNoType(), myType, "Defining no type");
});


test("Properties format", function () {
  var property = null;
  var oldValue = null;
  var MyClass = Class.define({
    properties : {
      foo : {
        type : "String",
        format : function(value, old, prop) {
          return value + " works";
        }
      },
      bar : {
        type : "String",
        format : "_formatBar"
      }
    }, 

    members : {
      _formatBar : function(value, old, prop) {
        property = prop;
        oldValue = old;
        return value + " works";
      }
    }
  });
  
  var obj = new MyClass();
 
  obj.setFoo("Format");
  equal(obj.getFoo(), "Format works", "Format with function");

  obj.setBar("Format");
  equal(obj.getBar(), "Format works", "Format with in member section defined function");
  equal(property, "bar", "Right property is passed as argument");
  obj.setBar("Old");
  equal(oldValue, "Format works", "Old value is is passed as argument");
});


test("Properties apply", function () {
  var apply1Called = false;
  var apply2Called = false;
  var property = null;
  var oldValue = null;

  var MyClass = Class.define({
    properties : {
      foo : {
        type : "String",
        apply : function(value, old, prop) {
          apply1Called = true;
        }
      },
      bar : {
        type : "String",
        apply : "_applyBar"
      }
    }, 

    members : {
      _applyBar : function(value, old, prop) {
        apply2Called = true;
        property = prop;
        oldValue = old;
      }
    }
  });

  var obj = new MyClass();
 
  obj.setFoo("JO");
  ok(apply1Called, "Apply with function");

  obj.setBar("JO");
  ok(apply2Called, "Apply with in member section defined function");
  equal(property, "bar", "Right property is passed as argument");
  obj.setBar("Old");
  equal(oldValue, "JO", "Old value is is passed as argument");
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
 
  equal(obj.getFoo(), "Hello", "Init value works fine");
  throws(obj.getBar, "Init value with wrong intial value fails");
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

  equal(obj.getFoo(), "Hi", "Generic setter for string");
  equal(obj.getBar(), false, "Generic setter for boolean");
  
  throws(function() {
    obj.set({
      some : "Hi"
    });    
  }, "No setter found");
  
  obj.set("bar", true);
  equal(obj.getBar(), true, "Generic key, value setter works");
});

test("Properties nullable", function () {
  var MyClass = Class.define({
    properties : {
      foo : {
        type : "String",
        nullable : true,
        init : null
      }
    }
  });
  
  var obj = new MyClass();
 
  equal(obj.getFoo(), null, "Null value for inti value allowed");
  obj.setFoo(null);
  equal(obj.getFoo(), null, "Null value for set value allowed");
});


test("Properties boolean", function () {
  var MyClass = Class.define({
    properties : {
      foo : {
        type : "Boolean"
      }
    }
  });
  
  var obj = new MyClass();
  obj.setFoo(true);
  equal(obj.isFoo(), true, "isPropertyName method available");
});


test("Properties get/set visibility", function () {
  var MyClass = Class.define({
    properties : {
      foo : {
        type : "Boolean",
        set : false,
        get : false
      }
    }
  });
  
  var obj = new MyClass();
  ok(obj._getFoo, "private getter availabe");
  ok(obj._setFoo, "private setter availabe");
  equal(obj.getFoo, null, "public getter not availabe");
  equal(obj.setFoo, null, "public getter not availabe");
});


test("Properties events", function () {
  var MyClass = Class.define({
    properties : {
      foo : {
        type : "Boolean",
        event : "changeFoo"
      }
    }
  });
  
  var obj = new MyClass();
  throws(function() {
    obj.setFoo(true);
  }, "no events available");

  var eventFired = false;
  
  var MockEvent = Class.define({
    members : {
      emit : function(event, data) {
        eventFired = true;
      }      
    }
  });

  var MyClass = Class.define(MockEvent ,{
    properties : {
      foo : {
        type : "Boolean",
        event : "changeFoo"
      }
    }
  });
  
  var obj = new MyClass();
  obj.setFoo(true);
  ok(eventFired, "Event is fired");
});


test("Property validation", function () {
  
  var validate1 = false;
  var property = null;
  var oldValue = null;
  
  var MyClass = Class.define({
    properties : {
      foo : {
        type : "String",
        validate : function() {
          return false;
        }
      },

      bar : {
        type : "String",
        validate : "_validateBar"
      },
      
      more : {
        type : "String",
        validate : ["_validateBar", function() {return "custom msg"}]
      }
    }, 

    members : {
      _validateBar : function(value, old, prop) {
        validate1 = true;
        property = prop;
        oldValue = old;
        return true;
      }
    }
  });
  
  var obj = new MyClass();
 
  throws(function() {
    obj.setFoo("error");
  }, "validation should fail");
  
  
  obj.setBar("no Error");
  ok(validate1, "validation function returns true");
  equal(property, "bar", "Right property is passed as argument");
  obj.setBar("Old");
  equal(oldValue, "no Error", "Old value is is passed as argument");

  ok(validate1, "validation function returns true");

  var validate2 = false;
  validate1 = false;
  try {
   obj.setMore("error");
  } catch (exc) {
    var ValidationError = Class.ValidationError;
    validate2 = (exc.message == "custom msg" && exc instanceof ValidationError && validate1);
  }
  ok(validate2, "more than one validation and error with custom message");
});