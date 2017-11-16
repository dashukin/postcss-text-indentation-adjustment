/**
 * Postcss typography patterns
 */

// declaration string: e.g
	// 1. padding: {$p1, .l2, .p2} {$p2, .l2, .p3};
	// 2. padding: $p2 0 {$p2, .l2, .p3}
	// 3. /*{$p1, .p2, .p3}*/
export const declarationPattern = {
	pattern: '[\\w\\-]+:.+;',
	flags: 'gm'
}
// declaration property: e.g. padding
export const propertyPattern = {
	pattern: '(.+)(?=\\s*:)',
	flags: ''
};
// declaration value: e.g. {$p1, .l2, .p2} {$p2, .l2, .p3}
export const valuePattern = {
	pattern: '(?::(?!(?:.+\\/\\*))|(?:\\/\\*))\\s*([^*;]+)(?=\\s*(?:;|(?:\\*\\/))?)',
	flags: ''
};
// correction group: e.g. {$p1, .l2, .p2}
export const groupPattern = {
	pattern: '{(?!(\\s*})).+?}',
	flags: 'gm'
}
// atRule replacement pattern e.g "0/*{0, .p1, l3}*/" in "@include adaptive-padding-margin(padding-top, $transactional-panel-map, 0/*{0, .p1, l3}*/);"
export const atRuleReplacementPattern = {
	pattern: '(?:[\\w\\d$\\-])+\\s*\\/\\*.+\\*\\/',
	flags: ''
};

// correction group split pattern
export const groupArgumentsSplitPattern = {
	pattern: '\\s*,\\s*',
	flags: 'g'
};

export const debugPattern = {
	pattern: '\\-\\-debug',
	flags: 'g'
}

export const hasDebugPattern = {
	pattern: `\\s+${debugPattern.pattern}(?:\\s|\\*|$)`,
	flags: 'g'
}
