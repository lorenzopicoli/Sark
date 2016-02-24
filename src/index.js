import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import favicon from 'serve-favicon';
import socket from './server/socket';

/*
================================
Server setup
=================================
*/
var app = express();
var httpServer = http.createServer(app).listen(3000);
var io = require('socket.io').listen(httpServer);

/*
================================
Config.json read
=================================
*/
var file = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
var password = "";
var shouldLogin = false; //This is true when the user has typed the right password and setted to false right after the redirect to logged.html

//If we are testing then socket listeners should be added ASAP
if(process.env.NODE_ENV === 'test'){
	socket.setupListeners(io);
}

//Read the password property from the config.json file
//If there isn't one just terminate the process
if(file.hasOwnProperty('password')){
	password = file.password;
}else{
	console.log('Invalid config.json');
	process.exit();
}


var bodyParser = require('body-parser')
app.use(bodyParser.json() );       
app.use(bodyParser.urlencoded({     
  extended: true
}));

app.use(favicon(__dirname + '/public/favicon.ico'));

app.post('/login', (req, res)=>{
	//If the password is right redirect to logged.html
	if (req.body.password === password){
		shouldLogin = true;
		res.redirect('/logged.html');
	}else{
		res.redirect('/tryPass.html');
	}
});

//Check if the user can redirect in case the requested page was logged.html
app.use('*', (req, res, next)=>{
	if(req.originalUrl === '/logged.html' && !shouldLogin){
		res.redirect('/');
	}else{
		shouldLogin = false;
		next();
	}
})

//If the user is going for logged.html and is here that means that the password is right
//We setup socket.io listeners
app.use('/logged.html', (req, res, next) =>{
	socket.setupListeners(io);
	next();
});

//Serve static files from /public
app.use(express.static(__dirname + '/public'));

//Any other page that falls here doesn't exists
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