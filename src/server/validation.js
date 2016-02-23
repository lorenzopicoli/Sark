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
	if (!validator.isJSON(JSON.stringify(config))){
		var result = {
			valid: false, 
			error: 'The configuration information is not in the correct format.'
		};

		return result;
	}
	if (config.filename !== undefined && !validator.matches(config.filename, /^[a-zA-Z]+[.][a-zA-Z]+$/)){
		var result = {
			valid: false, 
			error: 'The filename field must contain only alphanumeric characters.'
		}
	
		return result;
	}

	if (config.configuration !== undefined && !validator.isAlpha(config.configuration)){
		var result = {
			valid: false, 
			error: 'The configuration field must contain only alpha characters.'
		}
		
		return result;
	}

	if(config.scheme !== undefined && !validator.isAlpha(config.scheme)){
		var result = {
			valid: false, 
			error: 'The scheme field must contain only alpha characters.'
		}
		
		return result;
	}

	if(config.ios !== undefined && !validator.matches(config.ios, /^\d[.]\d$/)){
		var result = {
			valid: false, 
			error: 'The iOS field is not in the correct format.'
		}
		
		return result;
	}

	if(config.sdk !== undefined && !validator.matches(config.sdk, /[a-zA-Z]+\d[.]\d$/)){
		var result = {
			valid: false, 
			error: 'The SDK field is not in the correct format.'
		}
		
		return result;
	}

	return {
		valid: true
	}
}

function validateURL(url){
	return validator.isURL(url);
}
module.exports = {validateConfig, validateURL};