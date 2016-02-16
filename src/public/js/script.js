var socket = io.connect("http://localhost:3000");

socket.on('connect', () =>{
	console.log('connect');
	socket.emit('newCommand', "Build");
});