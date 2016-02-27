/* istanbul ignore next */
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

/* istanbul ignore next */
function addPaddingZero(numberString){
	if(numberString.length < 2){
		return '0' + numberString;
	}else{
		return numberString;
	}
}

/* istanbul ignore next */
function getCurrentTime(){
	var date = new Date();
	var h = addPaddingZero(date.getHours().toString());
	var m = addPaddingZero(date.getMinutes().toString());
	var s = addPaddingZero(date.getSeconds().toString());
	return `${h}:${m}:${s}`
}

/* istanbul ignore next */
function createLogItemFromData(data){
	var log = data.toString('utf8') + '...';
	var type = '';
	var time = getCurrentTime();

	if(log.indexOf('Succeed') > -1){
		type = 'success';
	}else if(log.indexOf('⚠️') > -1){
		type = 'warning';
	}else if(log.indexOf('❌') > -1){
		type = 'error';
	}
	return {log, type, time};
}

module.exports = {createLogItemFromData, getCurrentTime};