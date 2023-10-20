const userHelper = require("../helpers/userHelpers");
const jwt = require("jsonwebtoken")
const { jwt_secret } = require("../configurations/constants");

exports.isAdmin = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      const error = new Error("Not authenticated");
      error.status = 400;
      next(error);
    }
    if (authHeader != "admin@123") {
      const error = new Error("Not authenticated");
      error.status = 400;
      next(error);
    }
    next();
  } catch (error) {
    console.log(error);
    const err = new Error(error.message);
    next(err);
  }
};

exports.isUser = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      const error = new Error("Not authenticated");
      error.status = 400;
      next(error);
    }
    decodedToken = jwt.verify(authHeader, jwt_secret);
    const response = await userHelper.isUserVerification(decodedToken);
    if (response.statusCode != 200) {
      const error = new Error(response.message);
      error.status = 400;
      next(error);
    } else {
      req.body.userId = decodedToken.userId;
      next();
    }
  } catch (error) {
    console.log(error);
    const err = new Error(error.message);
    next(err);
  }
};
