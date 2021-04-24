const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const minifyCSS = require('gulp-minify-css');
const autoprefixer = require('gulp-autoprefixer');
const useref = require('gulp-useref');
const rename = require('gulp-rename');
const { server, reload } = require('gulp-connect');

gulp.task('watch', function() {
  gulp.watch('src/**/*.ts', gulp.series('browserify'));
  gulp.watch('src/**/*.html', gulp.series('html'));
  gulp.watch('src/**/*.css', gulp.series('css'));
});

gulp.task('html', function() {
  return gulp
    .src('src/*.html')
    .pipe(useref())
    .pipe(gulp.dest('dist'))
    .pipe(reload());
});

gulp.task('css', function() {
  return gulp
    .src('src/assets/css/*.css')
    .pipe(minifyCSS())
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
    .pipe(concat('style.min.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(reload());
});

gulp.task('images', function() {
  gulp.src('src/**/*.jpg').pipe(gulp.dest('dist'));
  gulp.src('src/**/*.ico').pipe(gulp.dest('dist'));
  return gulp.src('src/**/*.png').pipe(gulp.dest('dist'));
});

gulp.task('serve', () => {
  server({
    name: 'Dev Game',
    root: './dist',
    port: 5000,
    livereload: true,
  });
});

gulp.task('browserify', function() {
  return browserify({
    entries: './src/app.ts',
  })
    .plugin('tsify')
    .bundle()
    .on('error', function(err) {
      console.log(err.message);
    })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'))
    .pipe(reload());
});

gulp.task('fonts', function() {
  return gulp.src(['src/assets/fonts/*.ttf']).pipe(gulp.dest('dist/assets/fonts'));
});

gulp.task(
  'default',
  gulp.series(['browserify', 'html', 'css', 'images', 'fonts', gulp.parallel('serve', 'watch')]),
);
