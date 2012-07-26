module("oo");


test("Class creation", function () {
  var SuperClass = Class.define();
  SuperClass.prototype.superMethod = function() {
    return true;
  };

  var obj = new SuperClass();

  ok(obj.superMethod, "Super method is inherited");
  equal(obj.superMethod(), true, "Super method returns the right value");
});


test("Class creation without new", function () {
  var SuperClass = Class.define();
  SuperClass.prototype.superMethod = function() {
    return true;
  };

  throws(SuperClass, "Create intance without 'new'");
});


test("Class definition with wrong key", function () {
  throws(function() {
    var SuperClass = Class.define({
      method : {}
    });
  }, "Create intance without 'new'");
});


test("Basic inheritance", function () {
  var SuperClass = function() {};

  SuperClass.prototype.superMethod = function() {
    return true;
  };


  var MyClass = Class.define(SuperClass);
  var obj = new MyClass();
  
  ok(obj.superMethod, "Super method is inherited");
  equal(obj.superMethod(), true, "Super method returns the right value");
});


test("Inheritance by extend", function () {
  var SuperClass = Class.define({
    members : {
      superMethod : function() {
        return true;
      }
    }
  });

  var MyClass = SuperClass.extend();
  var obj = new MyClass();
  ok(obj.superMethod, "Super method is inherited");
  equal(obj.superMethod(), true, "Super method returns the right value");
});

test("Implicit constructor call", function () {
  var SuperClass = function(name) {
    this.name = name;
  };

  var MyClass = Class.define(SuperClass);
  var obj = new MyClass("Monkey");
  
  equal(obj.name, "Monkey", "Constructor of super not called");
});


test("Explicit constructor call", function () {
  var SuperClass = function(name) {
    this.name = name;
  };

  var MyClass = Class.define(SuperClass, {
      constructor : function(name) {
        SuperClass.apply(this, arguments);
      }
  });

  var obj = new MyClass("Monkey");

  equal(obj.name, "Monkey", "Constructor of super not called");
});


test("Explicit constructor call: extend", function () {
  var SuperClass = function(name) {
    this.name = name;
  };

  var MyClass = Class.define(SuperClass, {
      constructor : function(name) {
        SuperClass.apply(this, arguments);
      }
  });
  
  var MyClass2 = MyClass.extend({
    constructor : function(name) {
      MyClass.apply(this, arguments);
    }
  });

  var obj = new MyClass("Monkey");
  equal(obj.name, "Monkey", "Constructor of super not called");
});