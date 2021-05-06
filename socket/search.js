const mongoose = require("mongoose");

const { users } = require('../database/database');
const { activitySchema } = require('../database/activity-schema');

const search = async ({ data, socket }) => {
  try{
      const { searchText, _id } = data;
      const userlist = await users.find({ 'email' : new RegExp( searchText ,"i") }, 
        [ 'email', 'name', '_id', 'picture', 'about' ], 
        {limit:25} 
      );
      socket.emit('search-result' , userlist);
      
      // updating my activity
      const myActivityDB = new mongoose.model(`activity${_id}`, activitySchema, `activity${_id}`);
      await myActivityDB({ 'time': new Date().toGMTString() , 'description': `Searched for ${ searchText }`  }).save();

    } catch(e){ console.log(e); }
}

module.exports = { search };