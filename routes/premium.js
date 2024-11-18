const express = require('express');
const premium = require('../controllers/premiumuser');
const authenticatemiddleware =  require('../middleware/auth');
const router = express.Router();


router.get('/showLeaderBoard',authenticatemiddleware.authenticate,premium.getUserLeaderBoard);

// Route to add a new user


module.exports = router;