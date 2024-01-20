const express = require("express");

const userController = require('../../controllers/user/userController');
const tokenverification = require('../../middlewares/tokenVerification')

const router = express.Router();

router.post('/create-category',tokenverification.isUser,userController.createCategory);
router.get('/get-categories',tokenverification.isUser,userController.getCategories);
router.get('/get-labels',userController.getLabels);
router.post('/add-expense',tokenverification.isUser,userController.addExpense);
router.get('/get-expenses',tokenverification.isUser,userController.getExpense);
router.get('/analyse-the-expense',tokenverification.isUser,userController.analysisTheExpenseBy);
router.get('/search-with-keyword',tokenverification.isUser,userController.searchWithKeyword);

router.get('/get-user',tokenverification.isUser,userController.getUser);



module.exports = router;
