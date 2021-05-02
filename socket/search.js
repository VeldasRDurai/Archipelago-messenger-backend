const mongoose = require("mongoose");

const { users } = require('../database/database');

const search = async ({ data, socket }) => {
  try{
      const { searchText } = data;
      const userlist = await users.find({ 'email' : new RegExp( searchText ,"i") }, 
        [ 'email', 'name', '_id' ], 
        {limit:25} 
      );
      socket.emit('search-result' , userlist);
    } catch(e){ console.log(e); }
}

module.exports = { search };