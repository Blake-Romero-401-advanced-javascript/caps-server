'use strict';

const io = require('socket.io-client');
const express = require('express');
const cors = require('cors');
const faker = require('faker');

const socket = io.connect('http://localhost:3000/caps');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const PORT = process.env.PORT || 3001;

// app.post('/delivery/:store/:code', (req, res) => {

//   if (!(req.params.store && req.params.code)) { throw 'Invalid Delivery Params'; }

//   const message = {
//     store: req.params.store,
//     code: req.params.code,
//   };

//   socket.emit('delivered', message);

//   console.log('triggered', message);

//   res.status(200).send(`${req.params.store} - ${req.params.code} Delivered ${new Date().toUTCString()}`);
// });

app.post('/pickup', (req, res) => {

  let delivery = req.body || {
    store: '1-206-flowers',
    orderID: faker.random.uuid(),
    customer: `${faker.name.firstName()} ${faker.name.lastName()}`,
    address: `${faker.address.city()}, ${faker.address.stateAbbr()}`,
  };

  socket.emit('pickup', delivery);
  res.status(200).send('scheduled');

});

app.listen(PORT, console.log(`API Server @ ${PORT}`));