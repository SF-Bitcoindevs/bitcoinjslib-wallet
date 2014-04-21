var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      vendor: {
        files: [
          {
            expand: true, cwd: 'bower_components/bootstrap/dist',
            src: ['**'], dest: 'app/js/vendor/bootstrap/'
          },
          {
            expand: true, cwd: 'bower_components/backbone/',
            src: ['backbone.js'], dest: 'vendorjs/backbone/'
          },
          {
            expand: true, cwd: 'bower_components/jquery/dist',
            src: ['**'], dest: 'vendorjs/jquery/'
          },
          {
            expand: true, cwd: 'bower_components/underscore/',
            src: ['underscore.js'], dest: 'vendorjs/underscore/'
          },
          {
            expand: true, cwd: 'bower_components/font-awesome/',
            src: ['fonts/**', 'css/**'], dest: 'app/js/vendor/font-awesome/'
          },
          {
            expand: true, cwd: 'bower_components/secure-random/lib',
            src: ['*.js'], dest: 'vendorjs/secure-random/'
          },
          {
            expand: true, cwd: 'bower_components/gibberish-aes/dist',
            src: ['*.js'], dest: 'vendorjs/gibberish-aes/'
          },
          {
            expand: true, cwd: 'css/',
            src: ['**'], dest: 'app/css'
          },
          {
            expand: true, cwd: 'extjs/bitcoinlib-entry/',
            src: ['index.js'], dest: 'bower_components/bitcoinjs-lib/src/'
          }
        ]
      }
    },
    browserify: {
      dist: {
        files: [
        {"vendorjs/bitcoinjs-lib.js": ["bower_components/bitcoinjs-lib/src/index.js"]}
        ],
        options: {
          transform: ["coffeeify", "jadeify"],
          standalone: "Bitcoin"
        }
      }
    },
    concat: {
        options: {
            separator: ';',
        },
        dist: {
            src: ['js/src-js/util.js', 'js/src-js/tx.js', 'js/src-js/helloblock.js', 'js/src-js/wallet.js', 'js/src-js/carbonwallet-app.js', 'js/src-js/carbonwallet-dash.js'],
            dest: 'js/app.js'
        },
        dev: {
            src: ['js/src-js/util.js', 'js/src-js/tx.js', 'js/src-js/helloblock.js', 'js/src-js/wallet.js', 'js/src-js/carbonwallet-app.js', 'js/src-js/carbonwallet-dash.js'],
            dest: 'app/js/app.min.js' // This is not minified, but is only used for development purposes - saves uglifiying for every change
        }
    },
    uglify: {
      options: {
        sourceMap: true,
        sourceMapName: function(filePath) {
          return filePath + '.map';
        }
      },
      carbonFiles: {
        files: {
          'app/js/ext.min.js': [
            'vendorjs/bitcoinjs-lib.js',
            'vendorjs/secure-random/secure-random.js',

            'vendorjs/jquery/jquery.js',
            'app/js/vendor/bootstrap/js/bootstrap.js',

            'extjs/qrcode.js',
            'extjs/mnemonic.js',
            'extjs/electrum.js',
            'vendorjs/gibberish-aes/gibberish-aes.js'
          ],
          'app/js/app.min.js': [
            'js/app.js'
          ]
        }
      }
    },
    jade: {
        compile: {
            options: {
                data: {
                    debug: false
                }
            },
            files: {
                "app/app.html": ["jade/app.jade"]
            }
        }
    },
    watch: {
      bitcoinlibJS: {
         files: [
          'bower_components/bitcoinlib-js/**/*.js'
         ],
         tasks: ['newer:browserify']
      },
      carbonJS: {
         files: [
          'extjs/**/*.js',
          'vendorjs/**/*.js'
         ],
         tasks: ['newer:uglify']
      },
      appJS: {
         files: [
          'js/src-js/*.js'
         ],
         tasks: ['newer:concat:dev']
      },
      jadeML: {
         files: ['jade/**/*.jade'],
         tasks: ['newer:jade']
      }
    },
    concurrent: {
      dev: {
        tasks: ['http-server', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    'http-server': {
        'dev': {
            // the server root directory
            root: "./app",
            port: 8282,
            host: "127.0.0.1",
            cache: 1,
            showDir : true,
            autoIndex: true,
            defaultExt: "html"
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-http-server');

  grunt.registerTask('default', ['copy:vendor', 'browserify', 'concat:dist', 'uglify', 'jade']);
  // grunt.registerTask('serve', ['default', 'newer:copy:vendor', 'newer:concat:dev', 'newer:jade', 'concurrent']);
  grunt.registerTask('serve', "Dev server", function() {
      if (!grunt.file.exists("vendorjs/bitcoinjs-lib.js")) {
          // browserify has not run
          grunt.task.run("default");
      }
      grunt.task.run(['newer:copy:vendor', 'newer:concat:dev', 'newer:jade', 'concurrent']);
  })
};
