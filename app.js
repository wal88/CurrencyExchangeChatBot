var restify = require('restify');
var builder = require('botbuilder');
var luis = require('./controller/LuisDialog');
var microsoftComputerVision = require("microsoft-computer-vision");
const fs = require('fs');


var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});


var connector = new builder.ChatConnector({
    appId: 'be1b04fd-47f3-4ca1-8b87-2b2cb7f28f74',
    appPassword: 'dofuvGTNIJ6]xhGJ8267^*%'
});


server.post('/api/messages', connector.listen());


var bot = new builder.UniversalBot(connector, function (session) {
    var msg = session.message;
    if (msg.attachments && msg.attachments.length > 0) {

        var attachment = msg.attachments[0];
        //    session.send({
        //        text: "You sent:",
        //        attachments: [
        //            {
        //                contentType: attachment.contentType,
        //                contentUrl: attachment.contentUrl,
        //                name: attachment.name
        //            }
        //        ]
        //    });
        // session.send( "contentType: "+attachment.contentType
        //                    +"\ncontentUrl: "+attachment.contentUrl
        //                    +"\nname: "+attachment.name);
        console.log("hi");

       microsoftComputerVision.orcImage({
            "Ocp-Apim-Subscription-Key": "92c7a34041824d56a62bf3b15e831f7c",
            "request-origin": "westcentralus",
            "content-type": "application/octet-stream",
            "url": attachment.contentUrl,
            "language": "en",
            "detect-orientation": true

        }).then((result) => {

            console.log(JSON.stringify(result));
            session.send(JSON.stringify(result));
            session.send(result);

        }).catch((err) => {
            throw err;
        })

    } else {
        session.send('Sorry, I did not understand here is a list of what I can help you with: ', session.message.text);
    }
});

luis.startDialog(bot);