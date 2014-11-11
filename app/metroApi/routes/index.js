exports.error = function(err, req, res, next){

  console.log(err.statusCode + ':' +  err.detail);

  res.status = err.statusCode;
  res.send({error: err.detail});
};
