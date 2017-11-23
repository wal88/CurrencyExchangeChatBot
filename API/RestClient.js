var  request = require('request');

exports.getTableData = function (url, session, username, callback){
    request.get(url, {'headers':{'ZUMO-API-VERSION': '2.0.0'}}, function(err,res,body){
        if(err){
            console.log(err);
        }else {
            callback(body, session, username);
        }
    });
};

exports.getExchangeRate = function (url, session, callback){
    
        request.get(url, function(err,res,body){
            if(err){
                console.log(err);
            }else {
                callback(body, session);
            }
        });
};

