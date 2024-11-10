const Expense = require('../Models/Expenses');

// Get all expenses
exports.getAddExpense = (req, res, next) => {
   Expense.findAll()
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

  Expense.create({
      expenses: expenses,  // Updated to match model field name
      category: category,
      description: description
  })
  .then(() => {
      return Expense.findAll(); // Fetch all expenses after adding the new one
  })
  .then(expenses => {
      res.status(201).json(expenses); // Return updated expense list
  })
  .catch(err => {
      console.error('Error adding expense:', err);
      res.status(500).json({ error: 'An error occurred' });
  });
};

// Delete an expense by ID
exports.postDeleteExpense = (req, res, next) => {
  const expenseId = req.params.id; 

  Expense.findByPk(expenseId) 
      .then(expense => {
          if (!expense) {
              return res.status(404).json({ error: 'Expense not found' });
          }
          return expense.destroy(); 
      })
      .then(() => {
          console.log("Destroyed Expense");
          res.status(200).json({ message: 'Expense deleted successfully' }); 
      })
      .catch(err => {
          console.error('Error deleting expense:', err);
          res.status(500).json({ error: 'An error occurred while deleting the expense.' });
      });
};