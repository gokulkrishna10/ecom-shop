const eComShop = require('../controllers/eComShopController')

exports.createTask = function (req, res) {
    eComShop.createTask(req, (err, response) => {
        if (err) {
            res.status(err.code ? err.code : 500).send(err)
        } else {
            res.status(201).send(response)
        }
    })
}