const express = require('express');
const expenseController = require('../controllers/expenses');
const usersController = require('../controllers/users');

const authenticator =  require('../middleware/auth');

const router = express.Router();

router.post('/signup',usersController.postSignupDetails);
router.post('/login',usersController.postLoginDetails);


router.get('/download',authenticator.authenticate, expenseController.downloadexpense);
router.get('/past-download',authenticator.authenticate, expenseController.downloadPastFileUrls);

module.exports = router;
