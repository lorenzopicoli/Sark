import fs from 'fs'

function parseFile(path, callback){
	var lr = require('readline').createInterface({
		input: fs.createReadStream(path)
	});
	var lineCount = 0; 
	var deviceList = [];
	var iOSList = [];

	lr.on('line', function (line) {
		lineCount++;
		if(lineCount == 1){ //The first line is useless
			return;
		}

		//Matches the line with the os version regex (it will match (x.x))
		var os = line.match(/\d[.]\d/);
		//We know that each line of the file contains only one iOS version
		//so it's safe to get only the first match
		if(os != null){
			iOSList.push(os[0]);
		}

		//Matches the line with the device name regex
		var device = line.match(/[a-zA-Z].+?(?=\s\(|\s\[)/g);
		//Pushes any matches into deviceList
		if(device != null){
			device.forEach((item)=>{
				deviceList.push(item);
			});
		}
	});

	//Filter duplicates and send data through callback
	lr.on('close', (data) =>{
		var newiOSList = iOSList.filter(function(elem, pos) {
    		return iOSList.indexOf(elem) == pos;
		})
		var newDeviceList = deviceList.filter(function(elem, pos) {
    		return deviceList.indexOf(elem) == pos;
		})
		callback({ios: newiOSList, device: newDeviceList});
	});
}

function parseSdkFile(path, callback){
	var lr = require('readline').createInterface({
		input: fs.createReadStream(path)
	});
	var lineCount = 0;
	var sdkList = [];

	lr.on('line', function (line) {
		lineCount++;

		//Would be much faster to just use the regex -sdk\s+?(?<=-sdk\s).* but turns out that javascript doens't
		//support lookbehind regex. So we match including "-sdk " and remove it later.
		var sdk = line.match(/-sdk.*/g);
		if(sdk != null){
			sdkList.push(sdk[0].replace('-sdk ', ''));
		}
	});

	lr.on('close', (data) =>{
		var newSdkList = sdkList.filter(function(elem, pos) {
    		return sdkList.indexOf(elem) == pos;
		})
		callback(newSdkList);
	});
}

module.exports = {parseFile, parseSdkFile};