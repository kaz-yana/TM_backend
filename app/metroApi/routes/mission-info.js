var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dateNow;

var MissionInfomations = new Schema({
  station_no: String,
  mission_no: String,
  mission_image_url: String,
  mission_title: String,
  mission_summary: String,
  target_place_no: String,
  targets : { type: mongoose.Schema.Types.ObjectId, ref: 'targetPlace' },
  created_at: Date,
  updated_at: Date,
  deleted_at: Date
});

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

mongoose.model('targetPlace', TargetPlaceInfomations, 'target_place_info');
mongoose.model('missionInfo', MissionInfomations, 'mission_info');

/* GET missionInfo. */
router.get('/', function(req, res, next) {
  var stationNo ='';
  var missionNo =''; 
  var queryPara = {};
  var resultRes = [];

  if(!req.query.station_no){
    var err = new Error('Invalid parameter');
    err.status = 400;
    next(err);
  }else{

    // クエリパラメータから検索用のパラメータ取得
    queryPara.station_no = req.query.station_no;
    if(req.query.mission_no){queryPara.mission_no = req.query.mission_no;}

    // DB接続
    mongoose.connect('mongodb://localhost/metro');

    var missionInfomation = mongoose.model('missionInfo');

    // 検索
    missionInfomation.find(queryPara).populate('targets').exec(function(err, missionInfos){
console.log(missionInfos);
     for (var i=0, size=missionInfos.length; i<size; ++i) {
        resultRes.push({ station_no: missionInfos[i].station_no,
                   mission_no: missionInfos[i].mission_no,
                   mission_title: missionInfos[i].mission_title,
                   mission_image_url: missionInfos[i].mission_image_url,
                   mission_summary: missionInfos[i].mission_summary,
                   target_place_no: missionInfos[i].target_place_no,
                   target_place_info: missionInfos[i].targets
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

/* POST mission info. */
router.post('/', function(req, res, next) {
  var stationNo ='';
  var missionNo ='';
  var missionImageUrl ='';
  var missionTitle ='';
  var missionSummary ='';
  var targetPlaceNo ='';
  var resultRes = [];
  dateNow = Date.now();

    stationNo = req.body.station_no;
    missionNo = req.body.mission_no;
    missionImageUrl = req.body.mission_image_url;
    missionTitle = req.body.mission_title;
    missionSummary = req.body.mission_summary;
    targetPlaceNo  = req.body.target_place_no;

    mongoose.connect('mongodb://localhost/metro');

    var MissionInfo = mongoose.model('missionInfo');

    var mission = new MissionInfo();
    mission.station_no = stationNo;
    mission.mission_no = missionNo;
    mission.mission_image_url = missionImageUrl;
    mission.mission_title = missionTitle;
    mission.mission_summary = missionSummary;
    mission.targe_place_no = targetPlaceNo;
    mission.created_at = dateNow;
    mission.updated_at = dateNow;

    mission.save(function(err) {
      if (err) { console.log(err); }
      mongoose.disconnect();

      resultRes.push({station_no: stationNo, mission_no: missionNo});
      var responseJSON = JSON.stringify(resultRes);
      res.send(responseJSON);

    });
});

module.exports = router;
