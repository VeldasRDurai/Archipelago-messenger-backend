var express = require('express');
var router = express.Router();

const { users } = require('../database/database');

const authenticationRouter = require("./authentication");

router.use('/' , authenticationRouter);

router.get('/', async (req, res, next) => {
  const { email , name , _id } = await users.findOne({ email : req.email } , ['email','name','_id']);

  console.log( 'email : ', email, ' name : ', name, '_id : ' , _id );
  res.json({ email , name , _id });
});

module.exports = router;