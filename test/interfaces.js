if (typeof exports !== "undefined") {
  var Class = require("../class");
  var _ = require("underscore");
  QUnit.module("interfaces");
} else {
  module("interfaces");
}

test("Literal Interfaces", function () {
  var Interface1 = {
    foo : true // simple definition
  };
  
  var Interface2 = {
    bar : function() {}
  };

  throws(function() {
    var MyClass = Class.define({
      interfaces : [Interface1, Interface2],

      members : {
        foo : function() {
          return true;
        }
      }
    });
  }, "Defining of class fails as not all methods are implemented");
});


test("Class Interfaces", function () {
  var Interface1 = Class.define({
    members : {
      some : function() {}
    }
  });
  
  var Interface2 = Class.define({
    properties : {
      foo : "Boolean"
    },
    members : {
      bar : function() {}
    }
  });


  var MyClass = Class.define({
    interfaces : [Interface1, Interface2],

    properties : {
      foo : "Boolean"
    },
    members : {
      bar : function() {},

      some : function() {}
    }
  });
  
  throws(function() {
    var MyClass = Class.define({
      interfaces : [Interface1, Interface2],

      members : {
        foo : function() {}
      }
    });
  }, "Defining of class fails as not all methods are implemented");
});


test("Interfaces all implemented", function () {
  var Interface1 = Class.define({
    members : {
      foo : function() {}
    }
  });
  
  var Interface2 = Class.define({
    members : {
      bar : function() {}
    }
  });


  var MyClass = Class.define({
    interfaces : [Interface1, Interface2],

    members : {
      foo : function() {
        return true;
      },
      
      bar : function() {
        return true;
      }
    }
  });
  

  var obj = new MyClass();
  equal(obj.foo(), true, "Method foo defined and returns the right value");
  equal(obj.bar(), true, "Method bar defined and returns the right value");
});


test("Interfaces all params implemented", function () {
  var interCalled = false;

  var Interface1 = Class.define({
    members : {
      foo : function(parm1, param2) {
        interCalled = true;
        if (_.toArray(arguments).length != 2) {
          throw new Error("The method needes to implement exactly 2 parameters");
        }
      },
      
      bar : function(parm1, param2) {
        if (_.toArray(arguments).length <= 2) {
          throw new Error("The method needes to implement 2 parameters");
        }

        if (!_.isString(arguments[0])) {
          throw new Error("Param 1 needes to be a string");
        }
      }
    }
  });


  var memberCalled = false;
  var MyClass = Class.define({
    interfaces : [Interface1],

    members : {
      foo : function(onlyOneParam) {
        memberCalled=true;
        return true;
      },
      
      bar : function(wrongType, some) {
        return true;
      }
    }
  });

  var obj = new MyClass();
  throws(function() {
    obj.foo("first")
  }, "Calling method with one argument fails");

  equal(memberCalled, false, "Member was not called");
  ok(interCalled, "Interface method was called");

  obj.foo("first", "second");
  ok(memberCalled, "Member method was called");

  throws(function() {
    obj.bar(true, "second");
  }, Error, "Calling method with wrong type of first arguments fails");
});


