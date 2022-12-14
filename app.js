const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');


const session = require('express-session');
const nocache = require("nocache");
const mongodb=require('./config/database')

const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');

const app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));


app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({ extname: 'hbs',defaultLayout: "layout",
 layoutsDir: __dirname + '/views/layouts/', 
 partialsDir: __dirname + '/views/partials/',
 adminDir:__dirname+'/views/admin/',
 userDir:__dirname+'/views/user/',
  helpers:{
  total:(qty,productprice)=>{
    return qty * productprice
  },
  subTotal: function(arr){
    let subtotal = 0;
    for (let i = 0; i < arr.length; i++) {
      subtotal =subtotal + arr[i].product.productprice * arr[i].quantity;
    }
    return subtotal;
  },
  eq: function(data,value){
    return data === value
  },
  
  json:function(data){
    return JSON.stringify(data)
  }
}
 }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(nocache());
app.use(session({secret:"key",resave:false,saveUninitialized:true,cookie:{maxAge:6000000}}));
app.use((req,res,next)=>{
  res.set('cache-control','no-store')
  next()
})


app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.render('user/404', { layout: 'adminerrorlayout' });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
