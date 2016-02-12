var gulp = require('gulp'),
 	plugins = require('gulp-load-plugins')(),
 	compiler = require('babel-core/register');

const paths = {
	js: ['.*.js', './src/*.js'],
	tests: ['./test/*.js'],
	other: ['./package.json', './.gitignore']
};

gulp.task('lint', function () {
    return gulp.src(paths.js)
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.failAfterError());
});

gulp.task('babel', () =>
    gulp.src(paths.js.concat(paths.tests))
    	.pipe(plugins.newer('dist'))
        .pipe(plugins.babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist'))
);

gulp.task('pre-test', function () {
  return gulp.src(paths.js)
    // Covering files
    .pipe(plugins.istanbul())
    // Force `require` to return covered files
    .pipe(plugins.istanbul.hookRequire());
});

gulp.task('test', ['babel', 'pre-test'], function () {
  return gulp.src(paths.tests)
  	.pipe(plugins.mocha({compilers : { js: compiler }}))
    // Creating the reports after tests ran
    .pipe(plugins.istanbul.writeReports())
    // Enforce a coverage of at least 90%
    .pipe(plugins.istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});

gulp.task('copy', () =>
	gulp.src(paths.other)
		.pipe(plugins.newer('dist'))
		.pipe(gulp.dest('dist'))
);