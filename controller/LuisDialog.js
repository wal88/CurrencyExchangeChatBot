var builder = require('botbuilder');
var RestClient = require('../API/Restclient');
var ExchangeRate = require('./ExchangeRate');
var ConvertCurrency = require('./ConvertCurrency');
var CurrencyReserves = require('./CurrencyReserves');


exports.startDialog = function (bot) {
    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/1543b832-d22d-4a8a-96bc-a873cc526509?subscription-key=7f8105988bb944b1a97f266d314f52eb&verbose=true&timezoneOffset=12.0&q=')
    bot.recognizer(recognizer);


    // Bot dialog when user wants to see exchange rates (ie. when GetExchangeRate intent is triggered)
    bot.dialog('GetExchangeRate', [

        function (session, args, next) {
            session.dialogData.args = args || {};

            var currencyEntities = builder.EntityRecognizer.findAllEntities(session.dialogData.args.intent.entities, 'currency');

            ExchangeRate.showExchangeRate(session, session.conversationData["username"], currencyEntities);
        }
    ]).triggerAction({
        matches: 'GetExchangeRate'
    });


    // Bot dialog when user wants to convert currency (ie. when ConvertCurrency intent is triggered)
    bot.dialog('ConvertCurrency', [

        function (session, args, next) {
            session.dialogData.args = args || {};

            var currencyEntities = builder.EntityRecognizer.findAllEntities(session.dialogData.args.intent.entities, 'currency');
            var numberEntity = builder.EntityRecognizer.findAllEntities(session.dialogData.args.intent.entities, 'builtin.number');

            ConvertCurrency.getConvertedAmount(session, currencyEntities, numberEntity);
        }
    ]).triggerAction({
        matches: 'ConvertCurrency'
    });

    // dialog to add new currency or update existing one
    bot.dialog('AddOrUpdateCurrencyReserve', [
        function (session, args, next) {
            session.dialogData.args = args || {};

            if (!session.conversationData["loggedIn"]) {
                session.beginDialog('LogInOrCreateAccount');
            } else {
                next(); // Skip if user logged in
            }
        },

        function (session, results, next) {

            var currencyEntities = builder.EntityRecognizer.findAllEntities(session.dialogData.args.intent.entities, 'currency');
            var numberEntity = builder.EntityRecognizer.findAllEntities(session.dialogData.args.intent.entities, 'builtin.number');

            if (!currencyEntities || !numberEntity) {
                session.send('I didn\'t understand. Please state the amount and currency you want to add');
                session.endConversation();
            }

            let amount = parseFloat(numberEntity[0].entity);
            let currency = currencyEntities[0].entity;
            let username = session.conversationData["currentUsername"];
            session.send('Updating the your ' + currency + ' reserve to ' + amount + ' in your account..');
            session.sendTyping();

            // need to find out id of user's database entry
            CurrencyReserves.getId(username).then(function (id) {
                // now update database
                RestClient.updateAccount(amount, currency, id).then(function (success) {
                    if (success) {
                        session.send('Currency reserve successfully updated in your account');
                    } else {
                        session.send('Could not update your currency reserves due to database error, please try again');
                    }
                });
            });
        }
    ]).triggerAction({
        matches: 'AddOrUpdateCurrencyReserve'
    });

    // Intiates logging in or account creation, starting with username
    bot.dialog('LogInOrCreateAccount', [
        (session, args, next) => {

            if (args && args.reprompt) {
                builder.Prompts.text(session, "Please enter the username for your account, or say cancel if you no longer want to login or create new account");
            } else {
                builder.Prompts.text(session, 'Please type your username to login or create new account');
            }
        },
        (session, results, next) => {
            if (results.response && RegExp("end|stop|quit|cancel|restart").test(results.response)) {
                session.endConversation();
            } else if (!results.response || results.response.trim().length == 0) {
                session.replaceDialog('LogInOrCreateAccount', { reprompt: true });
            } else {
                session.sendTyping();
                let typedUsername = results.response.trim();
                session.conversationData["currentUsername"] = typedUsername;
                CurrencyReserves.isExistingUser(typedUsername).then(function (isExistingUser) {
                    if (isExistingUser) {
                        session.beginDialog('InputPassword');
                    } else {
                        session.beginDialog('InputNewPassword');
                    }
                });
            }
        },
        function (session, results, next) {
            session.conversationData["loggedIn"] = true;
            session.endDialogWithResult(results);   // return back to whatever dialog needed loggedIn status after successful sign in
        }
    ]).triggerAction({
        matches: 'LogInOrCreateAccount'
    });;

    // receives and checks password from user
    bot.dialog('InputPassword', [
        (session, args, next) => {

            if (args && args.reprompt) {
                builder.Prompts.text(session, "Please enter a password to log in to this account, or say cancel if you do not want to stop log in");
            } else if (args && args.wrongPassword) {
                builder.Prompts.text(session, "You have entered an incorrect password. Please try again, or say cancel to stop");
            } else {
                builder.Prompts.text(session, 'Please type the password for this account');
            }
        },
        (session, results, next) => {
            if (results.response && RegExp("end|stop|quit|cancel|restart").test(results.response)) {
                session.endConversation();
            } else if (!results.response || results.response.trim().length == 0) {
                session.replaceDialog('InputPassword', { reprompt: true });
            } else {
                session.sendTyping();
                CurrencyReserves.isCorrectPassword(results.response.trim()).then(function (isCorrectPassword) {
                    if (isCorrectPassword) {
                        session.send('You have successfully logged in.');
                        session.endDialogWithResult(results);
                    } else {
                        session.replaceDialog('InputPassword', { wrongPassword: true });
                    }
                });
            }
        }
    ]);

    // gets and stores password from user for a new account
    bot.dialog('InputNewPassword', [
        (session, args, next) => {

            if (args && args.reprompt) {
                builder.Prompts.text(session, "Please enter a password for to create an account, or say cancel if you no longer want to create new account")
            } else {
                builder.Prompts.text(session, 'Please type a password for your new account');
            }
        },
        (session, results, next) => {
            if (results.response && RegExp("end|stop|quit|cancel|restart").test(results.response)) {
                session.endConversation();
            } else if (!results.response || results.response.trim().length == 0) {
                session.replaceDialog('InputNewPassword', { reprompt: true });
            } else {
                // post new account into database
                let username = session.conversationData["currentUsername"];
                let password = results.response.trim();
                session.sendTyping();
                CurrencyReserves.createNewAccount(username, password).then(function (postSuccess) {
                    if (postSuccess) {
                        session.send('Your account has been created, you are now logged in.');
                        session.endDialogWithResult(results);
                    } else {
                        session.send('There was a problem creating your new account, please try again');
                        session.endConversation();
                    }
                });
            }
        }
    ]);


    // dialog to delete currency reserve stored
    bot.dialog('DeleteCurrencyReserve', [
        function (session, args, next) {
            session.dialogData.args = args || {};

            if (!session.conversationData["loggedIn"]) {
                session.beginDialog('LogInOrCreateAccount');
            } else {
                next(); // Skip if user logged in
            }
        },

        function (session, results, next) {

            var currencyEntities = builder.EntityRecognizer.findAllEntities(session.dialogData.args.intent.entities, 'currency');

            if (!currencyEntities) {
                session.send('I didn\'t understand. Please state the currency in your account that you want to delete');
                session.endConversation();
            }

            let currency = currencyEntities[0].entity;
            let username = session.conversationData["currentUsername"];
            session.send('Deleting ' + currency + ' reserve from your account..');
            session.sendTyping();

            // need to find out id of user's database entry
            CurrencyReserves.getId(username).then(function (id) {
                // now update database
                RestClient.updateAccount(null, currency, id).then(function (success) {
                    if (success) {
                        session.send('Currency reserve successfully deleted from your account');
                    } else {
                        session.send('Could not update your currency reserves due to database error, please try again');
                    }
                });
            });
        }
    ]).triggerAction({
        matches: 'DeleteCurrencyReserve'
    });

    // Bot dialog when user wants to see their stored currencies (ie. when ShowCurrenciesHeld intent is triggered)
    bot.dialog('ShowCurrenciesHeld', [

        function (session, args, next) {
            session.dialogData.args = args || {};
            if (!session.conversationData["loggedIn"]) {
                session.beginDialog('LogInOrCreateAccount');
            } else {
                next(); // Skip if user logged in
            }
        },

        function (session, results, next) {
            session.send("Retrieving your currencies stored");

            let currenciesStored = [];
            let username = session.conversationData["currentUsername"];

            // get row's id first
            CurrencyReserves.getId(username).then(function (id) {
                // now use id to get data for this user
                RestClient.getUserData(id).then(function (body) {
                    if (body) {
                        CurrencyReserves.showReserves(session, body);
                    } else {
                        session.send('Could not retrieve your currency reserves due to database error, please try again');
                    }
                });
            });
        }
    ]).triggerAction({
        matches: 'ShowCurrenciesHeld'
    });
}