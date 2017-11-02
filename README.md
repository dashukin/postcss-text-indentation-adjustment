# postcss-text-indentation-adjustment
PostCSS plugin for adjusting measurements or position values like padding, margin, translateY, top, bottom, etc. based on typography class names and relevant text metrics.

#### The main goals of this plugin are:
1. Provide ability to create pixel-perfect calculations for i.e. paddings/margins/etc. based on font metrics (diacritics, text rendering box gaps) and typography rules (line-height, font-size).
1. Provide safe ability to describe indentation corrections based on core typography styles.
1. Avoid any dependency on custom style syntax that cannot be simply ignored if needed.
1. Support **automatic creation of any dependend rules based on media queries, localizations or any specific parent selectors defined for common typography styles**.
1. Support **CSS, SCSS** or whatever syntax postcss can handle via appropriate parser. 

## Content

- [Example](#example)
- [Core typography](#core-typography)
- [CSS Input](#css-input)
- [CSS Output (unoptimized)](#css-output-unoptimized)
- [CSS Output (optimized)](#css-output-optimized)
- [Usage example](#usage-example)
- [Postcss usage example](#postcss-usage-example)
- [Gulp usage example](#gulp-usage-example)
- [Weback usage example](#webpack-usage-example)


## Example

### Core typography 
Describes **base rules for main typography elements**. Can be either classNames or tags.
```css
.p1 {
    /* pure correction data */
    font-size: 12px;
    line-height: 18px;
    font-family: Arial;
}

h1 {
    font: 12px/18px Arial;
}

@media (min-width: 1499px) {
    /* atRule based correction data */
    .p1 {
        font-size: 16px;
        line-height: 22px;
    }
}

html[lang="en"] .p1,
html[lang="ko"] .p1 {
    /* selector based correction data */
    font-size: 18px;
    line-height: 24px;
    font-family: Arial;
}

.p2,
.p3 {
    /* multiple selectors */
    font-size: 12px;
    line-height: 18px;
    font-family: Arial;
}

@media (min-width: 1499px) {
    /* atRule + selector based correction data */
    html[lang="en"] .p1 {
        font-size: 20px;
        line-height: 26px;
    }
}

```

### CSS Input.
Example styles that should receive corrections **based on core styles**.
Core concept is to have common rules for all typography styles in one place - this makes much easier any transitions to new styles once design is going to be changed.
```css
.rule {
	padding-top: 24px /* {24px, .p1} */;
}

.parent-rule .rule {
	margin-top: 24px /* {24px, .p1, h1} */;
}

@media (min-width: 1499px) {
	.rule-inside-media {
		transform: translateY(24px) /* translateY({24px, .p1, h1})*/;
	}

	.parent-rule .rule-inside-media {
		top: 24px /* {24px, .p1, h1} */;
	}
}
```

### CSS Output (unoptimized)
Parsed css output (before grouping media queries, rules and declarations).
Each declaration value with previously set correction template has been **corrected for line-height, text rendering box gap and diacritics values of every used classname declared in core typography file**.
```css
.rule {
	padding-top: 19px;
}

.parent-rule .rule {
	margin-top: 14px;
}

@media (min-width: 1499px) {
	.rule-inside-media {
		transform: translateY(14px);
	}

	.parent-rule .rule-inside-media {
		top: 14px;
	}
}

html[lang="en"] .rule {
	padding-top: 18px;
}

html[lang="ko"] .rule {
	padding-top: 18px;
}

@media (min-width: 1499px) {
	.rule {
		padding-top: 19px;
	}
}

@media (min-width: 1499px) {
	html[lang="en"] .rule {
		padding-top: 18px;
	}
}

html[lang="en"] .parent-rule .rule {
	margin-top: 13px;
}

html[lang="ko"] .parent-rule .rule {
	margin-top: 13px;
}

@media (min-width: 1499px) {
	.parent-rule .rule {
		margin-top: 14px;
	}
}

@media (min-width: 1499px) {
	html[lang="en"] .parent-rule .rule {
		margin-top: 18px;
	}
}

html[lang="en"] .rule-inside-media {
	transform: translateY(13px);
}

html[lang="ko"] .rule-inside-media {
	transform: translateY(13px);
}

@media (min-width: 1499px) {
	.rule-inside-media {
		transform: translateY(14px);
	}
}

@media (min-width: 1499px) {
	html[lang="en"] .rule-inside-media {
		transform: translateY(18px);
	}
}

html[lang="en"] .parent-rule .rule-inside-media {
	top: 13px;
}

html[lang="ko"] .parent-rule .rule-inside-media {
	top: 13px;
}

@media (min-width: 1499px) {
	.parent-rule .rule-inside-media {
		top: 14px;
	}
}

@media (min-width: 1499px) {
	html[lang="en"] .parent-rule .rule-inside-media {
		top: 18px;
	}
}

```

### CSS Output (optimized)
With grouping media queries, rules and declarations.
```css
.rule{
	padding-top:19px;
}

.parent-rule .rule{
	margin-top:14px;
}

html[lang="en"] .rule,html[lang="ko"] .rule{
	padding-top:18px;
}

html[lang="en"] .parent-rule .rule,html[lang="ko"] .parent-rule .rule{
	margin-top:13px;
}

html[lang="en"] .rule-inside-media,html[lang="ko"] .rule-inside-media{
	transform:translateY(13px);
}

html[lang="en"] .parent-rule .rule-inside-media,html[lang="ko"] .parent-rule .rule-inside-media{
	top:13px;
}

@media (min-width: 1499px){
	.rule-inside-media{
		transform:translateY(14px);
	}

	.parent-rule .rule-inside-media{
		top:14px;
	}
	.rule{
		padding-top:19px;
	}
	html[lang="en"] .rule{
		padding-top:18px;
	}
	.parent-rule .rule{
		margin-top:14px;
	}
	html[lang="en"] .parent-rule .rule{
		margin-top:18px;
	}
	.rule-inside-media{
		transform:translateY(14px);
	}
	html[lang="en"] .rule-inside-media{
		transform:translateY(18px);
	}
	.parent-rule .rule-inside-media{
		top:14px;
	}
	html[lang="en"] .parent-rule .rule-inside-media{
		top:18px;
	}
}

```

### Usage example
#### 1. Import modules

```javascript
import fse from 'fs-extra';
import path from 'path';
import textIndentationAdjustment, {parser} from 'postcss-text-indentation-adjustment';

// for direct postcss usage
import postcss from 'postcss';

// for gulp usage example
import gulp from 'gulp';
import gulpPostcss from 'gulp-postcss';


// for webpack usage example
import ExtractTextPlugin from 'extract-text-webpack-plugin';

// postcss-partial-loader for handling scss partial imports
import postcssPartialImport from 'postcss-partial-import';

// postcss-scss for webpack + scss usage example
import postcssScss from 'postcss-scss';

// compressing tools for media queries and rules
import cssMqPacker from 'css-mqpacker';
import mergeRules from 'postcss-merge-rules';
```

#### 2. Create text metrics data to be used for pixel-perfect correction.
**Basic adjustment will only include line-height corrections.** 

In order to achieve pixel-perfect result **plugin requires [text metrics](https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics)** data (of each font that is used in core typography styles) to be passed to parser as an option. 
Most of the time **text metrics** retrieving is a one time operation which can be perfomed by [font-metrics](https://github.com/dashukin/font-metrics) tool. It will provide a json file with all required data that should be used in order to provide more neat result.

Text metrics can be created for system fonts as well as for localy or remotely hosted fonts.

##### See the usage example:
```javascript
import fontMetrics from 'font-metrics';

const fontParser = fontMetrics({
	fonts: [
		{
			fontFamily: 'Arial'
		},
		{
			fontFamily: 'Roboto',
			src: 'https://fonts.gstatic.com/s/roboto/v15/sTdaA6j0Psb920Vjv-mrzH-_kf6ByYO6CLYdB4HQE-Y.woff2'
		},
		{
			fontFamily: 'SteelworksVintageDemo',
			src: 'mounted-path/SteelworksVintageDemo.otf'
		}
	],
	output: './metrics/',
	filename: 'metrics.json',
	express: {
		port: 3412,
		mount: [
			{
				alias: 'mounted-path',
				path: __dirname + '/your/local/dir/with/fonts'
			}
		]
	}
});

fontParser.parse();
```

#### 3. Parse core typography styles

Core typography parser takes into input **.css** file. 

In case core typography styles are written with any preprocessor like sass, scss, less - they should be precompiled once before text-indentation-plugin initialization.

```javascript
// load text metrics data
const textMetricsData = JSON.parse(fse.readFileSync('path/to/parsed/text-metrics.json', 'utf-8'));

const typographyStyles = fse.readFileSync(path.resolve(__dirname, './path/to/core/typography.css'), 'utf8');
const parseTypography = parser({
	metrics: textMetricsData.metrics
});
const parsedTypography = parseTypography(typographyStyles);

const textIndentationAdjustmentPlugin = textIndentationAdjustment({
	corrections: parsedTypography
});
```

#### 4. Run postcss on target styles depending on the build setup

#### Postcss usage example

```javascript
fse.readFile('path/to/source/style.css', (err, css) => {
    postcss([textIndentationAdjustmentPlugin, mergeRules(), cssMqPacker()])
        .process(css)
        .then(result => {
            fse.writeFile('path/to/dest/style.css', result.css);
        });
});
```
#### Gulp usage example

```javascript
gulp.task('compile:css-gulp', () => {
	gulp.src('path/to/styles/to/be/processed/with/gulp.css')
		.pipe(gulpPostcss([
			textIndentationAdjustmentPlugin,
			mergeRules(),
			cssMqPacker()
		]))
		.pipe(gulp.dest('path/to/processed/style.css'));
});
```

#### Webpack usage example

In case any preprocessor is used - postcss plugin should be used before it with appropriate syntax.

In example, **scss** files should have their partials inlined before running this plugin, and appropriate postcss syntax (_postcss-scss_) should be used.

```javascript
// index.js
import 'path/to/styles/to/be/imported.scss';
```

```javascript
// webpack config
const webpackConfig = {
	entry: {
		index: path.resolve(__dirname, 'path/to/src/index.js')
	},
	output: {
		path: path.resolve(__dirname, 'path/to/dist/folder/'),
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
						plugins: [postcssPartialImport(), textIndentationAdjustmentPlugin],
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
```

### 

#### Documentation is in progress...
