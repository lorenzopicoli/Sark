var isClientConnected = false;

function executeCommand(command, callback){
	console.log("New command ", command); 
    if (callback !== undefined) {
    	callback();
    }
}

module.exports = {
	isClientConnected: ()=>{
		return isClientConnected;
	},
	setupListeners: (io) =>{
		io.on('connection', (socket) =>{
			isClientConnected = true;
			socket.on('newCommand', (command, callback) =>{
				executeCommand(command, callback);
			});

		});
	}
};