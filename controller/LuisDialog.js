var builder = require('botbuilder');
var GetTableData = require('./GetTableData')

exports.startDialog = function(bot){
    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/1543b832-d22d-4a8a-96bc-a873cc526509?subscription-key=7f8105988bb944b1a97f266d314f52eb&verbose=true&timezoneOffset=12.0&q=')
    bot.recognizer(recognizer);
    
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
                GetTableData.displayTableData(session, session.conversationData["username"]);  // <---- THIS LINE HERE IS WHAT WE NEED 
        }

    ]).triggerAction({
        matches: 'ShowCurrenciesHeld'
    });   

}