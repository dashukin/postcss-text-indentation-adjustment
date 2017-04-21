/*
* postcss-text-metrics parser test
* */

/*global
	describe, test
 */

/**
 * @name expect
 * @property toEqual
 */

import parser from './parser';

const dotReplacement = '%dot%';

const parse = parser({
	dotReplacement
});

let baseData = {
	atRule: null,
	selector: '',
	className: '',
	delta: 0,
	baseDelta: 0,
	decreaseBy: 0,
	fontSize: 0,
	lineHeight: 0
};

/**
 * Tests should include next combinations:
 * 1. Simple rule
 * 2. Simple rule with parent className selector
 * 3. Simple rule with parent attribute selector
 * 4. Simple rule with parent complex selector
 * 5. Simple rule with multiple selectors
 * 6. Simple rule with multiple selectors, any or each of them should have parent selector
 * 7. Simple rule within atRule 
 * 8. Simple rule within atRule with parent selector
 * 9. Simple rule within atRule with multiple selectors
 * 10. Simple rule within atRule with multiple selectors, any or each of them should have parent selector
 */

describe('CSS parser', () => {
	
	/**
	 * 1. Simple rule
	 */
	test('it should parse CSS rule', () => {
		
		const css = `
			.simple-rule {
				font-size: 12px;
				line-height: 18px;
				font-family: Arial;
			}
		`;
		
		const expectedData = {
			[`${dotReplacement}simple-rule`]: [Object.assign(baseData, {
				className: '.simple-rule',
				fontSize: 12, 
				lineHeight: 18,
				delta: 3,
				baseDelta: 3
			})]
		};
		
		const parsedData = parse(css);
		
		expect(parsedData).toEqual(expectedData);
		
	});
	
	
	/**
	 * 2. Simple rule with parent selector
	 */
	test('it should parse CSS rule with parent selector', () => {
		
		const css = `
			.parent-selector .simple-rule {
				font-size: 14px;
				line-height: 18px;
				font-family: Arial;
			}
		`;
		
		const expectedData = {
			[`${dotReplacement}simple-rule`]: [Object.assign(baseData, {
				className: '.simple-rule',
				selector: '.parent-selector',
				fontSize: 14,
				lineHeight: 18,
				delta: 2,
				baseDelta: 2
			})]
		};
		
		const parsedData = parse(css);
		
		expect(parsedData).toEqual(expectedData);
		
	});
	
	
	/**
	 * 3. Simple rule with parent attribute selector
	 */
	test('it should parse CSS rule with parent attribute selector', () => {
		
		const css = `
			html[lang="ko"] .rule-with-parent {
				font-size: 14px;
				line-height: 18px;
				font-family: Arial;
			}
		`;
		
		const expectedData = {
			[`${dotReplacement}rule-with-parent`]: [Object.assign(baseData, {
				className: '.rule-with-parent',
				selector: 'html[lang="ko"]',
				fontSize: 14,
				lineHeight: 18,
				delta: 2,
				baseDelta: 2
			})]
		};
		
		const parsedData = parse(css);
		
		expect(parsedData).toEqual(expectedData);
		
	});
	
	
	/**
	 * 4. Simple rule with parent complex selector
	 */
	test('it should parse CSS rule with parent complex selector', () => {
		
		const css = `
			.description-block > .copy-block .rule-with-complex-parent-selector {
				font-size: 14px;
				line-height: 18px;
				font-family: Arial;
			}
		`;
		
		const expectedData = {
			[`${dotReplacement}rule-with-complex-parent-selector`]: [Object.assign({}, baseData, {
				className: '.rule-with-complex-parent-selector',
				selector: '.description-block > .copy-block',
				fontSize: 14,
				lineHeight: 18,
				delta: 2,
				baseDelta: 2
			})]
		};
		
		const parsedData = parse(css);
		
		expect(parsedData).toEqual(expectedData);
		
	});
	
	
	/**
	 * 5. Simple rule with multiple selectors
	 */
	test('it should parse CSS rule with multiple selectors', () => {

		const css = `
			.first-selector-in-multiple-selectors, 
			.second-selector-in-multiple-selectors {
				font-size: 14px;
				line-height: 18px;
				font-family: Arial;
			}
		`;
		
		const expectedData = {
			[`${dotReplacement}first-selector-in-multiple-selectors`]: [Object.assign({}, baseData, {
				className: '.first-selector-in-multiple-selectors',
				selector: '',
				fontSize: 14,
				lineHeight: 18,
				delta: 2,
				baseDelta: 2
			})],
			[`${dotReplacement}second-selector-in-multiple-selectors`]: [Object.assign({}, baseData, {
				className: '.second-selector-in-multiple-selectors',
				selector: '',
				fontSize: 14,
				lineHeight: 18,
				delta: 2,
				baseDelta: 2
			})]
		};
		
		const parsedData = parse(css);
		
		expect(parsedData).toEqual(expectedData);
		
	});
	
	
	/**
	 * 6. Simple rule with multiple selectors, any or each of them should have parent selector
	 */
	test('it should parse CSS with multiple selectors, any or each of them should have parent selector', () => {
		
		const css = `
			.first-parent-selector .first-selector-in-multiple-selectors, 
			.second-selector-in-multiple-selectors,
			.third-parent > div .third-selector-in-multiple-selectors {
				font-size: 14px;
				line-height: 18px;
				font-family: Arial;
			}
		`;
		
		const expectedData = {
			[`${dotReplacement}first-selector-in-multiple-selectors`]: [Object.assign({}, baseData, {
				className: '.first-selector-in-multiple-selectors',
				selector: '.first-parent-selector',
				fontSize: 14,
				lineHeight: 18,
				delta: 2,
				baseDelta: 2
			})],
			[`${dotReplacement}second-selector-in-multiple-selectors`]: [Object.assign({}, baseData, {
				className: '.second-selector-in-multiple-selectors',
				selector: '',
				fontSize: 14,
				lineHeight: 18,
				delta: 2,
				baseDelta: 2
			})],
			[`${dotReplacement}third-selector-in-multiple-selectors`]: [Object.assign({}, baseData, {
				className: '.third-selector-in-multiple-selectors',
				selector: '.third-parent > div',
				fontSize: 14,
				lineHeight: 18,
				delta: 2,
				baseDelta: 2
			})]
		};
		
		const parsedData = parse(css);
		
		expect(parsedData).toEqual(expectedData);
		
	});
	
	
	/**
	 * 7. Simple rule within atRule
	 */
	test('it should parse CSS rule within atRule', () => {
		
		const css = `
			@media (min-width: 1499px) {
				.simple-rule-within-media {
					font-size: 16px;
					line-height: 22px;
				}
			}
		`;
		
		const expectedData = {
			[`${dotReplacement}simple-rule-within-media`]: [Object.assign({}, baseData, {
				atRule: {
					name: 'media',
					params: '(min-width: 1499px)'
				},
				className: '.simple-rule-within-media',
				selector: '',
				fontSize: 16,
				lineHeight: 22,
				delta: 3,
				baseDelta: 3
			})]
		};
		
		const parsedData = parse(css);
		
		expect(parsedData).toEqual(expectedData);
		
	});
	
	
	/**
	 * 8. Simple rule within atRule with parent selector
	 */
	test('it should parse CSS rule within atRule with parent selector', () => {
		
		const css = `
			@media (min-width: 1499px) {
				.parent-selector .simple-rule-within-media {
					font-size: 16px;
					line-height: 22px;
				}
			}
		`;
		
		const expectedData = {
			[`${dotReplacement}simple-rule-within-media`]: [Object.assign({}, baseData, {
				atRule: {
					name: 'media',
					params: '(min-width: 1499px)'
				},
				className: '.simple-rule-within-media',
				selector: '.parent-selector',
				fontSize: 16,
				lineHeight: 22,
				delta: 3,
				baseDelta: 3
			})]
		};
		
		const parsedData = parse(css);
		
		expect(parsedData).toEqual(expectedData);
		
	});
	
	
	/**
	 * 9. Simple rule within atRule with multiple selectors
	 */
	test('it should parse CSS rule within atRule with multiple selectors', () => {
		
		const css = `
			@media (min-width: 1499px) {
				.first-rule-within-media,
				.second-rule-within-media {
					font-size: 16px;
					line-height: 22px;
				}
			}
		`;
		
		const expectedData = {
			[`${dotReplacement}first-rule-within-media`]: [Object.assign({}, baseData, {
				atRule: {
					name: 'media',
					params: '(min-width: 1499px)'
				},
				className: '.first-rule-within-media',
				selector: '',
				fontSize: 16,
				lineHeight: 22,
				delta: 3,
				baseDelta: 3
			})],
			[`${dotReplacement}second-rule-within-media`]: [Object.assign({}, baseData, {
				atRule: {
					name: 'media',
					params: '(min-width: 1499px)'
				},
				className: '.second-rule-within-media',
				selector: '',
				fontSize: 16,
				lineHeight: 22,
				delta: 3,
				baseDelta: 3
			})]
		};
		
		const parsedData = parse(css);
		
		expect(parsedData).toEqual(expectedData);
		
	});
	
	
	/**
	 * 10. Simple rule within atRule with multiple selectors, any or each of them should have parent selector
	 */
	test('it should parse CSS rule within atRule with multiple selectors, any or each of them should have parent selector', () => {
		
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
		
		const expectedData = {
			[`${dotReplacement}first-rule-within-media`]: [Object.assign({}, baseData, {
				atRule: {
					name: 'media',
					params: '(min-width: 1499px)'
				},
				className: '.first-rule-within-media',
				selector: '.first-parent-selector',
				fontSize: 16,
				lineHeight: 22,
				delta: 3,
				baseDelta: 3
			})],
			[`${dotReplacement}second-rule-within-media`]: [Object.assign({}, baseData, {
				atRule: {
					name: 'media',
					params: '(min-width: 1499px)'
				},
				className: '.second-rule-within-media',
				selector: '',
				fontSize: 16,
				lineHeight: 22,
				delta: 3,
				baseDelta: 3
			})],
			[`${dotReplacement}third-rule-within-media`]: [Object.assign({}, baseData, {
				atRule: {
					name: 'media',
					params: '(min-width: 1499px)'
				},
				className: '.third-rule-within-media',
				selector: '.third-parent-selector',
				fontSize: 16,
				lineHeight: 22,
				delta: 3,
				baseDelta: 3
			})]
		};
		
		const parsedData = parse(css);
		
		expect(parsedData).toEqual(expectedData);
		
	});
	
	
});

