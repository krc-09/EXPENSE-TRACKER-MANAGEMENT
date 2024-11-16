const Expense = require('../Models/Expenses');
const jwt = require('jsonwebtoken');
const Users = require('../Models/users');
const sequelize = require('../utils/database');
const AWS = require('aws-sdk');

function uploadToS3(data, filename) {
  const BUCKET_NAME = 'expensetracking009';
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
  const s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
  });

  
    var params = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: data,
      ACL:'public-read'
    };
    
  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, s3response) => {
      if (err) {
        console.error('Error uploading to S3:', err);
        reject(err);
      } else {
        console.log('Upload successful:', s3response);
        resolve(s3response.Location); // Return the file URL on success
      }
    });
  });
}
// Get all expenses for a specific user
const getAddExpense = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    res.status(200).json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};


// Download expenses and upload them to S3
const downloadexpense = async (req, res) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });

    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ error: 'No expenses found to download' });
    }

    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expense_${req.user.id}_${new Date()}.txt`;

    // Await the result of uploadToS3
    const fileURL = await uploadToS3(stringifiedExpenses, filename);
    res.status(200).json({ fileURL, success: true });
  } catch (error) {
    console.error('Error downloading expense:', error);
    res.status(500).json({ error: 'An error occurred while generating the download' });
  }
};

// Add a new expense
const postAddExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  const { expenses, category, description } = req.body;

  if (!expenses || !category) {
    return res.status(400).json({ error: 'Expense and category are mandatory' });
  }

  try {
    // Create the new expense with the transaction
    await Expense.create({
      expenses: expenses,
      category: category,
      description: description,
      userId: req.user.id,
    }, { transaction: t });

    // Calculate total expenses and update the user's total expenses
    const totalExpenses = Number(req.user.totalExpenses) + Number(expenses);
    console.log('Updated total expenses:', totalExpenses);

    // Update the user's total expenses
    await Users.update(
      { totalExpenses: totalExpenses },
      { where: { id: req.user.id }, transaction: t }
    );

    // Commit the transaction after successful operations
    await t.commit();

    // Fetch the updated expenses list for the user
    const updatedExpenses = await Expense.findAll({ where: { userId: req.user.id } });

    res.status(201).json(updatedExpenses);
  } catch (err) {
    console.error('Error adding expense:', err);
    await t.rollback();
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Delete an expense by ID
const postDeleteExpense = async (req, res, next) => {
  const expenseId = req.params.id;
  const userId = req.user.id;

  if (!expenseId) {
    return res.status(400).json({ success: false, message: 'Invalid expense ID' });
  }

  try {
    // Find the expense by ID and user ID
    const expense = await Expense.findOne({ where: { id: expenseId, userId: userId } });

    // Check if the expense exists and belongs to the user
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found or not authorized to delete' });
    }

    // Delete the expense
    await expense.destroy();

    // Update the user's total expenses after deletion
    const updatedTotalExpenses = Number(req.user.totalExpenses) - Number(expense.expenses);
    console.log('Updated total expenses after deletion:', updatedTotalExpenses);

    await Users.update(
      { totalExpenses: updatedTotalExpenses },
      { where: { id: userId } }
    );

    res.status(200).json({ message: 'Expense deleted successfully', updatedTotalExpenses });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'An error occurred while deleting the expense' });
  }
};

module.exports = {
  getAddExpense,
  downloadexpense,
  postAddExpense,
  postDeleteExpense,
};