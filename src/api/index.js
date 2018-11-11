'use strict';

const express = require('express');

//https://nodejs.org/api/path.html
const path = require('path'); //貌似沒用到? 能觸裡檔案路徑問題，win 跟 unix 差異

//https://www.cnblogs.com/chyingp/p/node-learning-guide-express-morgan.html
const logger = require('morgan'); //日誌功能

//https://www.cnblogs.com/chyingp/p/express-cookie-parser-deep-in.html
const cookieParser = require('cookie-parser'); //處裡 cookie 相關

//https://www.cnblogs.com/chyingp/p/nodejs-learning-express-body-parser.html
//https://github.com/expressjs/body-parser
const bodyParser = require('body-parser'); // 處裡收到的 req 的 body(不同的請求、編碼)

const cors = require('cors'); //cross domain (允許非此domain的人可call API))

const index = require('./routes/index');
const nccuToken = require('./routes/token');
const general = require('./routes/general');

// const routes = require('./routes/index');

const app = express();

/**** server configuration ****/

app.use(cookieParser()); //使用 cookieParser

//處理 post 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // js跟browser encode規則不一樣
app.use(cors());
app.use(logger('dev')); //調用 morgan 的日誌功能

app.use('/', index);
app.use('/token', nccuToken);
app.use('/general', general); // /general/ -> post, /general/sendRawTransaction

/**** error handlers ****/

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err,
    });
  });
}

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {},
  });
});

app.listen(8888);
console.log("now listening");

module.exports = app;
