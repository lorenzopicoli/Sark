import Git from 'nodegit';
import rmdirAsync from './removeDirContent';
import commands from './commands';
import fs from 'fs';
import path from 'path';
var repository;
var GITHUB_TOKEN;

/*
===========================================================
Delete any older repo on ./git/ and create the folder again
===========================================================
*/
function prepareForClone(callback){
	rmdirAsync('./git/', ()=>{
		callback();
	});
}

/*
======================
Clone repository
======================
*/
function clone(repo, token, callback){
	GITHUB_TOKEN = token;
	var options = {fetchOpts: {
	        		callbacks: {
	         			certificateCheck: function() {
	            			// github will fail cert check on some OSX machines
	            			// this overrides that check
	           		 	return 1;
	          			},

	          			/* istanbul ignore next */
	        			credentials: function(url, userName) {
        					return Git.Cred.userpassPlaintextNew(token, "x-oauth-basic");
	        			}
	        		}}
	        	};

	prepareForClone(()=>{
		//I think this isn't the best way to handle an exception, BUT here are the facts
		//Other libraries I tested would propmt git username and password whenever the requested
		//repo didn't exist. This kinda of behavior isn't acceptable because the user wouldn't 
		//have access to the machine, BUT this library (nodegit) would raise an execption!
		//BUT I couldn't handle it except this way... So there we go. It works(!) so why change it?
		/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
		process.on('uncaughtException', function(err) {
			if(err.Error = 'authentication required but no callback set'){
				if(callback !== null && callback !== undefined){
					callback({type:'error', log:"Something went wrong, are you sure the URL is correct?"});
					callback = null;
				}
				return;
			}else{
				throw err;
			}
		})
		/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
		Git.Clone(repo, './git', options).done((repo)=>{
			//Sometimes callback would be called here and on the error handler
			if(callback !== null && callback !== undefined){
	  			callback({type:'success', log:"Cloned successfully"});
				callback = null;
			}
	    });
})};

/*
======================
Pull changes
======================
*/
/* istanbul ignore next: Istanbul for some reason doesn't cover this, but it's being tested */
function pull(socket, callback){

process.on('uncaughtException', function(err) {
	if(err.Error = "Could not find repository from './git/'"){
		if(callback !== null && callback !== undefined){
			var item = {
				log:  "A repository was not found. Try creating one, pasting the clone URL in the first field and click on 'Update'",
				type: 'error',
				time: commands.getCurrentTime()
			}
			socket.emit('updateLog', item);
			callback({type:'error', log:"Something went wrong, try to click on 'Update'."});
			callback = null;
		}
		return;
	}else{
		throw err;
	}
})

//Try to open the repository on ./git/
Git.Repository.open('./git/')
  .then(function(repo) {
    repository = repo;

    return repository.fetchAll({
      callbacks: {
      	/* istanbul ignore next */
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
		if(callback !== null && callback !== undefined){
			callback({type:'success', log:"Pull done"});
			callback = null;
		}
  });
}

module.exports = {clone, pull};

