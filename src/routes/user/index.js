const routes = require("express").Router();

const userRouteOne = require('./userOneRoutes');
const userRouteTwo = require('./userTwoRoutes')


routes.use("/", userRouteOne);
routes.use("/two",userRouteTwo)


module.exports = routes;

