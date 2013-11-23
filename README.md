class.js
========

Simple (2KB minified & gzipped & all features) class system for JavaScript. Designed to work with backbone.js and node.js.

## Features
  * Core:
    * Inheritance 
    * ```__super__``` - reference to super class
  * Plugins:
    * Mixins
    * Interfaces
    * Singleton
    * Namespaces
    * Properties
      * getter / setter (Optional:Support for ECMA5 getter / setter)
      * visibility
      * type check (Class, Object, String, Number, Boolean, Function, Array, Element, Regex, Date, more can be added)
      * format value
      * validation
      * init value,
      * nullable
      * events (optional, event emitter needed: e.g. Backbone.Events, node.js events.EventEmitter)
  * Extensible: Add your own definition keys and types
  * Browser & commonJS support
  * Well tested

## Dependencies

  * http://underscorejs.org

## Installation

Browser:

```html
<script src="underscore.js"></script>
<script src="class.js"></script>
```

node.js:

```
npm install classjs
```

```js
require("classjs");
```

## Example


```js
var Class = require('classjs');
var EventEmitter = require("events").EventEmitter;

var ICompany = {
  addEmploye : function(employe) {
    // Check passed arguments
    if (Array.prototype.slice.call(arguments).length != 1) {
      throw new Error("Wrong length of arguments");
    }
    if (typeof employe !== "object") {
      throw new Error("Wrong type for argument employe");
    }
  }
};

// Define a new class. Extend from EventEmitter.
var Company = Class.define(EventEmitter, {
  interfaces : [ICompany],
  properties : {
    activated : "Boolean",
    name : {
      type : "String",
      init : "No Name",
      validate : function(value, old, prop) {
        return value != "foo"; // alternative you can return a custom error message as a string
      },
      apply : "_applyName",
      event : "nameChanged"
    },
    street : {
      type : "String",
      format : function(value, old, prop) {
        return value.toUpperCase()  
      },
      get : false, // generate only private getter / setter
      set : false
    },
    city : {
      type : "String",
      nullable : true
    }
  },

  members : {
    _applyName : function(value, old, prop) {
      console.log("Apply name method called with value: %s | old value: %s | property: %s", value, old, prop);
    },
    
    addEmploye : function(employe) {
      console.log("Base method 'addEmploye' called: ", employe);
    }
  }
});

// Extend from "Company"
var MyCompany = Company.extend({
  namespace : "my.cool.Company",

  constructor : function() {
    this.__super__.apply(this, arguments);
    this.setName("My Company"); 
    this._setStreet("Some Street", false);
    this.setCity(null);
  },
  
  
  members : {
    addEmploye : function(employe) {
      // Call overridden method
      this.__super__.addEmploye.apply(this, arguments);
      console.log("Overridden method 'addEmploye' called: ", employe);
    }
  }
  
});

var company = new MyCompany();
company.on("nameChanged", function(data) {
  console.log("Name changed to %s", data.value);
});
company.addEmploye({name:"Lena"});
company.setName("My new Company");
```

## Tests & Custom Builds

