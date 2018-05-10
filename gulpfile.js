var gulp = require('gulp'),
   uglify = require('gulp-uglify'),
   concat = require('gulp-concat'),
   del    = require('del'),
   runSequence = require('run-sequence');

 gulp.task('js', function () {
    return gulp.src('scripts/*.js')
      .pipe(uglify())
      .pipe(concat('app.js'))
      .pipe(gulp.dest('dist/scripts'));
 });

// Copy third party libraries from /node_modules into /dist/scripts/vendor.js
gulp.task('vendor', function() {
  return gulp.src('node_modules/idb/dist/*')
    .pipe(uglify())
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist/scripts'))
});

gulp.task('copy-root', function() {
  return gulp.src([
    'index.html', 
    'favicon.ico',
    'manifest.json',
    'service-worker.js'
  ]).pipe(gulp.dest('dist'));
});

gulp.task('copy-img', function() {
  return gulp.src([
    'images/**', 
  ]).pipe(gulp.dest('dist/images'));
});
gulp.task('copy-css', function() {
  return gulp.src([
    'styles/**', 
  ]).pipe(gulp.dest('dist/styles'));
});

gulp.task('directories', function () {
  return gulp.src('*.*', {read: false})
    .pipe(gulp.dest('dist/styles'))
    .pipe(gulp.dest('dist/images'))
    .pipe(gulp.dest('dist/images/icons'))
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('clean', function (done) {
  return del(['dist'], done);
});

gulp.task('build', function(callback) {
  runSequence('clean',
              'directories',
              ['vendor', 'js'],
              ['copy-root', 'copy-css', 'copy-img'],
              callback);
});

gulp.task('default', ['vendor']);