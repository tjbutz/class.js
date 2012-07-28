module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      name: 'class.js',
      banner: "/*! class.js v<%= pkg.version %> <%= pkg.url %> | License: https://github.com/tjbutz/class.js/blob/master/LICENSE */"
    },
    concat: {
      dist: {
        src: ['<banner>', 
              // Warning: The order of the script inclusion is relevant
              // for the order of the class definition.
              // e.g.: Interface check should be done when all methods were added
              'lib/class.core.js',
              'lib/class.namespace.js',
              'lib/class.singleton.js',
              'lib/class.statics.js', // can override singleton
              'lib/class.properties.js',
              'lib/class.mixins.js', 
              'lib/class.members.js', // can override properties & mixins
              'lib/class.interfaces.js' // need to be added last
        ],
        dest: 'class.js'
      }
    },
    min: {
      dist: {
        src: ['<banner>', 'class.js'],
        dest: 'class.min.js'
      }
    },
    test: {
      files: ['test/**/*.js']
    },
    
    lint: {
      files: ['grunt.js', 'lib/**/*.js']
    },

    watch: {
      files: [
				"lib/**/*.js"
			],
			tasks : "default"
    },

    jshint: {
      options: {
        curly: false,
        eqeqeq: true,
        immed: false,
        latedef: true,
        newcap: false,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        shadow : true,
        expr : false
      },
      globals: {
        exports: true,
        require : true,
        module: false
      }
    },
    uglify: {}
  });

  // Default task.
//  grunt.registerTask('default', 'lint test concat min');

  grunt.registerTask('default', 'concat min qunit');
  
  grunt.registerTask("qunit", function( commit, configFile ) {
    var done = this.async();
    //var config = grunt.file.readJSON( configFile ).qunit;
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
        deps: "./test/lib/underscore.js",
        code: "./class.js",
        tests: ["./test/oo.js", "./test/properties.js", "./test/properties.ecma5.js", "./test/members.js", "./test/mixins.js", "./test/interfaces.js", "./test/statics.js", "./test/singleton.js"]
    },function(err, report) {
      done(report.failed === 0);
    });		
  });
};