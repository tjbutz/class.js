if (typeof exports !== "undefined") {
  var Class = require("../class");
  QUnit.module("interfaces");
} else {
  module("interfaces");
}

test("Literal Interfaces", function () {
  var Interface1 = {
    foo : true
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
      some : function() {
        
      }
    }
  });
  
  var Interface2 = Class.define({
    properties : {
      foo : "Boolean"
    },
    members : {
      bar : function() {
        return true;
      }
    }
  });


  var MyClass = Class.define({
    interfaces : [Interface1, Interface2],

    properties : {
      foo : "Boolean"
    },
    members : {
      bar : function() {
        return true;
      },

      some : function() {

      }
    }
  });
  
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


test("Interfaces all implemented", function () {
  var Interface1 = Class.define({
    members : {
      foo : function() {
        return false;
      }
    }
  });
  
  var Interface2 = Class.define({
    members : {
      bar : function() {
        return true;
      }
    }
  });


  var MyClass = Class.define({
    mixins : [Interface1, Interface2],

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


