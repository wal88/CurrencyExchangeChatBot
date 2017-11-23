var RestClient = require('../API/Restclient');

exports.showExchangeRate = function (session, username){
    var from="NZD", to="USD";
    var url = "http://apilayer.net/api/live?access_key=8db6106aae6236f2cee4620f4965f956"
                +"&source="+from 
                +"&currencies="+to;
    RestClient.getExchangeRate(url, session, handleExchangeRate)
};

function handleExchangeRate(message, session) {
    var currencyTableData = JSON.parse(message);
    session.send(message);
    
    // var array = [];
    
    // for (var index in currencyTableData) {
    //     // var usernameReceived = currencyTableData[index].name;
    //     for(let itemProperty in currencyTableData[index]) {
    //         console.log("property name: " +itemProperty + ", value: "+currencyTableData[index][itemProperty]);
    //     }
    // }
    
    //session.send('');                
} 