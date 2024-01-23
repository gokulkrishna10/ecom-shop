const eComShop = require('../controllers/eComShopController')

exports.addProducts = function (req, res) {
    eComShop.addProducts(req, (err, response) => {
        if (err) {
            res.status(err.code ? err.code : 500).send(err)
        } else {
            res.status(201).send(response)
        }
    })
}

exports.getProducts = function (req, res) {
    eComShop.getProducts(req, (err, response) => {
        if (err) {
            res.status(err.code ? err.code : 500).send(err)
        } else {
            res.status(200).send(response)
        }
    })
}


exports.updateCart = function (req, res) {
    eComShop.updateCart(req, (err, response) => {
        if (err) {
            res.status(err.code ? err.code : 500).send(err)
        } else {
            res.status(200).send(response)
        }
    })
}


exports.getCartItems = function (req, res) {
    eComShop.getCartItems(req, (err, response) => {
        if (err) {
            res.status(err.code ? err.code : 500).send(err)
        } else {
            res.status(200).send(response)
        }
    })
}

exports.getFilteredProducts = function (req, res) {
    eComShop.getFilteredProducts(req, (err, response) => {
        if (err) {
            res.status(err.code ? err.code : 500).send(err)
        } else {
            res.status(200).send(response)
        }
    })
}


exports.removeCartItems = function (req, res) {
    eComShop.removeCartItems(req, (err, response) => {
        if (err) {
            res.status(err.code ? err.code : 500).send(err)
        } else {
            res.status(200).send(response)
        }
    })
}
