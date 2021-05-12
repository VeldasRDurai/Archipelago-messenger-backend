require('dotenv').config();
const q = require('q');
const webPush = require('web-push');

const { subscriptions } = require('../database/database');

const pushNotification = ({ email, name, picture, message, chattingWithEmail }) => {
    const payload = {
        title: `New message from ${ email }`,
        message: `${name} : ${message}` ,
        url: 'https://archipelago-messenger.herokuapp.com/',
        ttl: 36000,
        icon: picture,
        image: picture
    };
    subscriptions.find({ 'email': chattingWithEmail }, (err, datas ) => {
        if (err) {
            console.error(`Error occurred while getting subscriptions`);
        } else {
            let parallelSubscriptionCalls = datas.map((subscription) => {
                return new Promise((resolve, reject) => {
                    const pushSubscription = {
                        endpoint: subscription.endpoint,
                        keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth }
                    };

                    const pushPayload = JSON.stringify(payload);
                    const pushOptions = {
                        vapidDetails: {
                            subject: "https://github.com/VeldasRDurai",
                            privateKey: process.env.VAPID_PRIVATE_KEY,
                            publicKey: process.env.VAPID_PUBLIC_KEY
                        },
                        TTL: payload.ttl,
                        headers: {}
                    };
                    webPush.sendNotification( pushSubscription, pushPayload, pushOptions)
                    .then( value => resolve({ status: true, endpoint: subscription.endpoint, data: value}))
                    .catch( err =>  reject({ status: false,endpoint: subscription.endpoint, data: err}));
                });
            });
            
            q.allSettled(parallelSubscriptionCalls).then( pushResults => console.info(pushResults) );
        }
    });
}

module.exports = { pushNotification }