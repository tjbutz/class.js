var testrunner = require("qunit");

// or use setup function
testrunner.setup({
    log: {
        summary: true,
        errors: true
    }
});


// one code and tests file
testrunner.run({
    deps: "./lib/underscore.js",
    code: "../class.js",
    tests: ["./oo.js", "./properties.js", "./properties.ecma5.js", "./members.js", "./mixins.js", "./interfaces.js", "./statics.js", "./singleton.js"]
},function(err, report) {
  console.log(err, report);
});