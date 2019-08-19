const express = require('express');
const routes = express.Router();

const Controller = require('../controllers/Controller.js');

routes.get('/status_sistema', Controller.status_sistema);

routes.get('/dbConnection', Controller.dbConnection)

module.exports = routes;