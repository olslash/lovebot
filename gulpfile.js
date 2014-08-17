'use strict';

var gulp = require('gulp');
// var gutil = require('gulp-util');
// var coveralls = require('gulp-coveralls');
var jshint = require('gulp-jshint');
// var mocha = require('gulp-mocha');
var nodemon = require('gulp-nodemon');

gulp.task('default', ['lint']);

gulp.task('lint', function() {
  return gulp.src('./src/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('run', function() {
  nodemon({ script: 'src/core.js', 
  ext: 'html js', 
  ignore: [''],
  env: { 'NODE_ENV': 'development' } , 
  nodeArgs: ['--harmony']})
    .on('change', ['lint'])
    .on('restart', function () {
      console.log('Nodemon restarted.');
    });
});