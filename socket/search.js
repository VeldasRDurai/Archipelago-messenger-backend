const { users } = require('../database/database');

const search = async ({ data, socket }) => {
    try{
        const userlist = await users.find({ 'email' : new RegExp( data.searchText ,"i") } , [ 'email' , 'name' ] , {limit:25} );
        socket.emit('search-result' , userlist);
      } catch(e){ console.log(e); }
}

module.exports = { search };