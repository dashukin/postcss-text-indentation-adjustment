# postcss-text-indentation-adjustment
PostCSS plugin for adjusting measurements or position values like padding, margin, translateY, top, bottom, etc. based on typography class names and relevant text metrics.

#### The main goals of this plugin are:
1. Provide safe ability to describe indentation corrections and avoid any dependency on custom style syntax.
1. Support automatic creation of any dependend rules based on media queries, localizations or any specific parent selectors defined for common typography styles.
1. Support CSS, SCSS or whatever syntax postcss can handle via appropriate parser. 

#### Example

##### Core typography
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

##### CSS Input 
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

##### CSS Output (without grouping media queries, rules and declarations)
```css
.inner-partial-rule {
  padding-top: 14px;
}

.partial-rule {
  pading-top: 14px;
}

.rule {
  padding-top: 19px;
}

.parent-rule .rule {
  margin-top: 19px;
}

@media (min-width: 1499px) {
  .rule-inside-media {
    transform: translateY(19px);
  }
  .parent-rule .rule-inside-media {
    top: 19px;
  }
  html[lang="en"] .rule-inside-media {
    transform: translateY(18px);
  }
  html[lang="ko"] .rule-inside-media {
    transform: translateY(18px);
  }
}

@media (min-width: 1499px) and (min-width: 1499px) {
  .rule-inside-media {
    transform: translateY(21px);
  }
}

@media (min-width: 1499px) {
  html[lang="en"] .parent-rule .rule-inside-media {
    top: 18px;
  }
  html[lang="ko"] .parent-rule .rule-inside-media {
    top: 18px;
  }
}

@media (min-width: 1499px) and (min-width: 1499px) {
  .parent-rule .rule-inside-media {
    top: 21px;
  }
}

html[lang="en"] .inner-partial-rule {
  padding-top: 13px;
}

html[lang="ko"] .inner-partial-rule {
  padding-top: 13px;
}

@media (min-width: 1499px) {
  .inner-partial-rule {
    padding-top: 16px;
  }
}

@media (min-width: 1499px) {
  html[lang="en"] .inner-partial-rule {
    padding-top: 21px;
  }
}

html[lang="en"] .partial-rule {
  pading-top: 13px;
}

html[lang="ko"] .partial-rule {
  pading-top: 13px;
}

@media (min-width: 1499px) {
  .partial-rule {
    pading-top: 16px;
  }
}

@media (min-width: 1499px) {
  html[lang="en"] .partial-rule {
    pading-top: 21px;
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
    padding-top: 21px;
  }
}

html[lang="en"] .parent-rule .rule {
  margin-top: 18px;
}

html[lang="ko"] .parent-rule .rule {
  margin-top: 18px;
}

@media (min-width: 1499px) {
  .parent-rule .rule {
    margin-top: 21px;
  }
}

```

##### CSS Output (with grouping media queries, rules and declarations)
```css
.inner-partial-rule{
  padding-top:14px;
}

.partial-rule{
  pading-top:14px;
}

.rule{
  padding-top:19px;
}

.parent-rule .rule{
  margin-top:19px;
}

html[lang="en"] .inner-partial-rule,html[lang="ko"] .inner-partial-rule{
  padding-top:13px;
}

html[lang="en"] .partial-rule,html[lang="ko"] .partial-rule{
  pading-top:13px;
}

html[lang="en"] .rule,html[lang="ko"] .rule{
  padding-top:18px;
}

html[lang="en"] .parent-rule .rule,html[lang="ko"] .parent-rule .rule{
  margin-top:18px;
}

@media (min-width: 1499px){
  .rule-inside-media{
    transform:translateY(19px);
  }
  .parent-rule .rule-inside-media{
    top:19px;
  }
  html[lang="en"] .rule-inside-media,html[lang="ko"] .rule-inside-media{
    transform:translateY(18px);
  }
  html[lang="en"] .parent-rule .rule-inside-media,html[lang="ko"] .parent-rule .rule-inside-media{
    top:18px;
  }
  .inner-partial-rule{
    padding-top:16px;
  }
  html[lang="en"] .inner-partial-rule{
    padding-top:21px;
  }
  .partial-rule{
    pading-top:16px;
  }
  html[lang="en"] .partial-rule{
    pading-top:21px;
  }
  .rule{
    padding-top:21px;
  }
  .parent-rule .rule{
    margin-top:21px;
  }
}

@media (min-width: 1499px) and (min-width: 1499px){
  .rule-inside-media{
    transform:translateY(21px);
  }
  .parent-rule .rule-inside-media{
    top:21px;
  }
}

```


#### Work in progress...
