const express = require('express');

const statisticsController = require('../controllers/statisticsController');
const userController = require('../controllers/userController');
const router = express.Router();
const passport = require('passport');

router.get('/users', 
    //passport.authenticate('jwt', { session: false }),
    //userController.checkAdmin, 
    statisticsController.userCount
);

router.get('/events', 
    //passport.authenticate('jwt', { session: false }),
    //userController.checkAdmin, 
    statisticsController.eventCount
);




module.exports = router;