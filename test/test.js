//Chai
import chai from 'chai';
import { expect } from 'chai';
import chaiHttp from 'chai-http';

//Sark
import server from '../src/index';

//Helper
import httpStatus from 'http-status';
import assert from 'assert';
import io from 'socket.io-client';
import sinon from 'sinon';

chai.use(chaiHttp);

var client;
var socketURL = 'http://localhost:3000';
var options ={
  transports: ['websocket'],
  'force new connection': true
};

describe('Sark Tests', () => {

	after(() =>{
	    server.httpServer.close();
	});

	describe('Server Reachability', () =>{
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

	describe('Socket.io Communication', () =>{

		beforeEach(() =>{
			client = io.connect(socketURL, options);
		});

		afterEach(() =>{
		    client.disconnect();
		});

		it('recieves new client connection', () =>{
		    client.on('connect',function(usersName){
				expect(server.app.isClientConnected).to.equal(true);
		      	done(); 
		    });
		});

		it('recieves new command', () =>{
			sinon.spy(server.executeCommand);

			client.on('connect', () =>{
				client.emit('newCommand', "Build");

				client.on('newCommand',function(usersName){
					assert(server.executeCommand.calledOnce);
					server.executeCommand.restore();
			      	done(); 
			   	});
			});



		});

		// it('executes new command', () =>{

		// });

		// it('detect terminal updates', () =>{

		// });

	});
});