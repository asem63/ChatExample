var express = require('express');
var mid = require('./../middleware');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { sampleText: 'Werks', logged:true });
});

module.exports = router;
