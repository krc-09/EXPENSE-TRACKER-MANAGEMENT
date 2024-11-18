
const bcrypt = require('bcrypt');
const Users = require('../Models/users')
const jwt = require('jsonwebtoken')


exports.postSignupDetails = async (req, res, next) => {
    const { name, email, password } = req.body;

    // Check for missing fields and respond with 400 Bad Request
    if (!name) {
        return res.status(400).json({ error: 'Name is mandatory' });
    }
    if (!email) {
        return res.status(400).json({ error: 'Email is mandatory' });
    }
    if (!password) {
        return res.status(400).json({ error: 'Password is mandatory' });
    }

    try {
        // Check if a user with the provided email already exists
        const existingUser = await Users.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new user if not existing
        await  Users.create({ name, email, password: hashedPassword });


        // Return a success response
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};


function generateAccessToken(id,name,ispremiumuser){
    return jwt.sign({userId:id,name:name,ispremiumuser},'TOKEN_SECRET')
}
exports.postLoginDetails = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is mandatory for login' });
    }
    if (!password) {
        return res.status(400).json({ error: 'Password is mandatory for login' });
    }

    try {
        // Check if the user exists
        const user = await Users.findOne({ where: { email: email } });
        if (!user) {
            // Respond with 404 if no user is found with the given email
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the provided password matches the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Respond with 401 if the password is incorrect
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Respond with 200 if login is successful
        res.status(200).json({ message: 'User login successful',token:generateAccessToken(user.id,user.name,user.ispremiumuser)});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

