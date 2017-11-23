var builder = require('botbuilder');
var ExchangeRate = require('./ExchangeRate');
var ConvertCurrency = require('./ConvertCurrency');
var CurrenciesHeld = require('./CurrenciesHeld');


exports.startDialog = function (bot) {
    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/1543b832-d22d-4a8a-96bc-a873cc526509?subscription-key=7f8105988bb944b1a97f266d314f52eb&verbose=true&timezoneOffset=12.0&q=')
    bot.recognizer(recognizer);

    // Bot dialog when user wants to see their stored currencies (ie. when ShowCurrenciesHeld intent is triggered)
    bot.dialog('ShowCurrenciesHeld', [

        function (session, args, next) {
            session.dialogData.args = args || {};
            if (!session.conversationData["username"]) {
                builder.Prompts.text(session, "Enter a username to setup your account.");
            } else {
                next(); // Skip if we already have this info.
            }
        },

        function (session, results, next) {
            if (results.response) {
                session.conversationData["username"] = results.response;
            }
            session.send("Retrieving your currencies");
            CurrenciesHeld.displayTableData(session, session.conversationData["username"]);  // <---- THIS LINE HERE IS WHAT WE NEED 
        }

    ]).triggerAction({
        matches: 'ShowCurrenciesHeld'
    });


    // Bot dialog when user wants to see exchange rates (ie. when GetExchangeRate intent is triggered)
    bot.dialog('GetExchangeRate', [

        function (session, args, next) {
            session.dialogData.args = args || {};
            if (!session.conversationData["username"]) {
                builder.Prompts.text(session, "Enter a username to setup your account.");
            } else {
                next(); // Skip if we already have this info.
            }
        },

        function (session, results, next) {
            if (results.response) {
                session.conversationData["username"] = results.response;
            }

            var currencyEntities = builder.EntityRecognizer.findAllEntities(session.dialogData.args.intent.entities, 'currency');

            ExchangeRate.showExchangeRate(session, session.conversationData["username"], currencyEntities);  // <---- THIS LINE HERE IS WHAT WE NEED 
        }

    ]).triggerAction({
        matches: 'GetExchangeRate'
    });

    // Bot dialog when user wants to see exchange rates (ie. when GetExchangeRate intent is triggered)
    bot.dialog('ConvertCurrency', [
        
                function (session, args, next) {
                    session.dialogData.args = args || {};
                    if (!session.conversationData["username"]) {
                        builder.Prompts.text(session, "Enter a username to setup your account.");
                    } else {
                        next(); // Skip if we already have this info.
                    }
                },
        
                function (session, results, next) {
                    if (results.response) {
                        session.conversationData["username"] = results.response;
                    }
        
                    var currencyEntities = builder.EntityRecognizer.findAllEntities(session.dialogData.args.intent.entities, 'currency');
                    var numberEntity = builder.EntityRecognizer.findAllEntities(session.dialogData.args.intent.entities, 'builtin.number');
        
                    ConvertCurrency.getConvertedAmount(session, session.conversationData["username"], currencyEntities, numberEntity);  // <---- THIS LINE HERE IS WHAT WE NEED 
                }
        
            ]).triggerAction({
                matches: 'ConvertCurrency'
            });

}