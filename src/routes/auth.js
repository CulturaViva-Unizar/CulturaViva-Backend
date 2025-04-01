const express = require('express');
require('../config/passport');
const authController = require('../controllers/authController');
const router = express.Router();
const passport = require('passport');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/change-password', 
    passport.authenticate('jwt', { session: false }), 
    authController.changePassword);

module.exports = router;