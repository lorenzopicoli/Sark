//Chai
import chai from 'chai';
import { expect } from 'chai';
import chaiHttp from 'chai-http';

//Sark
import server from '../src/index';
import socket from '../src/server/socket'

//Helper
import httpStatus from 'http-status';
import assert from 'assert';
import io from 'socket.io-client';
import sinon from 'sinon';

chai.use(chaiHttp);

var socketURL = 'http://localhost:3000';
var options ={
  transports: ['websocket'],
  'force new connection': true
};

describe('Sark Tests', () => {

	after(() =>{
	    server.httpServer.close();
	});

	describe('Server Reachability', (done) =>{
		it('should respond with status 200 for homepage', (done) =>{
		  	chai.request(server.app)
		  		.get('/')
		  		.end(function(err, res){
		  			expect(res.status).to.equal(200);
		  			done();
		  		});
		});

		it('should respond with status 200 for logged page', (done) =>{
		  	chai.request(server.app)
		  		.get('/logged.html')
		  		.end(function(err, res){
		  			expect(res.status).to.equal(200);
		  			done();
		  		});
		});

		it('should respond with 404 for any other request', (done)=>{
		  	chai.request(server.app)
		  		.get('/anotherPage')
		  		.end(function(err, res){
		  			expect(res.status).to.equal(404);
		  			done();
		  		});
		});
	});

	describe('Socket.io Communication', (done) =>{

		it('recieves new client connection', (done) =>{
			var client = io.connect(socketURL, options);

		    client.on('connect',function(){
				expect(socket.isClientConnected()).to.equal(true);
				client.disconnect();
		      	done(); 
		    });
		});

		it('recieves new command', (done) =>{
			var client = io.connect(socketURL, options);
			var spy = sinon.spy();
			
			client.on('connect', () =>{
				client.emit('newCommand', "Build", spy);

				setTimeout(function(){
					assert(spy.calledOnce);
					client.disconnect();
			      	done(); 
		       }, 50)
			});	
		});

		// it('executes new command', () =>{

		// });

		// it('detect terminal updates', () =>{

		// });

	});
});