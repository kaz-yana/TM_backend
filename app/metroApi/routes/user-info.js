var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dateNow;

var UserInformations = new Schema({
  user_no: String,
  user_name: String,
  uid: String,
  created_at: Date,
  updated_at: Date,
  deleted_at: Date
});

var UserSequences = new Schema({
  sequence_no: Number,
  updated_at: Date
});

mongoose.model('userInfo', UserInformations, 'user_info');
mongoose.model('userSequence', UserSequences, 'user_sequence');

function repeatText(s,num) {
      var t,n;
      t = "";
      for (n=0;n<num;n++) {
        t += s;
      }
      return t;
}

function getZeroDigit(num,digit) {
        var s;
        if (isNaN(num)) {
        s = num; //10進数以外にも対応
        } else {
        s = num.toString(); //数値のままではlengthが使えない
        }
        if (digit > s.length) s = repeatText("0",digit - s.length) + s;
        return s;
}

function getSequenceNum(cb) {
        var sequenceNumBefore = 0;
        var sequenceNumAfter = 0;

        var Sequence = mongoose.model('userSequence');
        Sequence.findById('544b45c6ce3c4e6d7748c89d', function(err, userSe){
console.log(userSe);
            sequenceNumBefore =  userSe.sequence_no;
            sequenceNumAfter = sequenceNumBefore + 1;

            Sequence.update({ _id: '544b45c6ce3c4e6d7748c89d'},
              { sequence_no: sequenceNumAfter, updated_at: dateNow},
              { multi: false},
              function(err) {
              if (err) { console.log(err); }
console.log(sequenceNumAfter);
              cb(sequenceNumAfter);
            });
        });
}

/* POST UserInfo. */
router.post('/', function(req, res, next) {
  var userName = '';
  var uid = '';
  var userNo ='';
  var resultRes = [];
  var sequenceNum = 0;
  var sequenceString ='';
  dateNow = Date.now();
  // クエリのbodyから設定値を取得する
  // リクエストの確認
  if(!req.body.uid || !req.body.user_name){
    var err = new Error('Invalid parameter');
    err.status = 400;
    next(err);
  }else{

    uid = req.body.uid;
    userName = req.body.user_name;

    // ユーザNo取得
    // DB接続
    mongoose.connect('mongodb://localhost/metro');

    // シーケンス番号の取得
    getSequenceNum( function(sequenceNum){
      // 10桁に変更
      sequenceString = getZeroDigit(sequenceNum, 10);

      var UserInformation = mongoose.model('userInfo');

      // ユーザ情報登録
      var user = new UserInformation();
      // クエリのbodyから設定値を取得する
      user.uid = uid;
      user.user_name = userName;
      user.user_no = sequenceString;
      user.created_at = dateNow;
      user.updated_at = dateNow;

      user.save(function(err) {
        if (err) { console.log(err); }
        // DB切断
        mongoose.disconnect();

        resultRes.push({ user_no: sequenceString});
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
  var resultRes = [];
  var queryPara = {};

  if(!req.query.uid && !req.query.user_name && !req.query.user_no){
    var err = new Error('Invalid parameter');
    err.status = 400;
    next(err);
  }else{

    // クエリパラメータから検索用のパラメータ取得
    if(req.query.uid){queryPara.uid = req.query.uid;}
    if(req.query.user_name){queryPara.user_name = req.query.user_name;}
    if(req.query.user_no){queryPara.user_no = req.query.user_no;}

    // DB接続
    mongoose.connect('mongodb://localhost/metro');

    var UserInformation = mongoose.model('userInfo');

    // 検索
    UserInformation.find(queryPara, function(err, userInfos){
      for (var i=0, size=userInfos.length; i<size; ++i) {
        resultRes.push({ user_name: userInfos[0].user_name,
                   uid: userInfos[0].uid, 
                   user_no: userInfos[0].user_no
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
