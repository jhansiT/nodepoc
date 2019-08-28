var express = require('express');
var router = express.Router();
var jsonToken = require('jwt-simple');
var nodemailer = require('nodemailer');
var mongojs = require("mongojs"),
  config = require('config.json'),
  db = mongojs(config.connectionString);
var crypto = require('crypto');
var moment = require("moment")
require("moment-duration-format");
var ObjectID = mongojs.ObjectID;

var algorithm = 'aes-256-ctr',
password = 'd6F3Efeq';
var encrypt = function(text) {
var cipher = crypto.createCipher(algorithm, password);
var crypted = cipher.update(text, 'utf8', 'hex')
crypted += cipher.final('hex');
return crypted;
}
//console.log(encrypt("test"));

var decrypt = function(text) {
var decipher = crypto.createDecipher(algorithm, password)
var dec = decipher.update(text, 'hex', 'utf8')
dec += decipher.final('utf8');
return dec;
}
//console.log(decrypt("108bc784"))
var authenticate = require('../middlewares/validateRequest');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/*  "/states"
 *    GET: finds all states
*/
router.get('/states', function (req, res) {  
    db.states.find(function (err, docs) {
      res.json(docs);
    })
  });
  
  /*  "/districts"
   *    GET: finds all districts
  */  
  router.get('/districts', function (req, res) {
    db.districts.find(function (err, docs) {
      res.json(docs);
    });
  });  
  /*  "/districts"
   *    GET: finds districts  based on District ID
  */  
  router.get("/district", function (req, res) {
    db.districts.find({ stateID: req.query.stateID }).toArray(function (err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get districts based on ID");
      } else {
        res.json(doc);
      }
    });
  });
  
  
      // GET: finds all blocks   
  router.get('/blocks', function (req, res) {
    db.block.find(function (err, docs) {
      res.json(docs);
    });
  });
  
  // GET: finds blocks  based on block ID

  router.get('/block', function (req, res) {
    db.block.find({ districtID: req.query.districtID}).toArray(function (err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get districts based on ID");
      } else {
        res.json(doc);
      }
    });
  });  
   
  /*  "/clusters"
   *    GET: finds all clusters
  */
  
  router.get("/clusters", function (req, res) {
    db.clusters.find(function (err, docs) {
      res.json(docs);
    });
  }); 
  
      // GET: finds clusters based on cluster ID
 
  router.get("/cluster", function (req, res) {
    db.clusters.find({ blockID: req.query.blockID }).toArray(function (err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get contact");
      } else {
        res.json(doc);
      }
    });
  });
  
  /*  "/viillages"
   *    GET: finds all Villages
  */
  
  router.get("/villages", function (req, res) {
    db.villages.find(function (err, docs) {
      if (err) {
        handleError(res, err.message, "Failed to get contacts.");
      } else {
        res.status(200).json(docs);
      }
    });
  });
  
  /*  "/village"
   *    GET: finds villages based on village ID
  */
  
  router.get("/village", function (req, res) {
    db.villages.find({ clusterID: req.query.clusterID }).toArray(function (err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get contact");
      } else {
        res.status(200).json(doc);
      }
    });
  });

   
  //  GET: finds all tabInformation
  
  router.get("/tabInformation", function (req, res) {
    db.tabInformation.find(function (err, docs) {
      res.json(docs);
    });
  });
  
  //projectManager
  
  router.get("/projectManager", function (req, res) {
    db.projectManager.find(function (err, docs) {
      if (err) {
        handleError(res, err.message, "Failed to get contacts.");
      } else {
        res.status(200).json(docs);
      }
    });
  });
  
  //projectCoordinator
  
  router.get("/projectCoordinator", function (req, res) {
    db.projectCoordinator.find(function (err, docs) {
      if (err) {
        handleError(res, err.message, "Failed to get contacts.");
      } else {
        res.status(200).json(docs);
      }
    });
  });
  
  //swasthyaSaathi
  
  router.get("/swasthyaSaathi", function (req, res) {
    db.swasthyaSaathi.find(function (err, docs) {
      if (err) {
        handleError(res, err.message, "Failed to get contacts.");
      } else {
        res.json(docs);
      }
    });
  });

router.get("/swasthyaSaathi", function (req, res) {
    db.swasthyaSaathi.find({ villageID: req.query.villageID}).toArray(function (err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get contact");
      } else {
        res.json(doc);
      }
    });
  });


 
router.get("/viewerReports", function (req, res) {
    db.viewerReports.find(function (err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get contact");
      } else {
        res.json(doc);
      }
    });
  });
  
  

router.post('/authLog', function (req, res, next) {
  console.log(req.body);
  console.log(encrypt(req.body.password));
  db.collection('users').find({ username: req.body.username, password: encrypt(req.body.password) }, function (error, data) {
    if (error) {
      res.json({ status: "false", msg: error });
      return;
    }
    if (data.length === 0) {
      res.json({ status: "false", data: "Please enter valid username and password" });
      return;
    }
  
    res.json(genToken(data));
  });
});

function genToken(data) {
  var expires = expiresIn(5000000);
  //var expires = Date.now()+120000; // 7 days
  var token = jsonToken.encode({ exp: expires },
    require('../config/secret')());
  return {
    status: "true",
    path: '/home',
    data: data,
    token: token,
    expires: expires
  };
}

function expiresIn(numDays) {
  var dateObj = Date.now() + numDays;
  return dateObj;
}


//Save sessionReports from Android mobile

router.post('/sessionReports', function (req, res, next) {
  var data = req.body.sessionReports;

  var sessionData=JSON.parse(data);  
    var arr=[];    
    for (i = 0; i < sessionData.length; i++) {
      console.log(sessionData[i])
      db.collection('sessionReports').insert(sessionData[i], function (error, data) {
        if (error) {
          console.log(error);
          return;
        }
       arr.push(data);
       if(arr.length == sessionData.length){
         res.json({status:"success"})
       }     
      });
    
  }
});router.get('/sessionReports', function (req, res) {  
    db.sessionReports.find(function (err, docs) {
      res.json(docs);
    })
  });

//Get sessionReports bases on from date and toDate

router.post('/dates', function (req, res, next) {
    console.log(req.body)
  db.collection('sessionReports').find({ date: { $gte: new Date(req.body.fromDate), $lte: new Date(req.body.toDate) } }, function (error, data) {

    if (error) {
      res.json({ status: "false", msg: error });
      return;
    }
    res.json(data);
  });
});

 router.get("/sessionReports", function (req, res) {
    db.sessionReports.find({ imeiNumber: req.query.imeiNumber}).toArray(function (err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get sessionReports based on imeiNumber");
      } else {
        res.json(doc);
      }
    });
  });


module.exports = router;
