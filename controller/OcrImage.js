var microsoftComputerVision = require("microsoft-computer-vision");
var cloudinary = require('cloudinary');
var ConvertOcrAmounts = require('./ConvertOcrAmounts');
var image;
var angle;

// Perform OCR on the image which will send back JSON object of all texts found, 
// this will then need to be cleaned for numbers, currency converted and finally numbers overlayed
exports.ocrImage = function (session, from, to, attachment) {
    session.sendTyping();

    image = attachment;

    // OCR the image and return texts found
    microsoftComputerVision.orcImage({
        "Ocp-Apim-Subscription-Key": "92c7a34041824d56a62bf3b15e831f7c",
        "request-origin": "westcentralus",
        "content-type": "application/json",
        "url": attachment.contentUrl,
        "language": "en",
        "detect-orientation": true

    }).then((ocrResults) => { // success
        angle = parseInt(ocrResults.textAngle);

        // send OCR results to be formatted, cleaned and converted
        formatAmounts(session, from, to, ocrResults);

    }).catch((err) => { // OCR error
        session.send('I\'m sorry there was an error processing this file. Please make sure it\'s a valid image file');
        return;
    })

    // test results because bot emulator's localhost URL doesn't work with OCR api
    // var ocrAngleMenu = JSON.parse('{"language":"en","textAngle":-6.400000000000036,"orientation":"Up","regions":[{"boundingBox":"38,3,542,225","lines":[{"boundingBox":"280,3,62,19","words":[{"boundingBox":"280,3,62,19","text":"(Pasta"}]},{"boundingBox":"180,31,262,18","words":[{"boundingBox":"180,31,58,18","text":"Linguini"},{"boundingBox":"244,33,3,3","text":"•"},{"boundingBox":"250,32,58,17","text":"Rigatoni"},{"boundingBox":"315,34,2,2","text":"•"},{"boundingBox":"321,33,39,12","text":"(Penne"},{"boundingBox":"367,33,3,4","text":"•"},{"boundingBox":"374,33,68,13","text":"Fettuccini"}]},{"boundingBox":"39,61,173,12","words":[{"boundingBox":"39,62,35,10","text":"Pasta"},{"boundingBox":"79,61,30,11","text":"with"},{"boundingBox":"115,62,51,11","text":"Tomato"},{"boundingBox":"173,62,39,11","text":"Sauce"}]},{"boundingBox":"408,63,172,14","words":[{"boundingBox":"408,71,128,4","text":"…„…"},{"boundingBox":"543,63,37,14","text":"$9.00"}]},{"boundingBox":"39,78,243,14","words":[{"boundingBox":"39,78,56,13","text":"Linguini"},{"boundingBox":"99,78,35,11","text":"Clam"},{"boundingBox":"139,78,39,11","text":"Sauce"},{"boundingBox":"183,78,31,14","text":"(Red"},{"boundingBox":"219,81,15,8","text":"or"},{"boundingBox":"238,78,44,14","text":"White)"}]},{"boundingBox":"480,79,99,14","words":[{"boundingBox":"480,87,48,4","text":"…„."},{"boundingBox":"534,79,45,14","text":"$15.95"}]},{"boundingBox":"39,93,375,13","words":[{"boundingBox":"39,93,25,11","text":"Eight"},{"boundingBox":"67,93,22,9","text":"little"},{"boundingBox":"92,93,23,9","text":"neck"},{"boundingBox":"118,94,28,8","text":"clams"},{"boundingBox":"149,94,38,9","text":"sautéed"},{"boundingBox":"191,94,9,8","text":"in"},{"boundingBox":"211,94,27,11","text":"garlic"},{"boundingBox":"241,94,19,9","text":"and"},{"boundingBox":"263,94,22,9","text":"basil"},{"boundingBox":"288,97,28,6","text":"sauce"},{"boundingBox":"319,94,18,9","text":"and"},{"boundingBox":"340,94,43,12","text":"chopped"},{"boundingBox":"386,95,28,9","text":"Clams"}]},{"boundingBox":"38,106,198,12","words":[{"boundingBox":"38,106,47,12","text":"Cheese"},{"boundingBox":"91,107,46,11","text":"Ravioli"},{"boundingBox":"143,115,93,3","text":"—"}]},{"boundingBox":"533,107,45,15","words":[{"boundingBox":"533,107,45,15","text":"$11.95"}]},{"boundingBox":"38,122,206,10","words":[{"boundingBox":"38,122,14,9","text":"Six"},{"boundingBox":"91,123,35,8","text":"raviolis"},{"boundingBox":"164,123,22,9","text":"With"},{"boundingBox":"216,125,28,7","text":"Sauce"}]},{"boundingBox":"38,136,50,11","words":[{"boundingBox":"38,136,50,11","text":"Alfredo"}]},{"boundingBox":"459,138,120,13","words":[{"boundingBox":"459,146,3,3","text":"."},{"boundingBox":"533,138,46,13","text":"$11.95"}]},{"boundingBox":"38,152,122,9","words":[{"boundingBox":"38,152,33,9","text":"Cream"},{"boundingBox":"138,152,22,9","text":"With"}]},{"boundingBox":"39,212,257,14","words":[{"boundingBox":"39,212,95,14","text":"Hamburger…"},{"boundingBox":"259,212,37,14","text":"$6.00"}]},{"boundingBox":"458,213,121,15","words":[{"boundingBox":"458,222,77,4","text":"…„…"},{"boundingBox":"542,213,37,15","text":"$6.50"}]}]},{"boundingBox":"39,228,103,14","lines":[{"boundingBox":"39,228,103,14","words":[{"boundingBox":"39,228,48,11","text":"Stuffed"},{"boundingBox":"96,229,46,13","text":"Burger"}]}]},{"boundingBox":"144,170,435,84","lines":[{"boundingBox":"269,170,84,28","words":[{"boundingBox":"269,170,84,28","text":"(Burgers"}]},{"boundingBox":"166,230,413,14","words":[{"boundingBox":"166,236,3,4","text":"•"},{"boundingBox":"176,236,3,4","text":"•"},{"boundingBox":"267,237,3,3","text":"•"},{"boundingBox":"542,230,37,14","text":"$9-95"}]},{"boundingBox":"144,244,112,10","words":[{"boundingBox":"144,244,21,9","text":"With"},{"boundingBox":"201,245,19,8","text":"and"},{"boundingBox":"222,245,34,9","text":"Cheese"}]}]}]}');
    // var ocrCars = JSON.parse('{"language":"en","textAngle":0,"orientation":"Up","regions":[{"boundingBox":"80,125,107,21","lines":[{"boundingBox":"80,125,107,21","words":[{"boundingBox":"80,125,107,21","text":"Categories"}]}]},{"boundingBox":"216,7,279,135","lines":[{"boundingBox":"392,7,103,19","words":[{"boundingBox":"392,7,60,19","text":"12:32"},{"boundingBox":"461,8,34,18","text":"PM"}]},{"boundingBox":"216,57,74,18","words":[{"boundingBox":"216,57,74,18","text":"Results"}]},{"boundingBox":"329,125,85,17","words":[{"boundingBox":"329,125,85,17","text":"Vehicles"}]}]},{"boundingBox":"133,207,213,600","lines":[{"boundingBox":"134,207,90,20","words":[{"boundingBox":"134,207,90,20","text":"Compact"}]},{"boundingBox":"135,304,211,20","words":[{"boundingBox":"135,304,67,20","text":"LUXury"},{"boundingBox":"208,304,14,15","text":"&"},{"boundingBox":"229,304,65,20","text":"Sports"},{"boundingBox":"301,304,45,15","text":"Cars"}]},{"boundingBox":"135,402,92,20","words":[{"boundingBox":"135,402,92,20","text":"Economy"}]},{"boundingBox":"135,498,80,17","words":[{"boundingBox":"135,498,80,17","text":"Medium"}]},{"boundingBox":"135,581,193,21","words":[{"boundingBox":"135,581,67,21","text":"People"},{"boundingBox":"209,581,119,17","text":"Carrier/Mini"}]},{"boundingBox":"133,609,39,16","words":[{"boundingBox":"133,609,39,16","text":"Van"}]},{"boundingBox":"135,692,139,21","words":[{"boundingBox":"135,692,42,17","text":"Pick"},{"boundingBox":"184,693,27,20","text":"Up"},{"boundingBox":"217,692,57,17","text":"Truck"}]},{"boundingBox":"135,790,84,17","words":[{"boundingBox":"135,790,35,17","text":"Full"},{"boundingBox":"177,790,42,17","text":"Size"}]}]},{"boundingBox":"381,190,78,695","lines":[{"boundingBox":"381,190,78,14","words":[{"boundingBox":"381,190,37,14","text":"from"},{"boundingBox":"425,190,34,14","text":"USD"}]},{"boundingBox":"412,213,46,23","words":[{"boundingBox":"412,213,46,23","text":"$40"}]},{"boundingBox":"381,288,78,15","words":[{"boundingBox":"381,288,37,15","text":"from"},{"boundingBox":"425,289,34,14","text":"USD"}]},{"boundingBox":"412,311,47,24","words":[{"boundingBox":"412,311,47,24","text":"$43"}]},{"boundingBox":"381,385,78,15","words":[{"boundingBox":"381,385,37,15","text":"from"},{"boundingBox":"425,386,34,14","text":"USD"}]},{"boundingBox":"412,408,47,24","words":[{"boundingBox":"412,408,47,24","text":"$43"}]},{"boundingBox":"381,484,78,14","words":[{"boundingBox":"381,484,37,14","text":"from"},{"boundingBox":"425,484,34,14","text":"USD"}]},{"boundingBox":"412,507,46,23","words":[{"boundingBox":"412,507,46,23","text":"$49"}]},{"boundingBox":"381,579,78,15","words":[{"boundingBox":"381,579,37,15","text":"from"},{"boundingBox":"425,580,34,14","text":"USD"}]},{"boundingBox":"412,602,47,24","words":[{"boundingBox":"412,602,47,24","text":"$54"}]},{"boundingBox":"381,676,78,15","words":[{"boundingBox":"381,676,37,15","text":"from"},{"boundingBox":"425,677,34,14","text":"USD"}]},{"boundingBox":"412,700,47,23","words":[{"boundingBox":"412,700,47,23","text":"$57"}]},{"boundingBox":"381,776,78,15","words":[{"boundingBox":"381,776,37,15","text":"from"},{"boundingBox":"425,777,34,14","text":"USD"}]},{"boundingBox":"412,799,47,24","words":[{"boundingBox":"412,799,47,24","text":"$63"}]},{"boundingBox":"381,870,78,15","words":[{"boundingBox":"381,870,37,15","text":"from"},{"boundingBox":"425,871,34,14","text":"USD"}]}]}]}');
    // var ocrMenu = JSON.parse('{"language":"en","textAngle":0,"orientation":"Up","regions":[{"boundingBox":"139,250,1817,177","lines":[{"boundingBox":"139,250,1817,101","words":[{"boundingBox":"139,251,1065,100","text":"TEXAS-SIZED"},{"boundingBox":"1259,250,697,101","text":"COMBOS"}]},{"boundingBox":"141,393,1351,34","words":[{"boundingBox":"141,393,300,34","text":"INCLUDES"},{"boundingBox":"458,393,130,34","text":"TWO"},{"boundingBox":"609,393,687,34","text":"MADE-FROM-SCRATCH"},{"boundingBox":"1316,394,176,32","text":"SIDES"}]}]},{"boundingBox":"139,572,910,2475","lines":[{"boundingBox":"174,572,434,25","words":[{"boundingBox":"174,573,141,23","text":"RIBEYE"},{"boundingBox":"325,572,128,25","text":"STEAK"},{"boundingBox":"464,572,144,25","text":"COMBO"}]},{"boundingBox":"143,1570,543,48","words":[{"boundingBox":"143,1570,272,47","text":"RIBEYE"},{"boundingBox":"437,1570,249,48","text":"STEAK"}]},{"boundingBox":"211,1642,234,36","words":[{"boundingBox":"211,1645,68,32","text":"with"},{"boundingBox":"296,1642,79,36","text":"Beef"},{"boundingBox":"389,1642,56,35","text":"Rib"}]},{"boundingBox":"211,1704,349,44","words":[{"boundingBox":"211,1707,68,32","text":"with"},{"boundingBox":"295,1704,119,36","text":"Grilled"},{"boundingBox":"429,1704,131,44","text":"Shrimp"}]},{"boundingBox":"172,1863,446,25","words":[{"boundingBox":"172,1863,151,25","text":"SIRLOIN"},{"boundingBox":"335,1863,129,25","text":"STEAK"},{"boundingBox":"474,1863,144,25","text":"COMBO"}]},{"boundingBox":"139,2769,910,49","words":[{"boundingBox":"139,2770,291,48","text":"SIRLOIN"},{"boundingBox":"455,2770,249,48","text":"STEAK"},{"boundingBox":"725,2769,324,49","text":"COMBO**"}]},{"boundingBox":"210,2863,317,36","words":[{"boundingBox":"210,2866,69,32","text":"with"},{"boundingBox":"296,2863,77,35","text":"BBQ"},{"boundingBox":"386,2864,141,35","text":"Chicken"}]},{"boundingBox":"210,2933,235,36","words":[{"boundingBox":"210,2936,69,32","text":"with"},{"boundingBox":"296,2933,79,36","text":"Beef"},{"boundingBox":"389,2934,56,34","text":"Rib"}]},{"boundingBox":"210,3003,350,44","words":[{"boundingBox":"210,3006,69,32","text":"with"},{"boundingBox":"295,3003,119,36","text":"Grilled"},{"boundingBox":"429,3003,131,44","text":"Shrimp"}]}]},{"boundingBox":"1278,1833,939,1281","lines":[{"boundingBox":"1278,1833,707,54","words":[{"boundingBox":"1278,1833,179,54","text":"BBQ"},{"boundingBox":"1484,1834,197,47","text":"BEEF"},{"boundingBox":"1703,1833,282,49","text":"COMBO"}]},{"boundingBox":"1331,1906,316,35","words":[{"boundingBox":"1331,1909,68,32","text":"with"},{"boundingBox":"1416,1906,77,35","text":"BBQ"},{"boundingBox":"1506,1906,141,35","text":"Chicken"}]},{"boundingBox":"1331,1975,234,36","words":[{"boundingBox":"1331,1979,68,31","text":"with"},{"boundingBox":"1416,1975,79,36","text":"Beef"},{"boundingBox":"1509,1976,56,35","text":"Rib"}]},{"boundingBox":"1331,2045,349,45","words":[{"boundingBox":"1331,2049,68,32","text":"with"},{"boundingBox":"1415,2045,119,36","text":"Grilled"},{"boundingBox":"1549,2045,131,45","text":"Shrimp"}]},{"boundingBox":"1311,2162,362,27","words":[{"boundingBox":"1311,2162,92,27","text":"BBQ"},{"boundingBox":"1416,2163,101,23","text":"BEEF"},{"boundingBox":"1528,2162,145,25","text":"COMBO"}]},{"boundingBox":"1743,2789,298,40","words":[{"boundingBox":"1743,2789,298,40","text":"SMOTHER"}]},{"boundingBox":"1743,2832,299,31","words":[{"boundingBox":"1743,2832,133,31","text":"YOUR"},{"boundingBox":"1885,2832,157,31","text":"STEAK"}]},{"boundingBox":"1701,2909,458,32","words":[{"boundingBox":"1701,2910,83,30","text":"WITH"},{"boundingBox":"1797,2909,90,32","text":"YOUR"},{"boundingBox":"1900,2909,118,32","text":"CHOICE"},{"boundingBox":"2032,2909,40,32","text":"OF"},{"boundingBox":"2084,2909,75,32","text":"ONE:"}]},{"boundingBox":"1725,2950,420,33","words":[{"boundingBox":"1725,2950,103,29","text":"Sautéed"},{"boundingBox":"1840,2951,157,32","text":"mushrooms,"},{"boundingBox":"2008,2951,83,28","text":"onions"},{"boundingBox":"2101,2951,44,28","text":"and"}]},{"boundingBox":"1723,2988,334,35","words":[{"boundingBox":"1723,2988,82,29","text":"choice"},{"boundingBox":"1815,2988,24,29","text":"of"},{"boundingBox":"1848,2996,69,27","text":"gravy"},{"boundingBox":"1926,2996,25,21","text":"or"},{"boundingBox":"1960,2988,97,29","text":"cheese."}]},{"boundingBox":"1726,3025,491,29","words":[{"boundingBox":"1726,3026,137,28","text":"Mushroom"},{"boundingBox":"1874,3025,76,29","text":"Sauce"},{"boundingBox":"1962,3033,10,14","text":"’"},{"boundingBox":"1985,3026,53,28","text":"Bleu"},{"boundingBox":"2049,3026,91,28","text":"cheese"},{"boundingBox":"2150,3025,67,29","text":"Crust"}]},{"boundingBox":"1703,3085,96,29","words":[{"boundingBox":"1703,3085,54,29","text":"Dhs"},{"boundingBox":"1769,3086,30,28","text":"14"}]}]},{"boundingBox":"2305,1649,47,432","lines":[{"boundingBox":"2305,1649,47,28","words":[{"boundingBox":"2305,1649,47,28","text":"140"}]},{"boundingBox":"2305,1711,47,28","words":[{"boundingBox":"2305,1711,47,28","text":"130"}]},{"boundingBox":"2319,1913,33,28","words":[{"boundingBox":"2319,1913,33,28","text":"95"}]},{"boundingBox":"2308,1983,44,28","words":[{"boundingBox":"2308,1983,44,28","text":"110"}]},{"boundingBox":"2308,2053,44,28","words":[{"boundingBox":"2308,2053,44,28","text":"110"}]}]},{"boundingBox":"1171,2870,47,169","lines":[{"boundingBox":"1185,2870,33,28","words":[{"boundingBox":"1185,2870,33,28","text":"99"}]},{"boundingBox":"1173,2940,45,28","words":[{"boundingBox":"1173,2940,45,28","text":"119"}]},{"boundingBox":"1171,3010,47,29","words":[{"boundingBox":"1171,3010,47,29","text":"105"}]}]},{"boundingBox":"547,3274,1420,62","lines":[{"boundingBox":"696,3274,1214,27","words":[{"boundingBox":"696,3275,27,22","text":"BE"},{"boundingBox":"733,3274,99,23","text":"COOKED"},{"boundingBox":"840,3274,30,23","text":"TO"},{"boundingBox":"880,3274,87,23","text":"ORDER."},{"boundingBox":"977,3274,148,23","text":"CONSUMING"},{"boundingBox":"1136,3275,54,22","text":"RAW"},{"boundingBox":"1198,3274,32,23","text":"OR"},{"boundingBox":"1240,3274,183,23","text":"UNDERCOOKED"},{"boundingBox":"1433,3274,85,27","text":"MEATS,"},{"boundingBox":"1529,3274,110,27","text":"POULTRY,"},{"boundingBox":"1649,3274,119,26","text":"SEAFOOD,"},{"boundingBox":"1779,3274,131,27","text":"SHELLFISH,"}]},{"boundingBox":"547,3309,1420,27","words":[{"boundingBox":"547,3309,32,23","text":"OR"},{"boundingBox":"589,3309,61,23","text":"EGGS"},{"boundingBox":"660,3310,51,22","text":"MAY"},{"boundingBox":"720,3309,116,23","text":"INCREASE"},{"boundingBox":"844,3309,65,23","text":"YOUR"},{"boundingBox":"919,3309,51,23","text":"RISK"},{"boundingBox":"978,3309,30,23","text":"OF"},{"boundingBox":"1018,3309,150,23","text":"FOODBORNE"},{"boundingBox":"1178,3309,100,27","text":"ILLNESS,"},{"boundingBox":"1289,3309,138,23","text":"ESPECIALLY"},{"boundingBox":"1436,3310,17,22","text":"IF"},{"boundingBox":"1461,3309,48,23","text":"YOU"},{"boundingBox":"1520,3310,60,22","text":"HAVE"},{"boundingBox":"1589,3309,98,23","text":"CERTAIN"},{"boundingBox":"1697,3309,107,23","text":"MEDICAL"},{"boundingBox":"1812,3309,155,23","text":"CONDITIONS."}]}]}]}');
    // var ocrResults = ocrAngleMenu;
}

