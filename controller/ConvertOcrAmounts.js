var RestClient = require('../API/Restclient');

// this function is used to convert OCR numbers
exports.convertAmounts = function (session, amounts, from, to, callback) {

    for (let i = 0; i < amounts.length; i++) {
        let convertedAmounts = [];
        for (let j = 0; j < amounts[i].text.length; j++) {
            let isLast = false;
            // if this is the last number of the row, and the last row of text, THEN allow callback to activate
            if (i == amounts.length - 1 && j == amounts[i].text.length - 1) {
                isLast = true;
            }

            let number = amounts[i].text[j];

            let url = "https://apilayer.net/api/convert?access_key=8db6106aae6236f2cee4620f4965f956"
                + "&from=" + from
                + "&to=" + to
                + "&amount=" + number;

            RestClient.convertAmount(url).then(function (message) {
                let body = JSON.parse(message);

                if (!body.success) {
                    session.send("Error retrieving exchange rates. API may be down (please try again), or subscription has ended (please contact Administrator).");
                    return; // if query is unsuccessful, stop here
                }
                let convertedAmount = body.result.toFixed(2); // trim result to 2 decimal places
                amounts[i].text[j] = convertedAmount;

                if (isLast) {
                    setTimeout(function () {
                        callback(session, amounts); // once the last number has been converted, callback to overlay the amounts on the image after a short delay
                    }, 500);
                }
            });
        }
    }
}