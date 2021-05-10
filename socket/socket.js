const { newUser } =     require('./new-user');
const { startChat } =   require('./start-chat');
const { sendMessage } = require('./send-message');
const { endChat } =     require('./end-chat');
const { disconnect } =  require('./disconnect');

const { search } =      require('./search');
const { typing } =      require('./typing');
const { newAbout } =    require('./new-about');
const { getHistory } =  require('./get-history');

module.exports = (io) => {
    io.on('connection' , socket => {
      console.log('user connected', socket.id);
      socket.emit('connected');
      socket.on('new-user', data => newUser({ data, socket }) );
      socket.on('start-chat', data => startChat({ data, socket }) );
      socket.on('send-message', data => sendMessage({ data, socket }) );
      socket.on('end-chat', data => endChat({ data, socket }) ); 
      socket.on('disconnect' , () => disconnect({ socket }) );

      socket.on('search', data => search({ data, socket }) );
      socket.on('typing', data => typing({ data, socket }) );
      socket.on('new-about', data => newAbout({ data, socket }) );
      socket.on('get-history', data => getHistory({ data, socket }) );
      socket.on('online', data => newUser({ data, socket }) );
      socket.on('offline', () => disconnect({ socket }) );
    });
}
// const socketProvider = (io) => {
//     return new Promise((resolve, reject) => {
//         try{
//             io.on('connection' , socket => {
//                 console.log( 'user connected' , socket.id );
//                 socket.emit('connected');
//                 resolve(socket);
//             })
//         } catch(e) {
//             reject(e);
//         }     
//     })
// }

// module.exports = { socketProvider }