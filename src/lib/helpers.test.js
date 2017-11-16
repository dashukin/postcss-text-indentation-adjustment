/*
* postcss-text-metrics helpers tests
* */

/*global
	describe, xdescribe, test, expect
 */

import {
	extractDeclarations,
	extractProperty,
	extractValue,
	extractGroups,
	hasGroup,
	exctractAtRuleReplacement,
	makeStringOneLine,
	hasDebugOption,
	extractDebugOption
} from './helpers';

test('should return array of parsed declarations or empty array if no declarations were found', () => {
	expect(extractDeclarations('padding: {$p1, .l2, .p2} {$p2, .l2, .p3};'))
		.toEqual(['padding: {$p1, .l2, .p2} {$p2, .l2, .p3};']);
	
	expect(extractDeclarations(' padding: {$p1, .l2, .p2} {$p2, .l2, .p3}; '))
		.toEqual(['padding: {$p1, .l2, .p2} {$p2, .l2, .p3};']);
	
	expect(extractDeclarations('dfggdf2 323 padding: {$p1, .l2, .p2} {$p2, .l2, .p3}; dsfg'))
		.toEqual(['padding: {$p1, .l2, .p2} {$p2, .l2, .p3};']);
	
	expect(extractDeclarations(' padding: {$p1, .l2, .p2} 0 {$p2, .l2, .p3};'))
		.toEqual(['padding: {$p1, .l2, .p2} 0 {$p2, .l2, .p3};']);
	
	expect(extractDeclarations('sdf -webkit-padding-top: {$p1, .l2, .p2} 0 {$p2, .l2, .p3};'))
		.toEqual(['-webkit-padding-top: {$p1, .l2, .p2} 0 {$p2, .l2, .p3};']);
	
	expect(extractDeclarations('margin: {$p1, .l2, .p2} 0 {$p2, .l2, .p3};'))
		.toEqual(['margin: {$p1, .l2, .p2} 0 {$p2, .l2, .p3};']);
	
	expect(extractDeclarations('margin: 12px {$p1, .l2, .p2} 0 {$p2, .l2, .p3};'))
		.toEqual(['margin: 12px {$p1, .l2, .p2} 0 {$p2, .l2, .p3};']);
	
	expect(extractDeclarations('margin: {$p1, .l2, .p2} {$p1, .l2, .p2} {$p1, .l2, .p2} {$p1, .l2, .p2};'))
		.toEqual(['margin: {$p1, .l2, .p2} {$p1, .l2, .p2} {$p1, .l2, .p2} {$p1, .l2, .p2};']);
	
	expect(extractDeclarations(`
				padding-bottom: {$p4, .p2, .p1}px;
				padding-right: {$p3, .p2, .p1};
				padding: {$p2, .p2, .l1} 0 {$p1-5, .p2, .l2};
			`))
		.toEqual(['padding-bottom: {$p4, .p2, .p1}px;', 'padding-right: {$p3, .p2, .p1};', 'padding: {$p2, .p2, .l1} 0 {$p1-5, .p2, .l2};']);
	
	// without semicolon
	// postcss doesn't process comments in declaration if it is not ended with semicolon
	expect(extractDeclarations('margin: 3px'))
		.toEqual([]);
});

test('should return css declaration property from string',() => {
	expect(extractProperty('padding: 2px'))
		.toEqual('padding');
	
	expect(extractProperty('padding-top: {$p1, .l1, .p2}'))
		.toEqual('padding-top');
	
	expect(extractProperty('-webkit-padding-top: {$p1, .l1, .p2}'))
		.toEqual('-webkit-padding-top')
});

describe('.hasDebugOption', () => {
	test('should return true when declaration value contains ---debug flag', () => {
		expect(hasDebugOption('padding: 2px /*{2px} --debug */'))
			.toBeTruthy();

		expect(hasDebugOption('padding: 2px /*{2px} --debug*/'))
			.toBeTruthy();
	});

	test('should return false when declaration value doesn\'t contains ---debug flag', () => {
		expect(hasDebugOption('padding: 2px /*{2px}--debug */'))
			.toBeFalsy();

		expect(hasDebugOption('padding: 2px /*{2px}--debug*/'))
			.toBeFalsy();

		expect(hasDebugOption('padding: 2px /*{2px} --debugger */'))
			.toBeFalsy();
	});
});

