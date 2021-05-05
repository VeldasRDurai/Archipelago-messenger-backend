var express = require('express');
var router = express.Router();

const { users } = require('../database/database');

const authenticationRouter2 = require("./authentication2");
router.use('/' , authenticationRouter2 );

router.get('/', async (req, res, next) => {
  const { email, name, _id, picture } = await users.findOne({ email : req.email } , ['email','name','_id','picture']);

  console.log( 'email : ', email, ' name : ', name, '_id : ' , _id );
  res.json({ email, name, _id, picture });
});

module.exports = router;
