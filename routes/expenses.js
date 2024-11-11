const express = require('express');
const expenseController = require('../controllers/expenses');
const userauthentication =  require('../middleware/auth');
const router = express.Router();

// Route to get all users
router.get('/get-expenses',userauthentication.authenticate,expenseController.getAddExpense);

// Route to add a new user
router.post('/add-expenses',userauthentication.authenticate, expenseController.postAddExpense);

router.delete('/delete-expense/:id',userauthentication.authenticate, expenseController.postDeleteExpense);




module.exports = router;