# postcss-text-indentation-adjustment
PostCSS plugin for adjusting measurements or position values like padding, margin, translateY, top, bottom, etc. based on typography class names and relevant text metrics.

#### The main goals of this plugin are:
1. Provide safe ability to describe indentation corrections based on core typography styles.
1. Avoid any dependency on custom style syntax.
1. Support **automatic creation of any dependend rules based on media queries, localizations or any specific parent selectors defined for common typography styles**.
1. Support **CSS, SCSS** or whatever syntax postcss can handle via appropriate parser. 

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
import postcss from 'postcss';
```

#### 2. Parse core typography styles

```javascript
const typographyStyles = fse.readFileSync(path.resolve(__dirname, './path/to/core/typography.css'), 'utf8');
const parseTypography = parser({ /*options*/ });
const parsedTypography = parseTypography(typographyStyles);
```

#### 3. Run postcss on target styles

```javascript
const textIndentationAdjustmentPlugin = textIndentationAdjustment();
fse.readFile('path/to/source/style.css', (err, css) => {
    postcss([textIndentationAdjustmentPlugin])
        .process(css)
        .then(result => {
            fse.writeFile('path/to/dest/style.css', result.css);
        });
});
```

#### Work in progress...
