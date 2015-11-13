var gulp = require('gulp'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    exec = require('child_process').exec,
    handlebars = require('gulp-handlebars'),
    wrap = require('gulp-wrap'),
    jsonlint = require("gulp-jsonlint"),
    browserSync = require('browser-sync').create();


var jsFiles = [
  './bower_components/jquery/dist/jquery.js',
  './bower_components/bootstrap/dist/js/bootstrap.js',
  './bower_components/d3/d3.js',
  './bower_components/lodash/lodash.js',
  './bower_components/handlebars/handlebars.js',
  './bower_components/colorbrewer/colorbrewer.js'
  ];

gulp.task('less', function() {
    return gulp.src('./app/assets/less/*.less')
      .pipe(less())
      .pipe(gulp.dest('./app/assets/css'))
      .pipe(browserSync.stream());
});

// javascript compilation

gulp.task('build', function() {
  return gulp.src(jsFiles,{base: 'bower_components/'})
    .pipe(concat('lib.js'))
    // .pipe(gulp.dest('./app/assets/js/'))
    .pipe(rename('lib.min.js'))
    // .pipe(uglify())
    .pipe(gulp.dest('./app/assets/js/'));
});

// template
gulp.task('templates', function() {
  return gulp.src('./app/templates/*.hbs')
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>);'))
    .pipe(concat('templates.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./app/templates/'));
});

// copy fonts
gulp.task('fonts', function() {
  return gulp.src(['./bower_components/bootstrap/dist/fonts/glyphicons*.*'])
          .pipe(gulp.dest('app/assets/fonts/'));
});

// dot render
gulp.task('dot', function(){
  // exec('node gen_treaty.js', function (err, stdout, stderr) { console.log(stdout,stderr);});
  // exec('node gen_full.js', function (err, stdout, stderr) { console.log(stdout,stderr);});
})

gulp.task('dotwatch', function(){
  gulp.watch('./*.js', ['dot']);
  gulp.watch('./app/data/*.json', ['dot']);
  gulp.watch('./app/assets/js/source.js', ['dot']);
})

// validate json
gulp.task('json', function(){
  gulp.src("./config.json")
      .pipe(jsonlint())
      .pipe(jsonlint.reporter());
})

gulp.task('serve', ['less', 'templates','fonts','json'], function() {
    browserSync.init({server: "./"});

    gulp.watch('./app/assets/less/*.less', ['less']);
    gulp.watch('./app/templates/*.hbs', ['templates']);
    gulp.watch('./**/*.json', ['json']);

    gulp.watch("*.json").on('change', browserSync.reload);
    gulp.watch("app/*.html").on('change', browserSync.reload);
    gulp.watch("app/assets/js/*.js").on('change', browserSync.reload);
});


gulp.task('default', [ 'less', 'fonts', 'build','templates']);
