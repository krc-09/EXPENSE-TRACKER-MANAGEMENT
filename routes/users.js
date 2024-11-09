const express = require('express');
const usersController = require('../controllers/users');

const router = express.Router();

router.post('/signup',usersController.postSignupDetails);
router.post('/login',usersController.postLoginDetails);



module.exports = router;