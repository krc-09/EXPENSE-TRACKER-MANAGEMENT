const User = require('../Models/users');
const Expense = require('../Models/Expenses');
const sequelize = require('../utils/database');

const getUserLeaderBoard = async (req, res) => {
    try {
        // Retrieve all users with their IDs and names, including the total cost of expenses
        const leaderboardofusers = await User.findAll({
           
            order: [[sequelize.literal('totalExpenses'), 'DESC']]
        });

        // Send the sorted leaderboard as the response
        res.status(200).json(leaderboardofusers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching the leaderboard' });
    }
};

module.exports = { getUserLeaderBoard };
