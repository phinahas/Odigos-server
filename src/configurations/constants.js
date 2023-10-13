require("dotenv").config();

module.exports = {
    DB_URL : process.env.DB_URI,
    PORT:process.env.PORT,
}