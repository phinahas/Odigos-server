const routes = require('express').Router();

const userRoutes = require('./user/index');

const middleware = require('../middlewares/middlewares')

routes.use('/api/user/',middleware.middleware1,userRoutes);

module.exports = routes;