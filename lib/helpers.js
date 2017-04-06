'use strict';

import {
	declarationPattern, 
	propertyPattern, 
	valuePattern, 
	groupPattern, 
	atRuleReplacementPattern, 
	groupArgumentsSplitPattern
} from './patterns';

/**
 * Exctract declaration
 * @param input {String}
 * @returns {Array}
 */
export const extractDeclarations = (input) => {
	let {pattern, flags} = declarationPattern;
	return trim(input).match(new RegExp(pattern, flags)) || [];
}

/**
 * Exctract declaration property
 * @param input {String}
 * @returns {String|Null}
 */
export const extractProperty = input => {
	let {pattern, flags} = propertyPattern;
	let [, output = null] = trim(input).match(new RegExp(pattern, flags)) || [];
	return output;
}

/**
 * Exctract declaration value
 * @param input {String}
 * @returns {String|Null}
 */
export const extractValue = input => {
	let {pattern, flags} = valuePattern;
	let [, output = null] = trim(input).match(new RegExp(pattern, flags)) || [];
	return output ? trim(output) : output;
}

/**
 * Exctract correction group values
 * @param input {String}
 * @returns {Array}
 */
export const extractGroups = input => {
	let {pattern, flags} = groupPattern;
	return (trim(input).match(new RegExp(pattern, flags)) || []).map(group => {
		return trim(group.replace(/[{}]/g, ''));
	});
}

/**
 * Check if input string contains correction group
 * @param input {String} Input string
 * @returns {Boolean}
 */
export const hasGroup = input => {
	let {pattern, flags} = groupPattern;
	let output = (new RegExp(pattern, flags)).test(input);
	return output;
}

/**
 * Find a substring that should be replaced in atRule params value after processing correction group
 * @param input {String}
 * @returns {String|Null}
 */
export const exctractAtRuleReplacement = input => {
	let {pattern, flags} = atRuleReplacementPattern;
	let [output = null] = trim(input).match(new RegExp(pattern, flags)) || [];
	return output;
}

/**
 * Split correction group and return array of arguments
 * @param input {String}
 * @returns {Array} Correction group arguments
 */
export const getCorrectionGroupArguments = input => {
	let {pattern, flags} = groupArgumentsSplitPattern;
	return input.split(new RegExp(pattern, flags));
}

function trim (input = '') {
	return input.replace(/^\s+/, '').replace(/\s+$/, '');
}

