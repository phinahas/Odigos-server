exports.testController = async (req, res, next) => {
    try {
      const body = req.body; 
      let statusCode = 200; 
      res.status(statusCode).send({body});
    } catch (error) {
      const err = new Error(error.message);
      next(err);
    }
  };