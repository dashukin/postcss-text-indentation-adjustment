/**
 * Postcss text metrics plugin.
 * 
 */

/**
 * @name postCSS
 * @type {Object}
 * @property plugin
 * @property process
 * @property decl
 * @property atRule
 * @property rule
 * @property parse
 */

/**
 * @name nodeSass
 * @type {Object}
 * @property render
 * @property renderSync
 */

/**
 * @name _
 * @type {Object}
 * @property zipObjectDeep
 */

'use strict';

import postCSS from 'postcss';
import _ from 'lodash';

import {
	extractDeclarations, 
	extractProperty, 
	extractValue, 
	extractGroups, 
	hasGroup, 
	exctractAtRuleReplacement, 
	getCorrectionGroupArguments
} from './helpers';

/**
 * @param options {Object} Initial options
 * @param options.files {Array|String} Path or array of paths to files that should be used as correction src
 * @param [options.fontFamilyCorrection] {Object}
 * @param [options.dotReplacement] {String} className "dot" replacement. Required for _.zipObjectDeep
 * @param [options.textMetrics] {Object} Text metrics data for appropriate font-family
 * @param [optiosn.textMetrics.decreaseBy] {Function|Number|String} A value desired result should be decreased by.
 */
export default postCSS.plugin('postcss-text-metrics', (options = {}) => {
	
	const {
		dotReplacement = '%dot%',
		textMetrics = {},
		plainCSS = true,
		calculate = true, 	// if corrected values should be calculated. In case final value is NaN - all expression should be wrapped in calc()
		useCalc = false
	} = options;
	
	return scss => {
		
		scss.each(node => {
			// iterate over all nodes in each rule
			// as long as we are processing scss code - each rule could contain comment, rule, declaration
			if (node.type === 'rule') {
				processRule(node);
			}
		});
		
		function processRule (rule) {
			
			// nested rules support
			rule.each(node => {
				
				let {type} = node;
				
				if (type === 'rule') {
					// recursively process nested rules
					processRule(node);
					
				} else if (type === 'comment') {
					// process comment. NOTE: higher priority is given to declaration parsing.
					// create reference to comment's rule (parent node) so we can create new declarations later
					let rule = node.parent;
					
					// save comment value
					let commentText = node.text;
					
					// remove parsed comment node
					node.remove();
					
					// check if comment has any correction group
					if (!hasGroup(commentText)) {
						return;
					}
					
					// parse comment and get an object containing declarations and their values.
					let newDeclarations = parseComment(commentText);
					
					// do nothing if it was a comment without correction group
					if (!newDeclarations) {
						return;
					}
					
					_.each(newDeclarations, (declarationValue, declarationProp) => {
						
						let pureCorrectedDeclarationValue = getPureCorrectedDeclarationValue(declarationValue);
						
						// create pure correction
						createDeclarations(rule, declarationProp, {
							value: pureCorrectedDeclarationValue
						});
						
						// create selector based corrections
						let selectorBasedDeclarations = getSelectorBasedCorrectedDeclarationValues(declarationValue);
						createDeclarations(rule, declarationProp, selectorBasedDeclarations);
						
						// create atRule based corrections
						let atRuleBasedDeclarations = getAtRuleBasedCorrectedDeclarationValues(declarationValue);
						createDeclarations(rule, declarationProp, atRuleBasedDeclarations);
						
						// create atRule + selector based corrections
						let atRuleSelectorBasedDeclarations = getAtRuleSelectorBasedCorrectedDeclarationValues(declarationValue);
						createDeclarations(rule, declarationProp, atRuleSelectorBasedDeclarations);
						
					});
					
				} else if (type === 'decl') {
					
					// correction template could be stored in declaration.
					// e.g. padding: $p1 - 5px - 2px /*{24px, .p2, .p1} 0 {24px, .p2, .p3}*/;
					
					// comment in declaration could be accessed via raw value.
					// get raw declaration value
					// e.g. $p1 - 5px - 2px /*{24px, .p2, .p1} 0 {24px, .p2, .p3}*/
					let rawValue = _.get(node, 'raws.value.raw', '');
					
					// in case declaration has correction group(s) - we should parse them and replace declaration value with corrected one
					if (hasGroup(rawValue)) {
						
						let declarationRule = node.parent;
						let declarationProperty = node.prop;
						
						// exctract value that is going to be processed
						// e.g. {24px, .p2, .p1} 0 {24px, .p2, .p3}
						let newDeclrationValue = extractValue(rawValue);
						
						// replace all correction groups with processed values
						// e.g. 24px - 5 - 7 0 24px - 5 - 0
						
						// create pure correction
						let pureCorrectedDeclarationValue = getPureCorrectedDeclarationValue(newDeclrationValue);
						createDeclarations(declarationRule, declarationProperty, {
							value: pureCorrectedDeclarationValue
						});
						
						// create selector based corrections
						let selectorBasedDeclarations = getSelectorBasedCorrectedDeclarationValues(newDeclrationValue);
						createDeclarations(declarationRule, declarationProperty, selectorBasedDeclarations);
						
						// create atRule based corrections
						let atRuleBasedDeclarations = getAtRuleBasedCorrectedDeclarationValues(newDeclrationValue);
						createDeclarations(declarationRule, declarationProperty, atRuleBasedDeclarations);
						
						// create atRule + selector based corrections
						let atRuleSelectorBasedDeclarations = getAtRuleSelectorBasedCorrectedDeclarationValues(newDeclrationValue);
						createDeclarations(declarationRule, declarationProperty, atRuleSelectorBasedDeclarations);
						
					}
					
				} else if (type === 'atrule') {
					// atrule covers any rule that starts with "@" including @media, @include, etc
					// for all cases we should ensure if there're any correction groups that should be processed.
					
					if (node.nodes) {
						// in case if atrule has child nodes (e.g. @media) we should process it like original rule
						processRule(node);
						
					} else {
						// otherwise parse atrule value
						// each rule/declaration/comment/etc has it's original value stored in "raws" property
						let atRuleRawValue = _.get(node, 'raws.params.raw', '');
						
						if (!hasGroup(atRuleRawValue)) {
							return;
						}
						
						// get new value from atRule params
						// e.g. {0, .p1, .l1} from @include yourMixinName(0/*{0, .p1, .l1}*/);
						let newDeclrationValue = extractValue(atRuleRawValue) || '';
						// create corrected value
						let pureCorrectedDeclarationValue = getPureCorrectedDeclarationValue(newDeclrationValue);
						
						if (!pureCorrectedDeclarationValue) {
							return;
						}
						// find a string in atRule params that should be replaced with corrected value
						// e.g.  0/*{0, .p1, .l1}*/
						let atRuleReplacement = exctractAtRuleReplacement(atRuleRawValue);
						
						if (!atRuleReplacement) {
							_logDebug('could not extract atRule replacement from ' + atRuleRawValue);
						}
						// replace it with new value
						let newAtRuleParams = atRuleRawValue.replace(atRuleReplacement, pureCorrectedDeclarationValue);
						// set corrected value as new atRule params value
						node.params = newAtRuleParams;
						
					}
					
				} else {
					return;
				}
				
			});
			
		}
		
		/**
		 * Parse comment text and exctract declarations and values.
		 * e.g. inline comment - // padding: {$p2, .p1, .p3}
		 * or multiline comment
		 * 	/ *
		 * 		margin-bottom: {$p3, .p2, .p3}
		 *		margin-right: {$p1, .p2, .p3}
		 * * /
		 * @param text {String}
		 * @returns {Object|Null} An object with "declaration properties" as keys and "declaration values" as values
		 */
		function parseComment (text) {
			
			let newDeclarations = {};
			
			let parsedDeclarations = extractDeclarations(text);
			
			parsedDeclarations.forEach(parsedDeclaration => {
				// parse declaration property name
				let declarationProp = extractProperty(parsedDeclaration);
				
				let declarationValue = extractValue(parsedDeclaration);
				
				if (!declarationProp || !declarationValue) {
					return newDeclarations;
				}
				
				newDeclarations[declarationProp] = declarationValue;
			});
			
			return newDeclarations;
		}
		
		/**
		 * Create pure corrected declaration value parsed from input string.
		 * @param declarationValue {String} Initial declaration value that shoud be corrected.
		 * @returns {*|null} Corrected value or null
		 */
		function getPureCorrectedDeclarationValue (declarationValue) {
			
			let correctedDeclarationvalue = declarationValue;
			let correctionGroups = extractGroups(declarationValue);
			
			correctionGroups.forEach(initialGroup => {
				
				let initialGroupArguments = getCorrectionGroupArguments(initialGroup);
				
				let firstArgument = initialGroupArguments[0];
				
				let correctionDataCollection = getCorrectedData.apply(null, initialGroupArguments);
				
				// Process pure corrections without any "selector" or "atRule" modifications:
				// pure corrections rely on data without correction selectors and atRules.
				// in case there're multiple definitions of any rules for the same selector we should use the last one
				let corrections = correctionDataCollection.map(classNameCorrectionsData => {
					return classNameCorrectionsData.filter(correctionData => {
						return !correctionData.selector && !correctionData.atRule;
					});
				}).map(filteredClassNameCorrectionsData => {
					return filteredClassNameCorrectionsData.slice(-1);
				}).reduce((prev, next) => {
					let baseDelta = _.get(next, '[0].baseDelta', 0);
					let decreaseBy = _.get(next, '[0].decreaseBy', 0);
					return prev.concat([baseDelta, decreaseBy]);
				}, [firstArgument]);
				
				let correctedValue = getCorrectedValue({
					corrections,
					calculate,
					useCalc
				});
				
				correctedDeclarationvalue = correctedDeclarationvalue.replace(`{${initialGroup}}`, correctedValue);
				
			});
			
			return correctionGroups.length ? correctedDeclarationvalue : null;
		}
		
		
		/**
		 * Create selector based corrected declaration values
		 * @param declarationValue
		 */
		function getSelectorBasedCorrectedDeclarationValues (declarationValue) {
			
			let initialDeclarationValue = declarationValue;
			
			// first of all we should get all classNames data.
			let correctionGroups = extractGroups(declarationValue);
			
			let uniqueClassNames = _.uniq(correctionGroups.reduce((classNamesCollection, initialGroup) => {
				let [, ...initialGroupClassNames] = getCorrectionGroupArguments(initialGroup);
				return classNamesCollection.concat(initialGroupClassNames);
			}, [])).sort();
			
			let classNamesData = uniqueClassNames.reduce((outputData, className) => {
				outputData[className] = _.get(textMetrics, className.replace(/\./g, dotReplacement, ''), [])
					.filter(data => {
						// exclude data with atRules
						return !data.atRule;
					})
				return outputData;
			}, {});
			
			// find all possible selector used for exctracted classNames
			let uniqueSelectors = _.uniq(_.reduce(classNamesData, (selectorsOutput, classNameData) => {
				let classNameDataSelectors = classNameData.reduce((classNameSelectorsOutput, correctionData) => {
					return classNameSelectorsOutput.push(correctionData.selector), classNameSelectorsOutput;
				}, []);
				return selectorsOutput.concat(classNameDataSelectors);
			}, [])).filter(selector => {
				return !!selector;
			});
			
			// iterate over unique selectors and create additional declarations based on selectors and classNamesData
			let selectorBasedDeclarations = uniqueSelectors.reduce((declarationsOutput, selector) => {
				
				let selectorBasedCorrectedDeclarationValue = initialDeclarationValue;
				
				correctionGroups.forEach(correctionGroup => {
					
					let [firstArgument, ...correctionGroupClassNames] = getCorrectionGroupArguments(correctionGroup);
					
					let corrections = correctionGroupClassNames.reduce((calculatedOutput, correctionClassName) => {
						
						let correctedClassNameValues = _.get(classNamesData, correctionClassName, []).filter(data => {
							return (data.selector === selector) || !data.selector;
						});
						
						let correctedClassNameValueData = _.find(correctedClassNameValues, {selector}) || _.find(correctedClassNameValues, {selector: ''}) || null;
						
						let baseDelta = _.get(correctedClassNameValueData, 'baseDelta', 0);
						let decreaseBy = _.get(correctedClassNameValueData, 'decreaseBy', 0);
						
						return calculatedOutput.concat([baseDelta, decreaseBy]);
						
					}, [firstArgument])
					
					let correctedValue = getCorrectedValue({
						corrections,
						calculate,
						useCalc
					});
					
					selectorBasedCorrectedDeclarationValue = selectorBasedCorrectedDeclarationValue.replace(`{${correctionGroup}}`, correctedValue);
					
				});
				
				let correctedSelectorBasedDeclarationData = {
					selector,
					value: selectorBasedCorrectedDeclarationValue
				}
				
				return declarationsOutput.push(correctedSelectorBasedDeclarationData), declarationsOutput;
				
			}, []);
			
			return selectorBasedDeclarations;
			
		}
		
		/**
		 * get atRule based corrected declaration values
		 * @param declarationValue {String}
		 * @returns {Object[]}
		 */
		function getAtRuleBasedCorrectedDeclarationValues (declarationValue) {
			
			let initialDeclarationValue = declarationValue;
			
			// first of all we should get all classNames data.
			let correctionGroups = extractGroups(declarationValue);
			
			let uniqueClassNames = _.uniq(correctionGroups.reduce((classNamesCollection, initialGroup) => {
				let [, ...initialGroupClassNames] = getCorrectionGroupArguments(initialGroup);
				return classNamesCollection.concat(initialGroupClassNames);
			}, [])).sort();
			
			let classNamesData = uniqueClassNames.reduce((outputData, className) => {
				outputData[className] = _.get(textMetrics, className.replace(/\./g, dotReplacement, ''), [])
					.filter(data => {
						// exclude data with selectors
						return !data.selector;
					})
				return outputData;
			}, {});
			
			// find all possible selector used for exctracted classNames
			let uniqueAtRules = _.uniq(_.reduce(classNamesData, (selectorsOutput, classNameData) => {
				let classNameDataSelectors = classNameData.reduce((classNameSelectorsOutput, correctionData) => {
					return classNameSelectorsOutput.push(correctionData.atRule), classNameSelectorsOutput;
				}, []);
				return selectorsOutput.concat(classNameDataSelectors);
			}, [])).filter(atRule => {
				return !!atRule;
			});
			
			// iterate over unique selectors and create additional declarations based on selectors and classNamesData
			let atRuleBasedDeclarations = uniqueAtRules.reduce((declarationsOutput, atRule) => {
				
				let atRuleBasedCorrectedDeclarationValue = initialDeclarationValue;
				
				correctionGroups.forEach(correctionGroup => {
					
					let [firstArgument, ...correctionGroupClassNames] = getCorrectionGroupArguments(correctionGroup);
					
					let corrections = correctionGroupClassNames.reduce((calculatedOutput, correctionClassName) => {
						
						let correctedClassNameValues = _.get(classNamesData, correctionClassName, []).filter(data => {
							return (data.atRule === atRule) || !data.atRule;
						});
						
						let correctedClassNameValueData = _.find(correctedClassNameValues, {atRule}) || _.find(correctedClassNameValues, {atRule: null}) || null;
						
						let baseDelta 	= _.get(correctedClassNameValueData, 'baseDelta', 0);
						let decreaseBy 	= _.get(correctedClassNameValueData, 'decreaseBy', 0);
						
						return calculatedOutput.concat([baseDelta, decreaseBy]);
						
					}, [firstArgument]);
					
					let correctedValue = getCorrectedValue({
						corrections,
						calculate,
						useCalc
					});
					
					atRuleBasedCorrectedDeclarationValue = atRuleBasedCorrectedDeclarationValue.replace(`{${correctionGroup}}`, correctedValue);
					
				});
				
				let correctedSelectorBasedDeclarationData = {
					atRule,
					value: atRuleBasedCorrectedDeclarationValue
				}
				
				return declarationsOutput.push(correctedSelectorBasedDeclarationData), declarationsOutput;
				
			}, []);
			
			return atRuleBasedDeclarations;
			
		}
		
		/**
		 * get atRule + selector based corrected declaration values
		 * @param declarationValue {String}
		 * @returns {Object[]}
		 */
		function getAtRuleSelectorBasedCorrectedDeclarationValues (declarationValue) {
			
			let initialDeclarationValue = declarationValue;
			
			// first of all we should get all classNames data.
			let correctionGroups = extractGroups(declarationValue);
			
			let uniqueClassNames = _.uniq(correctionGroups.reduce((classNamesCollection, initialGroup) => {
				let [, ...initialGroupClassNames] = getCorrectionGroupArguments(initialGroup);
				return classNamesCollection.concat(initialGroupClassNames);
			}, [])).sort();
			
			let classNamesData = uniqueClassNames.reduce((outputData, className) => {
				outputData[className] = _.get(textMetrics, className.replace(/\./g, dotReplacement, ''), [])
					.filter(data => {
						// should include both atRule and selector values
						return !!data.selector && !!data.atRule;
					})
				return outputData;
			}, {});
			
			// find all possible selector used for exctracted classNames
			let uniqueAtRulesSelectors = _.uniq(_.reduce(classNamesData, (selectorsOutput, classNameData) => {
				let classNameDataSelectors = classNameData.reduce((classNameSelectorsOutput, correctionData) => {
					return classNameSelectorsOutput.push({atRule: correctionData.atRule, selector: correctionData.selector}), classNameSelectorsOutput;
				}, []);
				return selectorsOutput.concat(classNameDataSelectors);
			}, [])).filter(atRule => {
				return !!atRule;
			});
			
			// iterate over unique selectors and create additional declarations based on selectors and classNamesData
			let atRuleBasedDeclarations = uniqueAtRulesSelectors.reduce((declarationsOutput, uniqueData) => {
				
				let atRuleBasedCorrectedDeclarationValue = initialDeclarationValue;
				
				correctionGroups.forEach(correctionGroup => {
					
					let [firstArgument, ...correctionGroupClassNames] = getCorrectionGroupArguments(correctionGroup);
					
					let corrections = correctionGroupClassNames.reduce((calculatedOutput, correctionClassName) => {
						
						let correctedClassNameValues = _.get(classNamesData, correctionClassName, []).filter(data => {
							return (data.atRule === uniqueData.atRule) && (data.selector === uniqueData.selector) || (!data.atRule && !data.selector);
						});
						
						let correctedClassNameValueData = _.find(correctedClassNameValues, {atRule: uniqueData.atRule, selector: uniqueData.selector}) || _.find(correctedClassNameValues, {atRule: null, selector: ''}) || null;
						
						let baseDelta = _.get(correctedClassNameValueData, 'baseDelta', 0);
						let decreaseBy = _.get(correctedClassNameValueData, 'decreaseBy', 0);
						
						return calculatedOutput.concat([baseDelta, decreaseBy]);
						
					}, [firstArgument]);
					
					let correctedValue = getCorrectedValue({
						corrections,
						calculate,
						useCalc
					});
					
					atRuleBasedCorrectedDeclarationValue = atRuleBasedCorrectedDeclarationValue.replace(`{${correctionGroup}}`, correctedValue);
					
				});
				
				let correctedSelectorBasedDeclarationData = {
					atRule: uniqueData.atRule,
					selector: uniqueData.selector,
					value: atRuleBasedCorrectedDeclarationValue
				}
				
				return declarationsOutput.push(correctedSelectorBasedDeclarationData), declarationsOutput;
				
			}, []);
			
			return atRuleBasedDeclarations;
			
		}
		
		
		/**
		 *
		 * @param initialValue {Number|String}
		 * @param currentClassName {String} Target element className from correction file
		 * @param siblingClassName {String} Sibling element className from correction file
		 * @returns {Array[]} Array of correction data objects for each className provided in arguments.
		 */
		function getCorrectedData (initialValue = 0, ...classNames) {
			
			let classNamesCorrectionsData = [];
			
			classNames.forEach(className => {
				/**
				 * @name correctionData
				 * @type {Array} Collection of correction rules for fiven className
				 */
				let correctionData = _.get(textMetrics, className.replace(/\./g, dotReplacement), null);
				if (_.isArray(correctionData)) {
					classNamesCorrectionsData.push(correctionData);
				}
			});
			
			return classNamesCorrectionsData;
		}
		
		/**
		 * Combine corrections into final result.
		 * In case calculate option is set to true - try to process given values and provide a result one.
		 * Otherwise - use calc() function
		 * @param corrections {Array} Corrections list
		 * @param calculate {Boolean} If result should be calculated.
		 * @param useCalc {Boolean} If expression value should be wrapped into css calc() function
		 */
		function getCorrectedValue ({corrections, calculate, useCalc}) {
			const [initialValueString, ...subtrahends] = corrections;
			let initialValue = parseInt(initialValueString.replace(/\D/g, ''), 10);
			let initialUnit = initialValueString.replace(/\d/g, '');
			
			let calculatedValue = subtrahends.reduce((prev, next) => {
					const subtrahend = parseInt(next, 10);
					return prev - subtrahend;
				}, initialValue);
			
			let expressionValue = [initialValueString].concat(subtrahends).join(' - ');
			
			let outputValue = calculate && !isNaN(calculatedValue)
				? calculatedValue + initialUnit
				: useCalc || (isNaN(calculatedValue) && useCalc)
					? `calc(${expressionValue})`
					: expressionValue;
			
			return outputValue;
		}
		
		/**
		 * Update declaration value or create new one if declarationValue data contains any modification selector or atRule
		 * @param rule {Object} Postcss rule object that should be updated with new declaration(s)
		 * @param declarationProperty {String} Declaration name
		 * @param declarationValue {Object|Object[]} Declaration properties
		 * @param declarationValue.selector {String} Selector that should be applied at the beginning of newly created rule
		 * @param declarationValue.value {Number|String} Declaration value
		 */
		function createDeclarations (rule, declarationProperty, declarationValue) {
			
			if (!rule || (rule.type !== 'rule')) {
				_logDebug('createDeclarations - invalid type of parentNode.');
				return;
			}
			
			if (!_.isString(declarationProperty)) {
				_logDebug('createDeclarations - invalid type of declarationProperty.');
				return;
			}
			
			const {selector: ruleSelector} = rule;
			const hasParentRule = rule.parent !== rule.root();
			const ampersandValue = plainCSS || !hasParentRule ? '' : '&';
			
			// create array of declaration values even if only one object has been passed.
			declarationValue = [].concat(declarationValue);
			
			declarationValue.forEach(declarationData => {
				let {value = null, selector = null, atRule = null} = declarationData;
				
				if (!value) {
					_logDebug('createDeclarations - attempted to update declaration with invalid value');
					return;
				}
				
				if (!selector && !atRule) {
					// if there's no selector and atRule in declarationData
					// we should update existing declaration values or create new directly in provided node
					if (rule.some(node => {return node.type === 'decl' && node.prop === declarationProperty})) {
						// update existing declaration. Pure correction
						rule.each(node => {
							if ((node.type === 'decl') && (node.prop === declarationProperty)) {
								node.value = value;
							}
						});
					} else {
						let newDeclaration = new postCSS.decl({
							prop: declarationProperty,
							value
						});
						rule.append(newDeclaration);
					}
					
				} else if (selector && !atRule) {
					// selector based correction
					
					// create new declaration
					let additionalRuleDeclaration = new postCSS.decl({
						prop: declarationProperty,
						value
					});
					
					// create new nested rule
					let newRule = new postCSS.rule();
					// update rules selector
					newRule.selector = `${selector} ${ampersandValue} ${ruleSelector}`;
					newRule.append(additionalRuleDeclaration);
					
					// insert newly created rule into node.
					rule.parent.append(newRule);
					
				} else if (!selector && atRule) {
					// atRule based correction
					
					let {name: atRuleName, params: atRuleParams} = atRule;
					
					let newAtRule = new postCSS.atRule();
					newAtRule.name = atRuleName;
					newAtRule.params = atRuleParams;
					
					let declaration = new postCSS.decl({
						prop: declarationProperty,
						value
					});
					
					let newRule = new postCSS.rule();
					newRule.selector = ruleSelector;
					newRule.append(declaration);
					
					newAtRule.append(newRule);
					
					rule.parent.append(newAtRule);
					
				} else if (selector && atRule) {
					// atRule + selector based correction
					
					let {name: atRuleName, params: atRuleParams} = atRule;
					
					let newAtRule = new postCSS.atRule();
					newAtRule.name = atRuleName;
					newAtRule.params = atRuleParams;
					
					let declaration = new postCSS.decl({
						prop: declarationProperty,
						value
					});
					
					let newRule = new postCSS.rule();
					newRule.selector = `${selector} ${ampersandValue} ${ruleSelector}`;
					newRule.append(declaration);
					
					newAtRule.append(newRule);
					
					rule.parent.append(newAtRule);
					
				}
				
			});
			
		}
		
	}
	
	function _logDebug (...args) {
		console.log.apply(console, ['postcss-text-metrics: '].concat(args));
	}
	
});
