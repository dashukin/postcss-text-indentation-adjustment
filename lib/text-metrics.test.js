/*
* postcss-text-metrics plugin tests
* */

/*global
 	describe, test, expect
 */

/**
 * @name expect
 * @property toBe
 */

import postcss from 'postcss';
import postcsssTextMetrics from './text-metrics';

const textMetricsPlugin = postcsssTextMetrics({
	dotReplacement: '%dot%'
});

const processCSS = function (css) {
	return postcss().use(textMetricsPlugin).process(css).toString();
};

describe('Text-metrics adjustment', () => {
	
	describe('css without correction templates', () => {
		
		test('it should not affect simple rule', () => {
			const css = `
				.simple-rule {
					font-size: 12px;
					line-height: 18px;
					font-family: Arial;
				}
			`;
			
			const expected = `
				.simple-rule {
					font-size: 12px;
					line-height: 18px;
					font-family: Arial;
				}
			`;
			
			const processed = processCSS(css);
			
			expect(processed).toBe(expected);
		});
		
		test('it should not affect rule with parent selector', () => {
			const css = `
				.parent-selector .simple-rule {
					font-size: 14px;
					line-height: 18px;
					font-family: Arial;
				}
			`;
			
			const expected = `
				.parent-selector .simple-rule {
					font-size: 14px;
					line-height: 18px;
					font-family: Arial;
				}
			`;
			
			const processed = processCSS(css);
			
			expect(processed).toBe(expected);
		});
		
		test('it should not affect rule with parent attribute selector', () => {
			const css = `
				html[lang="ko"] .rule-with-parent {
					font-size: 14px;
					line-height: 18px;
					font-family: Arial;
				}
			`;
			
			const expected = `
				html[lang="ko"] .rule-with-parent {
					font-size: 14px;
					line-height: 18px;
					font-family: Arial;
				}
			`;
			
			const processed = processCSS(css);
			
			expect(processed).toBe(expected);
		});
		
		test('it should not affect rule with parent complex selector', () => {
			const css = `
				.description-block > .copy-block .rule-with-complex-parent-selector {
					font-size: 14px;
					line-height: 18px;
					font-family: Arial;
				}
			`;
			
			const expected = `
				.description-block > .copy-block .rule-with-complex-parent-selector {
					font-size: 14px;
					line-height: 18px;
					font-family: Arial;
				}
			`;
			
			const processed = processCSS(css);
			
			expect(processed).toBe(expected);
		});
		
		test('it should not affect rule with multiple selectors', () => {
			const css = `
				.first-selector-in-multiple-selectors, 
				.second-selector-in-multiple-selectors {
					font-size: 14px;
					line-height: 18px;
					font-family: Arial;
				}
			`;
			
			const expected = `
				.first-selector-in-multiple-selectors, 
				.second-selector-in-multiple-selectors {
					font-size: 14px;
					line-height: 18px;
					font-family: Arial;
				}
			`;
			
			const processed = processCSS(css);
			
			expect(processed).toBe(expected);
		});
		
		test('it should not affect rule with multiple selectors, any or each of them should have parent selector', () => {
			const css = `
				.first-parent-selector .first-selector-in-multiple-selectors, 
				.second-selector-in-multiple-selectors,
				.third-parent > div .third-selector-in-multiple-selectors {
					font-size: 14px;
					line-height: 18px;
					font-family: Arial;
				}
			`;
			
			const expected = `
				.first-parent-selector .first-selector-in-multiple-selectors, 
				.second-selector-in-multiple-selectors,
				.third-parent > div .third-selector-in-multiple-selectors {
					font-size: 14px;
					line-height: 18px;
					font-family: Arial;
				}
			`;
			
			const processed = processCSS(css);
			
			expect(processed).toBe(expected);
		});
		
		test('it should not affect rule within atRule', () => {
			const css = `
				@media (min-width: 1499px) {
					.simple-rule-within-media {
						font-size: 16px;
						line-height: 22px;
					}
				}
			`;
			
			const expected = `
				@media (min-width: 1499px) {
					.simple-rule-within-media {
						font-size: 16px;
						line-height: 22px;
					}
				}
			`;
			
			const processed = processCSS(css);
			
			expect(processed).toBe(expected);
		});
		
		test('it should not affect rule within atRule with parent selector', () => {
			const css = `
				@media (min-width: 1499px) {
					.parent-selector .simple-rule-within-media {
						font-size: 16px;
						line-height: 22px;
					}
				}
			`;
			
			const expected = `
				@media (min-width: 1499px) {
					.parent-selector .simple-rule-within-media {
						font-size: 16px;
						line-height: 22px;
					}
				}
			`;
			
			const processed = processCSS(css);
			
			expect(processed).toBe(expected);
		});
		
		test('it should not affect rule within atRule with multiple selectors', () => {
			const css = `
				@media (min-width: 1499px) {
					.first-rule-within-media,
					.second-rule-within-media {
						font-size: 16px;
						line-height: 22px;
					}
				}
			`;
			
			const expected = `
				@media (min-width: 1499px) {
					.first-rule-within-media,
					.second-rule-within-media {
						font-size: 16px;
						line-height: 22px;
					}
				}
			`;
			
			const processed = processCSS(css);
			
			expect(processed).toBe(expected);
		});
		
	});
	
	
});

