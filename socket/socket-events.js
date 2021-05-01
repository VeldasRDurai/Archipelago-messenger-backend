// module.exports = async (io) => {
//     const { socketProvider } = require('./socket');
//     const socket = await socketProvider(io);

//     const { newUser } =     require('./new-user');
//     const { getHistory } =  require('./get-history');
//     const { search } =      require('./search');
//     const { startChat } =   require('./start-chat');
//     const { sendMessage } = require('./send-message');
//     const { disconnect } =  require('./disconnect');

//     socket.on('new-user', data => newUser({ data, socket }) );
//     socket.on('get-history', data => getHistory({ data, socket }) );
//     socket.on('search', data => search({ data, socket }) );
//     socket.on('start-chat', data => startChat({ data, socket }) );
//     socket.on('send-message', data => sendMessage({ data, socket }) ); 
//     socket.on( 'disconnect' , () => disconnect({ socket }) );
// }