// This function will perform second step of formatting, cleaning and converting the numbers
function formatAmounts(session, from, to, ocrResults) {
    var amounts = [];

    // Find the numbers in all texts, and convert and format to numbers
    for (let region of ocrResults.regions) {
        for (let line of region.lines) {
            for (let word of line.words) {
                // if 'word' block has numbers, add it to amounts array
                var numbers = word.text.match(/[-+]?(\d*)([-\.:](?=\d))?(\d+)/g);
                if (numbers) {
                    word.text = [];
                    for (let number of numbers) {
                        word.text.push(parseFloat(number.replace(/[-\.:]/g, '.'))); // change symbols to ., then parse to float
                    }
                    word.boundingBox = word.boundingBox.split(',').map(Number); // keep the bounds too for use later
                    amounts.push(word);
                }
            }
        }
    } // now convert prices
    ConvertOcrAmounts.convertAmounts(session, amounts, from, to, overlayConvertedAmounts);
}

// This final function will overlay converted prices on the image and send it to the user
function overlayConvertedAmounts(session, amounts) {
    // cloudinary API setup
    cloudinary.config({
        cloud_name: 'wal88',
        api_key: '767674743348436',
        api_secret: 'rTbK3jHR89spYdkMbiNUpYTZq8Q'
    });

    // change text size according to image's text pixel size (about two thirds of pixel height = font size)
    let fontSize = parseInt(amounts[1].boundingBox[3] * 4 / 3);
    cloudinary.v2.uploader.text("text_style",
        { public_id: "dark_text", font_family: "Arial", font_size: fontSize, font_color: "black", opacity: 90, font_weight: "bold", background: "white" },
        function (error, result) { }
    );

    var transformations = [];

    //here we specify a new text overlay for each number, pushing each overlay JSON object into the 'transformations' array
    for (let amount of amounts) {
        let bounds = amount.boundingBox;
        transformations.push({
            overlay: "text:dark_text:" + amount.text.join(" "),
            gravity: "north_west",
            x: bounds[0], y: bounds[1],  //, width: bounds[3], height: 60 // dont need width/height as we adjust with font size
            angle: angle
        });
    }

    // Options used by cloudinary API for manupilating the image (in our case, overlaying texts)
    var options = {
        public_id: image.name,
        transformation: transformations
    };

    // Cloudinary API call, overlays converted prices and returns the new image
    cloudinary.v2.uploader.upload(image.contentUrl, 
        options,
    
        function (error, overlayedImage) {
            if (error) {
                session.send('Im sorry there was an error in processing the image. Image file may be too large');
                return;
            } else {
                // success
                // Send the new image with overlayed converted prices to the user, and also the full image URL
                session.send({
                    text: "Converted prices:",
                    attachments: [
                        {
                            contentType: image.contentType,
                            contentUrl: overlayedImage.url,
                            name: image.name
                        }
                    ]
                });
                session.send("To view full image: \n" + overlayedImage.url);
            }
        }
    );
}
