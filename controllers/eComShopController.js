const eComShopDao = require('../dao/eComShopManagerDAO')


exports.getProducts = function (req, callback) {
    eComShopDao.getProducts(req, (err, result) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, result)
        }
    })
}