describe('.extractDebugOption', () => {
	test('should return array containing declaration value without --debug flag as a first argument ' +
		'and false as a second argument', () => {
		expect(extractDebugOption('padding: 2px /*{2px}*/'))
			.toEqual(['padding: 2px /*{2px}*/', false]);

		expect(extractDebugOption('padding: 2px /*{2px} --flag*/'))
			.toEqual(['padding: 2px /*{2px} --flag*/', false]);

		expect(extractDebugOption('padding: 2px /*{2px}--debug*/'))
			.toEqual(['padding: 2px /*{2px}--debug*/', false]);

		expect(extractDebugOption('padding: 2px /*{2px}--debugger*/'))
			.toEqual(['padding: 2px /*{2px}--debugger*/', false]);

		expect(extractDebugOption('padding: 2px /*{2px} --debugger*/'))
			.toEqual(['padding: 2px /*{2px} --debugger*/', false]);

		expect(extractDebugOption('padding: 2px /*{2px}--debugger */'))
			.toEqual(['padding: 2px /*{2px}--debugger */', false]);

		expect(extractDebugOption('padding: 2px /*{2px} --debugger */'))
			.toEqual(['padding: 2px /*{2px} --debugger */', false]);
	});

	test('should return array containing declaration value without --debug flag as a first argument ' +
		'and true as a second argument', () => {
		expect(extractDebugOption('padding: 1px /*{1px} --debug */'))
			.toEqual(['padding: 1px /*{1px} */', true]);

		expect(extractDebugOption('padding: 2px /*{2px} --debug*/'))
			.toEqual(['padding: 2px /*{2px} */', true]);

		expect(extractDebugOption('padding: 3px /*{3px} --debug --flag*/'))
			.toEqual(['padding: 3px /*{3px} --flag*/', true]);

	});
});

describe('.extractValue', () => {
	test('should return css declaration value under the .value property of object parsed from string', () => {
		expect(extractValue('padding: 2px').value)
			.toEqual('2px');

		expect(extractValue('padding-top: {$p2, l1, l2}').value)
			.toEqual('{$p2, l1, l2}');

		expect(extractValue('padding: 2px {$p2, l1, l2}').value)
			.toEqual('2px {$p2, l1, l2}');

		expect(extractValue('padding: 2px {$p2, l1, l2} 2px {$p2, l1, l2}').value)
			.toEqual('2px {$p2, l1, l2} 2px {$p2, l1, l2}');

		expect(extractValue('padding: {$p2, l1, l2} 2px {$p2, l1, l2} 2px').value)
			.toEqual('{$p2, l1, l2} 2px {$p2, l1, l2} 2px');

		expect(extractValue('padding:{$p2, l1, l2} 2px {$p2, l1, l2} 2px').value)
			.toEqual('{$p2, l1, l2} 2px {$p2, l1, l2} 2px');

		expect(extractValue('padding:3px 2px {$p2, l1, l2} 2px').value)
			.toEqual('3px 2px {$p2, l1, l2} 2px');

		expect(extractValue('padding:3px 2px 2px').value)
			.toEqual('3px 2px 2px');

		expect(extractValue('padding-bottom: $p2/*{$p2, .p1, .bcaps}*/').value)
			.toEqual('{$p2, .p1, .bcaps}');

		expect(extractValue('padding-bottom: $p2 /*{$p2, .p1, .bcaps} */').value)
			.toEqual('{$p2, .p1, .bcaps}');
	});

	test('should return debug value under the .debug property of object parsed from string', () => {
		// truthy
		expect(extractValue('padding: 2px --debug ').debug)
			.toBeTruthy();

		expect(extractValue('padding-top: {$p2, l1, l2} --debug').debug)
			.toBeTruthy();

		expect(extractValue('padding-bottom: $p2/*{$p2, .p1, .bcaps} --debug */').debug)
			.toBeTruthy();

		expect(extractValue('padding-bottom: $p2/*{$p2, .p1, .bcaps} --debug*/\'/').debug)
			.toBeTruthy();

		// falsy
		expect(extractValue('padding: 2px--debug ').debug)
			.toBeFalsy();

		expect(extractValue('padding-top: {$p2, l1, l2}--debug').debug)
			.toBeFalsy();

		expect(extractValue('padding-bottom: $p2/*{$p2, .p1, .bcaps} --debugger */').debug)
			.toBeFalsy();

		expect(extractValue('padding-bottom: $p2/*{$p2, .p1, .bcaps}--debug*/\'/').debug)
			.toBeFalsy();

		expect(extractValue('padding-bottom: $p2/*{$p2, .p1, .bcaps}--debuger*/\'/').debug)
			.toBeFalsy();
	});
});

