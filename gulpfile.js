var gulp = require('gulp'),
    spawn = require('gulp-spawn'),
    fs = require('fs'),
    colors = require('colors'),
    exec = require('child_process').exec,
    mocha = require('gulp-mocha'),
    gutil = require('gulp-util'),
    docco = require('gulp-docco'),
    coffee = require('gulp-coffee'),
    grep = require('gulp-grep-stream'),
    jsdoc = require('gulp-jsdoc'),
    marked = require('marked'),
    tap = require('tap'),
    gulp = require('gulp'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

marked.setOptions({
    gfm: true
});

gulp.task('default', function () {
    gulp.watch('./src/*.coffee')
    gulp.src('./src/*.coffee')
        .pipe(watch(function(files) {
            return files.pipe(coffee({bare: true}))
                .pipe(gulp.dest('./dist/'))
                .pipe(uglify())
                .pipe(rename({suffix: '.min'}))
                .on('end', function(){
                    exec('coffeedoc ./src', function(err, stdout, stderr){
                        if(err){
                            var err= new gutil.PluginError('coffeedoc', {
                                message: 'coffeedoc could not compile'
                            });
                        }else if(stdout){
                            console.log(stdout);
                        }
                    });
                });
        }));


    gulp.src(['./examples/*.coffee', './test/*.coffee'])
        .pipe(watch(function(files) {
            return files.pipe(coffee({bare: true}))
                .pipe(gulp.dest('./build/'))
                .on('data', function(){
                    exec('tap ./build/test*.js --tap --debug', function(err, stdout, stderr){
                        // Highlight various words in test console output
                        gutil.log(stdout
                            .replace(/(?:(?:^ok)|(?:pass))\s*[0-9]+/gim, '$&'.green.bold)
                            .replace(/(?:(?:fail)|(?:not\sok))\s*[0-9]+/mgi, '$&'.red.bold)
                            .replace(/---[\s\S.]*\.\.\./mgi, '$&'.red));
                    });
                })
        }));
//    gulp.src(['./test/*.coffee'])
//        .pipe(watch(function(files) {
//            return files.pipe(coffee({bare: true}))
//                .pipe(gulp.dest('./build/test/'))
//                .pipe(mocha({reporter: 'tap'}));
//        }));
});


gulp.task('gendocs', function(){
    var writeStream = fs.createWriteStream('./build/readme.html');
    gulp.watch('./README.MD')
        .on('change', function(event){
            var text = marked(fs.readFileSync(event.path));
            console.log('text', text)
            fs.writeFileSync(writeStream, 'dwqdwq');
        });

//    gulp.src('./README.MD')
//        .pipe(watch(function(files){
//            return files.on('data', function(buf){
//                console.log(buf);
//            })
//        }));
});
