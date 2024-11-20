const Expense = require('../Models/Expenses');
const jwt = require('jsonwebtoken');
const Users = require('../Models/users');
const sequelize = require('../utils/database');

const UserServices = require('../services/userservices');
const S3Service = require('../services/S3services');
const FileUrl = require('../Models/fileurls');

// Get all expenses for a specific user
const getAddExpense = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get page from query params, default to 1
    const limit = parseInt(req.query.limit) || 10; // Get limit from query params, default to 10
    const offset = (page - 1) * limit; // Calculate offset

    // Fetch expenses with pagination
    const expenses = await Expense.findAndCountAll({
      where: { userId: req.user.id },
      limit: limit,
      offset: offset,
      order: [['createdAt', 'DESC']], // Optional: order by created date
    });

    res.status(200).json({
      expenses: expenses.rows,
      currentPage: page,
      totalPages: Math.ceil(expenses.count / limit),
    });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};



// Download expenses and upload them to S3
const downloadexpense = async (req, res) => {
  try {
    const expenses = await UserServices.getAddExpenses(req)

    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ error: 'No expenses found to download' });
    }

    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expense_${req.user.id}_${new Date()}.txt`;

    // Await the result of uploadToS3
    const fileURL = await S3Service.uploadToS3(stringifiedExpenses, filename);
    await  FileUrl.create({url: fileURL,userId:req.user.id});


    // Return a success response

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

const downloadPastFileUrls = async (req, res) => {
  try {
    // Retrieve all past file URLs for the user along with their creation dates
    const pastFiles = await FileUrl.findAll({
      where: { userId: req.user.id },
      attributes: ['url', 'createdAt'],
      order: [['createdAt', 'DESC']], // Optional: order by creation date
    });

    if (!pastFiles || pastFiles.length === 0) {
      return res.status(404).json({ error: 'No past URLs found' });
    }

    // Format each file URL with its creation date
    const pastFileURLs = pastFiles.map(file => {
      const formattedDate = new Date(file.createdAt).toISOString(); // Format the date as ISO string
      return `${formattedDate}, ${file.url}`; // Include both the date and URL
    }).join('\n'); // Join all entries with a new line

    const fileListName = `PastFileURLs_${req.user.id}_${new Date().toISOString()}.txt`;

    // Upload the file containing all past URLs and their dates to S3
    const fileURLsUpload = await S3Service.uploadToS3(pastFileURLs, fileListName);

    // Return the URL of the uploaded file
    res.status(200).json({ fileURLsFile: fileURLsUpload, success: true });
  } catch (error) {
    console.error('Error creating file with past URLs:', error);
    res.status(500).json({ error: 'An error occurred while generating the file with past URLs' });
  }
};

module.exports = {
  getAddExpense,
  downloadexpense,
  postAddExpense,
  postDeleteExpense,
  downloadPastFileUrls
<<<<<<< HEAD
};
=======
};
>>>>>>> 4ec143124690b802c7905c1975b5df9a06201365
