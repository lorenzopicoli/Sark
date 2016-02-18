//Chai
import chai from 'chai';
import { expect } from 'chai';
import chaiHttp from 'chai-http';

//Sark
import server from '../src/index';
import socket from '../src/server/socket'
import commands from '../src/server/commands'
import parser from '../src/server/logParser'

//Helper
import httpStatus from 'http-status';
import assert from 'assert';
import io from 'socket.io-client';
import sinon from 'sinon';
import fs from 'fs';

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
		       }, 100)
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
	});

	describe('Ability to pull information', (done)=>{

		it('should create a new device/os log file', (done)=>{
			deleteFileIfExists(commands.deviceListPath, () =>{
				commands.createDeviceLogFile(()=>{
					doesFileExists(commands.deviceListPath, (result)=>{
						expect(result).to.equal(true);
						done();
					});
				});
			});
		});

		it('should parse device/os file correctly', (done)=>{
			var expectResult = {
				ios: ['9.1', '9.2'], 
				device: ['iMac de Lorenzo', 
				'Apple TV 1080p', 
				'iPad 2', 
				'iPad Air', 
				'iPad Air 2', 
				'iPad Pro', 
				'iPad Retina', 
				'iPhone 4s', 
				'iPhone 5', 
				'iPhone 5s', 
				'iPhone 6', 
				'iPhone 6 Plus', 
				'iPhone 6s', 
				'Apple Watch - 38mm', 
				'iPhone 6s Plus', 
				'Apple Watch - 42mm']
			}
			parser.parseFile('./test/testLog.log', (item)=>{
				expect(item).to.deep.equal(expectResult);
				done();
			});
		});

		it('should create a new sdk log file', (done)=>{
			deleteFileIfExists(commands.sdkListPath, () =>{
				commands.createSdkLogFile(()=>{
					doesFileExists(commands.sdkListPath, (result)=>{
						expect(result).to.equal(true);
						done();
					});
				});
			});
		});

		it('should parse sdk file correctly', (done)=>{
			var expectResult = [ 
				'macosx10.11',
			  	'iphoneos9.2',
			  	'iphonesimulator9.2',
			  	'appletvos9.1',
			  	'appletvsimulator9.1',
			  	'watchos2.1',
			  	'watchsimulator2.1' 
			  	]
			parser.parseSdkFile('./test/testSdk.log', (item)=>{
				expect(item).to.deep.equal(expectResult);
				done();
			});
		});
	});
});

function doesFileExists(path, callback){
	fs.access(path, fs.F_OK, function(err) {
	    callback(!err)
	})
}

function deleteFileIfExists(path, callback){
	fs.access(path, fs.F_OK, function(err) {
	    if (!err) {
	        fs.unlink(path, ()=>{
	        	callback()
	        });
	    } else {
	    	callback()
	    }
	})
}