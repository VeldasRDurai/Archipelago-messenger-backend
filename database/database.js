const mongoose = require("mongoose");

const { accountSchema } = require('./account-schema');
const { activeUsersSchema } = require('./active-users-schema');
const { subscriptionsSchema } = require('./subscriptions-schema');

// mongoose.connect( "mongodb://localhost:27017/" + "archipelago" , 
const databaseName = 'archipelago';
const password = process.env.DATABASE_PASSWORD;
mongoose.connect( `mongodb+srv://VeldasRDurai:${password}@cluster0.u80jr.mongodb.net/${databaseName}?retryWrites=true&w=majority`,
    { useNewUrlParser:true , useUnifiedTopology: true} );

const users = mongoose.model( 'Users' , accountSchema );
const activeUsers = mongoose.model( 'ActiveUsers' , activeUsersSchema );
const subscriptions = mongoose.model('Subscriptions', subscriptionsSchema );

module.exports = { users, activeUsers, subscriptions };