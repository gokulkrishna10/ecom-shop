const eComShopDao = require('../dao/eComShopManagerDAO')


exports.addProducts = function (req, callback) {
    eComShopDao.addProducts(req, (err, result) => {
        if (err) {
            callback(err, null)
        } else {
            if (result) {
                callback(null, {'status': "success", "msg": "product/s added successfully"})
            } else {
                callback(null, {"status": "no-action", "msg": "product/s could not be added"})
            }
        }
    })
}