/*
* gulp tasks
* */

/**
 * @name gulp
 * @property task
 * @property pipe
 */

/**
 * @name fse
 * @property readFileSync
 */

import gulp from 'gulp';
import del from 'del';
import gulpPostcss from 'gulp-postcss';
import postcssScss from 'postcss-scss';
import sass from 'gulp-sass';
import nodeSass from 'node-sass';
import fse from 'fs-extra';
import textMetrics from './src/index';
import parser from './src/lib/parser';
import fontMetrics from 'font-metrics';
import runSequence from 'run-sequence';

const source = {
	css: './example/src/css/**/*.css',
	cssTypography: './example/src/css-typography/css-typography.css',
	scss: './example/src/scss/**/*.scss',
	scssTypography: './example/src/scss-typography/scss-typography.scss',
	fontMetricsSrc: './example/dist/font-metrics/font-metrics.json'
};

const output = {
	css: './example/dist/css',
	scss: './example/dist/scss',
	fontMetrics: './example/dist/font-metrics'
};

function getFontMetricsData () {
	let metrics;

	try {
		metrics = JSON.parse(fse.readFileSync(source.fontMetricsSrc, 'utf-8'));
	} catch (error) {
		console.log(error);
		metrics = {};
	}
	return metrics;
}

function parseTypography (input) {
	const fontMetricsData = getFontMetricsData();
	const parse = parser({
		metrics: fontMetricsData.metrics
	});

	return parse(input);
}

gulp.task('fonts:parse', () => {
	const fontParser = fontMetrics({
		fonts: [{
			fontFamily: 'Arial'
		}],
		output: output.fontMetrics,
		filename: 'font-metrics.json'
	});

	del(`${output.fontMetrics}/*`);
	fontParser.parse();
});

gulp.task('compile:css', () => {
	const cssData = fse.readFileSync(source.cssTypography, 'utf8');
	const parsedCSSData = parseTypography(cssData);
	const cssTextMetricsPlugin = textMetrics({
		corrections: parsedCSSData
	});

	del(`${output.css}/*`);
	gulp.src(source.css)
		.pipe(gulpPostcss([cssTextMetricsPlugin]))
		.pipe(gulp.dest(output.css));
});

gulp.task('compile:scss', () => {
	const scssData = nodeSass.renderSync({
		file: source.scssTypography
	}).css.toString();
	const parsedScssData = parseTypography(scssData);
	const scssTextMetricsPlugin = textMetrics({
		corrections: parsedScssData,
		plainCSS: false
	});

	del(`${output.scss}/*`);
	gulp.src(source.scss)
		.pipe(gulpPostcss([scssTextMetricsPlugin]), {
			parser: postcssScss
		})
		.pipe(sass({
			outputStyle: 'expanded'
		})).on('error', function (err) {
			console.log(err);
			this.emit('end');
		})
		.pipe(gulp.dest(output.scss));
});

gulp.task('compile:all', () => {
	runSequence(['compile:css', 'compile:scss']);
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
