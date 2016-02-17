import fs from 'fs'

function parseFile(path, callback){
	var lr = require('readline').createInterface({
		input: fs.createReadStream(path)
	});
	var lineCount = 0;
	var deviceList = [];
	var iOSList = [];
	var deviceList = [];

	lr.on('line', function (line) {
		lineCount++;
		if(lineCount == 1){
			return;
		}

		//Matches the line with the os version regex (it will match (x.x))
		//TODO: Shouldn't include parenthensis
		var os = line.match(/[(]{1}\d[.]\d[)]/);
		if(os != null){
			iOSList.push(os[0]);
		}

		//Matches the line with the device name regex
		var device = line.match(/[a-zA-Z].+?(?=\s\(|\s\[)/g);
		if(device != null){
			device.forEach((item)=>{
			deviceList.push(item);
			});
		}
	});

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

module.exports = {parseFile};