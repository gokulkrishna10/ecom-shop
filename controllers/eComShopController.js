const eComShopDao = require('../dao/eComShopManagerDAO')
const async = require('async')

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


exports.updateCart = function (req, mainCallback) {
    async.waterfall([
            function getCartItem(callback) {
                eComShopDao.getCartItem(req, (err, result) => {
                    if (err) {
                        callback(err, null)
                    } else {
                        callback(null, result)
                    }
                })
            },
            function updateCart(response, callback) {
                eComShopDao.updateCart(req, response, (err, result) => {
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
        ],
        function finalCallback(finalErr, finalResponse) {
            if (finalErr) {
                mainCallback(finalErr, null)
            } else {
                mainCallback(null, finalResponse)
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