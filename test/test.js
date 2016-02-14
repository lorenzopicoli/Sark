import httpStatus from 'http-status';
import chai from 'chai';
import { expect } from 'chai';
import app from '../src/index';
import server from '../src/index';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);

describe('Sark Tests', () => {

	describe('Server Tests', () =>{

		after(function() {
		    server.close();
		  });

		it('responds with status 200', (done) =>{
		  	chai.request(app)
		  		.get('/')
		  		.end(function(err, res){
		  			expect(res.status).to.equal(200);
		  			done();
		  		});
		});

		it('should respond with 404 for any request other than the homepage', (done)=>{
		  	chai.request(app)
		  		.get('/anotherPage')
		  		.end(function(err, res){
		  			expect(res.status).to.equal(404);
		  			done();
		  		});
		});

		it('recieves new PC connection', () =>{

		});

		it('recieves new command', () =>{

		});

		it('execute new command', () =>{

		});

		it('detect terminal updates', () =>{

		});

	});
});