var express = require('express');
var router = express.Router();

const { users } = require('../database/database');

const authenticationRouter = require("./authentication");

router.use('/' , authenticationRouter);

router.get('/', async (req, res, next) => {
  const user = await users.findOne({ email : req.email } , ['email','name']);
  console.log( user );
  res.json({ email:user.email, name:user.name });
});

module.exports = router;