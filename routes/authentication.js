require('dotenv').config();

const express = require("express");
const jwt     = require("jsonwebtoken");
const router  = express.Router();


router.use('/', async ( req , res , next ) => {
    try{
        if (req.cookies['accessToken'] === undefined ) throw ("NO ACCESS TOKEN");
        const payload = await jwt.verify( req.cookies['accessToken'] , process.env.ACCESS_TOKEN_SECRET);
        console.log('payload ' , payload)
        req.email = payload.email;
        next();
    } catch {
        try{
            if (req.cookies['refreshToken'] === undefined ) throw ("NO REFRESH TOKEN");
            const payload = await jwt.verify( req.cookies['refreshToken'] , process.env.REFRESH_TOKEN_SECRET);
            const accessToken  = jwt.sign({ email : payload.email } , process.env.ACCESS_TOKEN_SECRET , { expiresIn : "15m" });
            res.cookie( "accessToken" , accessToken  , { path:"/" ,  httpOnly:true , maxAge: 900000,  sameSite:'none', secure:true } );         
            req.email = payload.email;
            next();
        } catch (e) {
            console.log(e);
            res.status(401).send(e);
        } 
    }
});

module.exports = router;