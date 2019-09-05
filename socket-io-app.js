
const sg                      = require('sg-argv');
const _                       = sg._;

module.exports.socketApp = function(app, server) {
  const io                      = require('socket.io')(server);

  // const ARGV                    = sg.ARGV();
  // const port                    = ARGV.port     || 3333;

  app.get('/fly', (req, res) => {
    res.sendFile(`${__dirname}/public/fly-index.html`);
  });

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
