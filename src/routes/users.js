const express = require('express');
const passport = require('passport');
require('../config/passport');

const userController = require('../controllers/userController');

const router = express.Router();

router.get('/me', passport.authenticate('jwt', { session: false }), userController.getProfile);
router.get('/me/saved-events', passport.authenticate('jwt', { session: false }), userController.getSavedItems);
router.get('me/attending-events', passport.authenticate('jwt', { session: false }), userController.getAttendingItems);

router.put('/me', passport.authenticate('jwt', { session: false }), userController.updateProfile);

router.post('/me/saved-events', passport.authenticate('jwt', { session: false }), userController.saveItem);
router.post('/me/attending-events', passport.authenticate('jwt', { session: false }), userController.attendItem);

router.delete('/me/saved-events/:eventId', passport.authenticate('jwt', { session: false }), userController.removeSavedItem);
router.delete('/me/attending-events/:eventId', passport.authenticate('jwt', { session: false }), userController.removeAttendingItem);



module.exports = router;
