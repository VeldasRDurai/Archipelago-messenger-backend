const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = socketio( server , {cors:{ origin:'*' }});

mongoose.connect( "mongodb://localhost:27017/" + "pesalama" , 
{ useNewUrlParser:true , useUnifiedTopology: true} );

const historySchema = new mongoose.Schema({
  email: { type : String ,  required: [ true , " No name specified...!"  ] },
  lastSendBy : { type : String ,  required: [ true , " No sendBy specified...!"  ] } ,
  lastMsg : { type : String ,  required: [ true , " No msg specified...!"   ] },
  lastMsgTime : { type : Date ,required: [ true , " No date specified...!"  ] },
  unRead  : { type : Number , default:0 }
});
const accountSchema = new mongoose.Schema ({
  email : { type : String , required: [ true , " No email specified...!"     ] },
  name  : { type : String , required: [ true , " No name specified...!"     ] },
  password : { type : String },
  refreshToken : { type : String } ,
  history  : { type : [historySchema] } 
});

const chatSchema = new mongoose.Schema({
  sendBy : { type : String ,  required: [ true , " No sendBy specified...!"  ] } ,
  msg    : { type : String ,  required: [ true , " No msg specified...!"  ] } ,
  msgTime: { type : Date   ,  required: [ true , " No Date specified...!"  ] } ,
  read   : { type : Boolean , default: false },
});

const activeUser = new mongoose.Schema({
  email: { type : String ,  required: [ true , " No name specified...!"  ] },
  socketId : { type : String }
});

const users   = mongoose.model( 'Users' , accountSchema );
const activeUsers = mongoose.model( 'ActiveUsers' , activeUser );

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors( { origin : "http://localhost:3000" , credentials : true } )); 

const indexRouter = require('./routes/index');
const logInRouter = require('./routes/log-in');
const signUpRouter = require('./routes/sign-up');

app.use('/log-in' ,express.static(path.join(__dirname, 'public')));
app.use('/sign-up',express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/log-in',logInRouter({ users : users}));
app.use('/sign-up',signUpRouter({ users: users}));
app.use('/', indexRouter({ users : users}));

io.on('connection' , async ( socket ) => {
  console.log( 'user connected' , socket.id );
  socket.emit('connected');
  socket.on('newUser', async (data) => {
    try {
      console.log(data);
      let acknowledge = await activeUsers({ email:data.email , socketId:socket.id }).save(); 
      console.log( acknowledge );
      const user = await users.findOne( {'email' :data.email } );
      socket.emit('setHistory', { history: user.history });
    } catch (e){ console.log(e); }
  });
  socket.on('getHistory' , async (data) => {
    try{
      const user= await users.findOne( {'email' :data.email } );
      socket.emit('setHistory', { history: user.history });
    } catch(e){ console.log(e); }
  })
  socket.on( 'search', async ( data ) => { 
    try{
      const userlist = await users.find({ 'email' : new RegExp( data.searchText ,"i") } , [ "email" ] , {limit:25} );
      socket.emit('searchResult' , userlist);
    } catch(e){
      console.log(e);
    }
  });
  socket.on('createRoom', async (data) => {
    try{
      console.log("create room");
      console.log( socket.rooms );
      let names = [ data.userData.email , data.with ].sort();
      ![...socket.rooms].includes(names[0] + names[1]) && socket.join( names[0] + names[1] ) && console.log('joined-room');
      const chatDB = await new mongoose.model( names[0] + names[1] , chatSchema , names[0] + names[1] );
      let ack1 = await chatDB.updateMany( {'sendBy':data.with ,'read':false} , {'read':true} );
      console.log( '1' , ack1 );
      let ack2 = await users.updateOne({'email': data.userData.email , 'history.email':data.with } , 
          { $set : { 'history.$.unRead': 0 }} );
      console.log( '2' , ack2 );
      const allChat = await chatDB.find();
      socket.emit('previousMsg' , allChat );

      console.log( socket.rooms );
      // const activeUsersList = await activeUsers.find({ email : data.with });
      // console.log( activeUsersList );
      // activeUsersList.length !== 0 && 
      // activeUsersList.forEach( ( item ) => 
      //   socket.broadcast.to(item.socketId).emit("invite",{ room : names[0] + names[1] }) 
      // );
    } catch(e){
      console.log(e);
    }
  });
  socket.on('joinRoom', function(data) {
    console.log('joinRoom');
    socket.join(data.room);
    console.log( socket.rooms );
  });
  socket.on( 'sendMsg' , async (data) => {
    try {
      console.log('sendMsg');
      console.log(data);
      const names = [ data.userData.email , data.with ].sort();
      const chatDB = await new mongoose.model( names[0] + names[1] , chatSchema , names[0] + names[1] );
      const info = { sendBy:data.userData.email , msg:data.message , msgTime:new Date() };
      await chatDB( info ).save();
  
      const sender = await users.findOne({ email : data.userData.email });
        if (!(sender.history.some( item => item.email === data.with ) )) {
            console.log("reached2...");
            let ack3 = await users.updateOne( { 'email' : data.userData.email } , 
                { $push : {  history : { 'email':data.with  , 'lastMsg':info.msg , 'lastMsgTime':info.msgTime , 'lastSendBy':data.userData.email } } } );
            console.log( '3' , ack3);
            let ack4 = await users.updateOne( { 'email' : data.with } , 
                { $push : {  history : { 'email':data.userData.email  , 'lastMsg':info.msg , 'lastMsgTime':info.msgTime , 'lastSendBy': data.with , unRead : 1  } } } );
            console.log( '4' , ack4);
        } else {
          let ack5 = await users.updateOne( {'email': data.userData.email , 'history.email':data.with } , 
                { $set : { 'history.$.lastMsg':info.msg , 'history.$.lastMsgTime':info.msgTime , 'history.$.lastSendBy':data.userData.email  } } );
          console.log( '5' , ack5 );
          const user = await users.findOne( {'email':data.with  , 'history.email':data.userData.email } );
          const prevUnRead = user.history.find( item => item.email === data.userData.email ).unRead;
          let ack6 = await users.updateOne( {'email':data.with  , 'history.email':data.userData.email } , 
              { $set : { 'history.$.lastMsg':info.msg , 'history.$.lastMsgTime':info.msgTime , 'history.$.lastSendBy':data.userData.email , 'history.$.unRead':prevUnRead + 1 } } );
          console.log( '6' , ack6 );
        }

      const room = [ ... io.sockets.adapter.rooms.get(names[0]+names[1]) ];
      console.log(room);
      const activeUsersList = await activeUsers.find({ email : data.with });
      console.log( activeUsersList );
      if( activeUsersList.length !== 0 ){
        activeUsersList.forEach( item  => {
          if( !room.includes(item.socketId) ){
            socket.broadcast.to(item.socketId).emit("invite",{ room : names[0] + names[1] , ...info  });
          } else {
            socket.broadcast.to( names[0]+names[1] ).emit("reciveMsg",{ ...info });
          }
        });
      }
    } catch (e) {
      console.log(e);
    }
  });
  socket.on( 'disconnect' , async () => {
    try {
      console.log('user disconnected' , socket.id );
      let acknowledge = await activeUsers.deleteOne({ socketId:socket.id }); 
      console.log( acknowledge );
    } catch (e){
      console.log(e);
    }
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = { app:app , server:server };
