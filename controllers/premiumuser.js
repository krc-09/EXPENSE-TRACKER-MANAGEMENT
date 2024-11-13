const User = require('../Models/users');
const Expense = require('../Models/Expenses');
const sequelize = require('../utils/database');

const getUserLeaderBoard = async (req, res) => {
    try {
        // Retrieve all users and expenses from the database
        const users = await User.findAll();
        const expenses = await Expense.findAll();

        // Aggregate expenses by user ID
        const userAggregatedExpense = {};
        expenses.forEach((expense) => {
            console.log(expense);
            if (userAggregatedExpense[expense.userId]) {
                userAggregatedExpense[expense.userId] += expense.expenses;
            } else {
                userAggregatedExpense[expense.userId] = expense.expenses;
            }
        });

        // Create an array of user leaderboard details
        const userLeaderBoardDetails = users.map((user) => ({
            name: user.name,
            totalCost: userAggregatedExpense[user.id] || 0 // Default to 0 if no expenses
        }));

        // Sort the leaderboard details in descending order by total cost
        userLeaderBoardDetails.sort((a, b) => b.totalCost - a.totalCost);

        // Send the sorted leaderboard as the response
        res.status(200).json(userLeaderBoardDetails);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching the leaderboard' });
    }
};

module.exports = { getUserLeaderBoard };
