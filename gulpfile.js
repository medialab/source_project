var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var exec = require('child_process').exec;

var browserSync = require('browser-sync').create();

gulp.task('less', function() {
    return gulp.src('./app/assets/less/*.less')
      .pipe(less())
      .pipe(gulp.dest('./app/assets/css'))
      .pipe(browserSync.stream());
});

gulp.task('build', function() {
    return gulp.src([
      './bower_components/jquery/dist/jquery.js',
      './bower_components/bootstrap/dist/js/bootstrap.js',
      './bower_components/d3/d3.js',
      './bower_components/lodash/lodash.js'
      ],{base: 'bower_components/'}
    )
    .pipe(concat('lib.js'))
    .pipe(gulp.dest('./app/assets/js/'))
    .pipe(rename('lib.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./app/assets/js/'));
});

gulp.task('dot', function(){
  exec('node gen_dot.js', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
  });
})

gulp.task('dotwatch', function(){
  gulp.watch('./gen_dot.js', ['dot']);
  gulp.watch('./app/data/*.json', ['dot']);
  gulp.watch('./app/assets/js/source.js', ['dot']);
})
gulp.task('serve', ['less', 'dotwatch'], function() {
    browserSync.init({server: "./app"});

    // gulp.watch('js/*.js', ['lint', 'scripts']);
    gulp.watch('./app/assets/less/*.less', ['less']);
    gulp.watch("app/*.html").on('change', browserSync.reload);
    gulp.watch("app/assets/js/*.js").on('change', browserSync.reload);

});

gulp.task('default', [ 'less', 'build', 'watch']);
