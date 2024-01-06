const util = require('../customnodemodules/util_node_module/utils')
const ErrorMod = require('../customnodemodules/error_node_module/errors')
const customError = new ErrorMod()


exports.validateCreateTask = function (req, res, next) {
    let err = null;

    if (util.isNull(req.body.label)) {
        err = customError.BadRequest("request needs a task label")
        next(err)
    }
    next()
}



