var restify = require('restify');
var builder = require('botbuilder');
var luis = require('./controller/LuisDialog');

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
   session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text)
});

luis.startDialog(bot);