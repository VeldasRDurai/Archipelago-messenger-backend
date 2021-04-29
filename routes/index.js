var express = require('express');
var router = express.Router();

module.exports = ({ users }) => {

  const authenticationRouter = require("./authentication");
  router.use('/' , authenticationRouter({users:users}));

  router.get('/', async (req, res, next) => {
    const user = await users.findOne({ email : req.email } , ['email','name']);
    console.log( user );
    res.json({ email:user.email, name:user.name });
  });


  return router;
}
