const Expense = require('../Models/Expenses');
const jwt = require('jsonwebtoken');
const Users = require('../Models/users');
const sequelize = require('../utils/database');

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
exports.postAddExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    const expenses = req.body.expenses;
    const category = req.body.category;
    const description = req.body.description;
  
    if (!expenses) {
      return res.status(400).json({ error: 'Expense is mandatory' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Category is mandatory' });
    }
  
    try {
      // Create the new expense with the transaction
      await Expense.create({
        expenses: expenses,  // Updated to match model field name
        category: category,
        description: description,
        userId: req.user.id
      }, { transaction: t });
  
      // Calculate total expenses and update the user's total expenses
      const totalExpenses = Number(req.user.totalExpenses) + Number(expenses);
      console.log(totalExpenses);
  
      // Ensure you're updating the correct user by specifying `userId`
      await Users.update(
        { totalExpenses: totalExpenses },
        { where: { id: req.user.id }, transaction: t }  // Correct placement of `transaction`
      );
  
      // Commit the transaction after successful operations
      await t.commit();
  
      // Fetch the updated expenses list for the user
      const updatedExpenses = await Expense.findAll({ where: { userId: req.user.id } });
      
      // Return the updated expenses list
      res.status(201).json(updatedExpenses);
    } catch (err) {
      // Rollback the transaction in case of any error
      console.error('Error adding expense:', err);
      await t.rollback();
      res.status(500).json({ error: 'An error occurred' });
    }
  };
  


  exports.postDeleteExpense = async (req, res, next) => {
    const expenseId = req.params.id;
    const userId = req.user.id; // Assuming req.user.id is set after authentication

    // Check if expenseId is undefined or empty
    if (!expenseId || expenseId.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid expense ID" });
    }

    try {
        // Find the expense to get its amount before deletion
        const expense = await Expense.findOne({ where: { id: expenseId, userId: userId } });

        if (!expense) {
            // Expense not found or not authorized
            return res.status(404).json({ error: 'Expense not found or not authorized to delete' });
        }

        // Delete the expense
        await Expense.destroy({ where: { id: expenseId, userId: userId } });

        // Calculate the updated total expenses
        const updatedTotalExpenses = Number(req.user.totalExpenses) - Number(expense.expenses);
        console.log(updatedTotalExpenses);
        // Update the user's total expenses
        await Users.update(
            { totalExpenses: updatedTotalExpenses },
            { where: { id: userId } }
        );

        // Successfully deleted the expense and updated total expenses
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (err) {
        console.error('Error deleting expense:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'An error occurred while deleting the expense.' });
        }
    }
};
