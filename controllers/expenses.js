const Expense = require('../Models/Expenses');
const jwt = require('jsonwebtoken');
const Users = require('../Models/users');

// Get all expenses
exports.getAddExpense = (req, res, next) => {
   Expense.findAll({ where: { userId: req.user.id } })
        .then(expenses => {
            res.status(200).json(expenses); // Return the array directly
        })
        .catch(err => {
            console.error('Error fetching expenses:', err);
            res.status(500).json({ error: 'An error occurred' });
        });
};

// Add a new expense
exports.postAddExpense = (req, res, next) => {
    const expenses = req.body.expenses;
    const category = req.body.category;
    const description = req.body.description;
  
    if (!expenses) {
      return res.status(400).json({ error: 'Expense is mandatory' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Category is mandatory' });
    }
  
    // Create the new expense
    Expense.create({
      expenses: expenses,  // Updated to match model field name
      category: category,
      description: description,
      userId: req.user.id
    })
    .then(() => {
      // Calculate total expenses and update the user's total expenses
      const totalExpenses = Number(req.user.totalExpenses) + Number(expenses);
      console.log(totalExpenses);
  
      // Ensure you're updating the correct user by specifying `userId`
      return Users.update(
        { totalExpenses: totalExpenses },
        { where: { id: req.user.id } }  // Add condition to update the current user
      );
    })
    .then(() => {
      // Fetch the updated expenses list for the user
      return Expense.findAll({ where: { userId: req.user.id } });
    })
    .then(expenses => {
      // Return the updated expenses list
      res.status(201).json(expenses);
    })
    .catch(err => {
      console.error('Error adding expense:', err);
      res.status(500).json({ error: 'An error occurred' });
    });
  };
  


exports.postDeleteExpense = (req, res, next) => {
    const expenseId = req.params.id;
    const userId = req.user.id; // Assuming req.user.id is set after authentication

    // Check if expenseId is undefined or empty
    if (expenseId === undefined || expenseId.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid expense ID" });
    }

    // Attempt to delete the expense based on id and userId
    Expense.destroy({ where: { id: expenseId, userId: userId } })
        .then((noOfRows) => {
            if (noOfRows === 0) {
                // No rows were deleted, so either the expense doesn't exist or it's not authorized for deletion
                return res.status(404).json({ error: 'Expense not found or not authorized to delete' });
            }

            // Successfully deleted the expense
            res.status(200).json({ message: 'Expense deleted successfully' });
        })
        .catch(err => {
            console.error('Error deleting expense:', err);
            // Ensure no response is sent twice
            if (!res.headersSent) {
                res.status(500).json({ error: 'An error occurred while deleting the expense.' });
            }
        });
};
