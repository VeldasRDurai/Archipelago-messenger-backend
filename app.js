const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio( server , {cors:{ origin:'*' }});
const socket = require('./socket/socket');
socket(io);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors( { origin : "http://localhost:3000" , credentials : true } )); 

const indexRouter = require('./routes/index');
const signInRouter = require('./routes/sign-in');
const logInRouter = require('./routes/log-in');
const signUpRouter = require('./routes/sign-up');

app.use('/log-in' ,express.static(path.join(__dirname, 'public')));
app.use('/sign-up',express.static(path.join(__dirname, 'public')));
app.use('/sign-in',express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/log-in',logInRouter);
app.use('/sign-up',signUpRouter);
app.use('/sign-in',signInRouter);
app.use('/', indexRouter);

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