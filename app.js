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
  // lastSendBy : { type : String ,  required: [ true , " No sendBy specified...!"  ] } ,
  // lastMsg : { type : String ,  required: [ true , " No msg specified...!"   ] },
  // lastMsgTime : { type : Date ,required: [ true , " No date specified...!"  ] },
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
  // msgTime: { type : Date   ,  required: [ true , " No Date specified...!"  ] } ,
  // read   : { type : Boolean , default: false },
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
    } catch (e){ console.log(e); }
  });
  socket.on( 'search', async ( data ) => { 
    try{
      const userlist = await users.find({ 'email' : new RegExp( data.searchText ,"i") } , [ "email" ] , {limit:25} );
      socket.emit('searchResult' , userlist);
    } catch(e){
      console.log(e);
    }
  });
  socket.on('createRoom', async (data) => {
    console.log("create room");
    let names = [ data.userData.email , data.with ].sort();
    socket.join( names[0] + names[1] );
    console.log( socket.rooms );
    const activeUsersList = await activeUsers.find({ email : data.with });
    console.log( activeUsersList );
    activeUsersList.length !== 0 && 
    activeUsersList.forEach( item => socket.broadcast.to(item.socketId).emit("invite",{ room : names[0] + names[1] }) );
  });
  socket.on('joinRoom', function(data) {
    socket.join(data.room);
    console.log( socket.rooms );
  });
  socket.on( 'sendMsg' , async (data) => {
    console.log(data);
    // const activeUsersList = await activeUsers.find({ email : data.with });
    // console.log( activeUsersList );
    // activeUsersList.length !== 0 && 
    // activeUsersList.forEach( item => socket.broadcast.to(item.socketId).emit("reciveMsg",{  }) );
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
