var Avro = require("avronode").Avro;
var avro = new Avro();
var schema = require('fs').readFileSync(require.resolve("./message.avpr")).toString();
schema = JSON.parse(schema);
console.log(JSON.stringify(schema.types[0]));
avro.addSchema(JSON.stringify(schema.types[0]));
var object = {"name": "1", "type": "1", price: 1.0, valid: true, content: null};

var binary = avro.encodeDatum(object, "message");
console.log(binary);
var result = avro.decodeDatum(binary, "message");
console.log(result);
avro.close();

console.log("Done 1");
avro = new Avro();
avro.addSchema(JSON.stringify(schema.messages.sendMessage));
var request = {"message": {"name": "1", "type": "1", price: 1.0, valid: true, content: null}};
var binary = avro.encodeDatum(request, "message");
console.log(binary);
return;
var http = require("http");
var options = {
    hostname: 'localhost',
    port: 8888,
    path: '/',
    method: 'POST'
};

var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
    });
});

req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
});

// write data to request body
console.log(binary.length);
req.write(writeLength(binary.length));
req.write(new Buffer(binary));
req.write(writeLength(0));
req.end();

function writeLength(length) {
    var buf = new Buffer(4);
    buf.writeUInt8(0xff & (length >>> 24), 0);
    buf.writeUInt8(0xff & (length >>> 16), 1);
    buf.writeUInt8(0xff & (length >>> 8), 2);
    buf.writeUInt8(0xff & length, 3);
    return buf;
}
