var fs = require("fs");
var unpacking = {
	unpack: function(rootpath, servicePack, serviceZip, callback) {
		var stats = fs.statSync(rootpath + "/installable/" + servicePack + "/" + serviceZip);
		var serviceName = serviceZip.substring(0, serviceZip.length - ".tar.gz".length);
		var compareResult = "new";
		var dirExist = judgeIfExist(rootpath, servicePack, serviceName);
		if(dirExist){
			var contents = fs.readFileSync(rootpath + "/installed/" + servicePack + "/" + serviceName);
			var pair = contents.toString().split(",");
			if(stats.size + "" != pair[0] || stats.mtime + "" != pair[1]){
				compareResult = "newer";
			}
			else
				compareResult = "equal"
		}
		if(compareResult == "new")
			console.log("    - Ear: " + servicePack + "/" + serviceZip + " is new and will be unpacked");
		else if(compareResult == "equal")
			console.log("    - Ear: " + servicePack + "/" + serviceZip + " is the same with the deployed one, skip");
		else
			console.log("    - Ear: " + servicePack + "/" + serviceZip + " is newer than deployed one, deleted old one and unpacked the newer");
		
		
		if(compareResult == "new"){
			//ensure all existing files deleted
			deleteDeployed(rootpath, servicePack, serviceName, function(){
				deploy(rootpath, servicePack, serviceZip, serviceName, function(err) {
					writeInstalledInfo(rootpath, servicePack, serviceName, stats);
					callback(err);
				});
			});
		}
		else if(compareResult == "equal"){
			callback(null);
		}
		else if(compareResult == "newer"){
			deleteDeployed(rootpath, servicePack, serviceName, function(){
				deploy(rootpath, servicePack, serviceZip, serviceName, function(err) {
					writeInstalledInfo(rootpath, servicePack, serviceName, stats);
					callback(err);
				});
			});
		}
	}
};

function writeInstalledInfo(rootpath, servicePack, serviceName, stats){
	var newInfo = stats.size + "," + stats.mtime;
	var path = rootpath + "/installed/" + servicePack + "/" + serviceName;
	if(!fs.existsSync(rootpath + "/installed/" + servicePack))
		fs.mkdirSync(rootpath + "/installed/" + servicePack);
	fs.writeFileSync(rootpath + "/installed/" + servicePack + "/" + serviceName, newInfo);
}

function deleteDeployed(rootpath, servicePack, serviceName, callback) {
	var path = getInstallationPath(rootpath, servicePack, serviceName);
	console.log("deleting dir:" + path);
	if(fs.existsSync(path)){
		var exec = require('child_process').exec;
		var rm = exec("rm -rf " + path);
		rm.on('exit', function(code){
			console.log("deleted: " + code);
			callback();
		});
		rm.stderr.on('data', function (data) {
			console.log('        + delete dir error: ' + data);
		});
	}
	else{
		console.log("        - dir doesn't exist, " + path);
		callback();
	}
}

function deploy(rootpath, servicePack, serviceZip, serviceName, callback) {
	var spawn = require('child_process').spawn;
	var dirPath = rootpath + "/installable/" + servicePack;
	var unpackDir = rootpath + "/installable/temp/" + servicePack + "/" + serviceName;
	
	var pdir = rootpath + "/installable/temp/" + servicePack;
	if(!fs.existsSync(pdir)){
		fs.mkdirSync(pdir);
	}
	if(!fs.existsSync(unpackDir)){
		fs.mkdirSync(unpackDir);
	}
	console.log("      + Unpacking " + dirPath + "/" + serviceZip);
	var tar = spawn('tar', ['xf', dirPath + "/" + serviceZip], {cwd: unpackDir});
	tar.stderr.on('data', function (data) {
		console.log('        + Unpacking error: ' + data);
	});
	
	tar.on('exit', function (code) {
		try{
			if(code != 0){
				callback();
				return;
			}
			
			var oldPath = null;
			if(serviceName.indexOf("service-") == 0){
				oldPath = unpackDir + "/service";
			}
			else{
				oldPath = unpackDir + "/webapp";
			}
			var newPath = rootpath + "/";
			console.log("        + " + serviceZip + " was unpacked, moving");
			var cp = spawn('cp', ['-rf', oldPath, newPath]);
			cp.on('exit', function(code){
				if(code == 0)
					console.log("          - " + servicePack + "/" + serviceName + " was copied to " + newPath + " " + code);
				callback();
			});
			
			cp.stderr.on('data', function (data) {
				console.log('          - cp error: ' + data);
			});
		}
		catch(err){
			console.log("Error while unpacking ear file: " + servicePack + "/" + serviceZip, err);
			callback();
		}
	});
}

function judgeIfExist(rootpath, servicePack, serviceName){
	//first check if installed information exist
	var path = rootpath + "/installed/" + servicePack + "/" + serviceName;
	var exist = false;
	if(fs.existsSync(path)){
		path = getInstallationPath(rootpath, servicePack, serviceName);
		exist = fs.existsSync(path)
	}
	return exist;
}

function getInstallationPath(rootpath, servicePack, serviceName){
	var path = null;
	//parse simple name, "service-cmp_nd-jobmgmt" should be "jobmgmt"
	var simpleName = serviceName.substring(serviceName.indexOf("-") + 1 + servicePack.length + 1);
	//check if installed files exist
	if(serviceName.indexOf("service-") == 0){
		path = rootpath + "/service/" + servicePack + "/" + simpleName;
	}
	else
		path = rootpath + "/webapp/" + servicePack + "/" + simpleName;
	return path;
}

module.exports = unpacking;