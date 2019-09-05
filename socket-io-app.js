
const sg                      = require('sg-argv');
var path                      = require('path');
const _                       = sg._;

module.exports.socketApp = function(app, server, express) {
  const io                      = require('socket.io')(server);

  app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/fly-index.html`);
  });

  var nextId  = 0;
  var count   = 0;

  io.on('connection', (socket) => {
    const id    = nextId++;
    const name  = `user${id}`;

    console.log(`connection from ${name}`, {name, connected:true});
    io.emit('data', {from: name}, {name, connected:true});

    "newdata,appenddata,mungedata".split(',').forEach(eventName => {
      socket.on(eventName, function(data, callback) {
        console.log(`${eventName} from ${name}: ${data.str.length} bytes.`);
        io.emit(eventName, {from: name}, data);
        return callback();
      });
    });

    socket.on('viz', function(data, callback){
      console.log(`viz from ${name}: ${data.length} bytes.`);
      io.emit(`viz`, {from: name}, data);
      return callback();
    });

    socket.on('disconnect', function(){
      console.log(`disconnection from ${name}`, {name, connected:false});
      io.emit('data', {from: name}, {name, connected:false});
    });
  });

  return io;
};
