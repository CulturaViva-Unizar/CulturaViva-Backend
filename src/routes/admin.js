const express = require('express');
const passport = require('passport');
require('../config/passport');
const adminController = require('../controllers/adminController');
const router = express.Router();


router.get('/users', passport.authenticate('jwt', { session: false }), adminController.checkAdmin, adminController.getUsers);
router.get('/users/:userId', passport.authenticate('jwt', { session: false }), adminController.checkAdmin, adminController.getUserById);

router.patch('/users/:userId/block', passport.authenticate('jwt', { session: false }), adminController.checkAdmin, adminController.blockUser);
router.patch('/users/:userId/unblock', passport.authenticate('jwt', { session: false }), adminController.checkAdmin, adminController.unblockUser);
router.patch('/users/:userId/admin', passport.authenticate('jwt', { session: false }), adminController.checkAdmin, adminController.makeAdmin);

router.delete('/users/:userId', passport.authenticate('jwt', { session: false }), adminController.checkAdmin, adminController.deleteUser);

module.exports = router;