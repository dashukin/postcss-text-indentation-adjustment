/*
* postcss-text-metrics plugin tests
* */

/*global
 	describe, test, expect
 */

/**
 * @name expect
 * @property toBe
 * @property toMatch
 */

import postcss from 'postcss';
import postcsssTextMetrics from './text-metrics';
import {minify} from 'sqwish';

const textMetricsPlugin = postcsssTextMetrics({
	dotReplacement: '%dot%',
	corrections: {
		'selector': [{
			atRule: null,
			selector: '',
			baseDelta: 4,
			decreaseBy: 0
		}],
		'selector-with-parent-selector': [{
			atRule: null,
			selector: '.only-parent-selector',
			baseDelta: 4,
			decreaseBy: 0
		}],
		'selector-with-parent-attr-selector': [{
			atRule: null,
			selector: 'html[lang=en]',
			baseDelta: 4,
			decreaseBy: 0
		}],
		'with-complex-parent-selector': [{
			atRule: null,
			selector: '.complex:first-child > .parent + selector',
			baseDelta: 4,
			decreaseBy: 0
		}],
		'rule-with-multiple-selectors': [{
			atRule: null,
			selector: '',
			baseDelta: 4,
			decreaseBy: 0
		}],
		'rule-with-multiple-selectors-and-parent-selector': [{
			atRule: null,
			selector: '',
			baseDelta: 4,
			decreaseBy: 0
		}],
		'simple-rule-within-atrule': [{
			atRule: null,
			selector: '',
			baseDelta: 4,
			decreaseBy: 0
		}],
		'simple-rule-within-atrule-with-parent-selector': [{
			atRule: null,
			selector: '',
			baseDelta: 4,
			decreaseBy: 0
		}],
		'simple-rule-within-atrule-with-multiple-selectors': [{
			atRule: null,
			selector: '',
			baseDelta: 4,
			decreaseBy: 0
		}],
		'simple-rule-within-atrule-with-multiple-parent-selectors': [{
			atRule: null,
			selector: '',
			baseDelta: 4,
			decreaseBy: 0
		}],
		'simple-rule-with-atrule-correction': [{
			atRule: {
				name: 'media',
				params: '(min-width: 1499px)'
			},
			selector: '',
			baseDelta: 4,
			decreaseBy: 0
		}],
		'simple-rule-with-atrule-and-selector-correction': [{
			atRule: {
				name: 'media',
				params: '(min-width: 1499px)'
			},
			selector: '.parent-selector',
			baseDelta: 4,
			decreaseBy: 0
		}],
		'combination': [{
			atRule: null,
			selector: '',
			baseDelta: 4,
			decreaseBy: 0
		}, {
			atRule: null,
			selector: '.parent-selector',
			baseDelta: 4,
			decreaseBy: 0
		}, {
			atRule: {
				name: 'media',
				params: '(min-width: 1499px)'
			},
			selector: '.parent-selector',
			baseDelta: 4,
			decreaseBy: 0
		}]
	}
});

const processCSS = function (css) {
	return postcss().use(textMetricsPlugin).process(css).toString();
};

