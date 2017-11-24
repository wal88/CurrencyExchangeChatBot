var RestClient = require('../API/Restclient');

exports.showExchangeRate = function (session, username, currencyEntities){
    var base, to='';

    if (currencyEntities.length==0) {
        session.send("No currencies detected, please state currencies desired for exchange rates using three letter currency codes"); 
        return; // end here if no currencies to work with
    }
    
    // if only one currency provided, give exchange rate against NZD by default
    if(currencyEntities.length == 1) {
        base="NZD", to=currencyEntities[0].entity;
    } else if (currencyEntities.length == 2) {
        base=currencyEntities[0].entity, to=currencyEntities[1].entity;
    } else { // multiple currencies will give exchange rates against the first one
        base=currencyEntities[0].entity; // base currency
        for (let i = 1; i<currencyEntities.length; i++) {
            to+=currencyEntities[i].entity+','; // comma separated currencies against the base
        }
    }
    
    var url = "http://apilayer.net/api/live?access_key=8db6106aae6236f2cee4620f4965f956"
                +"&source="+base 
                +"&currencies="+to;
    RestClient.getExchangeRate(url, session, handleExchangeRate)
};

function handleExchangeRate(message, session) {
    var currencyTableData = JSON.parse(message);
    console.log(currencyTableData);
    
    if (!currencyTableData.success) {
        session.send("Error retrieving exchange rates. API may be down (please try again), or subscription has ended (please contact Administrator).");
        return; // if query is unsuccessful, stop here
    }

    var rates = currencyTableData.quotes;

    for (let exchangePair in rates) {
        
        session.send(exchangePair + " is " + rates[exchangePair]);
    }

    // var array = [];
    
    // for (var index in currencyTableData) {
    //     // var usernameReceived = currencyTableData[index].name;
    //     for(let itemProperty in currencyTableData[index]) {
    //         console.log("property name: " +itemProperty + ", value: "+currencyTableData[index][itemProperty]);
    //     }
    // }
    
    //session.send('');                
} 