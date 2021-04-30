require('dotenv').config();

const express = require("express");
const jwt     = require("jsonwebtoken");
const router  = express.Router();

const { users } = require('../database/database');


router.use('/', async ( req , res , next ) => {
    try{
        if (req.cookies['accessToken'] === undefined ) throw ("NO ACCESS TOKEN");
        const payload = await jwt.verify( req.cookies['accessToken'] , process.env.ACCESS_TOKEN_SECRET);
        req.email = payload.email;
        next();
    } catch {
        try{
            if (req.cookies['refreshToken'] === undefined ) throw ("NO ACCESS TOKEN");
            const payload = await jwt.verify( req.cookies['refreshToken'] , process.env.REFRESH_TOKEN_SECRET);
            const user = await users.findOne({ email : payload.email });
            if ( user.refreshToken !== req.cookies['refreshToken'] ) throw ("TOKEN NOT MATCHING TOKEN IN DATABASE") ;
            const accessToken  = jwt.sign({ email : payload.email } , process.env.ACCESS_TOKEN_SECRET , { expiresIn : "15m" });
            const refreshToken = jwt.sign({ email : payload.email } , process.env.REFRESH_TOKEN_SECRET );
            await users.updateOne( { email : payload.email } , { refreshToken : refreshToken } );
            res.cookie( "accessToken" , accessToken  , { path:"/" ,  httpOnly:true , maxAge: 900000 } );
            res.cookie( "refreshToken", refreshToken , { path:"/" ,  httpOnly:true } );            
            req.email = payload.email;
            next();
        } catch (e) {
            res.status(401).send(e);
        } 
    }
});

module.exports = router;