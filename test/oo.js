if (typeof exports !== "undefined") {
  var Class = require("../class");
  QUnit.module("oo");
} else {
  module("oo");
}


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


test("Instance of test", function () {
  var MyClass = Class.define();
  var SomeClass = MyClass.extend();
  var obj = new SomeClass();

  ok(obj instanceof SomeClass, "Constructor is set right");
  ok(obj instanceof MyClass, "Instance of super works");
});

test("Class definition with wrong key", function () {
  throws(function() {
    var SuperClass = Class.define({
      method : {}
    });
  }, "Defintion with wrong key fails");
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

test("Class define with name", function () {
  var SuperClass = Class.define("MySuperClass", {
    members : {
      superMethod : function() {
        return true;
      }
    }
  });

  ok(SuperClass, "Class defined without errors");
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
        this.__super__.apply(this, arguments);
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


test("Namepsace By Defintion", function () {
  var MyClass = Class.define({
    namespace : "my.cool.Class"
  });
  
  var MyClass2 = Class.define({
    namespace : "my.cool.Class2"
  });

  equal(Class.root.my.cool.Class, MyClass, "Class1 found in namespace");
  equal(Class.root.my.cool.Class2, MyClass2, "Class2 found in namespace");
});


test("Class definition hooks", function () {
  
  var before = false;
  var after = false;

  Class.onBeforeClassDefine = function() {
    before = true;
  };

  Class.onAfterClassDefine = function() {
    after = true;
  };

  var MyClass = Class.define({
    namespace : "my.cool.Class"
  });

  ok(before, "onBeforeClassDefiniton handler called");
  ok(after, "onAfterClassDefiniton handler called");
});


test("OO instantiation hooks", function () {
  
  var before = false;
  var after = false;

  Class.onBeforeInstantiation = function() {
    before = true;
  };

  Class.onAfterInstantiation = function() {
    after = true;
  };

  var MyClass = Class.define({
    namespace : "my.cool.Class"
  });
  var test = new MyClass();

  ok(before, "onBeforeClassDefiniton handler called");
  ok(after, "onAfterClassDefiniton handler called");
});

