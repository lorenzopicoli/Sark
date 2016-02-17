//Chai
import chai from 'chai';
import { expect } from 'chai';
import chaiHttp from 'chai-http';

//Sark
import server from '../src/index';
import socket from '../src/server/socket'
import commands from '../src/server/commands'

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

		it('shoud recieve new client connection', (done) =>{
			var client = io.connect(socketURL, options);

		    client.on('connect',function(){
				expect(socket.isClientConnected()).to.equal(true);
				client.disconnect();
		      	done(); 
		    });
		});

		it('should recieve build command', (done) =>{
			var client = io.connect(socketURL, options);
			var spy = sinon.spy();
			var config = {
				filename: './XcodeTest/sarktest/sarktest.xcodeproj',
				configuration: 'Debug',
				scheme: 'sarktest',
				device: 'iPhone 6s',
				ios: '9.2'
			}

			client.on('connect', () =>{
				client.emit('build', config, spy);

				setTimeout(function(){
					assert(spy.calledOnce);
					client.disconnect();
			      	done(); 
		       }, 50)
			});	
		});

		it('shoud execute build command', () =>{
			var client = io.connect(socketURL, options);
			var spy = sinon.spy();
			var config = {
				filename: './XcodeTest/sarktest/sarktest.xcodeproj',
				configuration: 'Debug',
				scheme: 'sarktest',
				device: 'iPhone 6s',
				ios: '9.2'
			}

			client.on('connect', () =>{
				commands.executeBuild(config, client, spy);

				client.on('updateLog', (item) =>{
					assert(spy.callCount > 0);
					if(item.log.indexOf('BUILD SUCCEEDED')){
						expect(item.tpye).to.equal('');
						client.disconnect();
						done();
					}
				});
			});	

		});

		// it('detect terminal updates', () =>{

		// });

	});
});