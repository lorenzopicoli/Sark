//Chai
import chai from 'chai';
import { expect } from 'chai';
import chaiHttp from 'chai-http';

//Sark
import server from '../src/index';
import socket from '../src/server/socket';
import commands from '../src/server/commands';
import parser from '../src/server/logParser';
import gitManager from '../src/server/gitManager';

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

		it('shoud recieve new client connection', (done) =>{
			var client = io.connect(socketURL, options);

		    client.on('connect',function(){
				expect(socket.isClientConnected()).to.equal(true);
				client.disconnect();
		      	done(); 
		    });
		});
	});


	describe('Github integration', (done)=>{
		it('should clone test repository', (done)=>{

			var client = io.connect(socketURL, options);
			client.on('connect', ()=>{
				gitManager.clone('https://github.com/lorenzopicoli/SarkTestProj.git', '', (item)=>{
					expect(item.type).to.equal('success');
					client.disconnect();
					done();
				});
			});
		});

		it('should pull test repository', (done)=>{

			var client = io.connect(socketURL, options);
			client.on('connect', ()=>{
				gitManager.pull(client, (item)=>{
					expect(item.type).to.equal('success');
					client.disconnect();
					done();
				});
			});	
		});
	});

	describe('Socket.io Communication', (done) =>{

		it('should recieve build command', (done) =>{
			var client = io.connect(socketURL, options);
			var config = {
				filename: 'sarktest.xcodeproj',
				configuration: 'Debug',
				scheme: 'sarktest',
				device: 'iPhone 6s',
				ios: '9.2'
			}

			client.on('connect', () =>{
				client.emit('build', config, ()=>{
					client.disconnect();
			      	done(); 
				});
			});	
		});

		it('should recieve clone request', (done)=>{
			var client = io.connect(socketURL, options);
			var config = {
				url: 'https://github.com/lorenzopicoli/SarkTestProj.git',
				token: ''
			}
			client.on('connect', () =>{
				client.emit('cloneRequest', config, (item)=>{
					expect(item.type).to.equal('success');
					client.disconnect();
					done();					
				});
			});	
		});

		it('should recieve clean request', (done)=>{
			var client = io.connect(socketURL, options);
			var config = {
				filename: 'sarktest.xcodeproj',
			}
			client.on('connect', () =>{
				client.emit('clean', config, ()=>{
					client.disconnect();
					done();					
				});
			});	
		});


		it('should recieve clean build folder request', (done)=>{
			var client = io.connect(socketURL, options);
			var path = process.env.HOME + '/Library/Developer/Xcode/DerivedData';
			fs.mkdir(path, ()=>{
				client.on('connect', () =>{
					client.emit('cleanFolder', ()=>{
						client.disconnect();
						done();
					});
				});	
			});
		});

		it('shoud execute build command', (done) =>{
			var client = io.connect(socketURL, options);
			var config = {
				filename: 'sarktest.xcodeproj',
				configuration: 'Debug',
				scheme: 'sarktest',
				device: 'iPhone 6s',
				ios: '9.2',
				sdk: 'iphonesimulator9.2',
			}

			if (process.env.TRAVIS){
				config.sdk = 'iphonesimulator8.1';
				config.ios = '8.2';
				console.log('IS TRAVIS!')
			}
			console.log('Does sark project exists?');
			doesFileExists('./git/sarktest.xcodeproj', (result)=>{
				console.log(result);
			});
			console.log('started build test');
			client.on('connect', () =>{
				console.log('connected to socket');
				commands.executeBuild(config, client, (item)=>{
					console.log(item);
					if(item.type === 'success'){
						client.disconnect();
						done();
					}
				});
			});
		});

		it('shoud clean build folder', (done) =>{
			var client = io.connect(socketURL, options);
			var path = process.env.HOME + '/Library/Developer/Xcode/DerivedData';
			client.on('connect', () =>{
				commands.executeCleanBuildFolder(client, ()=>{
					doesFileExists(path, (result) =>{
						expect(result).to.equal(false);
						client.disconnect();
						console.log('done!');
						done();
					});
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