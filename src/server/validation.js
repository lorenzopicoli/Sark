/* Config file example */
/*
var config = {
	filename: 'sarktest.xcodeproj',
	configuration: 'Debug',
	scheme: 'sarktest',
	device: 'iPhone 6s',
	ios: '9.2',
	sdk: 'iphonesimulator9.2',
}
*/

import validator from 'validator';

function validateConfig(config){
	if (!validator.isJSON(JSON.parse(config))){
		return {
			valid: false, 
			error: 'The configuration information is not in the correct format.'
		}
	}

	if (config.filename != undefined && !validator.isAlphanumeric(config.filename)){
		return {
			valid: false, 
			error: 'The filename field must contain only alphanumeric characters.'
		}
	}

	if (config.configuration != undefined && !validator.isAlpha(config.configuration)){
		return {
			valid: false, 
			error: 'The configuration field must contain only alpha characters.'
		}
	}

	if(config.scheme != undefined && !validator.isAlpha(config.scheme)){
		return {
			valid: false, 
			error: 'The scheme field must contain only alpha characters.'
		}
	}

	if(config.device != undefined && !validator.isAlphanumeric(config.devce)){
		return {
			valid: false, 
			error: 'The device field must contain only alphanumeric characters.'
		}
	}

	if(config.ios != undefined && !validator.matches(config.ios, /\d[.]\d/)){
		return {
			valid: false, 
			error: 'The iOS field is not in the correct format.'
		}
	}

	if(config.sdk != undefined && !validator.matches(config.sdk, /[a-zA-Z].+?(?=\s\(|\s\[)/g)){
		return {
			valid: false, 
			error: 'The SDK field is not in the correct format.'
		}
	}

	return {
		valid: true
	}
}

function validateURL(url){
	return validator.isURL(url);
}
module.exports = {validateConfig, validateURL};