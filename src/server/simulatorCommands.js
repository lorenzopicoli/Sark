import { spawn } from 'child_process';
import help from './helperFunctions';


/*
=====================================
TODO: This file lacks error handling!
=====================================
*/


/*
==========================================================================================
Open the simulator handlers.
TODO: I think there's a better way to bypass the need of sending a template on xcrun call
==========================================================================================
*/
function openSimulator(device, ios, socket, callback){
	var fullDevice = `${device} (${ios})`;

	//The device list contains iPhone 6s and iPhone 6s + apple watch (same thing for the Plus)
	//intruments would complain about ambiguity, adding ' [' fix this.
	if(device === 'iPhone 6s' || device === 'iPhone 6s Plus'){
		fullDevice += ' [';
	}

	socket.emit('updateLog', {
		time: help.getCurrentTime(),
		log: 'Waiting for device to boot...',
		type: 'info',
	});

	//We pass a invalid -t because instruments require it. Because of that we'll get
	//an error back saying that it's a invalid template, but the device will boot!
	var args = ['instruments', '-w', `${fullDevice}`, '-t', 'noTemp'];
	var xcrun = spawn('xcrun', args);

	xcrun.stderr.on('data', function(data) {
		if(data.toString('utf8').indexOf("Instruments Usage Error : The specified template 'noTemp' does not exist.") > -1){
			socket.emit('updateLog', {
				time: help.getCurrentTime(),
				type: 'success',
				log: 'Device booted...'
			});
			callback();
	  	}
	});
}

/*
================================
Installs the app
=================================
*/
function installApp(appPath, socket, callback){
	var args = ['simctl', 'install', 'booted', appPath];
	var xcrun = spawn('xcrun', args);

	socket.emit('updateLog', {
		time: help.getCurrentTime(),
		log: 'Installing the app...',
		type: 'info',
	});

	xcrun.on('close', (code) => {
		socket.emit('updateLog', {
			time: help.getCurrentTime(),
			type: 'success',
			log: 'App installed...'
		});
		callback();
		if (code !== 0) {
			console.log(`install process exited with code ${code}`);
		}
	});
}

/*
================================
Run the app
=================================
*/	
function runApp(appPath, socket, callback){
	getBundleId(appPath, socket, (bundle)=>{
		var args = ['simctl', 'launch', 'booted', bundle];
		var xcrun = spawn('xcrun', args);

		socket.emit('updateLog', {
			time: help.getCurrentTime(),
			log: 'Trying to run the app...',
			type: 'info',
		});

		xcrun.on('close', (code) => {
			socket.emit('updateLog', {
				time: help.getCurrentTime(),
				type: 'success',
				log: 'App running...'
			});
			callback();
			if (code !== 0) {
				console.log(`run process exited with code ${code}`);
			}
		});
	});
}

/*
===================================
This is needed for the run function
===================================
*/	
function getBundleId(appPath, socket, callback){
	var plistPath = appPath + '/Info.plist'
	var args = ['read', plistPath, 'CFBundleIdentifier'];
	var xcrun = spawn('defaults', args);
	var bundleId = '';

	socket.emit('updateLog', {
		time: help.getCurrentTime(),
		log: 'Trying to get the bundle identifier...',
		type: 'info',
	});

	xcrun.stdout.on('data', (data)=>{
		bundleId = data.toString('utf8');
	});

	xcrun.on('close', (code) => {
		callback(bundleId.replaceAll('\n', ''));

		if (bundleId === ''){
			socket.emit('updateLog', {
				time: help.getCurrentTime(),
				type: 'error',
				log: 'There was a problem when trying to get the app bundle identifier.'
			});
		}
		if (code !== 0) {
			console.log(`bundle process exited with code ${code}`);
		}
	});
}

module.exports = {openSimulator, installApp, runApp, getBundleId};	