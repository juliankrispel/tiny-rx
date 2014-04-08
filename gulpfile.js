var gulp = require('gulp'),
    spawn = require('gulp-spawn'),
    colors = require('colors'),
    exec = require('child_process').exec,
    mocha = require('gulp-mocha'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    grep = require('gulp-grep-stream'),
    tap = require('tap'),
    gulp = require('gulp'),
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

    gulp.src(['./examples/*.coffee', './test/*.coffee'])
        .pipe(watch(function(files) {
            return files.pipe(coffee({bare: true}))
                .pipe(gulp.dest('./build/'))
                .on('data', function(){
                    exec('tap ./build/test*.js --tap --debug', function(err, stdout, stderr){
                        gutil.log(stdout
                            .replace(/(?:(?:^ok)|(?:pass))\s*[0-9]+/gim, '$&'.green.bold)
                            .replace(/(?:(?:fail)|(?:not\sok))\s*[0-9]+/mgi, '$&'.red.bold)
                            .replace(/---[\s\S.]*\.\.\./mgi, '$&'.red));
                    });
                })
        }));
        //
//    gulp.src(['./test/*.coffee'])
//        .pipe(watch(function(files) {
//            return files.pipe(coffee({bare: true}))
//                .pipe(gulp.dest('./build/test/'))
//                .pipe(mocha({reporter: 'tap'}));
//        }));
});
