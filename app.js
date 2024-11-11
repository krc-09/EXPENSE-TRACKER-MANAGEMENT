const sequelize = require('./utils/database');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const express = require('express');
const app = express();
const Users = require('./Models/users'); 
const Expense = require('./Models/Expenses'); 



app.use(cors());
app.use(bodyParser.json()); // Apply bodyParser middleware before routes

// Serve static files
app.use(express.static(path.join(__dirname, 'views'))); 


 const userRoutes = require('./routes/users');
app.use('/users', userRoutes);
const expenseRoutes = require('./routes/expenses');
app.use('/expenses', expenseRoutes);

Users.hasMany(Expense);
Expense.belongsTo(Users);

sequelize.sync()
  .then(result => {
    console.log('Database synced');
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch(err => {
    console.log(err);
  });
