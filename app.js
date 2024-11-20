const sequelize = require('./utils/database');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const express = require('express');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const Users = require('./Models/users'); 
const Expense = require('./Models/Expenses'); 
const Order = require('./Models/orders'); 
const Forgotpassword = require('./Models/forgotpassword');
const FileUrl = require('./Models/fileurls')

const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'});
const errorLogStream = fs.createWriteStream(path.join(__dirname, 'error.log'), { flags: 'a' });
app.use(morgan('combined',{stream:accessLogStream}));
app.use(cors());
app.use(bodyParser.json()); // Apply bodyParser middleware before routes

// Serve static files
app.use(express.static(path.join(__dirname, 'views'))); 


 const userRoutes = require('./routes/users');
app.use('/users', userRoutes);
const expenseRoutes = require('./routes/expenses');
app.use('/expenses', expenseRoutes);
const purchaseRoutes = require('./routes/purchase');
app.use('/purchase', purchaseRoutes);
const premiumRoutes = require('./routes/premium');
app.use('/premium', premiumRoutes);
const forgotpasswordRoutes = require('./routes/resetpassword');

app.get('/test-sync-error', (req, res, next) => {
  const error = new Error('Synchronous test error!');
  next(error);  // Pass the error to the error-handling middleware
});

app.use('/password', forgotpasswordRoutes);
app.use(helmet());



Users.hasMany(Expense);
Expense.belongsTo(Users);

Users.hasMany(Order);
Order.belongsTo(Users);

Users.hasMany(Forgotpassword);
Forgotpassword.belongsTo(Users);

Users.hasMany(FileUrl);
FileUrl.belongsTo(Users);

app.use((err, req, res, next) => {
  const errorMessage = `[${new Date().toISOString()}] ${err.message || 'Unknown Error'}\nStack: ${err.stack || 'No stack trace'}\n\n`;

  errorLogStream.write(errorMessage); // Alternatively, you can use the errorLogStream

  // Send a generic error response
  res.status(500).json({
    error: 'An error occurred, please try again later.',
  });
});

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
