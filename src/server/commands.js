import util from 'util'
import { spawn } from 'child_process'
import io from './socket'
import fs from 'fs'
import parser from './logParser';
import help from './helperFunctions';
import path from 'path';
import rmdirAsync from './removeDirContent';
import simulator from './simulatorCommands';

/*
================================
Constants
=================================
*/
const deviceListPath = './logs/deviceList.log'
const sdkListPath = './logs/sdkList.log'

//Git path is not a constant because the relative path is different when testing
var gitPath = path.resolve(__dirname, '../../../git/')

if(process.env.NODE_ENV == 'test' || process.env.TRAVIS){
	gitPath = path.resolve(__dirname, '../../git/')
}

//Creates spawn's arguments for build action
function createBuildArgs(filename, scheme, configuration, sdk, device, os){
	var fileType = '-workspace';

	/* istanbul ignore else*/
	if(filename.indexOf('xcodeproj') > -1){
		fileType = '-project';
	}

	return [fileType, filename, '-scheme', scheme, '-configuration', configuration, '-sdk', sdk, '-destination', `name=${device},OS=${os}`, '-IDEBuildOperationMaxNumberOfConcurrentCompileTasks=4']
}

//Creates spawn's arguments for clean action
function createCleanArgs(filename){
	var fileType = '-workspace';

	/* istanbul ignore else*/
	if(filename.indexOf('xcodeproj') > -1){
		fileType = '-project';
	}
	return [fileType, filename, '-alltargets', 'clean', '-IDEBuildOperationMaxNumberOfConcurrentCompileTasks=4']
}

/*
================================================================
Main function for BUILDING
The argument config must have the following format:
{
	filename: file.xcodeproj [or .xcworkspace],
	scheme: myScheme,
	configuration: Debug [or Release],
	sdk: iphonesimulator9.2,
	device: iPhone 6s,
	ios: 9.2
}
=================================================================
*/
function executeBuild(config, socket, callback){
	//Append the filename to the git path
	var filePath =  path.resolve(gitPath, config.filename);
	var args = createBuildArgs(filePath, config.scheme, config.configuration, config.sdk, config.device, config.ios);
	var build = spawn('xcodebuild', args);
	var xcpretty = spawn('xcpretty');

	//pipeOutputs sets build stdout to xcpretty and send every new data to client
	pipeOutputs(socket, build, xcpretty, callback);
}

/*
================================================================
Main function for RUNNING
The argument config must have the following format:
{
	filename: file.xcodeproj [or .xcworkspace],
	scheme: myScheme,
	configuration: Debug [or Release],
	sdk: iphonesimulator9.2,
	device: iPhone 6s,
	ios: 9.2
}
=================================================================
*/
function executeRun(config, socket, callback){
	executeCleanBuildFolder(socket, ()=>{
		buildAndGetAppPath(config, socket, (appPath)=>{
			if(appPath !== ''){
				simulator.openSimulator(config.device, config.ios, socket, ()=>{
					simulator.installApp(appPath, socket, ()=>{
						simulator.runApp(appPath, socket, ()=>{
						});
					});
				});
			}
		});
	});
}

/*
================================================================
Main function for CLEANING
The argument config must have the following format:
{
	filename: file.xcodeproj [or .xcworkspace]
}
=================================================================
*/
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

/*
================================================================
Main function for CLEANING BUILD FOLDER
=================================================================
*/
function executeCleanBuildFolder(socket, callback) {

	socket.emit('updateLog', {
		time: help.getCurrentTime(),
		log: 'Deleting build folder...',
		type: 'info',
	});
	rmdirAsync(process.env.HOME + '/Library/Developer/Xcode/DerivedData', ()=>{
		socket.emit('updateLog', {
			time: help.getCurrentTime(),
			log: 'Cleaned build folder successfully',
			type: 'success',
		});

		/* istanbul ignore else*/
	    if (callback !== undefined) {
	    	callback();
	    }
    });
}

