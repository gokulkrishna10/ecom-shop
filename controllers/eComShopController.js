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

exports.getProducts = function (req, callback) {
    eComShopDao.getProducts(req, (err, result) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, result)
        }
    })
}


exports.updateCart = function (req, callback) {
    eComShopDao.updateCart(req, (err, result) => {
        if (err) {
            callback(err, null)
        } else {
            if (result) {
                callback(null, {'status': "success", "msg": "cart updated successfully"})
            } else {
                callback(null, {"status": "no-action", "msg": "no change made to cart"})
            }
        }
    })
}


exports.getCartItems = function (req, callback) {
    eComShopDao.getCartItems(req, (err, result) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, result)
        }
    })
}


exports.getFilteredProducts = function (req, callback) {
    eComShopDao.getFilteredProducts(req, (err, result) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, result)
        }
    })
}