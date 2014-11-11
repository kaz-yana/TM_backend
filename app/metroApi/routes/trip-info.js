var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dateNow;
var firstStatus = '1';

var TripInformations = new Schema({
  user_no: String,
  trip_no: Number,
  status: String,
  created_at: Date,
  updated_at: Date,
  deleted_at: Date
});

mongoose.model('tripInfo', TripInformations, 'trip_info');

function getTripNum(userNum, cb) {
        var tripNumBefore = 0;
        var tripNumAfter = 0;

        var tripInfoModel = mongoose.model('tripInfo');
        tripInfoModel.findOne({user_no: userNum, deleted_at: ''}).sort({created_at: -1}).exec(function(err, tripI){
console.log(tripI);
          if(tripI){
            tripNumBefore =  tripI.trip_no;
          }
 
          tripNumAfter = tripNumBefore + 1;

          cb(tripNumAfter);
        });
}

/* POST UserInfo. */
router.post('/', function(req, res, next) {
  var userNo ='';
  var tripNo ='';
  var resultRes = [];
  dateNow = Date.now();

  if(!req.body.user_no){
    var err = new Error('Invalid parameter');
    err.status = 400;
    next(err);
  }else{
 
    // クエリのbodyから設定値を取得する
    userNo = req.body.user_no;

    // DB接続
    mongoose.connect('mongodb://localhost/metro');

    // 旅番号の取得
    getTripNum(userNo, function(tripNum){
      var TripInformation = mongoose.model('tripInfo');

      // ユーザ情報登録
      var trip = new TripInformation();
      // クエリのbodyから設定値を取得する  
      trip.user_no = userNo;
      trip.trip_no = tripNum;
      trip.status = firstStatus;
      trip.created_at = dateNow;
      trip.updated_at = dateNow;

      trip.save(function(err) {
        if (err) { console.log(err); }
        // DB切断
        mongoose.disconnect();

        resultRes.push({user_no: userNo, trip_no: tripNum});
        // JSONに変換
        var responseJSON = JSON.stringify(resultRes);
        // 返信
        res.send(responseJSON);

      }); 
    });
  }
});

/* GET UserInfo. */
router.get('/', function(req, res, next) {
  var queryPara ={deleted_at: ''};
  var resultRes = [];

  if(!req.query.user_no){
    var err = new Error('Invalid parameter');
    err.status = 400;
    next(err);
  }else{
    // クエリパラメータから検索用のパラメータ取得
    queryPara.user_no = req.query.user_no;
    if(req.query.trip_no){queryPara.trip_no = req.query.trip_no;}

    // DB接続
    mongoose.connect('mongodb://localhost/metro');

    var TripInformation = mongoose.model('tripInfo');

    // 検索
    TripInformation.find(queryPara).sort({updated_at: -1}).exec(function(err, tripInfos){
console.log(tripInfos);
      for (var i=0, size=tripInfos.length; i<size; ++i) {
        resultRes.push({ user_no: tripInfos[i].user_no,
                   trip_no: tripInfos[i].trip_no, 
                   status: tripInfos[i].status,
                   created_at: tripInfos[i].created_at,
                   updated_at: tripInfos[i].updated_at
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

/* PUT tripInfo. */
router.put('/', function(req, res, next) {
  var userNo ='';
  var tripNo ='';
  var tripStatus ='';
  var resultRes = [];
  dateNow = Date.now();

  if(!req.body.user_no || !req.body.trip_no || !req.body.status){
    var err = new Error('Invalid parameter');
    err.status = 400;
    next(err);
  }else{
    userNo = req.body.user_no;
    tripNo = req.body.trip_no;
    tripStatus = req.body.status;

    mongoose.connect('mongodb://localhost/metro');
    var TripInformation = mongoose.model('tripInfo');
    TripInformation.update({ user_no: userNo, trip_no: tripNo, deleted_at: ''},
              {  status: tripStatus, updated_at: dateNow},
              { multi: false},
              function(err) {
              if (err) { console.log(err); }
              // DB切断
              mongoose.disconnect();
              // レスポンス作成
              resultRes.push({user_no: userNo, trip_no: tripNo, status: tripStatus});
              var responseJSON = JSON.stringify(resultRes);
              res.send(responseJSON);
    });
  }
});

/* Delete tripInfo. */
router.delete('/', function(req, res, next) {
  var query ={deleted_at: ''};
  var resultRes = [];
  dateNow = Date.now();

  if(!req.body.user_no){
    var err = new Error('Invalid parameter');
    err.status = 400;
    next(err);
  }else{
    query.user_no = req.body.user_no;
    if(req.body.trip_no){ query.trip_no = req.body.trip_no; }

    mongoose.connect('mongodb://localhost/metro');
    var TripInformation = mongoose.model('tripInfo');
    TripInformation.update(query,
              { updated_at: dateNow, deleted_at: dateNow},
              { multi: true},
              function(err) {
              if (err) { console.log(err); }
              // DB切断
              mongoose.disconnect();
              // レスポンス作成
              resultRes.push({user_no: query.user_no, trip_no: query.trip_no});
              var responseJSON = JSON.stringify(resultRes);
              res.send(responseJSON);
    });
  }
});

module.exports = router;
