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
      res.status(response.statusCode).send({message:response.message,newCategory:response.newCategory});

    } catch (error) {
      const err = new Error(error.message);
      next(err);
    }
  };

  exports.addExpense = async (req, res, next) => {
    try {
      const response = await userHelper.addExpense(req.body);
      res.status(response.statusCode).send({message:response.message,newExpense:response.expense});

    } catch (error) {
      const err = new Error(error.message);
      next(err);
    }
  };


  exports.getCategories = async (req, res, next) => {

    try {

     
      const response = await userHelper.getCategories(req.body);
      res.status(response.statusCode).send({message:response.message,categories:response.categories})
      
    } catch (error) {
      const err = new Error(error.message);
      next(err);
    }

  }
  
  exports.getLabels = async (req, res, next) => {

    try {

     
      const response = await userHelper.getLabels(req.body);
      res.status(response.statusCode).send({message:response.message,labels:response.labels})
      
    } catch (error) {
      const err = new Error(error.message);
      next(err);
    }

  }


  exports.getExpense = async(req,res,next)=>{
    try {

      req.body.filter = req.query.filter;
      const response = await userHelper.getExpense(req.body);
      res.status(response.statusCode).send({message:response.message,expenses:response.expenses,totalAmount:response.totalAmount});
      
    } catch (error) {
      const err = new Error(error.message);
      next(err);
    }
  }

  exports.analysisTheExpenseBy = async(req,res,next)=>{
    try {

      req.body.criteria = req.query.criteria;
      req.body.startDate = req.query.startDate;
      req.body.endDate = req.query.endDate;

      if(req.body.criteria != 'date' && req.body.criteria != 'category') res.status(409).send({message: 'Invalid criteria: '+req.body.criteria});
      const response = await userHelper.analysisTheExpenseBy(req.body);
      res.status(response.statusCode).send({message:response.message,expenses:response.finalArray});
      
    } catch (error) {
      const err = new Error(error.message);
      next(err);
    }
  }