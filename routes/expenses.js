const express = require('express');
const expenseController = require('../controllers/expenses');

const router = express.Router();

// Route to get all users
router.get('/get-expenses', expenseController.getAddExpense);

// Route to add a new user
router.post('/add-expenses', expenseController.postAddExpense);

router.post('/delete-expense/:id', expenseController.postDeleteExpense);




module.exports = router;