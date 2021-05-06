const express = require("express");
const router  = express.Router();

const authenticationRouter = require("./authentication");
router.use('/' , authenticationRouter );

router.get( '/', async (req, res, next) => {
    try {
        res.clearCookie( "accessToken");
        res.clearCookie( "refreshToken");
        res.send('success');
    } catch (e){ res.status(500).send(e); }    
});

module.exports = router;