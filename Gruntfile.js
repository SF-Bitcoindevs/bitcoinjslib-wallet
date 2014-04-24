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
            expand: true, cwd: 'bower_components/font-awesome/',
            src: ['fonts/**', 'css/**'], dest: 'app/js/vendor/font-awesome/'
          },
          {
            expand: true, cwd: 'css/',
            src: ['**'], dest: 'app/css'
          }
        ]
      }
    },
    concat: {
        options: {
            separator: ';',
        },
        dev: {
            src: ['js/hb.js', 'js/helloblock.js', 'js/consts.js', 'js/util.js', 'js/tx.js', 'js/wallet.js', 'js/carbonwallet-app.js', 'js/carbonwallet-dash.js'],
            dest: 'app/js/app.js'
        }
    },
    uglify: {
      options: {
        sourceMap: true,
        sourceMapName: function(filePath) {
          return filePath + '.map';
        }
      },
      walletFiles: {
        files: {
          'app/js/ext.min.js': [
            'extjs/bitcoinjs-min.js',
            'bower_components/secure-random/lib/secure-random.js',
            'bower_components/jquery/dist/jquery.js',
            'app/js/vendor/bootstrap/js/bootstrap.js',
            'extjs/qrcode.js',
            'extjs/mnemonic.js',
            'extjs/electrum.js',
            'bower-components/gibberish-aes/dist/gibberish-aes.js'
          ],
          'app/js/app.min.js': [
            'app/js/app.js'
          ]
        }
      },
      appFiles: {
        files: {
          'app/js/app.min.js': [
            'app/js/app.js'
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
      walletJS: {
         files: [
          'extjs/**/*.js'
         ],
         tasks: ['newer:uglify:walletFiles']
      },
      appJS: {
         files: [
          'js/*.js'
         ],
         tasks: ['newer:concat:dev', 'newer:uglify:appFiles']
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

  grunt.registerTask('default', ['copy:vendor', 'concat:dev', 'uglify', 'jade']);
  grunt.registerTask('serve', ['default', 'newer:copy:vendor', 'newer:concat:dev', 'newer:uglify', 'newer:jade', 'concurrent']);
};
