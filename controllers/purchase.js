const Razorpay = require('razorpay');
const Order = require('../Models/orders');
const Users = require('../Models/users')
const jwt = require('jsonwebtoken');
require('dotenv').config(); 


const purchasepremium = async (req, res) => {
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const amount = 2500;

        rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
            if (err) {
                throw new Error(JSON.stringify(err));
            }

            try {
                await req.user.createOrder({ orderid: order.id, status: 'PENDING' });
                return res.status(201).json({ order, key_id: rzp.key_id });
            } catch (createOrderError) {
                throw new Error(createOrderError);
            }
        });
    } catch (err) {
        console.log(err);
        res.status(401).json({ message: 'Something went wrong', error: err.message });
    }
};
function generateAccessToken(id,name,ispremiumuser){
    return jwt.sign({userId:id,name:name,ispremiumuser},'TOKEN_SECRET')
}
const updateTransactionStatus = async (req, res) => {
    try {
        const { payment_id, order_id } = req.body;

        const order = await Order.findOne({ where: { orderid: order_id } });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        await Promise.all([
            order.update({ paymentid: payment_id, status: 'SUCCESSFUL' }),
            req.user.update({ ispremiumuser: true })
        ]);

        // Generate a new token with updated premium status
        const newToken = generateAccessToken(req.user.id, req.user.name, true);

        return res.status(202).json({
            success: true,
            message: 'Transaction successful',
            token: newToken // Add token here
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ success: false, message: 'Something went wrong', error: err.message });
    }
};

module.exports = { purchasepremium ,
updateTransactionStatus};

