var express = require('express');
var router = express.Router();

module.exports = ( { users } ) => {

  const authenticationRouter = require("./authentication");
  router.use('/' , authenticationRouter({users:users}));

  router.get('/', function(req, res, next) {
    // let x = req.cookies['accessToken'];
    // res.send("<h1> HOME PAGE </h1>" + "<h3>" + x + "</h3>");
    res.json( { email : req.email } );
  });


  return router;
}
