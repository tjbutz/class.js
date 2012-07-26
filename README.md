class.js
========

Simple (1.69KB minified & gzipped) Class System for JavaScript. Designed to work with backbone.js and node.js.

## Features

  * Inheritance
  * Mixins
  * Interfaces
  * Properties
    * getter / setter
    * visibility
  	* type check (Class, Object, String, Number, Boolean, Function, Array, Element, Regex)
  	* format value
    * validation
    * init value,
	* nullable
    * events (optional, event emitter needed: e.g. Backbone.Events, node.js events.EventEmitter)
  * ```__super__``` - reference on super class (Backbone compatible)
  * Singleton
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

var MyCompany = Company.extend({
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
Class.define(superClass, {
  singleton : true|false,

  mixins : [Object|Class],

  interfaces : [Object|Class],

  properties : {
    type : "Number|Boolean|String|Object|Function|Array|Element|Regex" | Class,
    init : Mixed
    format : "Function" | Function,
    validate : "Function" | Function,
    apply : "Function" | Function,
    set : true|false,
    get : true|false,
	nullable : true|false,
    event : String
  },

  statics : {
    ...
  },
  
  members : {
    ...
  }
});
```