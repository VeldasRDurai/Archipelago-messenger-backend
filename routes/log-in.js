require('dotenv').config();

const express = require("express");
const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");

const router  = express.Router();

module.exports = ( obj ) => {

    router.post( '/', async (req, res, next) => {
        try { 
            const user = await obj.users.findOne({ email : req.body.email });
            if( user === null ){
                res.status(401).send("NO SUCH USERS");
            } else if( await bcrypt.compare( req.body.password , user.password ) ){
                const accessToken  = jwt.sign({email:user.email} , process.env.ACCESS_TOKEN_SECRET , {expiresIn:"15m"} );
                const refreshToken = jwt.sign({email:user.email} , process.env.REFRESH_TOKEN_SECRET );
                await obj.users.updateOne( {email:req.body.email} , {refreshToken:refreshToken} );
                res.cookie( "accessToken" , accessToken  , { path:"/" ,  httpOnly:true , maxAge: 900000  } );
                res.cookie( "refreshToken", refreshToken , { path:"/" ,  httpOnly:true } );            
                res.send("LOGGED IN...!");
            } else {
                res.status(401).send("WRONG PASSWORD");   
            }
        } catch (e){ res.status(500).send(e) }    
    });

    return router;
}
