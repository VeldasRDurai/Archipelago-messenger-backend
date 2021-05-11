const express = require('express');
const router = express.Router();

const { subscriptions } = require('../database/database');

const authenticationRouter = require("./authentication");
router.use('/' , authenticationRouter );

router.post('/', async (req, res) => { 
    try {
        console.log('body : ', req.body);
        console.log('email', req.email); 
        const ack1 = await subscriptions({ 
            email:req.email,
            endpoint: req.body.endpoint ,
            keys: req.body.keys 
        }).save();
        res.json({ data: 'Subscription saved.'});
    } catch (e) {
        console.error(`Error occurred while saving subscription. Err: ${e}`);
        res.status(500).json({ error: 'Technical error occurred' });
    }
});
module.exports = router;