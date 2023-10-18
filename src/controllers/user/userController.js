const userHelper = require('../../helpers/userHelpers');

exports.signup = async (req, res, next) => {
    try {
      const response = await userHelper.signup(req.body);
      res.status(response.statusCode).send({message:response.message});

    } catch (error) {
      const err = new Error(error.message);
      next(err);
    }
  };

  exports.signin = async (req, res, next) => {
    try {
      const response = await userHelper.signin(req.body);
      res.status(response.statusCode).send({message:response.message,user:response.user,token:response.token});

    } catch (error) {
      const err = new Error(error.message);
      next(err);
    }
  };

  exports.getUser = async (req, res, next) => {
    try {

      req.body.timezone = req.query.timezone;
      const response = await userHelper.getUser(req.body);
      res.status(response.statusCode).send({message:response.message,user:response.user})
      
    } catch (error) {
      const err = new Error(error.message);
      next(err);
    }
  }

  exports.createCategory = async (req, res, next) => {
    try {
      const response = await userHelper.createCategory(req.body);
      res.status(response.statusCode).send({message:response.message});

    } catch (error) {
      const err = new Error(error.message);
      next(err);
    }
  };

  exports.addExpense = async (req, res, next) => {
    try {
      const response = await userHelper.addExpense(req.body);
      res.status(response.statusCode).send({message:response.message});

    } catch (error) {
      const err = new Error(error.message);
      next(err);
    }
  };


  exports.getCategories = async (req, res, next) => {

    try {

     
      const response = await userHelper.getCategories();
      res.status(response.statusCode).send({message:response.message,categories:response.categories})
      
    } catch (error) {
      const err = new Error(error.message);
      next(err);
    }

  }
  