class.js is using grunt (https://github.com/cowboy/grunt) to build the modules and to run the tests.
If you would like to create a custom build of class.js or develop a feature, please follow these steps:

To install Grunt run the follwing command (npm (http://npmjs.org/) needed):
 
```
npm install -g grunt
```

Test & Build the project, run:
```
grunt
```

Automatically build project whenever a lib/*.js file is changed:
```
grunt watch
```

Run tests only:
```
grunt qunit
```

The tests are located in the ```test``` folder. With the index*.html files you can run the tests manually in any browser you want.

## API

```js
Class.define(name, superClass, definition)
```

  * name: The name of the class (optional)
  * superClass: Class (optional)
  * definition: Object (optional)

Defines a new class.

```js

Class.define(name, superClass, {
  namespace : String,

  singleton : true|false,

  mixins : [Object|Class],

  interfaces : [Object|Class],
  
  constructor : Function, // Optional. Super constructor is called implicit when not available

  properties : {
    prop1 : "Number|Boolean|String|Object|Function|Array|Element|Regex" | Class, // Simple property definition
    prop2 : {
                type : "Number|Boolean|String|Object|Function|Array|Element|Regex|Date" | Class, // Complex property definition
                init : Mixed
                format : "Function" | Function,
                validate : "Function" | Function | ["Function"|Function],
                apply : "Function" | Function,
                set : true|false,
                get : true|false,
                nullable : true|false,
                event : String
            }
    ... 
  },
  


  statics : {
    static1 : Function,
    static2 : Function,
    ...
  },
  
  members : {
    member1 : Function
    member2 : Function
    ...
  }
});
```

________________________________________________________________________________________________________________________

```js
SomeClass.extend(name, definition)
```

  * name: The name of the class (optional)
  * definition: Object (optional) (see Class.extend for more details)

The ```extend``` method is added automatically to every created Class. Extends from the given class.

```js

  var MyClass = Class.define();
  var SomeClass = MyClass.extend();
  var obj = new SomeClass();

```

## Advanced

Sometimes it can be usefull not to use the full feature set of class.js. You can use the methods that are used for the class definitions standalone as well:

```js
Class.singleton(clazz, setSingleton)
Class.mixins(clazz, mixins)
Class.interfaces(clazz, interfaces)
Class.properties(clazz, properties)
Class.statics(clazz, statics)
Class.members(clazz, members)
Class.namespace(namespace, clazz)
```   
________________________________________________________________________________________________________________________

Extending types

```js
Class.types (provided by properties plugin)
```

For example:

```js
Class.types["MyType"] = function(value) {
  return value instanceof MyType;
}
```
________________________________________________________________________________________________________________________

Extending definition

```js
Class.definition
```

For example:

```js
Class.definition.push("mykey");
Class.mykey = function(clazz, definition) {
  for (var key in definition) {
    clazz.prototype[key] = function() {
      alert("My New Extension");
    }
  }
}
```
________________________________________________________________________________________________________________________

Class define hooks

```js
Class.onBeforeClassDefine
Class.onAfterClassDefine 
```

For example:

```js
Class.onBeforeClassDefine = function() {
  console.log("Before Class Define called");
 };

Class.onAfterClassDefine = function() {
  console.log("After Class Define called");
};
```

Before instantiation hooks

```js
Class.onBeforeInstantiation
Class.onAfterInstantiation 
```

________________________________________________________________________________________________________________________

For example:

```js
Class.onBeforeInstantiation = function() {
  console.log("Before object is instantiated");
};

Class.onAfterInstantiation = function() {
  console.log("After object is instantiated");
};
```

________________________________________________________________________________________________________________________

ECMA5 Getter / Setter

When ECMA5 Mode is activated instead of setProp / getProp methods, ECMA5 getter and setter are generated. This can be used
like normal JavaScript properties, but will check for types / validate / format / etc.

```js
Class.ECMA5;
```

For example:

```js
Class.ECMA5 = true;

var MyClass = Class.define({
  properties : {
    foo : "Boolean"
    bar : "Number"      
  }
});


var obj = new MyClass();
obj.bar = 1 // no setBar(1) needed
var bar = obj.bar; // no getBar() needed
obj.foo = "string" // will throw an exception
```
________________________________________________________________________________________________________________________

Error Types

```js
Class.ValidationError
Class.TypeError // extends from validation error
```

In your error handler you can check for the type:

```js
    if (error instanceof Class.TypeError) {
      console.log(error.message);
      console.log(error.type);
      console.log(error.value);
      console.log(error.property);
    }

    if (error instanceof Class.ValidationError) {
      console.log(error.message);
      console.log(error.value);
      console.log(error.property);
    }
```

or use it for validation: 


```js

  var MyClass = Class.define({
    properties : {
      foo : "Boolean"
      bar : "Number"      
    }
  });

  var data = {
    foo : true,
    bar : "Some String"
  };
  
  var obj = new MyClass();
  var errors = [];

  var validate = function(property, value) {
    errors = [];
    for (var property in data) {
      try {
        obj.set(property, data[value]);  
      } catch (exc) {
        errors.push(exc);
      }
    }
    return errors.length === 0;
  }

  for (var property in data) {
    validate(property, data[property])
  }

  if (validate(data)) {
    console.log("Validation OK. Submit form");
  } else {
    console.log("Errors", errors);
  }
```

## Version History

 * 0.8.0 (2013/11/23, published to npm)
  * Named Classes
  * Namespace can now have a different context
 * 0.7.1 (2012/12/19, published to npm)
  * Fixed constructor after inheritance
 * 0.7.0 (2012/8/26, published to npm)
  * Enhanced ```__super__``` functionality
  * node.js example
  * Bugfixes
 * 0.6.2 (2012/8/5, published to npm)
  * Added "Date" type to properties
  * Refactoring
 * 0.6.1 (2012/7/29, published to npm)
  * Improved ECMA5 property support
  * Do not set the same value for a property twice
  * Removed Class.error handling from property system
  * Bugfixes
 * 0.6 (2012/7/28, published to npm)
  * Splitted up files
  * Use grunt to build project
  * Interfaces can now have parameter checks
 * 0.5.2 (2012/7/27, published to npm)
  * Added node tests
 * 0.5.1 (2012/7/27, published to npm)
  * Node.js fixes
 * 0.5 (2012/7/27, published to npm)
  * Added ECMA5 getter/setter
  * API stabilization / changes
  * Removed "notfire" event parameter from property setter
 * 0.4 (2012/7/27, not published to npm)
  * Improved plugin system
  * Added strict mode
  * API stabilization / changes
    * Removed instanceOf method
    * Class.definition is now an array to ensure order of execution
  * Before / After Class definition hooks
  * Before / After instantiation hooks
  * Bugfixes
  * More tests
 * 0.3 (2012/7/27, not published to npm)
  * Plugin system
  * QUnit tests
  * Namespaces
  * Bugfixes
  * Validation can be an array of validators
  * Simple properties (prop:type) now possible
  * Valiator & Formater can now be a member function
  * More documentation
 * 0.2 (2012/7/26)
  * Bugfixes
  * API stabilization
  * Documentation
 * 0.1.1 (2012/7/26)
  * Minor Bugfixes
  * Docu
 * 0.1 (2012/7/26)
  * Inital release

## Contribute

 * If you have a feature request or an issue please report it here: https://github.com/tjbutz/class.js/issues
 * If you have developed a plugin for class.js please let me know. I will list the plugin on this page.
 * If you use class.js in your project please let me know. I will list the project on this page.