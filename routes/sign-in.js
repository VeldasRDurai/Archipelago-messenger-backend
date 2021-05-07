const express = require("express");
const jwt     = require("jsonwebtoken");
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
        } else {
            const ack1 = await users.updateOne({ 'email' : payload.email },{
                'name' : payload.name, 
                'picture' : payload.picture, 
                'givenName' : payload.given_name,
                'familyName' : payload.family_name
            });
        }
        const accessToken  = jwt.sign({email:payload.email} , process.env.ACCESS_TOKEN_SECRET , {expiresIn:"15m"} );
        const refreshToken = jwt.sign({email:payload.email} , process.env.REFRESH_TOKEN_SECRET );
        res.cookie( "accessToken" , accessToken  , { path:"/" ,  httpOnly:true , maxAge: 900000, sameSite:'none' , secure:true } );
        res.cookie( "refreshToken", refreshToken , { path:"/" ,  httpOnly:true , sameSite:'none', secure:true } ); 
        res.send('success');
    } catch (e){ 
        console.log(e);
        res.status(500).send(e); 
    }    
});

module.exports = router;