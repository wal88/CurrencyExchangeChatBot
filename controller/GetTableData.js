var RestClient = require('../API/Restclient');

exports.displayTableData = function displayTableData2(session, username){
    var url = 'http://walapp.azurewebsites.net/tables/CurrencyTable';
    
    RestClient.getTableData(url, session, username, handleTableData)
};

function handleTableData(message, session, username) {
    var currencyTableData = JSON.parse(message);
    console.log(currencyTableData); 
    
    // var array = [];
    
    // for (var index in currencyTableData) {
    //     // var usernameReceived = currencyTableData[index].name;
    //     for(let itemProperty in currencyTableData[index]) {
    //         console.log("property name: " +itemProperty + ", value: "+currencyTableData[index][itemProperty]);
    //     }
    // }
    
    //session.send('');                
}