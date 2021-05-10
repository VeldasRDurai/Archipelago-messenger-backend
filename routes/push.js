const push = require('web-push');

let vapidkeys = {
    publicKey:'BPTusE7P8UdeFusBo-HAkYSKag0S5cNa1xjGfwmho0mlmSx_ZFj0aoHGKouP0ONYWxAK8cfeYhe5wsQucSPbO9U',
    privateKey:'DZjYA5kn9BCp27MgcpQpS18jBd2P7nWeFPq_4wMWY4g'
}

push.setVapidDetails('mailto:veldasrdurai72@gmail.com', vapidkeys.publicKey, vapidKeys.privateKey );
push.sendNotification(subscription,'test message');