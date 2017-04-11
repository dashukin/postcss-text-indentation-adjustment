/*
* gulp tasks
* */

/**
 * @name fse
 */

import gulp from 'gulp';
import del from 'del';
import gulpPostcss from 'gulp-postcss';
import postcssScss from 'postcss-scss';
import sass from 'gulp-sass';
import nodeSass from 'node-sass';
import fse from 'fs-extra';
import textMetrics from './index';
import parse from './lib/parser';

const textMetricsData = {
	'p1': [
		{
			atRule: null,
			selector: '.only-parent-selector',
			// line-height minus font-size minus any additional decreaseBy value
			baseDelta: 4, // (line-height - font-size) / 2
			decreaseBy: 1 // text metrics
		},
		{
			atRule: {
				name: 'media',
				params: '(max-width: 1499px)'
			},
			selector: null,
			// line-height minus font-size minus any additional decreaseBy value
			baseDelta: 6, // (line-height - font-size) / 2
			decreaseBy: 1 // text metrics
		},
		{
			atRule: {
				name: 'media',
				params: '(max-width: 1499px)'
			},
			selector: '.parent-selector-with-atrule',
			// line-height minus font-size minus any additional decreaseBy value
			baseDelta: 8, // (line-height - font-size) / 2
			decreaseBy: 1 // text metrics
		}
	]
};

// init text metrics plugin
const cssTextMetricsPlugin = textMetrics({
	textMetrics: textMetricsData
});

const scssTextMetricsPlugin = textMetrics({
	textMetrics: textMetricsData,
	plainCSS: false
});

const source = {
	css: './example/src/css/**/*.css',
	cssTypography: './example/src/css-typography/css-typography.css',
	scss: './example/src/scss/**/*.scss',
	scssTypography: './example/src/scss-typography/scss-typography.scss',
};

const output = {
	css: './example/dist/css',
	scss: './example/dist/scss'
};

const cssData = fse.readFileSync(source.cssTypography, 'utf8');
const parsedCSSData = parse(cssData);
console.log(parsedCSSData);

const scssData = nodeSass.renderSync({
	file: source.scssTypography
}).css.toString();

const parsedScssData = parse(scssData);
console.log(parsedScssData);

gulp.task('compile:css', () => {
	del(`${output.css}/*`);
	gulp.src(source.css)
		.pipe(gulpPostcss([cssTextMetricsPlugin]))
		.pipe(gulp.dest(output.css));
});

gulp.task('compile:scss', () => {
	del(`${output.scss}/*`);
	gulp.src(source.scss)
		.pipe(gulpPostcss([scssTextMetricsPlugin]), {
			syntax: postcssScss
		})
		.pipe(sass())
		.pipe(gulp.dest(output.scss));
});

gulp.task('compile:all', () => {
	console.log('Not implemented');
});

gulp.task('watch:css', () => {
	gulp.watch(source.css, ['compile:css']);
});

gulp.task('watch:scss', () => {
	gulp.watch(source.scss, ['compile:scss']);
});

gulp.task('watch:all', () => {
	console.log('Not implemented');
});

gulp.task('default', ['compile:css', 'watch:css', 'compile:scss', 'watch:scss']);
