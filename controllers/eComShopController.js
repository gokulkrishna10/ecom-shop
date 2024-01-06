const eComShopDao = require('../dao/eComShopManagerDAO')


exports.createTask = function (req, callback) {
    eComShopDao.createTask(req, (err, result) => {
        if (err) {
            callback(err, null)
        } else {
            if (result) {
                callback(null, {'status': "success", "msg": "successfully created a task"})
            } else {
                callback(null, {"status": "no-action", "msg": "task could not be created"})
            }
        }
    })
}