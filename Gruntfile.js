module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    watch: {
      styles: {
        files: ['app/assets/less/*.less'],
        tasks: ['less', 'concat']
      },
    },

    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          "app/assets/css/screen.css": "app/assets/less/screen.less"
        }
      }
    },

    concat: {
      js: {
        src: [
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/d3/d3.min.js',
          'bower_components/lodash/lodash.min.js'
        ],
        dest: 'app/assets/js/lib.js'
      }
    }

});

// 3. Nous disons à Grunt que nous voulons utiliser ces plugins.
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-less');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-cssmin');

// 4. Nous disons à Grunt quoi faire lorsque nous tapons "grunt" dans la console.
grunt.registerTask('default', ['less', 'concat']);

};