/*
========================================
Get the device and iOS list by:
- Deleting any old log files
- Retrieving new data
- Parsing the data
========================================
*/
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

/*
========================================
Get the sdk list by:
- Deleting any old log files
- Retrieving new data
- Parsing the data
========================================
*/
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

/*
================================================
Simply use spawn to get the device / os log file
================================================
*/
function createDeviceLogFile(callback){
	var xcrun = spawn('xcrun', ['instruments', '-s']);
	var logStream = fs.createWriteStream(deviceListPath, {flags: 'a'});
	xcrun.stdout.pipe(logStream);
	xcrun.stderr.pipe(logStream);

	xcrun.on('close', () =>{
		callback();
	});
}

/*
================================================
Simply use spawn to get the sdk log file
================================================
*/
function createSdkLogFile(callback){
	var xcodebuild = spawn('xcodebuild', ['-showsdks']);
	var logStream = fs.createWriteStream(sdkListPath, {flags: 'a'});
	xcodebuild.stdout.pipe(logStream);
	xcodebuild.stderr.pipe(logStream);

	xcodebuild.on('close', () =>{
		callback();
	});
}

/*
================================================
This is a helper function that takes:
'socket' - Used for sending new data to client
'ugly' - raw xcodebuild data
'pretty' - xcpretty stream to pipe the ugly data
'callback' - Used for testing and result
================================================
*/
function pipeOutputs(socket, ugly, pretty, callback){
	ugly.stdout.pipe(pretty.stdin);

	/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
	pretty.stdout.on('data', (data) => {
		var item = help.createLogItemFromData(data);
		socket.emit('updateLog', item)
		/* istanbul ignore else*/
	    if (callback !== undefined) {
	    	callback(item);
	    }
	});

	/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
	ugly.stderr.on('data', (data) => {
		var item = help.createLogItemFromData(data);
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

/*
=============
Helpers
=============
*/


/*
===============================================================
This function build the app passed in the config variable and
calls the callback with the path of the .app builded
(Helpful when running the app!)
===============================================================
*/
function buildAndGetAppPath(config, socket, callback){
	//Append the filename to the git path
	var filePath =  path.resolve(gitPath, config.filename);
	var args = createBuildArgs(filePath, config.scheme, config.configuration, config.sdk, config.device, config.ios);
	var build = spawn('xcodebuild', args);
	var xcpretty = spawn('xcpretty');
	var finalPath = '';

	build.stdout.pipe(xcpretty.stdin);

	build.stdout.on('data', (data)=>{
		var stringData = data.toString('utf8');
		if(stringData.indexOf('/Library/Developer/Xcode/DerivedData/') > -1){
			var path = stringData.match(/(\/usr\/bin\/touch -c \/U).+?(?=\n)/g);
			if(path !== null){
				finalPath = path[0].replaceAll('/usr/bin/touch -c ', '');
			}
		}
	});

	/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
	xcpretty.stdout.on('data', (data) => {
		var item = help.createLogItemFromData(data);
		socket.emit('updateLog', item)
	});

	/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
	build.stderr.on('data', (data) => {
		var item = help.createLogItemFromData(data);
		item.type = 'error';
		socket.emit('updateLog', item);
	});

	/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
	build.on('close', (code) => {
		if (finalPath === ''){
			socket.emit('updateLog', {time: help.getCurrentTime(), type: 'error', log: `There was a problem when trying to get the app path.`});
		}else{
			socket.emit('updateLog', {time: help.getCurrentTime(), type: 'success', log: `Found path of builded app: ${finalPath}`});
		}
		callback(finalPath);
		if (code !== 0) {
			// console.log(`build process exited with code ${code}`);
		}
	});
}

module.exports = {executeBuild, executeRun, executeClean, executeCleanBuildFolder, getDeviceAndiOSList, createDeviceLogFile, createSdkLogFile, deviceListPath, getSdkList, sdkListPath, executeCleanBuildFolder, buildAndGetAppPath}