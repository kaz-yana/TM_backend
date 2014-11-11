var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dateNow;

var TripPhotos = new Schema({
  user_no: String,
  trip_no: Number,
  do_no: Number,
  photo_no: Number,
  photo_name: String,
  photo_content: String,
  created_at: Date,
  updated_at: Date,
  deleted_at: Date
});

mongoose.model('tripPhoto', TripPhotos, 'trip_photo');

function getPhotoNum(userNum, tripNum, doNum, cb) {
        var photoNumBefore = 0;
        var photoNumAfter = 0;

        var tripPhoModel = mongoose.model('tripPhoto');
        tripPhoModel.findOne({user_no: userNum, trip_no: tripNum, do_no: doNum, deleted_at: ''}).sort({created_at: -1}).exec(function(err, tripP){
console.log(tripP);
          if(tripP){
            photoNumBefore =  tripP.photo_no;
          }
 
          photoNumAfter = photoNumBefore + 1;

          cb(photoNumAfter);
        });
}

/* POST trip photo. */
router.post('/', function(req, res, next) {
  var userNo ='';
  var tripNo ='';
  var doNo ='';
  var photoName ='';
  var photoContent ='';
  var resultRes = [];
  dateNow = Date.now();

  if(!req.body.user_no || !req.body.trip_no || !req.body.do_no || !req.body.photo_name || !req.body.photo_content){
    var err = new Error('Invalid parameter');
    err.status = 400;
    next(err);
  }else{
    // クエリのbodyから設定値を取得する
    userNo = req.body.user_no;
    tripNo = req.body.trip_no;
    doNo = req.body.do_no;
    photoName = req.body.photo_name;
    photoContent = req.body.photo_content;

    // DB接続
    mongoose.connect('mongodb://localhost/metro');

    // 旅番号の取得
    getPhotoNum(userNo, tripNo, doNo, function(photoNum){
      var TripPhoto = mongoose.model('tripPhoto');

      // ユーザ情報登録
      var trip = new TripPhoto();
      // クエリのbodyから設定値を取得する  
      trip.user_no = userNo;
      trip.trip_no = tripNo;
      trip.do_no = doNo;
      trip.photo_no = photoNum;
      trip.photo_name = photoName;
      trip.photo_content = photoContent;;
      trip.created_at = dateNow;
      trip.updated_at = dateNow;

      trip.save(function(err) {
        if (err) { console.log(err); }
        // DB切断
        mongoose.disconnect();

        resultRes.push({user_no: userNo, trip_no: tripNo, do_no: doNo, photo_no: photoNum});
        // JSONに変換
        var responseJSON = JSON.stringify(resultRes);
        // 返信
        res.send(responseJSON);

      }); 
    });
  }
});

/* GET tripPhoto. */
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
    if(req.query.photo_no){queryPara.photo_no = req.query.photo_no;}

    // DB接続
    mongoose.connect('mongodb://localhost/metro');
 
    var tripPhoto = mongoose.model('tripPhoto');

    // 検索
    tripPhoto.find(queryPara).sort({updated_at: -1}).exec(function(err, tripPhotos){
console.log(tripPhotos);
      for (var i=0, size=tripPhotos.length; i<size; ++i) {
        resultRes.push({ user_no: tripPhotos[i].user_no,
                   trip_no: tripPhotos[i].trip_no,
                   do_no: tripPhotos[i].do_no,
                   photo_no: tripPhotos[i].photo_no,
                   photo_name: tripPhotos[i].photo_name,
                   photo_content: tripPhotos[i].photo_content,
                   created_at: tripPhotos[i].created_at,
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

module.exports = router;
