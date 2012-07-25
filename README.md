class.js
========

Simple Class System for JavaScript

## Features

  * Inheritance
  * Mixins
  * Interfaces
  * Properties
    * getter / setter
    * visibility
  	* type check
  	* format value
    * validation
    * init value
    * events (optional, event emitter needed: e.g. Backbone.Events, node.js events.EventEmitter)
  * __super__ - reference on super class
  * Singleton
  * Browser & commonJS support

## Dependencies

  * http://underscorejs.org

## Usage

Browser:

```html
<script src="class.js"></script>
```

node.js:

```js
require("classjs");
```

## Example


```js
var Monkey = Class.define(EventEmitter, {
	properties : {
		"legs" : {
			type : "Number",
			init : 4,
			validate : function(value, old) {
				return value <= 4;
			},
			apply : "_applyLegs",
			event : "legsChanged"
		},

		head : {
			type : "Object",
			get : false, // generate only private getter / setter
			set : false
		}
	},

	members : {
		_applyLegs : function(value, old) {
			console.log(value, old);
		},
		
		jump : function() {
			console.log("jump");
		}
	}
});

var TwoLeggedMonkey = Monkey.extend({
	constructor : function() {
		this.__super__.apply(this, arguments);
		this.setLegs(3, false); // Do not fire the event
	},
	
	jump : function() {
		this.__super__.jump.apply(arguments);
	}
});

var monkey = new TwoLeggedMonkey();
monkey.on("legsChanged", function(data) {
	console.log("Legs changed to %i", data.value);
});
monkey.jump();
monkey.setLegs(2);
```

