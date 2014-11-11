var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var userInfo = require('./routes/user-info');
var tripInfo = require('./routes/trip-info');
var tripHist = require('./routes/trip-hist');
var tripPhoto = require('./routes/trip-photo');
var missionInfo = require('./routes/mission-info');
var targetPlaceInfo = require('./routes/target-place-info');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '1024mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit: '1024mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/metro/api/v1/user/infomations', userInfo);
app.use('/metro/api/v1/trip/infomations', tripInfo);
app.use('/metro/api/v1/trip/histories', tripHist);
app.use('/metro/api/v1/trip/photos', tripPhoto);
app.use('/metro/api/v1/mission/infomations', missionInfo);
app.use('/metro/api/v1/target-place/infomations', targetPlaceInfo);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.log(err);
    console.log(err.status);
    res.status(err.status || 500);
    console.log(res);
    res.send( {
        message: err.message,
        error: {}
    });
});

app.listen(80);

module.exports = app;
