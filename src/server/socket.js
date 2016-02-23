import commands from './commands'
import gitManager from './gitManager'
import validation from './validation'

var isClientConnected = false;

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
	isClientConnected: ()=>{
		return isClientConnected;
	},
	setupListeners: (io) =>{
		io.on('connection', (socket) =>{
			isClientConnected = true;

			commands.getDeviceAndiOSList((item)=>{
				socket.emit('updateDeviceAndiOSList', item);
			});

			commands.getSdkList((list)=>{
				socket.emit('updateSdkList', list);
			});

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

			socket.on('clean', (config, callback) =>{
				var isValid = validation.validateConfig(config);

				if(!isValid.valid){
					socket.emit('invalidField', isValid.error);
				}else{
					commands.executeClean(config, socket, callback);
				}
			});

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

			socket.on('cleanFolder', (callback)=>{
				commands.executeCleanBuildFolder(socket, callback);				
			});
		});
	}
};