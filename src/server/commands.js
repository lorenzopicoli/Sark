import util from 'util'
import { spawn } from 'child_process'
import io from './socket'
import fs from 'fs'
import parser from './logParser';
import path from 'path';
import rmdirAsync from './removeDirContent';

const deviceListPath = './logs/deviceList.log'
const sdkListPath = './logs/sdkList.log'
var gitPath = path.resolve(__dirname, '../../../git/')

if(process.env.NODE_ENV == 'test'){
	gitPath = path.resolve(__dirname, '../../git/')
}

function createBuildArgs(filename, scheme, configuration, sdk, device, os){
	var fileType = '-workspace';

	/* istanbul ignore else*/
	if(filename.indexOf('xcodeproj') > -1){
		fileType = '-project';
	}

	return [fileType, filename, '-scheme', scheme, '-configuration', configuration, '-sdk', sdk, '-destination', `name=${device},OS=${os}`, '-IDEBuildOperationMaxNumberOfConcurrentCompileTasks=4']
}

function createCleanArgs(filename){
	var fileType = '-workspace';

	/* istanbul ignore else*/
	if(filename.indexOf('xcodeproj') > -1){
		fileType = '-project';
	}
	return [fileType, filename, '-alltargets', 'clean', '-IDEBuildOperationMaxNumberOfConcurrentCompileTasks=4']
}

function executeBuild(config, socket, callback){
	//Append the filename to the git path
	var filePath =  path.resolve(gitPath, config.filename);
	var args = createBuildArgs(filePath, config.scheme, config.configuration, config.sdk, config.device, config.ios);
	var build = spawn('xcodebuild', args);
	var xcpretty = spawn('xcpretty');

	pipeOutputs(socket, build, xcpretty, callback);
}

function executeClean(config, socket, callback){
	//Append the filename to the git path
	var filePath =  path.resolve(gitPath, config.filename);
	var args = createCleanArgs(filePath);
	var clean = spawn('xcodebuild', args);
	var xcpretty = spawn('xcpretty');
	pipeOutputs(socket, clean, xcpretty, callback);

	/* istanbul ignore else*/
    if (callback !== undefined) {
    	callback();
    }
}

function executeCleanBuildFolder(socket, callback) {

	socket.emit('updateLog', {
		time: getCurrentTime(),
		log: 'Deleting build folder...',
		type: 'info',
	});
	rmdirAsync(process.env.HOME + '/Library/Developer/Xcode/DerivedData', ()=>{
		socket.emit('updateLog', {
			time: getCurrentTime(),
			log: 'Cleaned build folder successfully',
			type: 'success',
		});

		/* istanbul ignore else*/
	    if (callback !== undefined) {
	    	callback();
	    }
    });
}

function getDeviceAndiOSList(callback){

	fs.access(deviceListPath, fs.F_OK, function(err) {
	    if (!err) {
	        fs.unlink(deviceListPath, ()=>{
	        	/* istanbul ignore next: It's being tested directly */
	        	createDeviceLogFile(()=>{
	        		parser.parseFile(deviceListPath, callback);
	        	});
	        });
	    } else {
	    	/* istanbul ignore next: It's being tested directly */
        	createDeviceLogFile(()=>{
        		parser.parseFile(deviceListPath, callback);
        	});
	    }
	})
}

function getSdkList(callback){
	fs.access(sdkListPath, fs.F_OK, function(err) {
	    if (!err) {
	        fs.unlink(sdkListPath, ()=>{
	        	/* istanbul ignore next: It's being tested directly */
	        	createSdkLogFile(()=>{
	        		parser.parseSdkFile(sdkListPath, callback);
	        	});
	        });
	    } else {
	    	/* istanbul ignore next: It's being tested directly */
        	createSdkLogFile(()=>{
        		parser.parseSdkFile(sdkListPath, callback);
        	});
	    }
	})
}

function createDeviceLogFile(callback){
	var xcrun = spawn('xcrun', ['instruments', '-s']);
	var logStream = fs.createWriteStream(deviceListPath, {flags: 'a'});
	xcrun.stdout.pipe(logStream);
	xcrun.stderr.pipe(logStream);

	xcrun.on('close', () =>{
		callback();
	});
}

function createSdkLogFile(callback){
	var xcodebuild = spawn('xcodebuild', ['-showsdks']);
	var logStream = fs.createWriteStream(sdkListPath, {flags: 'a'});
	xcodebuild.stdout.pipe(logStream);
	xcodebuild.stderr.pipe(logStream);

	xcodebuild.on('close', () =>{
		callback();
	});
}

function pipeOutputs(socket, ugly, pretty, callback){
	ugly.stdout.pipe(pretty.stdin);

	/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
	pretty.stdout.on('data', (data) => {
		var item = createLogItemFromData(data);
		socket.emit('updateLog', item)

		/* istanbul ignore else*/
	    if (callback !== undefined) {
	    	callback(item);
	    }
	});

	/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
	ugly.stderr.on('data', (data) => {
		var item = createLogItemFromData(data);
		item.type = 'error';
		socket.emit('updateLog', item);

		/* istanbul ignore else*/
	    if (callback !== undefined) {
	    	callback(item);
	    }
	});

	/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
	ugly.on('close', (code) => {
		if (code !== 0) {
			// console.log(`build process exited with code ${code}`);
		}
	});
}

//Helpers
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

module.exports = {executeBuild, executeClean, executeCleanBuildFolder, getDeviceAndiOSList, createDeviceLogFile, createSdkLogFile, deviceListPath, getSdkList, sdkListPath, getCurrentTime, executeCleanBuildFolder}