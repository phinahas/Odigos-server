require("dotenv").config();
const mongoose = require('mongoose');
const {DB_URL} = require('./constants')



const dbUrl = DB_URL
const dbConnection = mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connection established"))
  .catch((err) => console.log(err));

module.exports = { dbConnection };


