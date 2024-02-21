const util = require('../customnodemodules/util_node_module/utils')
const ErrorMod = require('../customnodemodules/error_node_module/errors')
const customError = new ErrorMod()


exports.uploadFiles = function (req, res, next) {
    let err = null

    // check if req has files
    if (!req.files) {
        err = customError.BadRequest('No files were uploaded.');
        next(err)
    }
    console.log('The files ', req.files, ' are available in req.files');

    // check if req body has the json data
    if (req.body.jsonData) {
        try {
            req.body = JSON.parse(req.body.jsonData)
        } catch (err) {
            err = customError.BadRequest('Invalid JSON data')
            next(err)
        }
    } else {
        err = customError.BadRequest('Request needs a body')
        next(err)
    }
    next()
}


exports.validateUpdateCart = function (req, res, next) {
    let err = null;

    if (Object.keys(req.body).length === 0) {
        err = customError.BadRequest("request body is missing")
        next(err)
    } else if (util.isNull((req.body.pid))) {
        err = customError.BadRequest("request needs a pid")
        next(err)
    } else if (req.body.quantity < 0) {
        err = customError.BadRequest("product quantity has to be a non negative number")
        next(err)
    } else {
        next()
    }
}

exports.validateGetFilteredProducts = function (req, res, next) {
    let err = null;

    if (util.isNull(req.query.category)) {
        err = customError.BadRequest("request needs a category")
        next(err)
    } else {
        next()
    }
}


exports.validatePaymentDetails = function (req, res, next) {
    let err = null;

    // replace anything but numbers with empty string
    req.body.cardNumber = util.isNotNull(req.body.cardNumber) ? (req.body.cardNumber).replace(/\D/g, '') : req.body.cardNumber

    // replace anything that is not an uppercase letter (A-Z), a lowercase letter (a-z), or a single space with an empty string
    req.body.fullName = util.isNotNull(req.body.fullName) ? (req.body.fullName).replace(/[^A-Za-z ]/g, '') : req.body.fullName

    // replace anything but numbers with empty string
    req.body.cvv = util.isNotNull(req.body.cvv) ? (req.body.cvv).replace(/\D/g, '') : req.body.cvv


    if (Object.keys(req.body).length === 0) {
        err = customError.BadRequest("request body is missing")
        next(err)
    } else if (util.isNull((req.body.cardNumber))) {
        err = customError.BadRequest("request needs a cardNumber")
        next(err)
    } else if (util.isNull(req.body.fullName)) {
        err = customError.BadRequest("request needs a fullName")
        next(err)
    } else if (util.isNull(req.body.expiryDate)) {
        err = customError.BadRequest("request needs an expiryDate")
        next(err)
    } else if (util.isNull(req.body.cvv)) {
        err = customError.BadRequest("request needs a cvv")
        next(err)
    } else {
        // validate cardNumber
        if ((req.body.cardNumber).toString().length !== 16) {
            err = customError.BadRequest("cardNumber must have 16 digits")
            next(err)
        }

        //validate expiry date
        if (!isValidExpiryDate(req.body.expiryDate)) {
            err = customError.BadRequest("Invalid expiry date. Request needs an expiryDate greater than current date in MM/YY format")
            next(err)
        }

        //validate cvv
        if ((req.body.cvv).toString().length !== 3) {
            err = customError.BadRequest("card cvv must have 3 digits")
            next(err)
        }
    }
}

function isValidExpiryDate(expiryDate) {
    // check the format (MM/YY)
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(expiryDate)) {
        return false // Invalid format
    }

    // check if the expiry date is in the future
    let today = new Date()
    let [curMonth, curYear] = [today.getMonth() + 1, today.getFullYear()]
    let [expiryMonth, expiryYear] = expiryDate.split("/")
    expiryYear += 2000
    if (expiryYear < curYear) {
        return false
    } else if (expiryYear === curYear) {
        return !(expiryMonth < curMonth)
    }
    return true
}

