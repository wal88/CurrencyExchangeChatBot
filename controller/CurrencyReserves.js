var builder = require('botbuilder');
var RestClient = require('../API/Restclient');

exports.displayTableData = function (session, username) {
    var url = 'http://walapp.azurewebsites.net/tables/CurrencyTable';

    RestClient.getTableData(url, session, username, handleTableData)
};

function handleTableData(message, session, username) {
    var currencyTableData = JSON.parse(message);
    session.send(message);
}

var isExistingUser = function (username) {
    return new Promise(function (resolve, reject) {
        var url = 'http://walapp.azurewebsites.net/tables/CurrencyTable';
        RestClient.getTableData(url).then(function (message) {
            let currencyTableData = JSON.parse(message);

            for (var user of currencyTableData) {
                if (user.username == username) {
                    resolve(true);
                }
            }
            resolve(false);
        });
    });
}
exports.isExistingUser = isExistingUser;

var isCorrectPassword = function (password) {
    return new Promise(function (resolve, reject) {
        var url = 'http://walapp.azurewebsites.net/tables/CurrencyTable';
        RestClient.getTableData(url).then(function (message) {
            let currencyTableData = JSON.parse(message);

            for (var user of currencyTableData) {
                if (user.password == password) {
                    resolve(true);
                }
            }
            resolve(false);
        });
    });
}
exports.isCorrectPassword = isCorrectPassword;

var createNewAccount = function (username, password) {
    return new Promise(function (resolve, reject) {
        RestClient.postNewAccount(username, password).then(function (success) {
            resolve(success);
        });
    });
};
exports.createNewAccount = createNewAccount;

var getId = function (username) {
    return new Promise(function (resolve, reject) {
        var url = 'http://walapp.azurewebsites.net/tables/CurrencyTable';
        RestClient.getTableData(url).then(function (message) {
            let currencyTableData = JSON.parse(message);

            for (var user of currencyTableData) {
                if (user.username == username) {
                    resolve(user.id);
                }
            }
            reject(false);
        });
    });
};
exports.getId = getId;

exports.showReserves = function (session, body) {
    userRow = JSON.parse(body);
    let currencyHeroCards = [];
    session.sendTyping();

    for (let property in userRow) {

        if (property.length == 3 && userRow[property]) {
            let storedCurrency = property;
            // get currency information from REST countries API
            RestClient.getCurrencyCodeData(storedCurrency).then(function (body) {
                let countryInfo = JSON.parse(body);
                let currencyInfo;
                //unfortunately there's a list of currencies for some countries (even though we query with one currency), 
                // so just make sure to grab the right currency here
                for (let currency of countryInfo[0].currencies) {
                    if (currency.code == storedCurrency.toUpperCase()) {
                        currencyInfo = currency; break;
                    }
                }
                currencyHeroCards.push(new builder.ThumbnailCard(session)
                    .title(currencyInfo.symbol + userRow[storedCurrency])
                    .subtitle(currencyInfo.code)
                    .images([builder.CardImage.create(session, 'https://www.centralcharts.com/medias/logo_flags/' + currencyInfo.code + '.png')])
                    .text(currencyInfo.name)
                );
            });
        }
    }
    session.sendTyping();
    // wait for hero cards to load
    setTimeout(function () {
        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments(currencyHeroCards);
        session.send(msg).endDialog();
    }, 1500);
}

exports.calculateTotalValue = function (session, body, totalInThisCurrency) {
    userRow = JSON.parse(body);
    let itemsForRecieptCard = [];
    let totalConvertedAmount = 0;

    // get currency information for target currency from REST countries API
    RestClient.getCurrencyCodeData(totalInThisCurrency).then(function (body) {
        let countryInfo = JSON.parse(body);
        let currencyInfo;

        //unfortunately there's a list of currencies for some countries (even though we query with one currency), 
        // so just make sure to grab the right currency here
        for (let currency of countryInfo[0].currencies) {
            if (currency.code == totalInThisCurrency.toUpperCase()) {
                currencyInfo = currency; break;
            }
        }

        let convertedAmountsCard = {
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
                type: "AdaptiveCard",
                body: [
                    {
                        "type": "TextBlock",
                        "text": "Total worth converted to " + currencyInfo.name + ':',
                        "size": "large",
                        "weight": "bolder"
                    },
                    {
                        "type": "FactSet",
                        "facts": [{
                            "title": "Currencies stored",
                            "value": "Converts to"
                        }

                        ]
                    }
                ]
            }
        };

        for (let property in userRow) {

            if (property.length == 3 && userRow[property]) {
                let storedCurrency = property;

                RestClient.convertSingleAmount(session, userRow[property], storedCurrency, totalInThisCurrency).then(function (convertedAmount) {

                    convertedAmountsCard.content.body[1].facts.push({
                        "title": storedCurrency.toUpperCase() + userRow[storedCurrency],
                        "value": currencyInfo.symbol + convertedAmount
                    });
                    totalConvertedAmount += parseFloat(convertedAmount);
                });
            }
        }

        // wait for values to convert
        setTimeout(function () {
            convertedAmountsCard.content.body[1].facts.push({
                "title": 'Total in ' + currencyInfo.code,
                "value": currencyInfo.symbol + totalConvertedAmount.toFixed(2)
            });
            var msg = new builder.Message(session).addAttachment(convertedAmountsCard);
            session.send(msg).endDialog();
        }, 1500);
    });
    return;
}