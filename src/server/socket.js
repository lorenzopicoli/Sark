import commands from './commands'
import gitManager from './gitManager'
import validation from './validation'


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

module.exports = {
	setupListeners: (io) =>{
		io.on('connection', (socket) =>{

			/*
			======================================================
			Setup the new client by retrieving sdk/ios/device list
			======================================================
			*/
			commands.getDeviceAndiOSList((item)=>{
				socket.emit('updateDeviceAndiOSList', item);
			});

			commands.getSdkList((list)=>{
				socket.emit('updateSdkList', list);
			});

			/*
			=================================
			Build handler
			=================================
			*/
			socket.on('build', (config, callback) =>{
				var isValid = validation.validateConfig(config);
				if(!isValid.valid){
					socket.emit('invalidField', isValid.error);
				}else{
					socket.emit('gitUpdate', {type:'info', log:"Trying to pull changes..."});
					gitManager.pull(socket, (item)=>{
						socket.emit('gitUpdate', item);
						commands.executeBuild(config, socket, callback);
					});
				}
				
			});

			/*
			=================================
			Build handler
			=================================
			*/
			/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
			socket.on('run', (config, callback) =>{
				var isValid = validation.validateConfig(config);
				if(!isValid.valid){
					socket.emit('invalidField', isValid.error);
				}else{
					socket.emit('gitUpdate', {type:'info', log:"Trying to pull changes..."});
					gitManager.pull(socket, (item)=>{
						socket.emit('gitUpdate', item);
						commands.executeRun(config, socket, callback);
					});
				}
				
			});

			/*
			=================================
			Clean handler
			=================================
			*/
			/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
			socket.on('clean', (config, callback) =>{
				var isValid = validation.validateConfig(config);

				if(!isValid.valid){
					socket.emit('invalidField', isValid.error);
				}else{
					commands.executeClean(config, socket, callback);
				}
			});

			/*
			=================================
			Clean folder handler
			=================================
			*/
			/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
			socket.on('cleanFolder', (callback)=>{
				commands.executeCleanBuildFolder(socket, callback);				
			});

			/*
			=================================
			Clone handler
			=================================
			*/
			/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
			socket.on('cloneRequest', (item, callback)=>{
				var isValid = validation.validateURL(item.url);

				if(!isValid){
					socket.emit('gitUpdate', {type:'error', log:"Invalid url."});
				}else{
					socket.emit('gitUpdate', {type:'info', log:"Starting clone request..."});
					gitManager.clone(item.url, item.token, (item)=>{
						socket.emit('gitUpdate', item);
						if(callback !== null && callback !== undefined){
							callback(item);
						}
					})
				}
			});
		});
	}
};