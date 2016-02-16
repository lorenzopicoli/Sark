import util from 'util'
import { spawn } from 'child_process'
var child;

function createBuildArgs(filename, scheme, configuration, sdk, device, os){
	return ['-workspace', filename, '-scheme', scheme, '-configuration', configuration, '-sdk', sdk, '-destination', `name=${device},OS=${os}`]
}

function executeCommand(command, callback){
	console.log("About to execute Build command...");
	// console.log("The command is: ", createBuildCommand('"/Users/lorenzopiccoli/Lorenzo/iOS Dev/Trabalhos atuais/Chill/chill.xcworkspace"', 'chill', 'Debug', 'iphonesimulator9.2', 'iPhone5s', '9.2'));

	// child = spawn(createBuildCommand('"/Users/lorenzopiccoli/Lorenzo/iOS Dev/Trabalhos atuais/Chill/chill.xcworkspace"', 'chill', 'Debug', 'iphonesimulator9.2', 'iPhone5s', '9.2'))
	child = spawn('xcodebuild', createBuildArgs('/Users/lorenzopiccoli/Lorenzo/iOS Dev/Trabalhos atuais/Chill/chill.xcworkspace', 'chill', 'Debug', 'iphonesimulator9.2', 'iPhone 5s', '9.2'))

	child.stdin.on('data', (data) =>{
		console.log(data);
	});

	child.stdout.on('data', (data) => {
		console.log(data.toString('utf8'));
	});

	child.stderr.on('data', (data) => {
		console.log(`ps stderr: ${data}`);
	});

	child.on('close', (code) => {
		if (code !== 0) {
			console.log(`child process exited with code ${code}`);
		}
	});

    if (callback !== undefined) {
    	callback();
    }
}

module.exports = {executeCommand}