var express = require('express');
var app = express();
var path=require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use(express.static(path.join(__dirname, 'js')));

app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
});

io.on('test', function(socket){
    socket.on('chat message', function(msg){
      io.emit('test', msg);
    });
    io.emit('test', 'Neuer Client verbunden')
});



let zmq = require('zeromq')
let sock = zmq.socket('sub')

sock.connect('tcp://trinity.iota-tangle.io:5556')
// sock.connect('tcp://zmq.devnet.iota.org:5556')
// sock.connect('tcp://zmq.spamnet.iota.org:5556')
//Für neue bestätigte Transaktionen
sock.subscribe('sn')
//Für alle neuen Transaktionen
sock.subscribe('tx')


sock.on('message', msg => {
    // console.log(msg.toString('utf8')); //raw trytes
  const data = msg.toString().split(' ') // Split to get topic & data
  switch (
    data[0] // Use index 0 to match topic
  ) {
    case 'sn': 
        io.emit('sn', data);
    break;


    case 'tx': 
        io.emit('tx', data)
    break;
    } 
})



io.on('connection', socket => {
    console.log(socket.request.connection.remoteAddress+' connected');


    socket.on('disconnect', () => { console.log(socket.request.connection.remoteAddress+' disconnected'); });
});

io.on('test', data =>{
    console.log(data);
  })



http.listen(80, '0.0.0.0', ()=>{
    console.log('listening on *:80');
}) 