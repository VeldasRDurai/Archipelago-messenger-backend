const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = process.env.CLIENT_ID ;
const client = new OAuth2Client(CLIENT_ID);

const verify = async (token) => {
    try {
        const ticket = await client.verifyIdToken({ idToken: token , audience: CLIENT_ID });
        const payload = ticket.getPayload();
        return payload;
    } catch (e){ res.status(401).send(); }
}

module.exports = verify;