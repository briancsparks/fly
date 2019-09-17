
const bundler                 = require('../lib/bundle-maker');
const io                      = require('socket.io-client');
const fs                      = require('fs');
const minimist                = require('minimist');
const argv                    = minimist(process.argv.slice(2));

var   disabled = false;


// -----------------------------------------------------

// Parse args
var   buffers       = [];
var   totalLength   = 0;

(function() {

  const path      = argv._[0] || argv.path;
  if (!path || path === '-') {
    return fromStdin();
  }

  return fromFile(path);
}());



// -----------------------------------------------------

// Read from stdin
function fromStdin() {
  process.stdin.resume();
  process.stdin.on('data', function(buf) {
    buffers.push(buf);
    totalLength += buf.length;
  });
  process.stdin.on('end', function() {
    const payload = Buffer.concat(buffers, totalLength).toString();
    newdata(payload);
  });
}



// -----------------------------------------------------

// Read a file
function fromFile(path) {
  var payload;

  if (path === 'test') {
    payload = getTest();
    return mungedata(payload);
  }

  payload = payload || fs.readFileSync(path);
  newdata(payload);
}



// -----------------------------------------------------

// Which data-manipulation function should we use?
function munge(...data) {
  if (argv._[1] || argv.replace) {
    return replace(...data);
  }
  return augment(...data);
}



// -----------------------------------------------------

// Add a 'replacement' function
function replace(...data) {
  var dataStr = data[0];

  var scriptText = `
    const dataStr = ${dataStr};

    const data = d3.csvParse(dataStr).map(d => ({...d, population: +d.population * 1000}));

    replaceData(data, dataStr);
    renderData();
    `;

  return newdata(scriptText);
}




// -----------------------------------------------------

// Add a 'augment' function
function augment(data) {
  var dataStr = data[0];

  var scriptText = `
    const dataStr = ${dataStr};

    const data = d3.csvParse(dataStr).map(d => ({...d, population: +d.population * 1000}));

    appenddata(data, dataStr);
    renderData();
    `;

  return newdata(scriptText);
}



// -----------------------------------------------------

// newdata
function newdata(payload) {
  return send('newdata', payload);
}

// appenddata
function appenddata(payload) {
  return send('appenddata', payload);
}

// mungedata
function mungedata(payload) {
  return send('mungedata', payload);
}

function newdataX(payload) {
  console.log(`sending payload (newdata):`, {payload});

  const flyhost = `http://localhost:3330/`;

  log(`Sending to ${flyhost}: ${payload.length} bytes.`);

  const socket = io(flyhost);
  socket.on('connect', function() {
    // log(`fly connected`);

    socket.emit('newdata', {str: payload}, function() {
      console.log(`Back from newdatatrip`);
      socket.close();
    });

  });
}

function send(msg, payload) {
  console.log(`sending payload (send):`, {payload});

  const flyhost = `http://localhost:3330/`;

  log(`Sending to ${flyhost}: ${payload.length} bytes.`);

  const socket = io(flyhost);
  socket.on('connect', function() {
    // log(`fly connected`);

    socket.emit(msg, {str: payload}, function() {
      console.log(`Back from ${msg} trip`);
      socket.close();
    });

  });
}


function log(...args) {
  if (disabled) { return; }
  console.log(...args);
}


// function getTest() {
//   return `
//   \`country,population
//   China,1415046
//   India,1354052
//   United States,326767
//   Indonesia,266795
//   Brazil,210868
//   Pakistan,200814
//   Nigeria,195875
//   Bangladesh,166368
//   Russia,143965
//   Foobar,139999
//   Mexico,130759\`;
//   `;
// }

function getTest() {
  return `
  const dataStr =
  \`country,population
  China,1415046
  India,1354052
  United States,326767
  Indonesia,266795
  Brazil,210868
  Pakistan,200814
  Nigeria,195875
  Bangladesh,166368
  Russia,143965
  Foobar,139999
  Mexico,130759\`;

  const data = d3.csvParse(dataStr).map(d => ({...d, population: +d.population * 1000}));

  replaceData(data, dataStr);
  renderData();

  `;
}

// render(d3.csvParse(dataStr).map(d => ({...d, population: +d.population * 1000})));
