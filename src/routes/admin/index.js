const routes = require("express").Router();


const general = require('./general');


routes.use("/",general);


module.exports = routes;

