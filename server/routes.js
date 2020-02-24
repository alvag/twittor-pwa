// Routes.js - Módulo de rutas
var express = require('express');
var router = express.Router();

const msgs = [
  {
    _id: 1,
    user: 'spiderman',
    message: 'Hola Mundo'
  },
  {
    _id: 2,
    user: 'ironman',
    message: 'Hola Mundo'
  },
  {
    _id: 3,
    user: 'wolverine',
    message: 'Hola Mundo'
  }
];





// Get mensajes
router.get('/', function (req, res) {
  res.json(msgs);
});




module.exports = router;
