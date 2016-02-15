var socket = io("http://localhost:3000");

socket.on('connect', () =>{
	socket.emit('newCommand', "Build");
});