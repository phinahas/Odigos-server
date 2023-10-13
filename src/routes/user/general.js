const express = require("express");

const userController = require('../../controllers/user/userController');
const tokenverification = require('../../middlewares/tokenVerification')

const router = express.Router();

router.post('/create-category',userController.createCategory);
router.post('/add-expense',tokenverification.isUser,userController.addExpense);


module.exports = router;