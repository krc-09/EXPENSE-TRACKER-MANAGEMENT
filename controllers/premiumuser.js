const User = require('../Models/users');
const Expense = require('../Models/Expenses');
const sequelize = require('../utils/database');

const getUserLeaderBoard = async (req, res) => {
    try {
        // Retrieve all users with their IDs and names, including the total cost of expenses
        const leaderboardofusers = await User.findAll({
            attributes: [
                'id', 
                'name', 
                [sequelize.fn('SUM', sequelize.col('expenses')), 'total_cost']
            ],
            include: [
                {
                    model: Expense,
                    attributes: [] // Include expenses but don't return the details in the response
                }
            ],
            group: ['users.id'],
            order: [[sequelize.literal('total_cost'), 'DESC']]
        });

        // Send the sorted leaderboard as the response
        res.status(200).json(leaderboardofusers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching the leaderboard' });
    }
};

module.exports = { getUserLeaderBoard };
