const mongoose = require("mongoose");

const { accountSchema } = require('./account-schema');
const { activeUsersSchema } = require('./active-users-schema');

mongoose.connect( "mongodb://localhost:27017/" + "archipelago" , 
    { useNewUrlParser:true , useUnifiedTopology: true} );

const users = mongoose.model( 'Users' , accountSchema );
const activeUsers = mongoose.model( 'ActiveUsers' , activeUsersSchema );

module.exports = { users, activeUsers };