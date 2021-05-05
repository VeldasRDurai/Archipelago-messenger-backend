const express = require("express");
const router  = express.Router();

const { users } = require('../database/database');
const verify  = require("./google-authentication");

router.post( '/', async (req, res, next) => {
    try {
        console.log('sign-in');
        let token = req.body.token;
        let payload = await verify(token); 
        console.log('google payload : ', payload );
        const userlist = await users.findOne({ 'email' : payload.email });
        if (userlist === null){
            await users({
                'email' : payload.email, 
                'name' : payload.name, 
                'picture' : payload.picture, 
                'givenName' : payload.given_name,
                'familyName' : payload.family_name
            }).save();
        }
        res.cookie('session-token',token);
        res.send('success');
    } catch (e){ res.status(500).send(e) }    
});

module.exports = router;