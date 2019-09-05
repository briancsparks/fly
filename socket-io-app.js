
const sg                      = require('sg-argv');
var path = require('path');
const _                       = sg._;

module.exports.socketApp = function(app, server, express) {
  const io                      = require('socket.io')(server);

  // const ARGV                    = sg.ARGV();
  // const port                    = ARGV.port     || 3333;

  app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/fly-index.html`);
  });
  app.use(express.static(path.join(__dirname, 'public')));

  var nextId  = 0;
  var count   = 0;

  io.on('connection', (socket) => {
    const id    = nextId++;
    const name  = `user${id}`;

    console.log(`connection from ${name}`, {name, connected:true});
    io.emit('data', {from: name}, {name, connected:true});

    socket.on('data', function(data){
      console.log(`data from ${name}`, data);
      io.emit(`data`, {from: name}, data);
    });

    socket.on('viz', function(data, callback){
      console.log(`viz from ${name}`, data);
      io.emit(`viz`, {from: name}, data);
      return callback();
    });

    socket.on('disconnect', function(){
      console.log(`disconnection from ${name}`, {name, connected:false});
      io.emit('data', {from: name}, {name, connected:false});
    });
  });

  // server.listen(port, () => {
  //   console.log(`Server listening on ${port}`);
  // });

  return io;
};
