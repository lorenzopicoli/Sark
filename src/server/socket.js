import commands from './commands'

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

			socket.on('build', (config, callback) =>{
				commands.executeBuild(config, socket, callback);
			});

		});
	}
};