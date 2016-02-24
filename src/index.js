import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import favicon from 'serve-favicon';

var app = express();
var httpServer = http.createServer(app).listen(3000);
var io = require('socket.io').listen(httpServer);
var socket = require('./server/socket');

var file = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
var password = "";
var currentSess = '';
var shouldLogin = false;

if(process.env.NODE_ENV === 'test'){
	socket.setupListeners(io);
}

if(file.hasOwnProperty('password')){
	password = file.password;
}else{
	process.exit();
}

var bodyParser = require('body-parser')
app.use(bodyParser.json() );       
app.use(bodyParser.urlencoded({     
  extended: true
}));

app.use(favicon(__dirname + '/public/favicon.ico'));

app.post('/login', (req, res)=>{
	if (req.body.password === password){
		shouldLogin = true;
		res.redirect('/logged.html');
	}else{
		res.redirect('/tryPass.html');
	}
});

app.use('*', (req, res, next)=>{
	if(req.originalUrl === '/logged.html' && !shouldLogin){
		res.redirect('/');
	}else{
		shouldLogin = false;
		next();
	}
})

app.use('/logged.html', (req, res, next) =>{
	socket.setupListeners(io);
	next();
});

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


console.log('Server listening on port 3000');


module.exports = {httpServer, app, io};