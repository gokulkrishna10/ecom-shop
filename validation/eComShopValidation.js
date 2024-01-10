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
    } else if (util.isNull((req.body.quantity))) {
        err = customError.BadRequest("request needs product quantity")
        next(err)
    } else {
        next()
    }
}


