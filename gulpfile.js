var gulp = require('gulp'),
 	plugins = require('gulp-load-plugins')();

const paths = {
	js: ['.*.js', './src/*.js']
};

gulp.task('lint', function () {
    return gulp.src(['**/*.js','!node_modules/**'])
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.failAfterError());
});


gulp.task('scripts', function(){
	return gulp.start('lint');
});
