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
				gitManager.pull(socket, ()=>{
					commands.executeBuild(config, socket, callback);
				});
			});

			socket.on('cloneRequest', (url)=>{
				gitManager.clone(url, socket);
			});
		});
	}
};