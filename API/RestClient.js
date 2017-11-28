var request = require('request');

var getTableData = function (url) {
    return new Promise(function (resolve, reject) {
        request.get('http://walapp.azurewebsites.net/tables/CurrencyTable', { 'headers': { 'ZUMO-API-VERSION': '2.0.0' } }, function (err, res, body) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
}
exports.getTableData = getTableData;

exports.getExchangeRate = function (url, session, callback) {

    request.get(url, function (err, res, body) {
        if (err) {
            console.log(err);
        } else {
            callback(body, session);
        }
    });
};

var convertAmount = function (url) {
    return new Promise(function (resolve, reject) {
        request.get(url, function (err, res, body) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
}
exports.convertAmount = convertAmount;

var postNewAccount = function (username, password) {
    return new Promise(function (resolve, reject) {
        var options = {
            url: 'http://walapp.azurewebsites.net/tables/CurrencyTable',
            method: 'POST',
            headers: {
                'ZUMO-API-VERSION': '2.0.0',
                'Content-Type': 'application/json'
            },
            json: {
                "username": username,
                "password": password
            }
        };
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200 || response.statusCode == 201) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}
exports.postNewAccount = postNewAccount;

var updateAccount = function (amount, currency, id) {
    return new Promise(function (resolve, reject) {
        
        var options = {
            url: 'http://walapp.azurewebsites.net/tables/CurrencyTable/' + id, // need to use ID to make the PATCH request
            method: 'PATCH',
            headers: {
                'ZUMO-API-VERSION': '2.0.0',
                'Content-Type': 'application/json'
            },
            json: {
                [currency]: amount
            }
        };
        
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200 || response.statusCode == 201) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}
exports.updateAccount = updateAccount;

var getUserData = function (id) {
    return new Promise(function (resolve, reject) {
        request.get('http://walapp.azurewebsites.net/tables/CurrencyTable/'+id, { 'headers': { 'ZUMO-API-VERSION': '2.0.0' } }, function (err, res, body) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
}
exports.getUserData = getUserData;

var getCurrencyCodeData = function (code) {
    return new Promise(function (resolve, reject) {
        request.get('https://restcountries.eu/rest/v2/currency/'+code, function (err, res, body) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
}
exports.getCurrencyCodeData = getCurrencyCodeData;
