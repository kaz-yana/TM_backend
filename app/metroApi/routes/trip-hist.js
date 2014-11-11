var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dateNow;
var firstStatus = 1;

var TripHistories = new Schema({
  user_no: String,
  trip_no: Number,
  do_no: Number,
  station_no: String,
  mission_no: String,
  status: String,
  created_at: Date,
  updated_at: Date,
  deleted_at: Date
});

mongoose.model('tripHist', TripHistories, 'trip_history');

function getDoNum(userNum, tripNum, cb) {
        var doNumBefore = 0;
        var doNumAfter = 0;

        var tripHistModel = mongoose.model('tripHist');
        tripHistModel.findOne({user_no: userNum, trip_no: tripNum, deleted_at: ''}).sort({created_at: -1}).exec(function(err, tripH){
console.log(tripH);
          if(tripH){
            doNumBefore =  tripH.do_no;
          }
 
          doNumAfter = doNumBefore + 1;

          cb(doNumAfter);
        });
}

/* POST doHist. */
router.post('/', function(req, res, next) {
  var userNo ='';
  var tripNo ='';
  var doNo ='';
  var stationNo ='';
  var missionNo ='';
  var missionStatus;
  var resultRes = [];
  dateNow = Date.now();

  if(!req.body.user_no || !req.body.trip_no || !req.body.station_no || !req.body.mission_no){
    var err = new Error('Invalid parameter');
    err.status = 400;
    next(err);
  }else{
    // クエリのbodyから設定値を取得する
    userNo = req.body.user_no;
    tripNo = req.body.trip_no;
    stationNo = req.body.station_no;
    missionNo = req.body.mission_no;
    missionStatus = firstStatus;

    // DB接続
    mongoose.connect('mongodb://localhost/metro');

    // 旅番号の取得
    getDoNum(userNo, tripNo, function(doNum){
      var TripHistory = mongoose.model('tripHist');

      // ユーザ情報登録
      var trip = new TripHistory();
      // クエリのbodyから設定値を取得する  
      trip.user_no = userNo;
      trip.trip_no = tripNo;
      trip.do_no = doNum;
      trip.station_no = stationNo;
      trip.mission_no = missionNo;
      trip.status = missionStatus;
      trip.created_at = dateNow;
      trip.updated_at = dateNow;

      trip.save(function(err) {
        if (err) { console.log(err); }
        // DB切断
        mongoose.disconnect();

        resultRes.push({user_no: userNo, trip_no: tripNo, do_no: doNum});
        // JSONに変換
        var responseJSON = JSON.stringify(resultRes);
        // 返信
        res.send(responseJSON);

      }); 
    });
  }
});

/* GET tripHist. */
router.get('/', function(req, res, next) {
  var queryPara = {deleted_at: ''}
  var resultRes = [];

  if(!req.query.user_no){
    var err = new Error('Invalid parameter');
    err.status = 400;
    next(err);
  }else{

    // クエリパラメータから検索用のパラメータ取得
    queryPara.user_no = req.query.user_no;
    if(req.query.trip_no){queryPara.trip_no = req.query.trip_no;}
    if(req.query.do_no){queryPara.do_no = req.query.do_no;}

    // DB接続
    mongoose.connect('mongodb://localhost/metro');
 
    var tripHistory = mongoose.model('tripHist');

    // 検索
    tripHistory.find(queryPara).sort({updated_at: -1}).exec(function(err, tripHists){
console.log(tripHists);
      for (var i=0, size=tripHists.length; i<size; ++i) {
        resultRes.push({ user_no: tripHists[i].user_no,
                   trip_no: tripHists[i].trip_no,
                   do_no: tripHists[i].do_no,
                   status: tripHists[i].status,
                   station_no: tripHists[i].station_no,
                   mission_no: tripHists[i].mission_no,
                   created_at: tripHists[i].created_at,
                   updated_at: tripHists[i].updated_at,
        });
      }
      // DB切断
      mongoose.disconnect();
      //JSONに変換
      var responseJSON = JSON.stringify(resultRes);
      // 返信
      res.send(responseJSON);
    });
  }
});

/* PUT tripHist. */
router.put('/', function(req, res, next) {
  var userNo ='';
  var tripNo ='';
  var doNo ='';
  var stationNo ='';
  var missionNo ='';
  var missionStatus ='';
  var resultRes = [];
  dateNow = Date.now();

  if(!req.body.user_no || !req.body.trip_no || !req.body.station_no || !req.body.mission_no || !req.body.do_no || !req.body.status){
    var err = new Error('Invalid parameter');
    err.status = 400;
    next(err);
  }else{
    userNo = req.body.user_no;
    tripNo = req.body.trip_no;
    doNo = req.body.do_no;
    stationNo = req.body.station_no;
    missionNo = req.body.mission_no;
    missionStatus = req.body.status;

    mongoose.connect('mongodb://localhost/metro');
    var TripHistory = mongoose.model('tripHist');
    TripHistory.update({ user_no: userNo, trip_no: tripNo, do_no: doNo, deleted_at: ''},
              { station_no: stationNo, mission_no: missionNo, status: missionStatus, updated_at: dateNow},
              { multi: false},
              function(err) {
              if (err) { console.log(err); }
                // DB切断
                mongoose.disconnect();
                // レスポンス作成
                resultRes.push({user_no: userNo, trip_no: tripNo, do_no: doNo, status: missionStatus});
                var responseJSON = JSON.stringify(resultRes);
                res.send(responseJSON);
    });
  }
});

/* DELETE tripHist. */
router.delete('/', function(req, res, next) {
  var queryPara = {deleted_at: ''};
  var resultRes = [];
  dateNow = Date.now();

  if(!req.body.user_no){
    var err = new Error('Invalid parameter');
    err.status = 400;
    next(err);
  }else{
    queryPara.user_no = req.body.user_no;
    if(req.body.trip_no){
      queryPara.trip_no = req.body.trip_no;

      if(req.body.do_no){queryPara.do_no = req.body.do_no;}
    }

    mongoose.connect('mongodb://localhost/metro');
    var TripHistory = mongoose.model('tripHist');
    TripHistory.update(queryPara,
              { updated_at: dateNow, deleted_at: dateNow},
              { multi: true},
              function(err) {
              if (err) { console.log(err); }
              // DB切断
              mongoose.disconnect();
              // レスポンス作成
              resultRes.push({user_no: queryPara.user_no, trip_no: queryPara.trip_no, do_no: queryPara.do_no});
              var responseJSON = JSON.stringify(resultRes);
              res.send(responseJSON);
    });
  }
});
module.exports = router;
