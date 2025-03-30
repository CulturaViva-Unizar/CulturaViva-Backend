const express = require('express');
const passport = require('passport');
require('../config/passport');

const userController = require('../controllers/userController');

const router = express.Router();

router.get('/me', passport.authenticate('jwt', { session: false }), userController.getProfile);

router.put('/me', passport.authenticate('jwt', { session: false }), userController.updateProfile);

router.get('/me/saved', passport.authenticate('jwt', { session: false }), userController.getSavedItems);

module.exports = router;
