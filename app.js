var restify = require('restify');
var builder = require('botbuilder');
var luis = require('./controller/LuisDialog');
var OcrImage = require('./controller/OcrImage');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});


var connector = new builder.ChatConnector({
    appId: 'be1b04fd-47f3-4ca1-8b87-2b2cb7f28f74',
    appPassword: 'dofuvGTNIJ6]xhGJ8267^*%'
});


server.post('/api/messages', connector.listen());


var bot = new builder.UniversalBot(connector, [

    (session) => {
        session.sendTyping();
        // if there is an attachment, ask for currency direction then begin OCR afterwards
        var attachments = session.message.attachments;

        if (attachments && attachments.length > 0) {
            session.dialogData.attachment = attachments[0];
            
            session.beginDialog('getCurrencyDirectionFrom');

            //else, user's input could not be understood, re-annouce bot's abilities
        } else {
            session.send(new builder.Message(session)
            .text("Sorry, I didn't understand. I can help you with any of these tasks: " + botFunctions)
            .textFormat("markdown")
            .textLocale("en-us"));
        }
    },

    (session, results) => {
        session.dialogData.currencyDirectionFrom = results.response.trim();
        session.beginDialog('getCurrencyDirectionTo');
    },

    (session, results) => {
        session.dialogData.currencyDirectionTo = results.response.trim();
        var from = session.dialogData.currencyDirectionFrom, to = session.dialogData.currencyDirectionTo;
        session.send('Converting all prices from the original currency of '+from+' to the target currency of '+to+', please wait..');        
        session.sendTyping();
        
        OcrImage.ocrImage(session, from, to, session.dialogData.attachment);
    }

]);

bot.dialog('getCurrencyDirectionFrom', [
    (session, args, next) => {

        if (args && args.repromptFrom) {
            builder.Prompts.text(session, "Please enter the three letter currency code that the prices are in, or say cancel to stop processing this image")
        } else {
            builder.Prompts.text(session, 'What is the currency of the prices or amounts in the image?');
        }
    },
    (session, results, next) => {
        if (results.response && RegExp("end|stop|quit|cancel|restart").test(results.response)) {
            session.endConversation();
        } else if (!results.response || results.response.trim().length != 3) {
            session.replaceDialog('getCurrencyDirectionFrom', { repromptFrom: true });
        } else {
            session.endDialogWithResult(results);
        }
    }
]);


bot.dialog('getCurrencyDirectionTo', [
    (session, args, next) => {
        // session.dialogData.currencyDirection = args || {};
        if (args && args.repromptTo) {
            builder.Prompts.text(session, 'Please end three letter currency code that you want to convert all prices to, or say stop to cancel processing image');
        } else {
            builder.Prompts.text(session, 'Which currency do you want to convert them to?');
        }
    },
    (session, results, next) => {
        if (results.response && RegExp("end|stop|quit|cancel|restart").test(results.response)) {
            session.endConversation();
        } else if (!results.response || results.response.trim().length != 3) {
            session.replaceDialog('getCurrencyDirectionTo', { repromptTo: true });
        } else {
            session.endDialogWithResult(results);
        }
    } 
]);

// Welcome message when user first connects
bot.on('conversationUpdate', function (activity) {
    // when user joins conversation, send instructions
    if (activity.membersAdded) {
        activity.membersAdded.forEach(function (identity) {
            if (identity.id === activity.address.bot.id) {
                var welcomeMsg = new builder.Message()
                    .address(activity.address)
                    .text("Hi there, I'm the Currency Bot. I can help you with the following things: \n ----" + botFunctions)
                    .textFormat("markdown")
                    .textLocale("en-us");
                bot.send(welcomeMsg);
            }
        });
    }
});

luis.startDialog(bot);

var botFunctions = '\n * I can retrieve the latest exchange rate for one or more currency pairs'
                  +'\n * I can convert an amount in any currency to another currency'
                  +'\n * I can help you manage your currency reserves by storing and updating them'
                  +'\n * I can calculate the total worth of your currency reserves into one currency'
                  +'\n * If you send me an image, I can modify the image converting all prices to a new currency'
                  ;