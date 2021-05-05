const express = require("express");
const router  = express.Router();

const verify  = require("./google-authentication");

router.use('/', async ( req , res , next ) => {
    try {
        console.log('authentication');
        let token = req.cookies['session-token'];
        req.user = await verify(token);
        req.email = req.user.email ;
        next();
    } catch (e) {
        res.status(401).send();
    }
});

module.exports = router;