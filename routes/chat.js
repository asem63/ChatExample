var express = require('express');
var mid = require('./../middleware');
var router = express.Router();

/* GET home page. */
router.get('/sample', function(req, res, next) {
  res.render('chat', { title: 'Chat' });
});

module.exports = router;
