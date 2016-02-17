import commands from './commands'

var isClientConnected = false;

module.exports = {
	isClientConnected: ()=>{
		return isClientConnected;
	},
	setupListeners: (io) =>{
		io.on('connection', (socket) =>{
			isClientConnected = true;

			commands.getDeviceList((list)=>{
				socket.emit('updateDeviceList', list);
			});

			commands.getOSList((list)=>{
				socket.emit('updateiOSList', list);
			});

			socket.on('build', (config, callback) =>{
				commands.executeBuild(config, socket, callback);
			});

		});
	}
};