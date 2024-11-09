const Users = require('../Models/users')



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

        // Create a new user if not existing
        await Users.create({ name, email, password });

        // Return a success response
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};




