const express = require("express");

const userController = require('../../controllers/user/userController');
const tokenverification = require('../../middlewares/tokenVerification')

const router = express.Router();

router.post('/create-category',tokenverification.isUser,userController.createCategory);
router.get('/get-categories',tokenverification.isUser,userController.getCategories);
router.post('/add-expense',tokenverification.isUser,userController.addExpense);
router.get('/get-user',tokenverification.isUser,userController.getUser);



module.exports = router;
