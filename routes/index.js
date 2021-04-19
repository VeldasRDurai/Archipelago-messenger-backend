var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.send("<h1> HOME PAGE </h1>")
});

module.exports = router;