describe('Text-metrics plugin', () => {
	
	/**
	 * Test cases:
	 * 1. Simple rule
	 * 2. Simple rule with parent className selector
	 * 3. Simple rule with parent attribute selector
	 * 4. Simple rule with parent complex selector
	 * 5. Simple rule with multiple selectors
	 * 6. Simple rule with multiple selectors, any or each of them could have parent selector
	 * 7. Simple rule within atRule
	 * 8. Simple rule within atRule with parent selector
	 * 9. Simple rule within atRule with multiple selectors
	 * 10. Simple rule within atRule with multiple selectors, any or each of them could have parent selector
	 */
	
	/**
	 * CSS rules without correction templates should not be affected
	 */
	describe('should not modify css rule without correction templates in', () => {
		
		/**
		 * 1. Simple rule
		 */
		test('in simple rule', () => {
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
		
		
		/**
		 * 2. Simple rule with parent selector
		 */
		test('should not affect rule with parent selector', () => {
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
		
		
		/**
		 * 3. Simple rule with parent attribute selector
		 */
		test('should not affect rule with parent attribute selector', () => {
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
		
		
		/**
		 * 4. Simple rule with parent complex selector
		 */
		test('should not affect rule with parent complex selector', () => {
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
		
		
		/**
		 * 5. Simple rule with multiple selectors
		 */
		test('should not affect rule with multiple selectors', () => {
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
		
		
		/**
		 * 6. Simple rule with multiple selectors, any or each of them could have parent selector
		 */
		test('should not affect rule with multiple selectors, any or each of them could have parent selector', () => {
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
		
		
		/**
		 * 7. Simple rule within atRule
		 */
		test('should not affect rule within atRule', () => {
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
		
		
		/**
		 * 8. Simple rule within atRule with parent selector
		 */
		test('should not affect rule within atRule with parent selector', () => {
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
		
		/**
		 * 9. Simple rule within atRule with multiple selectors
		 */
		test('should not affect rule within atRule with multiple selectors', () => {
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
		
		/**
		 * 10. Simple rule within atRule with multiple selectors, any or each of them could have parent selector
		 */
		test('should not affect rule within atRule with multiple selectors', () => {
			const css = `
				@media (min-width: 1499px) {
					.first-parent-selector .first-rule-within-media,
					.second-rule-within-media,
					.third-parent-selector .third-rule-within-media {
						font-size: 16px;
						line-height: 22px;
					}
				}
			`;
			const expected = `
				@media (min-width: 1499px) {
					.first-parent-selector .first-rule-within-media,
					.second-rule-within-media,
					.third-parent-selector .third-rule-within-media {
						font-size: 16px;
						line-height: 22px;
					}
				}
			`;
			const processed = processCSS(css);
			expect(processed).toBe(expected);
		});
		
	});
	
	
	/**
	 * CSS rules with correction templates should be modified
	 */
	describe('should modify css with correction template in', () => {
		
		/**
		 * 1. Simple rule
		 */
		test('simple rule', () => {
			const css = `
				.simple-rule {
					padding-bottom: 24px /*{24px, selector}*/;
					transform: translate(24px) /*translate({24px, selector})*/;
				}
				.initial-parent-selector .simple-rule {
					margin-top: 24px /*{24px, selector}*/;
				}
			`;
			const expected = `
				.simple-rule {
					padding-bottom: 20px;
					transform: translate(20px);
				}
				.initial-parent-selector .simple-rule {
					margin-top: 20px;
				}
			`;
			const processed = processCSS(css);
			expect(processed).toBe(expected);
		});
		
		
		/**
		 * 2. Simple rule with parent selector
		 */
		test('rule with parent selector', () => {
			const css = `
				.simple-rule {
					padding-bottom: 24px /*{24px, selector-with-parent-selector}*/;
				}
			`;
			const expected = `
				.simple-rule {
					padding-bottom: 24px;
				}
				.only-parent-selector .simple-rule {
					padding-bottom: 20px;
				}
			`;
			const processed = processCSS(css);
			expect(processed).toBe(expected);
		});
		
		
		/**
		 * 3. Simple rule with parent attribute selector
		 */
		test('rule with parent attribute selector', () => {
			const css = `
				.simple-rule {
					padding-bottom: 24px /*{24px, selector-with-parent-attr-selector}*/;
				}
			`;
			const expected = `
				.simple-rule {
					padding-bottom: 24px;
				}
				html[lang=en] .simple-rule {
					padding-bottom: 20px;
				}
			`;
			const processed = processCSS(css);
			expect(processed).toBe(expected);
		});
		
		
		/**
		 * 4. Simple rule with parent complex selector
		 */
		test('rule with parent complex selector', () => {
			const css = `
				.rule {
					padding-bottom: 24px /*{24px, with-complex-parent-selector}*/;
				}
			`;
			const expected = `
				.rule {
					padding-bottom: 24px;
				}
				.complex:first-child > .parent + selector .rule {
					padding-bottom: 20px;
				}
			`;
			const processed = processCSS(css);
			expect(processed).toBe(expected);
		});
		
		
		/**
		 * 5. Simple rule with multiple selectors
		 */
		test('rule with multiple selectors', () => {
			const css = `
				.first-selector-in-multiple-selectors, 
				.second-selector-in-multiple-selectors {
						margin-top: 24px /*{24px, rule-with-multiple-selectors}*/;
					}
				`;
			const expected = `
				.first-selector-in-multiple-selectors, 
				.second-selector-in-multiple-selectors {
						margin-top: 20px;
					}
				`;
			const processed = processCSS(css);
			expect(processed).toBe(expected);
		});
		
		
		/**
		 * 6. Simple rule with multiple selectors, any or each of them could have parent selector
		 */
		test('rule with multiple selectors, any or each of them could have parent selector', () => {
			const css = `
					.first-parent-selector .first-selector-in-multiple-selectors, 
					.second-selector-in-multiple-selectors,
					.third-parent > div .third-selector-in-multiple-selectors {
						padding-bottom: 24px /*{24px, rule-with-multiple-selectors-and-parent-selector}*/;
					}
				`;
			const expected = `
					.first-parent-selector .first-selector-in-multiple-selectors, 
					.second-selector-in-multiple-selectors,
					.third-parent > div .third-selector-in-multiple-selectors {
						padding-bottom: 20px;
					}
				`;
			const processed = processCSS(css);
			expect(processed).toBe(expected);
		});
		
		
		/**
		 * 7. Simple rule within atRule
		 */
		test('rule within atRule', () => {
			const css = `
					@media (min-width: 1499px) {
						.simple-rule-within-media {
							margin-top: 24px /*{24px, simple-rule-within-atrule}*/;
						}
					}
				`;
			const expected = `
					@media (min-width: 1499px) {
						.simple-rule-within-media {
							margin-top: 20px;
						}
					}
				`;
			const processed = processCSS(css);
			expect(processed).toBe(expected);
		});
		
		
		/**
		 * 8. Simple rule within atRule with parent selector
		 */
		test('rule within atRule with parent selector', () => {
			const css = `
					@media (min-width: 1499px) {
						.parent-selector .simple-rule-within-media {
							margin-top: 24px /*{24px, simple-rule-within-atrule-with-parent-selector}*/;
						}
					}
				`;
			const expected = `
					@media (min-width: 1499px) {
						.parent-selector .simple-rule-within-media {
							margin-top: 20px;
						}
					}
				`;
			const processed = processCSS(css);
			expect(processed).toBe(expected);
		});
		
		
		/**
		 * 9. Simple rule within atRule with multiple selectors
		 */
		test('rule within atRule with multiple selectors', () => {
			const css = `
					@media (min-width: 1499px) {
						.first-rule-within-media,
						.second-rule-within-media {
							margin-top: 24px /*{24px, simple-rule-within-atrule-with-multiple-selectors}*/;
						}
					}
				`;
			const expected = `
					@media (min-width: 1499px) {
						.first-rule-within-media,
						.second-rule-within-media {
							margin-top: 20px;
						}
					}
				`;
			const processed = processCSS(css);
			expect(processed).toBe(expected);
		});
		
		
		/**
		 * 10. Simple rule within atRule with multiple selectors, any or each of them could have parent selector
		 */
		test('rule with multiple selectors, any or each of them could have parent selector', () => {
			const css = `
					@media (min-width: 1499px) {
						.first-parent-selector .first-rule-within-media,
						.second-rule-within-media,
						.third-parent-selector .third-rule-within-media {
							margin-top: 24px /*{24px, simple-rule-within-atrule-with-multiple-parent-selectors}*/;
						}
					}
				`;
			const expected = `
					@media (min-width: 1499px) {
						.first-parent-selector .first-rule-within-media,
						.second-rule-within-media,
						.third-parent-selector .third-rule-within-media {
							margin-top: 20px;
						}
					}
				`;
			const processed = processCSS(css);
			expect(processed).toBe(expected);
		});
		
	});
	
	
	/**
	 * CSS rules with correction templates based on combined correction data (atRule + parent selector) should generate multiple rules
	 */
	describe('should modify CSS with multiple combinations of rules based on selector and/or atRule data', () => {
		
		test('with selector parameter only', () => {
			const css = `
				.simple-rule {
					padding-bottom: 24px /*{24px, selector-with-parent-selector}*/;
				}
			`;
			const expected = `
				.simple-rule {
					padding-bottom: 24px;
				}
				.only-parent-selector .simple-rule {
					padding-bottom: 20px;
				}
			`;
			const processed = processCSS(css);
			expect(processed).toBe(expected);
		});
		
		
		test('with atRule parameter only', () => {
			const css = `
				.simple-rule {
					padding-bottom: 24px /*{24px, simple-rule-with-atrule-correction}*/;
				}
			`;
			const expected = `
				.simple-rule {
					padding-bottom: 24px;
				}
				@media (min-width: 1499px) {
					.simple-rule {
						padding-bottom: 20px;
					}
				}
			`;
			const processed = processCSS(css);
			expect(minify(processed)).toBe(minify(expected));
		});
		
		
		test('with atRule and selector', () => {
			const css = `
				.simple-rule {
					padding-bottom: 24px /*{24px, simple-rule-with-atrule-and-selector-correction}*/;
				}
			`;
			const expected = `
				.simple-rule {
					padding-bottom: 24px;
				}
				@media (min-width: 1499px) {
					.parent-selector .simple-rule {
						padding-bottom: 20px;
					}
				}
			`;
			const processed = processCSS(css);
			expect(minify(processed)).toBe(minify(expected));
		});
		
		
		test('with combination of correction rules: simple, atrule, selector, atrule + selector', () => {
			const css = `
				.simple-rule {
					background: red;
					padding-bottom: 24px /*{24px, combination}*/;
				}
			`;
			const expected = `
				.simple-rule {
					background: red;
					padding-bottom: 20px;
				}
				.parent-selector .simple-rule {
					padding-bottom: 20px;
				}
				@media (min-width: 1499px) {
					.parent-selector .simple-rule {
						padding-bottom: 20px;
					}
				}
			`;
			const processed = processCSS(css);
			expect(minify(processed)).toBe(minify(expected));
		});
		
	});
	
});

