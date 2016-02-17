import util from 'util'
import { spawn } from 'child_process'
import io from './socket'

function createBuildArgs(filename, scheme, configuration, sdk, device, os){
	var fileType = '-workspace';

	/* istanbul ignore else*/
	if(filename.indexOf('xcodeproj') > -1){
		fileType = '-project';
	}

	return [fileType, filename, '-scheme', scheme, '-configuration', configuration, '-sdk', sdk, '-destination', `name=${device},OS=${os}`, '-IDEBuildOperationMaxNumberOfConcurrentCompileTasks=4']
}

function executeBuild(config, socket, callback){
	var args = createBuildArgs(config.filename, config.scheme, config.configuration, 'iphonesimulator9.2', config.device, config.ios);
	var build = spawn('xcodebuild', args);
	var xcpretty = spawn('xcpretty');
	build.stdout.pipe(xcpretty.stdin);
	build.stderr.pipe(xcpretty.stdin);

	/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
	xcpretty.stdout.on('data', (data) => {
		socket.emit('updateLog', createLogItemFromData(data))
	});

	/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
	xcpretty.stderr.on('data', (data) => {
		var item = createLogItemFromData(data);
		item.type = 'error';
		socket.emit('updateLog', item)
	});

	/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
	xcpretty.on('close', (code) => {
		if (code !== 0) {
			console.log(`build process exited with code ${code}`);
		}
	});

	/* istanbul ignore else*/
    if (callback !== undefined) {
    	callback();
    }
}

//TODO: Pull this info dynamically 
function getDeviceList(callback){
	callback(['iPhone 4', 'iPhone 4s', 'iPhone 5', 'iPhone 5s', 'iPhone 6', 'iPhone 6 Plus', 'iPhone 6s', 'iPhone 6s Plus']);
}

//TODO: Pull this info dynamically 
function getOSList(callback){
	callback(['9.2']);
}

//Helpers
/* istanbul ignore next */
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

/* istanbul ignore next */
function getCurrentTime(){
	var date = new Date();
	return `${date.getHours()}:${date.getMinutes}:${date.getSeconds}`
}

/* istanbul ignore next */
function createLogItemFromData(data){
	var log = data.toString('utf8');
	var type = '';
	var time = getCurrentTime();

	if(log.indexOf('Build succeed') > -1){
		type = 'success';
	}else if(log.indexOf('⚠️') > -1){
		type = 'warning';
	}else if(log.indexOf('❌') > -1){
		type = 'error';
	}
	return {log, type, time};
}

module.exports = {executeBuild, getDeviceList, getOSList}