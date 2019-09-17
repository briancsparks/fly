
const bundler                 = require('../lib/bundle-maker');
const io                      = require('socket.io-client');
const fs                      = require('fs');
const minimist                = require('minimist');
const argv                    = minimist(process.argv.slice(2));

var   disabled = false;

var   buffers       = [];
var   totalLength   = 0;


(function() {

  const path      = argv._[0] || argv.path;
  if (!path || path === '-') {
    return fromStdin();
  }

  return fromFile(path);
}());



function fromStdin() {
  process.stdin.resume();
  process.stdin.on('data', function(buf) {
    buffers.push(buf);
    totalLength += buf.length;
  });
  process.stdin.on('end', function() {
    const payload = Buffer.concat(buffers, totalLength).toString();
    send(payload);
  });
}

function fromFile(path) {
  var payload;

  payload = payload || fs.readFileSync(path);
  send(payload);
}


function send(payload) {

  const flyhost = `http://localhost:3330/`;

  log(`Sending ingest to ${flyhost}: ${payload.length} bytes.`);

  const socket = io(flyhost);
  socket.on('connect', function() {
    // log(`fly connected`);

    socket.emit('munge', {str: payload}, function() {
      console.log(`Back from ingest trip`);
      socket.close();
    });

  });
}


function log(...args) {
  if (disabled) { return; }
  console.log(...args);
}


