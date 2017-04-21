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

const onlyParentConfig = {
	'p': [{
		atRule: null,
		selector: '.parent-selector',
		baseDelta: 4
	}]
};

const onlyParentPlugin = postcsssTextMetrics({
	
});

describe('Should process CSS code', () => {
	test('with a simple declaration', () => {
		expect(true).toBe(true);
	});
});

