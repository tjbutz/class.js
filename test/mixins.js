module("mixins");

test("Literal Mixins", function () {
  var Mixin1 = {
    foo : function() {
      return false;
    }
  };
  
  var Mixin2 = {
    bar : function() {
      return true;
    }
  };


  var MyClass = Class.define({
    mixins : [Mixin1, Mixin2],

    members : {
      foo : function() {
        return true;
      }
    }
  });

  var obj = new MyClass();
  equal(obj.foo(), true, "Method foo overridden by class and returns the right value");
  equal(obj.bar(), true, "Method bar defined and returns the right value");
});


test("Class Mixins", function () {
  var Mixin1 = Class.define({
    members : {
      foo : function() {
        return false;
      }
    }
  });
  
  var Mixin2 = Class.define({
    members : {
      bar : function() {
        return true;
      }
    }
  });


  var MyClass = Class.define({
    mixins : [Mixin1, Mixin2],

    members : {
      foo : function() {
        return true;
      }
    }
  });

  var obj = new MyClass();
  equal(obj.foo(), true, "Method foo overridden by class and returns the right value");
  equal(obj.bar(), true, "Method bar defined and returns the right value");
});
