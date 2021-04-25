require('dotenv').config();

const express = require("express");
const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");

const router  = express.Router();

module.exports = ( obj ) => {

    router.post( '/', async (req, res, next ) => {
        try { 
            console.log( req.body );
            const userlist = await obj.users.findOne({ email : req.body.email });
            if (userlist === null ){
                const hashedPass   = await bcrypt.hash( req.body.password , 10 );
                const accessToken  = jwt.sign({email:req.body.email} , process.env.ACCESS_TOKEN_SECRET , {expiresIn:"15m"} );
                const refreshToken = jwt.sign({email:req.body.email} , process.env.REFRESH_TOKEN_SECRET );
                const userdata   = { 
                    email : req.body.email , 
                    name : req.body.name , 
                    password : hashedPass , 
                    refreshToken : refreshToken
                };
                await obj.users(userdata).save();
                res.cookie( "accessToken" , accessToken  , { path:"/" ,  httpOnly:true , maxAge: 900000  } );
                res.cookie( "refreshToken", refreshToken , { path:"/" ,  httpOnly:true } );
                res.status(200).send();
                // res.json({ status:200 });
            } else { 
                res.status(401).send("EMAIL ALREADY EXIST"); 
                // res.json({ status:401 });
            }
        } catch (e){ res.status(500).send(e) }    
    });

    return router;
}
