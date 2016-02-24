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
import validation from '../src/server/validation';

//Helper
import httpStatus from 'http-status';
import assert from 'assert';
import io from 'socket.io-client';
import sinon from 'sinon';
import fs from 'fs';

//TODO: Maybe it's a good idea to split this into multiple files

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

	describe('Authentication', (done)=>{
		it('should redirect user to homepage if try to access logged.html without being authenticated', (done)=>{
		  	chai.request(server.app)
		  		.get('/logged.html')
		  		.end(function(err, res){
		  			var redirect = '/';
		  			var host = res.req._headers.host;
		  			var fullHost = 'http://' + host + redirect;
		  			expect(res.redirects).to.contain(fullHost);
		  			done();
		  		});
		});

		it('should redirect user to logged.html if provided the right password', (done)=>{
		  	chai.request(server.app)
		  		.post('/login')
		  		.send({password: '123'})
		  		.end(function(err, res){
		  			var redirect = '/logged.html';
		  			var host = res.req._headers.host;
		  			var fullHost = 'http://' + host + redirect;
		  			expect(res.redirects).to.contain(fullHost);
		  			done();
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
				ios: '9.2',
				sdk: 'iphonesimulator9.2',
			}

			if (process.env.TRAVIS){
				config.sdk = 'iphonesimulator9.2';
				config.ios = '9.1';
				config.device = 'iPhone 5s';
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
				config.sdk = 'iphonesimulator9.2';
				config.ios = '9.1';
				config.device = 'iPhone 5s';
			}

			client.on('connect', () =>{
				commands.executeBuild(config, client, (item)=>{
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

	describe('Fields validation', (done)=>{

		it('should succeed on a valid config file', ()=>{
			var config = {
				filename: 'sarktest.xcodeproj',
				configuration: 'Debug',
				scheme: 'sarktest',
				device: 'iPhone 6s',
				ios: '9.2',
				sdk: 'iphonesimulator9.2',
			}
			expect(validation.validateConfig(config).valid).to.equal(true);
		});

		it('should fail on a invalid format configuration', ()=>{
			var config = "test";
			expect(validation.validateConfig(config).valid).to.equal(false);
		});

		it('should fail on a invalid iOS field', ()=>{
			var config = {
				filename: 'sarktest.xcodeproj',
				configuration: 'Debug',
				scheme: 'sarktest',
				device: 'iPhone 6s',
				ios: 'youGotHacked!',
				sdk: 'iphonesimulator9.2',
			};
			expect(validation.validateConfig(config).valid).to.equal(false);
		});

		it('should fail on a invalid filename field', ()=>{
			var config = {
				filename: '\\@s#fg\n',
				configuration: 'Debug',
				scheme: 'sarktest',
				device: 'iPhone 6s',
				ios: '9.2',
				sdk: 'iphonesimulator9.2',
			};
			expect(validation.validateConfig(config).valid).to.equal(false);
		});

		it('should fail on a invalid configuration field', ()=>{
			var config = {
				filename: 'sarktest.xcodeproj',
				configuration: '924De%3',
				scheme: 'sarktest',
				device: 'iPhone 6s',
				ios: '9.2',
				sdk: 'iphonesimulator9.2',
			};
			expect(validation.validateConfig(config).valid).to.equal(false);
		});

		it('should fail on a invalid scheme field', ()=>{
			var config = {
				filename: 'sarktest.xcodeproj',
				configuration: 'Debug',
				scheme: '@sd/.\\',
				device: 'iPhone 6s',
				ios: '9.2',
				sdk: 'iphonesimulator9.2',
			};
			expect(validation.validateConfig(config).valid).to.equal(false);
		});

		it('should fail on a invalid SDK field', ()=>{
			var config = {
				filename: 'sarktest.xcodeproj',
				configuration: 'Debug',
				scheme: 'sarktest',
				device: 'iPhone 6s',
				ios: '9.2',
				sdk: 'hack9.2test',
			};
			expect(validation.validateConfig(config).valid).to.equal(false);
		});

		it('should succed on a valid URL', ()=>{
			var config = 'https://github.com/lorenzopicoli/SarkTestProj.git';
			expect(validation.validateURL(config)).to.equal(true);
		});

		it('should fail on a invalid URL', ()=>{
			var config = 'My git project . git is the file';
			expect(validation.validateURL(config)).to.equal(false);
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