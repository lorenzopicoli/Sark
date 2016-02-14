import express from "express";
import http from "http";
import path from 'path';
var app = express();
var server = http.createServer(app).listen(3000);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + "/public"));

app.get('*', function(req, res){
  res.status(404).send("This page doesn't exists");
});

module.exports = app;
module.exports = server;