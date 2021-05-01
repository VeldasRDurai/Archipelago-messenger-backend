
const { newUser } =     require('./new-user');
const { getHistory } =  require('./get-history');
const { search } =      require('./search');
const { startChat } =   require('./start-chat');
const { sendMessage } = require('./send-message');
const { disconnect } =  require('./disconnect');

module.exports = (io) => {
    io.on('connection' , socket => {
      console.log('user connected', socket.id);
      socket.emit('connected');
      socket.on('new-user', data => newUser({ data, socket }) );
      socket.on('get-history', data => getHistory({ data, socket }) );
      socket.on('search', data => search({ data, socket }) );
      socket.on('start-chat', data => startChat({ data, socket }) );
      socket.on('send-message', data => sendMessage({ data, socket }) ); 
      socket.on( 'disconnect' , () => disconnect({ socket }) );
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