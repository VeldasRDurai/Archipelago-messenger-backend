var express = require('express');
var router = express.Router();

const { users } = require('../database/database');

const authenticationRouter = require("./authentication");
router.use('/' , authenticationRouter );

router.get('/', async (req, res, next) => {
  try {
    console.log(req.email);
    const { email, name, _id, picture, about } = await users.findOne({ email : req.email } , ['email','name','_id','picture','about']);
    // const { email, name, _id, picture } = details;
    console.log( 'email : ', email, ' name : ', name, '_id : ' , _id, 'about : ', about );
    res.json({ email, name, _id, picture, about });
  } catch(e) { 
    console.log(e)
    res.status(500).send(e); 
  }
});

module.exports = router;
