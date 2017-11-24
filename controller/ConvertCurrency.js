var RestClient = require('../API/Restclient');

exports.getConvertedAmount = function (session, currencyEntities, numberEntity){
    
    var inputError;

    // error checking
    if (numberEntity.length < 1) {
        inputError="No amount found, to convert currency please tell me the amount (in numbers) that you want to convert and it's currency";
    } else if (numberEntity.length > 1) {
        inputError='Please only convert one amount at a time';
    } else if (currencyEntities.length == 0) {
        inputError='Please state the currency of this amount that you want to convert';
    } else if (currencyEntities.length > 2) {
        inputError='I only need two currencies to convert. Please only state the currency of the amount and (optional) which currency to convert to.'
    }

    // if there is a query problem with the inputs
    if (inputError) {
        return; // end here
    }

    var from, to='', amount = parseInt(numberEntity[0].entity);    
    
    // if only one currency provided, convert the currency provided to NZD by default
    if(currencyEntities.length == 1) {
        from=currencyEntities[0].entity, to="NZD";
    } else if (currencyEntities.length == 2) {
        // need to find out which currency the amount is in (ie. which of the two currencies is next to the amount)
        let amountStart = numberEntity[0].startIndex, amountEnd = numberEntity[0].endIndex;
        let firstCurStart = currencyEntities[0].startIndex, firstCurEnd = currencyEntities[0].endIndex;
        let amountToFirstCur = firstCurStart - amountEnd;
        let firstCurToAmount = amountStart - firstCurEnd;
        if (isClose(amountToFirstCur) || isClose(firstCurToAmount)) {
            from=currencyEntities[0].entity, to=currencyEntities[1].entity;
        } else {
            from=currencyEntities[1].entity, to=currencyEntities[0].entity;
        }
 
    } else { // multiple currencies will give exchange rates against the first one
        from=currencyEntities[0].entity; // base currency
        for (let i = 1; i<currencyEntities.length; i++) {
            to+=currencyEntities[i].entity+','; // comma separated currencies against the base
        }
    }
    
    var url = "https://apilayer.net/api/convert?access_key=8db6106aae6236f2cee4620f4965f956"
                +"&from="+from 
                +"&to="+to
                +"&amount="+amount;
    console.log("url is: "+url);
    
    RestClient.getExchangeRate(url, session, handleConvertedAmount)
};

function handleConvertedAmount(message, session) {
    var body = JSON.parse(message);
    console.log(body);
    
    if (!body.success) {
        session.send("Error retrieving exchange rates. API may be down (please try again), or subscription has ended (please contact Administrator).");
        return; // if query is unsuccessful, stop here
    }

    var convertedAmount = body.result.toFixed(2); // trim result to 2 decimal places
    var query = body.query;
    session.send(query.amount + query.from + " converts to: " + convertedAmount + query.to);
}

function isClose(number) {
    if (number >=0 && number <=4) {
        return true;
    }
    return false;
}