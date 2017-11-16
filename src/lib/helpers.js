'use strict';

import {
	declarationPattern, 
	propertyPattern, 
	valuePattern, 
	groupPattern, 
	atRuleReplacementPattern, 
	groupArgumentsSplitPattern,
	debugPattern,
	hasDebugPattern
} from './patterns';

/**
 * Exctract declaration
 * @param input {String}
 * @returns {Array}
 */
export const extractDeclarations = (input) => {
	const {pattern, flags} = declarationPattern;

	return trim(input).match(new RegExp(pattern, flags)) || [];
}

/**
 * Exctract declaration property
 * @param input {String}
 * @returns {String|Null}
 */
export const extractProperty = input => {
	const {pattern, flags} = propertyPattern;
	const [, output = null] = trim(input).match(new RegExp(pattern, flags)) || [];

	return output;
}

export const hasDebugOption = input => {
	const {pattern, flags} = hasDebugPattern;
	const hasDebug = (new RegExp(pattern, flags)).test(input);

	return hasDebug;
};

export const extractDebugOption = (input = '') => {
	const {pattern, flags} = debugPattern;
	const debug = hasDebugOption(input);
	let debugFreeInput = input;

	if (debug) {
		debugFreeInput = trim(debugFreeInput.replace(new RegExp(pattern, flags), ''));
		debugFreeInput = debugFreeInput.replace(/\s+/g, ' ');
	}

	return [debugFreeInput, !!debug];
};

/**
 * Exctract declaration value
 * @param input {String}
 * @returns {Object}
 */
export const extractValue = input => {
	const [flagsCleanInput, debug] = extractDebugOption(input);
	const {pattern, flags} = valuePattern;
	const [, value] = trim(flagsCleanInput).match(new RegExp(pattern, flags)) || [];

	const result = {
		value: value ? trim(value) : value,
		debug
	}
	return result;
}

/**
 * Exctract correction group values
 * @param input {String}
 * @returns {Array}
 */
export const extractGroups = input => {
	const {pattern, flags} = groupPattern;

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
	const {pattern, flags} = groupPattern;
	const output = (new RegExp(pattern, flags)).test(input);

	return output;
}

/**
 * Find a substring that should be replaced in atRule params value after processing correction group
 * @param input {String}
 * @returns {String|Null}
 */
export const exctractAtRuleReplacement = input => {
	const {pattern, flags} = atRuleReplacementPattern;
	const [output = null] = trim(input).match(new RegExp(pattern, flags)) || [];

	return output;
}

/**
 * Split correction group and return array of arguments
 * @param input {String}
 * @returns {Array} Correction group arguments
 */
export const getCorrectionGroupArguments = input => {
	const {pattern, flags} = groupArgumentsSplitPattern;

	return input.split(new RegExp(pattern, flags));
}

function trim (input = '') {
	input = input || '';

	return input.replace(/^\s+/, '').replace(/\s+$/, '');
}

export const makeStringOneLine = (str = '') => {
	const result = trim(str.replace(/\n/gm, '').replace(/\s+/g, ' '));

	return result;
};
