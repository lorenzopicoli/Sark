import commands from './commands'
import gitManager from './gitManager'

var isClientConnected = false;

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
				socket.emit('gitUpdate', {type:'info', log:"Trying to pull changes..."});
				gitManager.pull(socket, (item)=>{
					socket.emit('gitUpdate', item);
					commands.executeBuild(config, socket, callback);
				});
			});

			socket.on('clean', (config, callback) =>{
				commands.executeClean(config, socket, callback);
			});

			socket.on('cloneRequest', (item, callback)=>{
				socket.emit('gitUpdate', {type:'info', log:"Starting clone request..."});
				gitManager.clone(item.url, item.token, (item)=>{
					socket.emit('gitUpdate', item);
					callback(item);
				})
			});

			socket.on('cleanFolder', (callback)=>{
				commands.executeCleanBuildFolder(socket, callback);				
			});
		});
	}
};