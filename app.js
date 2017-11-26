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
        var attachments = session.message.attachments;

        if (attachments && attachments.length > 0) {
            session.dialogData.attachment = attachments[0];

            OcrImage.ocrImage(session, 'USD', 'nzd', session.dialogData.attachment); return; //delete

            session.beginDialog('getCurrencyDirectionFrom');
        } else {
            session.send("I can help you with any of these areas:"); // if welcomeIntent made, put this back: Sorry I didn't understand that. 
        }
    },
    (session, results) => {
        session.dialogData.currencyDirectionFrom = results.response;
        session.beginDialog('getCurrencyDirectionTo');
    },
    (session, results) => {
        session.dialogData.currencyDirectionTo = results.response;
        var from = session.dialogData.currencyDirectionFrom, to = session.dialogData.currencyDirectionTo;
        session.send('Converting all prices from the original currency of '+from+' to the target currency of '+to+', please wait..');

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
        } else if (results.response && results.response.length != 3) {
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
        } else if (results.response.length != 3) {
            session.replaceDialog('getCurrencyDirectionTo', { repromptTo: true });
        } else {
            session.endDialogWithResult(results);
        }
    } 
]);

luis.startDialog(bot);