test('should return array of correction groups from string', () => {
	expect(extractGroups(' {1, 2, 3} '))
		.toEqual(['1, 2, 3']);
	
	expect(extractGroups(' {1, 2, 3} asd {$p2, .l1, } 0'))
		.toEqual(['1, 2, 3', '$p2, .l1,']);
	
	expect(extractGroups('asdf{$p1, .l1, 3}__!{}{24px, 12, .l2}{ }123'))
		.toEqual(['$p1, .l1, 3', '24px, 12, .l2']);
	
	expect(extractGroups('{} {  } asd'))
		.toEqual([]);
	
	expect(extractGroups(''))
		.toEqual([]);
});

test('should return true if string contains correction groups(s)', () => {
	expect(hasGroup('$p4 /*{$p4, .p1, .type-h4}*/'))
		.toBeTruthy();
	
	expect(hasGroup('$p4/*{$p4, .p1, .type-h4}*/'))
		.toBeTruthy();
	
	expect(hasGroup('padding: {$p2, .p2, .l1};'))
		.toBeTruthy();
	
	expect(hasGroup('margin-top: {$p4, .p2};'))
		.toBeTruthy();
	
	expect(hasGroup(`padding-bottom: {$p4, .p2, .p1}px;
				padding-right: {$p3, .p2, .p1};
				padding: {$p2, .p2, .l1} 0 {$p1-5, .p2, .l2};`))
		.toBeTruthy();
	
	expect(hasGroup(`!
				margin-bottom: {$p3, .p2, .p3};
				margin-right: {$p1, .p2, .p3};`))
		.toBeTruthy();
	
	expect(hasGroup('(margin-right, $transactional-panel-map, 0/*{0, .p1, .l1}*/)'))
		.toBeTruthy();
	
	expect(hasGroup('margin-right, $transactional-panel-map, 0/*{0, .p1, .l1}*/'))
		.toBeTruthy();
	
	expect(hasGroup('margin-right, $transactional-panel-map, 0/*{0, .p1, .l1}*/'))
		.toBeTruthy();
	
	expect(hasGroup(`!
				padding: {$p1-5, .l2, .p3}  {$p1-5, .p2, .p3};`))
		.toBeTruthy();
	
	expect(hasGroup('padding-bottom: $p2 /*{$p2, .p1, .bcaps}*/'))
		.toBeTruthy();
	
});

test('should return atRule substring from string', () => {
	expect(exctractAtRuleReplacement('@include adaptive-padding-margin(padding-top, $transactional-panel-map, 0/*{0, .p1, l3}*/);'))
		.toEqual('0/*{0, .p1, l3}*/');
	
	expect(exctractAtRuleReplacement('@include adaptive-padding-margin(padding-top, $transactional-panel-map, 12px /*{0, .p1, l3}*/'))
		.toEqual('12px /*{0, .p1, l3}*/');
	
	expect(exctractAtRuleReplacement('@media (max-width: 1500px'))
		.toEqual(null);
	
	expect(exctractAtRuleReplacement('@media (max-width: 1500px /*{1500px, 120, 12}*/'))
		.toEqual('1500px /*{1500px, 120, 12}*/');
	
	expect(exctractAtRuleReplacement('@include opacity(0)'))
		.toEqual(null);
	
	expect(exctractAtRuleReplacement('@import \'../common/_base\';'))
		.toEqual(null);
	
	expect(exctractAtRuleReplacement('@extend .h2'))
		.toEqual(null);
});

test('should return string without line feeds and with multiple spaces replaced with one space', () => {
	expect(makeStringOneLine('abc def  ghi')).toEqual('abc def ghi');

	expect(makeStringOneLine(`abc 	 def ghi	j `)).toEqual('abc def ghi j');

	expect(makeStringOneLine(`
		abc: {
			padding: 10px;
		}
	`)).toEqual('abc: { padding: 10px; }');

	expect(makeStringOneLine(`
		@media (max-width: 1499px) {
			.parent-selector-with-atrule .simple-rule {
				padding-top: 15px;
			}
		}
	`)).toEqual('@media (max-width: 1499px) { .parent-selector-with-atrule .simple-rule { padding-top: 15px; } }');
});
