const express = require('express');

const passport = require('passport');
require('../config/passport');

const { register } = require('../controllers/users');
const { login } = require('../controllers/auth');
const { getProfile } = require('../controllers/users');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', passport.authenticate('jwt', { session: false }), getProfile);

module.exports = router;
