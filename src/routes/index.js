const routes = require('express').Router();

const userRoutes = require('./user/index');
const adminRoutes = require('./admin/index');

const middleware = require('../middlewares/middlewares');
const tokenVerification = require('../middlewares/tokenVerification')

routes.use('/api/user/',middleware.middleware1,userRoutes);
routes.use('/api/admin/',tokenVerification.isAdmin,adminRoutes)

module.exports = routes;