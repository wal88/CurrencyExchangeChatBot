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
        public_id: image.name.substring(0,image.name.indexOf('.')), // remove extension from file name, otherwise gets duplicated
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
