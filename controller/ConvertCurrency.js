var RestClient = require('../API/Restclient');

exports.getConvertedAmount = function (session, username, currencyEntities, numberEntity){
    var from, to='';

    var errorMessage='';

    // if no number, abort
    if (numberEntity.length < 1) {
        errorMessage="No amount found, to convert currency please tell me the amount (in numbers) that you want to convert and it's currency";
    } else if (numberEntity.length > 1) {
        errorMessage=''
    }
        return; // end here
    
    
    // if only one currency provided, give exchange rate against NZD by default
    if(currencyEntities.length == 1) {
        from="NZD", to=currencyEntities[0].entity;
    } else if (currencyEntities.length == 2) {
        from=currencyEntities[0].entity, to=currencyEntities[1].entity;
    } else { // multiple currencies will give exchange rates against the first one
        from=currencyEntities[0].entity; // base currency
        for (let i = 1; i<currencyEntities.length; i++) {
            to+=currencyEntities[i].entity+','; // comma separated currencies against the base
        }
    }
    
    var url = "http://apilayer.net/api/live?access_key=8db6106aae6236f2cee4620f4965f956"
                +"&source="+from 
                +"&currencies="+to;
    RestClient.getExchangeRate(url, session, handleExchangeRate)
};

function handleExchangeRate(message, session) {
    var currencyTableData = JSON.parse(message);
    console.log(currencyTableData);
    
    if (!currencyTableData.success) {
        session.send("Error retrieving exchange rates, API may be down. Please try again");
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