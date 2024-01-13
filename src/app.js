const express = require("express"),
    bodyParser = require("body-parser"),
    app = express(),
    router = express.Router(),
    routes = require("../routes"),
    portConfiguration = require('../portConfiguration.json'),
    envFile = require('../env.json'),
    multer = require('multer'),
    path = require("path"),
    fs = require('fs'),
    constants = require('../constants/constants');

var ErrorMod = require('../customnodemodules/error_node_module/errors');
var customError = new ErrorMod();
const eComShopValidator = require('../validation/eComShopValidation')


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(router);
app.set("port", portConfiguration[envFile.stage] || 8888);

app.use(function error_handler(err, req, res, next) {
    res.header("Content-Type", "application/json; charset=utf-8");
    res.status(err.code || 500).send(err)
});

router.all("*", function (req, res, next) {
    var origin = req.get("Origin");
    if (!origin) {
        origin = "*";
    }
    var allow_headers = req.get("Access-Control-Request-Headers");
    if (!allow_headers) {
        allow_headers = "Origin, X-Requested-With, X-Source-Ip, X-Identified-MCC,X-Identified-MNC, X-Using-Mobile-Data, Accept, Authorization, User-Agent,Host, Accept-Language, Location, Referrer, Set-Cookie";
    } else {
        if (allow_headers instanceof Array) {
            allow_headers = allow_headers.join(",");
        }
    }

    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
    res.set("Access-Control-Allow-Headers", allow_headers);
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE, PUT");
    res.set("Access-Control-Allow-Credentials", "true");
    if ("OPTIONS" === req.method) return res.sendStatus(200);
    next();
});


// CREATE UPLOADS DIRECTORY WHENEVER THE SERVER RUNS IF IT DOES NOT ALREADY EXIST

const uploadDir = path.join(__dirname, '../uploads');
// Check if the uploads directory exists, and create it if it doesn't
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, {recursive: true});
    }
} catch (error) {
    console.log("Could not create the uploads directory - ", error)
}


// FILE UPLOAD USING MULTER

// Set up storage engine
try {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadDir)
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
        }
    });
} catch (error) {
    console.log("Could not setup the storage disk directory - ", error)
}


// Initialize upload
const upload = multer({storage: storage});


//add products
router.post('/products', upload.array('prod_image', constants.maxInputFileCount), eComShopValidator.uploadFiles, routes.addProducts)

//get all products
router.get('/products', routes.getProducts)

//update cart
router.put('/cart', eComShopValidator.validateUpdateCart, routes.updateCart)

//get cart
router.get('/cart', routes.getCartItems)


router.all('/*', function (req, res) {
    res.status(404);
    res.send(customError.NotFound("Endpoint Not Found"));
});

app.listen(app.get("port"), () => {
    console.log("Express server : started on port : " + app.get("port"));
})

module.exports = app;
