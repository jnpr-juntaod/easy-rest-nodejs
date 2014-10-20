var Mocha = require("mocha");
var files = process.argv[2].split(",");
//Mocha runner
var mocha = new Mocha({
	ui:"bdd",
	reporter:"json",
	timeout:60000,
	slow:10000
});
for (var i = 0; i < files.length; i++) {
    console.log("aa==:" + files[i]);
	mocha.addFile(files[i]);
}

mocha.run(function(failures){
    process.exit(failures);
});