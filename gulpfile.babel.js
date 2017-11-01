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

import path from 'path';
import gulp from 'gulp';
import webpack from 'webpack';
import gulpWebpack from 'gulp-webpack';
import del from 'del';
import gulpPostcss from 'gulp-postcss';
import postcssScss from 'postcss-scss';
import sass from 'gulp-sass';
import nodeSass from 'node-sass';
import fse from 'fs-extra';
import textMetrics from './src/index';
import parser from './src/lib/parser';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import fontMetrics from 'font-metrics';
import runSequence from 'run-sequence';
import postcssPartialImport from 'postcss-partial-import';
import cssMqPacker from 'css-mqpacker';
import mergeRules from 'postcss-merge-rules';

const source = {
	css: './example/src/css/**/*.css',
	cssTypography: './example/src/css-typography/css-typography.css',
	scss: './example/src/scss/**/*.scss',
	scssTypography: './example/src/scss-typography/scss-typography.scss',
	fontMetricsSrc: './example/font-metrics/font-metrics.json'
};

const output = {
	gulp: {
		css: './example/dist/gulp/css',
		scss: './example/dist/gulp/scss'
	},
	webpack: {
		css: './example/dist/webpack/css',
		scss: './example/dist/webpack/scss'
	},
	fontMetrics: './example/dist/font-metrics'
};

const scssData = nodeSass.renderSync({
	file: source.scssTypography
}).css.toString();
const parsedScssData = parseTypography(scssData);
const scssTextMetricsPlugin = textMetrics({
	corrections: parsedScssData,
	plainCSS: false
});

const webpackExampleConfig = {
	entry: {
		index: path.resolve(__dirname, 'example/webpack-index-example.js')
	},
	output: {
		path: path.resolve(__dirname, 'example/dist/webpack/'),
		filename: '[name].js',
	},
	module: {
		rules: [{
			test: /\.(css|scss)$/,
			use: ExtractTextPlugin.extract({
				fallback: 'style-loader',
				use: [{
					loader: 'css-loader'
				}, {
					loader: 'postcss-loader',
					options: {
						plugins: [
							mergeRules(),
							cssMqPacker()
						]
					}
				}, {
					loader: 'sass-loader',
					options: {
						outputStyle: 'expanded'
					}
				}, {
					loader: 'postcss-loader',
					options: {
						ident: 'postcss',
						plugins: [postcssPartialImport(), scssTextMetricsPlugin],
						parser: postcssScss
					}
				}]
			})
		}]
	},
	plugins: [
		new ExtractTextPlugin('[name].css')
	]
}

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

gulp.task('compile:css-gulp', () => {
	const cssData = fse.readFileSync(source.cssTypography, 'utf8');
	const parsedCSSData = parseTypography(cssData);
	const cssTextMetricsPlugin = textMetrics({
		corrections: parsedCSSData
	});

	del(`${output.gulp.css}/*`);
	gulp.src(source.css)
		.pipe(gulpPostcss([
			cssTextMetricsPlugin,
			mergeRules(),
			cssMqPacker()
		]))
		.pipe(gulp.dest(output.gulp.css));
});

gulp.task('compile:scss-gulp', () => {
	const scssData = nodeSass.renderSync({
		file: source.scssTypography
	}).css.toString();
	const parsedScssData = parseTypography(scssData);
	const scssTextMetricsPlugin = textMetrics({
		corrections: parsedScssData,
		plainCSS: false
	});

	del(`${output.gulp.scss}/*`);
	gulp.src(source.scss)
		.pipe(gulpPostcss([postcssPartialImport(), scssTextMetricsPlugin]), {
			parser: postcssScss
		})
		.pipe(sass({
			outputStyle: 'expanded'
		})).on('error', function (err) {
			console.log(err);
			this.emit('end');
		})
		.pipe(gulpPostcss([
			mergeRules(),
			cssMqPacker()
		]))
		.pipe(gulp.dest(output.gulp.scss));
});

gulp.task('compile:scss-webpack', () => {
	const scssData = nodeSass.renderSync({
		file: source.scssTypography
	}).css.toString();
	const parsedScssData = parseTypography(scssData);
	const scssTextMetricsPlugin = textMetrics({
		corrections: parsedScssData,
		plainCSS: false
	});

	const webpackConfig = Object.create(webpackExampleConfig);
	webpackConfig.plugins = webpackConfig.plugins.concat([
		scssTextMetricsPlugin
	]);

	del(`${output.webpack.scss}/*`);

	gulp.src(source.scss)
		.pipe(gulpWebpack(webpackExampleConfig, webpack))
		.pipe(gulp.dest(output.webpack.scss))
});

gulp.task('compile:scss', () => {
	runSequence(['compile:scss-gulp', 'compile:scss-webpack']);
});

gulp.task('compile:css', () => {
	runSequence(['compile:css-gulp']);
});

gulp.task('compile:all', () => {
	runSequence(['compile:css', 'compile:scss']);
});

gulp.task('watch:css', () => {
	gulp.watch(source.css, ['compile:css-gulp']);
});

gulp.task('watch:scss', () => {
	gulp.watch(source.scss, ['compile:scss-gulp', 'compile:scss-webpack']);
});

gulp.task('clean', () => {
	del(`${output.gulp.css}/*`);
	del(`${output.gulp.scss}/*`);
	del(`${output.webpack.scss}/*`);
});

gulp.task('watch:all', () => {
	console.log('Not implemented');
});

gulp.task('default', ['compile:css-gulp', 'watch:css-gulp', 'compile:scss-gulp', 'watch:scss-gulp']);
