const adminHelper = require('../../helpers/adminHelpers')

exports.createLabel = async (req, res, next) => {
    try {
      const response = await adminHelper.createLabel(req.body);
      res.status(response.statusCode).send({message:response.message});

    } catch (error) {
      const err = new Error(error.message);
      next(err);
    }
  };