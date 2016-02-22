import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';

var app = express();
var httpServer = http.createServer(app).listen(3000);
var io = require('socket.io').listen(httpServer);
var socket = require('./server/socket');

app.use(express.static(__dirname + '/public'));

app.get('*', function(req, res){
  res.status(404).send('This page doesn\'t exists');
});

//Create git folder if it doesn't exists
try {
	fs.mkdirSync('./git/');
} catch(e) {
	if ( e.code != 'EEXIST' ) throw e;
}


socket.setupListeners(io);

console.log('Server listening on port 3000');


module.exports = {httpServer, app, io};