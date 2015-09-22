var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var browserSync = require('browser-sync').create();

gulp.task('sass', function() {
    return gulp.src('./app/assets/scss/*.scss')
        .pipe(sass())
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

gulp.task('serve', ['sass'], function() {
    browserSync.init({server: "./app"});
    // gulp.watch('js/*.js', ['lint', 'scripts']);
    gulp.watch('./app/assets/scss/*.scss', ['sass']);
    gulp.watch("app/*.html").on('change', browserSync.reload);
});

gulp.task('default', [ 'sass', 'build', 'watch']);
