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
        var attachments = session.message.attachments;
        if (attachments && attachments.length > 0) {

            var attachment = attachments[0];
            session.beginDialog('getCurrencyDirection', attachment);

            var currencyDirection = session.userData.currencyDirection;
        } else {
            session.send("Sorry I didn't understand that. I can help you with any of these areas:");
        }
    },
    (session, results) => {
        console.log(currencyDirection.from + " and " + currencyDirection.to);

        // OcrImage.ocrImage(attachment, session);

    }


]);

bot.dialog('getCurrencyDirection', [
    (session, args, next) => {
        session.dialogData.currencyDirection = args || {};

        builder.Prompts.text(session, `What's your name?`);

    },
    (session, results, next) => {
        if (results.response) {
            session.dialogData.currencyDirection.from = results.response;
        }
        builder.Prompts.text(session, `What company do you work for?`);

    },
    (session, results) => {
        if (results.response) {
            session.dialogData.currencyDirection.to = results.response;
        }
        session.endDialogWithResult({ response: session.dialogData.currencyDirection });
    }
])

luis.startDialog(bot);