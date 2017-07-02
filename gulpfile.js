const gulp = require('gulp');
const zip = require('gulp-zip');
const del = require('del');
const install = require('gulp-install');
const runSequence = require('run-sequence');
const awsLambda = require("node-aws-lambda");
const run = require('gulp-run');

gulp.task('clean', function() {
  return del(['./dist', './dist.zip']);
});

gulp.task('js', function() {
  return gulp.src('app/*.js')
      .pipe(gulp.dest('dist/'));
});

gulp.task('node-mods', function() {
  return gulp.src('./package.json')
      .pipe(gulp.dest('dist/'))
      .pipe(install({production: true}));
});

// on windows, gulp zip produce a "non conform" zip -> lambda fail during the load of cron-parser module
// and grunt-aws-lambda produce a big output (20 Mo)
// gulp.task('zip', function() {
//   return gulp.src('dist/**/*')
//       .pipe(zip('dist.zip'))
//       .pipe(gulp.dest('./'));
// });

// for windows user only, use powershell instead
// powershell Compress-Archive dist/* dist.zip -Force not work
// so I use .Net Framework
const cmd='powershell Add-Type -assembly "system.io.compression.filesystem";[System.IO.Compression.Zipfile]::CreateFromDirectory("dist", "dist.zip")';
gulp.task('zip', function() {
  return run(cmd).exec()
      .pipe(gulp.dest('output'));
});

gulp.task('upload', function(callback) {
  awsLambda.deploy('./dist.zip', require("./lambda-config.js"), callback);
});

gulp.task('deploy', function(callback) {
  return runSequence(
      ['clean'],
      ['js', 'node-mods'],
      ['zip'],
      ['upload'],
      callback
  );
});