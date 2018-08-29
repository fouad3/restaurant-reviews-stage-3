var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');


gulp.task('default',['browserSync', 'styles', 'scripts:main', 'scripts:restaurant'], function() {
    gulp.watch('app/sass/**/*.scss', ['styles']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', ['scripts:main', 'scripts:restaurant', 'reload']);
});


gulp.task('browserSync', function() {
    browserSync.init({
        server:{
            baseDir: 'app',
            routes: {
                '/node_modules': './node_modules',
            }
        }
    })

});

gulp.task('reload', function () {
   browserSync.reload();
});


gulp.task('styles', function() {
    gulp.src('app/sass/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('./app/css'))
        .pipe(browserSync.stream());
});


gulp.task('scripts:main', function() {
    gulp.src(['app/js/idb.js', 'app/js/dbhelper.js', 'app/js/main.js'])
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(sourcemaps.init())
        .pipe(concat('main.bundle.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/bundle_js'));
});

gulp.task('scripts:restaurant', function() {
    gulp.src(['app/js/idb.js', 'app/js/dbhelper.js', 'app/js/restaurant_info.js'])
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(sourcemaps.init())
        .pipe(concat('restaurant.bundle.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/bundle_js'));
});



gulp.task('copy-html', function() {
    gulp.src('app/*.html')
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
    gulp.src('app/img/*')
        .pipe(gulp.dest('./dist/img'));
});

gulp.task('copy-json', function() {
    gulp.src('app/*.json')
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-js', function() {
    gulp.src('app/bundle_js/*.js')
        .pipe(gulp.dest('./dist/bundle_js'));
});

gulp.task('copy-sw', function() {
    gulp.src('app/sw.js')
        .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['copy-html', 'copy-images', 'copy-json', 'copy-js', 'copy-sw']);
