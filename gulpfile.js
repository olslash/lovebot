var gulp = require('gulp');
// var gutil = require('gulp-util');
// var coveralls = require('gulp-coveralls');
var jshint = require('gulp-jshint');
// var mocha = require('gulp-mocha');
var nodemon = require('gulp-nodemon');

gulp.task('default', ['hint']);

gulp.task('lint', function() {
  return gulp.src('src/*.js')
    .pipe(jshint('.jshintrc'));
});

gulp.task('run', function() {
  nodemon({ script: 'src/core.js', 
  ext: 'html js', 
  ignore: [''],
  env: { 'NODE_ENV': 'development' } , 
  nodeArgs: ['--harmony', '--use-strict']})
    .on('change', ['lint'])
    .on('restart', function () {
      console.log('Nodemon restarted.');
    });
});