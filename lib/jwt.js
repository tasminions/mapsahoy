var jwt = require('jsonwebtoken');
var querystring = require("querystring");
var db = require('./db.js');

function authSuccess(request, accessToken, cb ){
  var token = generateAndStoreJWT(request, accessToken);
  cb( token );
}

function generateAndStoreJWT(request, accessToken){
  var token = generateToken(request, accessToken);
  var record = {
    "valid": true,
    "created": Date.now() * 1000
  };

  db.putRecord(accessToken, record, function(err){
    console.log("record saved ", record);
  });

  return token;
}

//generate the jwt
function generateToken(req, accessToken){
  var expireDefault = Math.floor(new Date().getTime()/1000) + 7*24*60*60;
  var token = jwt.sign({
    auth: accessToken,
    agent: req.headers['user-agent'],
    exp: expireDefault,   // Note: in seconds!
  }, process.env.JWT_SECRET);  // secret is defined in the environment variable JWT_SECRET
  return token;
}

// used when the user sends a request with JWT so that we can validate that its the right user in the right session
function validate(request, callback){
  var token = request.state.jwt;
  var decoded = verify(token);
  if (!decoded || !decoded.auth) {
    return callback("Authentication Error", null);
  } else {
    db.get(decoded.auth, function(err, record){
      if (err || !record || !record.valid) {
        return callback(err || "Authentication Error", null);
      } else {
        record.auth = decoded.auth
        return callback(null, record);
      }
    });
  }
}

function verify(token) {
  var decoded = false;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    decoded = false;
  }
  return decoded;
}

module.exports = {
  authSuccess: authSuccess,
  validate: validate
};
