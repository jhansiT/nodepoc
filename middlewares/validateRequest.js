var jwt = require('jwt-simple');
module.exports = function(req, res,next) {

    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['token'];
    var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];
    //var username=req.headers['x-username'];
    if (token || key) {
        try {
            var decoded = jwt.decode(token, require('../config/secret.js')());
            if (decoded.exp <= Date.now()) {
            	console.log("expe");
                    //res.status(400);
                    res.json({
                        "status": 400,
                        "message": "Token Expired.Please Re-login"
            });
            return;
                //res.redirect('http://localhost:3039/#/');
                //res.json({"msg":"your token expired"});
                //res.end("ended");
                //return;
            }
            var dbUser = validateUser(key);
            // The key would be the logged in user's username
            if (dbUser) {
                if ((req.url.indexOf('admin') >= 0 && dbUser.role == 'admin') || (req.url.indexOf('admin') < 0 && req.url.indexOf('/') >= 0)) {
                    next(); // To move to next middleware
                } else {
                   // res.status(403);
                    res.json({
                        "status": false,
                        "message": "Not Authorized"
                    });
                    return;
                }
            } else {
                // No user with this name exists, respond back with a 401
                //res.status(401);
                res.json({
                    "status": false,
                    "message": "Invalid User"
                });
                return;
            }
        } catch (err) {
            //res.status(500);
            res.json({
                "status": false,
                "message": "Oops something went wrong",
                "error": err
            });
        }
    } else {
        //res.status(401);
        res.json({
            "status": false,
            "message": "Invalid Token or Key"
        });
        return;
    }

    function validateUser(key) {
        console.log("key");
        var dbUserObj = { // spoofing a userobject from the DB.

            name: 'durgaprasad',
            role: 'developer',
            username: 'durgaprasad.yarramsetti@trakitnow.com'

        };
        return dbUserObj;
    }
};
