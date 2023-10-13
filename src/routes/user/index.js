const routes = require("express").Router();

const userAuth = require('./auth');
const general = require('./general')


routes.use("/auth", userAuth);
routes.use("/",general)


module.exports = routes;

