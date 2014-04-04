var gulp = require('gulp');
var coffee = require('gulp-coffee');

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('default', function () {
    gulp.src('./src/*.coffee')
        .pipe(watch(function(files) {
            return files.pipe(coffee({bare: true}))
                .pipe(gulp.dest('./dist/'))
                .pipe(uglify())
                .pipe(rename({suffix: '.min'}))
                .pipe(gulp.dest('./dist/'));
        }));
    gulp.src('./test/*.coffee')
        .pipe(watch(function(files) {
            return files.pipe(coffee({bare: true}))
                .pipe(gulp.dest('./build/'));
        }));
});
