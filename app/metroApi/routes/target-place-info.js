var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dateNow;

var TargetPlaceInfomations = new Schema({
  station_no: String,
  target_place_no: String,
  name: String,
  address: String,
  tel: String,
  business_hours: String,
  map_url: String,
  target_place_image_url: String,
  station_exit: String,
  abustract: String,
  pr1: String,
  pr2: String,
  pr3: String,
  created_at: Date,
  updated_at: Date,
  deleted_at: Date
});

mongoose.model('targetPlaceInfo', TargetPlaceInfomations, 'target_place_info');

/* GET targetPlaceInfo. */
router.get('/', function(req, res, next) {
  var stationNo ='';
  var targetPlaceNo =''; 
  var resultRes = [];

  if(!req.query.station_no || !req.query.target_place_no){
    var err = new Error('Invalid parameter');
    err.status = 400;
    next(err);
  }else{
    // クエリパラメータから検索用のパラメータ取得
    stationNo = req.query.station_no;
    targetPlaceNo = req.query.target_place_no;

    // DB接続
    mongoose.connect('mongodb://localhost/metro');

    var targetPlaceInfomation = mongoose.model('targetPlaceInfo');

    // 検索
    targetPlaceInfomation.findOne({station_no: stationNo, target_place_no: targetPlaceNo}, function(err, targetPlaceInfos){
console.log(targetPlaceInfos);
      if(targetPlaceInfos){
        resultRes.push({ station_no: targetPlaceInfos.station_no,
                   target_place_no: targetPlaceInfos.target_place_no,
                   name: targetPlaceInfos.name,
                   address: targetPlaceInfos.address,
                   tel: targetPlaceInfos.tel,
                   business_hours: targetPlaceInfos.business_hours,
                   map_url: targetPlaceInfos.map_url,
                   target_place_image_url: targetPlaceInfos.target_place_image_url,
                   station_exit: targetPlaceInfos.station_exit,
                   abustract: targetPlaceInfos.abustract,
                   pr1: targetPlaceInfos.pr1,
                   pr2: targetPlaceInfos.pr2,
                   pr3: targetPlaceInfos.pr3
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

router.post('/', function(req, res, next) {
  var stationNo ='';
  var targetPlaceNo ='';
  var name ='';
  var address ='';
  var tel ='';
  var businessHours ='';
  var mapUrl ='';
  var targetPlaceImageUrl ='';
  var stationExit ='';
  var abustract ='';
  var pr1 ='';
  var pr2 ='';
  var pr3 ='';
  var resultRes = [];
  dateNow = Date.now();

    stationNo = req.body.station_no;
    targetPlaceNo = req.body.target_place_no;
    name = req.body.name;
    address = req.body.address;
    tel = req.body.tel;
    businessHours  = req.body.business_hours;
    mapUrl = req.body.map_url;
    targetPlaceImageUrl = req.body.target_place_image_url;
    stationExit = req.body.station_exit;
    abustract = req.body.abustract;
    pr1 = req.body.pr1;
    pr2  = req.body.pr2;
    pr3  = req.body.pr3;

    mongoose.connect('mongodb://localhost/metro');

    var TargetPlaceInfo = mongoose.model('targetPlaceInfo');

    var mission = new TargetPlaceInfo();
    mission.station_no = stationNo;
    mission.target_place_no = targetPlaceNo;
    mission.name = name;
    mission.address = address;
    mission.tel = tel;
    mission.business_hours = businessHours;
    mission.map_url = mapUrl;
    mission.target_place_image_url = targetPlaceImageUrl;
    mission.station_exit = stationExit;
    mission.abustract = abustract;
    mission.pr1 = pr1;
    mission.pr2 = pr2;
    mission.pr3 = pr3;
    mission.created_at = dateNow;
    mission.updated_at = dateNow;

    mission.save(function(err) {
      if (err) { console.log(err); }
      mongoose.disconnect();

      resultRes.push({station_no: stationNo, target_place_no: targetPlaceNo});
      var responseJSON = JSON.stringify(resultRes);
      res.send(responseJSON);
    });
});

module.exports = router;
