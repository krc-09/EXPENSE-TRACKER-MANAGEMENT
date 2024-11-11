const jwt = require('jsonwebtoken');
const User = require('../Models/users'); 
const Expense = require('../Models/Expenses');


const authenticate = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        console.log(token);

        const user = jwt.verify(token, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwibmFtZSI6IkthbmthbmEgUm95Y2hvd2RodXJ5IiwiaWF0IjoxNTE2MjM5MDIyfQ.n6zmXiuW3y3JUh-AuGJoDZIS6Aa8m-t6L-FhCpzYNNc');
        console.log('userId >>>>', user.userId);

        User.findByPk(user.userId).then(user => {
           

            req.user = user; 
            next();
        })
        

    } catch (err) {
        console.log('JWT verification error:', err);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}

module.exports = {authenticate};

