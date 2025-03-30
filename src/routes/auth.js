const express = require('express');
require('../config/passport');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/change-password', authController.changePassword);

module.exports = router;