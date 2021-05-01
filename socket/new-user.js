const { users, activeUsers } = require('../database/database');
const { historySchema } = require('../database/history-schema');
const { chatSchema } = require('../database/chat-schema');
// const { activitySchema } = require('../database/activity-schema');

const newUser = async ({ data, socket }) => {
  try {
    console.log(data);
    const { email, name, _id } = data;
    const myHistoryDB = await new mongoose.model(`history${_id}`, historySchema, `history${_id}`);
    
    // adding me to list of active users
    const ack1 = await activeUsers({ email, name, socketId:socket.id }).save();
    console.log('Added to active user : ', ack1); 

    // changing the not sented messages to delivered status in my history
    const ack3 = await myHistoryDB.updateMany({'unRead': { $ne:0 } }, {lastDelivered: true });
    console.log('All pending messages delivered : ', ack3);

    // obtaining my history
    const history = await myHistoryDB.find();
    socket.emit('set-history', { history });

    // changing my status to online
    const ack2 = await users.updateOne({'email': email },{ 'online':true });
    console.log('Become online : ', ack2);

    const historyUsers = await myHistoryDB.find({'unRead': { $ne:0 } });
    historyUsers.forEach( item => {
      const sortedId = [ _id, item.id ].sort();

      //changing his messages to delivered in common database collection
      const chatDB = await new mongoose.model( `${sortedId[0]}chats${sortedId[1]}`, chatSchema,`${sortedId[0]}chats${sortedId[1]}` );
      await chatDB.updateMany({'sendBy':item.email,'delivered':false}, {'delivered':true});
      
      //changing his history last message to delivered
      const hisHistoryDB = await new mongoose.model(`history${item.id}`, historySchema, `history${item.id}`);
      await hisHistoryDB.updateOne({'email':email}, {lastDelivered: true });
      
      const oldChat = await chatDB.find();
      const history = await hisHistoryDB.find();      
      const activeUser = await activeUsers.find({ 'email':item.email });
      activeUser.forEach( item2 => {
        if (item2.isChatting && item2.chattingWithEmail === email){ 
          // finding weather he is chatting with me
          socket.broadcast.to(item2.socketId).emit('previous-message', { oldChat });
        } 
          //finding weather he is online
          socket.broadcast.to(item2.socketId).emit('set-history', { history });
      });
    });

    // updating my activity
    // const myActivityDB = await new mongoose.model(`activity${_id}`, activitySchema, `activity${_id}`);
    // await myActivityDB({ 'time': new Date(), 'activity':'You loged in' }).save();
  
  } catch (e) { console.log(e); }
}

module.exports = { newUser };