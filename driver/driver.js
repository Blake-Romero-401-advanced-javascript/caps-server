'use strict';

// const emitter = require('../lib/events');
const io = require('socket.io-client');
const socket = io.connect('http://localhost:3000/caps');

socket.emit('getall');

socket.on('pickup', payload => {

  socket.emit('received', payload.orderID);

  setTimeout(() => {
    console.log(`DRIVER: picked up ${payload.orderID}`);
    socket.emit('in-transit', payload);
  }, 2000);
  
  setTimeout(() => {
    console.log(`DRIVER: delivered ${payload.orderID}`);
    socket.emit('delivered', payload);
  }, 3000);

});
