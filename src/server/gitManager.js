var Git = require("nodegit");
import rmdirAsync from './removeDirContent';
import fs from 'fs';
import path from 'path';
var repository;
function prepareForClone(callback){
	rmdirAsync('./git/', ()=>{
		fs.mkdir('./git/', callback);
	});
}

function clone(repo, socket){
	prepareForClone(()=>{
		// simpleGit.outputHandler(function (command, stdout, stderr) {
	 //        stdout.on('data', (data)=>{
	 //        	socket.emit('gitUpdate', data.toString('utf8'));
	 //        	console.log('DATA', data.toString('utf8'));
	 //        });
	 //        stderr.on('data', (data)=>{
	 //        	socket.emit('gitUpdate', data.toString('utf8'));
	 //        	console.log('DATA', data.toString('utf8'));

	 //        });
	 //     })
		// .clone(repo, './', (err, update)=>{
		// 	var success = !err;
		// 	if(success){
		// 		socket.emit('gitUpdate', "Cloned successfully");
		// 	}else{
		// 		socket.emit('gitUpdate', "Ops, something went wrong when trying to clone repo. Try again!");
		// 	}
		// });
		process.on('uncaughtException', function(err) {
			if(err.Error = 'authentication required but no callback set'){
				console.log('HAHA! FUCK YOU!!!!')
			}else{
				throw err;
			}
		})
		Git.Clone(repo, './git', {
	      fetchOpts: {
	        callbacks: {
	          certificateCheck: function() {
	            // github will fail cert check on some OSX machines
	            // this overrides that check
	            console.log('AHA!');

	            return 1;
	          }
	        }
	      }}).done(()=>{console.log('Cloned?')});
})}

function pull(socket, callback){
	// simpleGit.outputHandler(function (command, stdout, stderr) {
 //        stdout.on('data', (data)=>{
 //        	socket.emit('gitUpdate', data.toString('utf8'));
 //        });
 //        stderr.on('data', (data)=>{
 //        	socket.emit('gitUpdate', data.toString('utf8'));
 //        });
 //     })
	// .pull(function(err, update) {
	// 	var success = !err;
	// 	if(success){
	// 		socket.emit('gitUpdate', "Pulled new code successfully");
	// 	}else{
	// 		socket.emit('gitUpdate', "Ops, something went wrong when trying to pull changes. Try again!");
	// 	}
	// 	callback();
	// })
	console.log(path.resolve(__dirname, '../../../git/'));
Git.Repository.open(path.resolve(__dirname, '../../../git/'))
  .then(function(repo) {
    repository = repo;

    return repository.fetchAll({
      callbacks: {
        credentials: function(url, userName) {
          return Git.Cred.sshKeyFromAgent(userName);
        },
        certificateCheck: function() {
          return 1;
        }
      }
    });
  })
  // Now that we're finished fetching, go ahead and merge our local branch
  // with the new one
  .then(function() {
    return repository.mergeBranches("master", "origin/master");
  })
  .done(function() {
    console.log("Done!");
  });
  }

module.exports = {clone, pull};

