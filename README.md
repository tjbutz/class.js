class.js
========

Simple (1.84KB minified & gzipped & all features) class system for JavaScript. Designed to work with backbone.js and node.js.

## Features
  * Core:
    * Inheritance 
    * ```__super__``` - reference on super class (Backbone compatible)
  * Plugins:
    * Mixins
    * Interfaces
    * Singleton
    * Namespaces
    * Properties
      * getter / setter
      * visibility
      * type check (Class, Object, String, Number, Boolean, Function, Array, Element, Regex, more can be added)
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

// Define a new class. Extend from EventEmitter.
var Company = Class.define(EventEmitter, {
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
			console.log(value, old, prop);
		},
		
		addEmploye : function(employe) {
			console.log("employe");
		}
	}
});

// Extend from "Company"
var MyCompany = Company.extend({
	namespace : "my.cool.Company",

	constructor : function() {
		Company.apply(this, arguments);
		this.setName("My Company", false); // Do not fire the event
		this._setStreet("Some Street", false);
		this.setCity(null);
	},
	
	
	members : {
		addEmploye : function(employe) {
			// Call overridden method
			this.__super__.addEmploye.apply(this, arguments);
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

## API

```js
Class.define(superClass, definition)
```

  * superClass: Class (optional)
  * definition: Object (optional)

Defines a new class.

```js

Class.define(superClass, {
  namespace : String,

  singleton : true|false,

  mixins : [Object|Class],

  interfaces : [Object|Class],
  
  constructor : Function, // Optional. Super constructor is called implicit when not available

  properties : {
    prop1 : "Number|Boolean|String|Object|Function|Array|Element|Regex" | Class, // Simple property definition
    prop2 : {
                type : "Number|Boolean|String|Object|Function|Array|Element|Regex" | Class, // Complex property definition
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
SomeClass.extend(definition)
```

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
Class.types
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
Class.definition["mykey"] = function(clazz, definition) {
  for (var key in definition) {
    clazz.prototype[key] = function() {
      alert("My New Extension");
    }
  }
}
```
________________________________________________________________________________________________________________________

Error Types

```js
Class.ValidationError
Class.TypeError // extends from validation error
```

For example you can override the default error handler for class.js:

```js
  Class.error = function(error) {
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

    throw error;
  }
```

or use it for validation: 


```js

  var MyClass = Class.define({
    foo : "Boolean"
    bar : "Number"
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

## Changelist

 * 0.3
  * Plugin system
  * QUnit tests
  * Namespaces
  * Bugfixes
 * 0.2
  * Bugfixes
  * API Stabilization
  * Documentation
 * 0.1.1
  * Minor Bugfixes
  * Docu
 * 0.1
  * Inital release
