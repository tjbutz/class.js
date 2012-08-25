var Class = require('../../class');
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