var express = require('express');
var router = express.Router();

const statisticsController = require('../controllers/statisticsController');

/* GET home page. */
router.get('/', statisticsController.countVisits, function(req, res, next) {
  res.send('Hello World');
});

module.exports = router;
