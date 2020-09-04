'use strict';


const messages = {
  
};

const io = require('socket.io')(3000);

io.on('connection', (socket) => {
  console.log('CORE', socket.id);
})

const caps = io.of('/caps');
caps.on('connection', (socket) => {
  console.log('Connected', socket.id);

  socket.on('join', room => {
    console.log('registered as', room);
    socket.join(room);
  });

  socket.on('received', orderID => {
    delete messages[orderID];
    // console.log('deleting', orderID, messages);
  })

  socket.on('getall', () => {
    for(let id in messages) {
      const payload = messages[id];
      caps.emit('pickup', payload);
    }
  });

  socket.on('pickup', (payload) => {
    messages[payload.orderID] = payload;
    logIt('pickup', payload);
    caps.emit('pickup', payload);
    console.log('pickup', Object.keys(messages).length);
  });

  socket.on('in-transit', (payload) => {
    logIt('in-transit', payload);
    caps.to(payload.store).emit('in-transit', payload);
  });

  socket.on('delivered', (payload) => {
    logIt('delivered', payload);
    caps.to(payload.store).emit('delivered', payload);
  });

});

function logIt(event, payload) {
  let time = new Date();
  console.log({ time, event, payload });
}




const net = require('net');

const port = process.env.PORT || 3000;
const server = net.createServer();

server.listen(port, () => console.log(`Server up on ${port}`));


// Create a list of clients that have connected to us.
let socketPool = {};

server.on('connection', (socket) => {
  // Give each client a unique ID number
  const id = `Socket-${Math.random()}`;
  // Add them to the list (we're goign to need this later...)
  socketPool[id] = socket;

  // Here's what we do when events come in
  socket.on('data', (buffer) => dispatchEvent(buffer));
  // Note that this is the same as the above ... how does that work in Javascript?
  // socket.on('data', dispatchEvent);

  socket.on('error', (e) => { console.log('SOCKET ERROR', e); });
  socket.on('end', (e) => { delete socketPool[id]; });

});

server.on('error', (e) => {
  console.error('SERVER ERROR', e.message);
});

function dispatchEvent(buffer) {
  let message = JSON.parse(buffer.toString().trim());
  // Right now, this is "dumb", just sending out the same messages to everyone
  // How might we handle more complex events and maybe chat commands?
  broadcast(message);
}

// Need to loop over every socket connection and manually
// send the message to them
function broadcast(message) {
  // Message is an object with 2 props: event and payload
  // We can use those to handle every event type and payload differently, if we choose
  let payload = JSON.stringify(message);
  for (let socket in socketPool) {
    socketPool[socket].write(payload)
  }
}
