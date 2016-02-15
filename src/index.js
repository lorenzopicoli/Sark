import express from 'express';
import http from 'http';
import path from 'path';

var app = express();
var httpServer = http.createServer(app).listen(3000);
var io = require('socket.io').listen(httpServer);

var isClientConnected = false;

app.use(express.static(__dirname + '/public'));

app.get('*', function(req, res){
  res.status(404).send('This page doesn\'t exists');
});

console.log('Server listening on port 3000');

io.on('connection', (socket) =>{
	isClientConnected = true;

	socket.on('newCommand', (command) =>{
		executeCommand(command);
	});
});

function executeCommand(command){
	console.log("New command ", command); 
};

export default {app, httpServer, executeCommand};