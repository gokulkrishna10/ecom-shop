const utils = require("../customnodemodules/util_node_module/utils")
const fs = require('fs')

exports.addProducts = function (req) {
    let productMapper = []

    for (let i = 0; i < req.body.length; i++) {
        let mappingObj = {}

        mappingObj.prod_name = req.body[i].name
        mappingObj.price = req.body[i].price
        mappingObj.short_description = utils.isNotNull(req.body[i].short_description) ? req.body[i].short_description : null
        mappingObj.category = req.body[i].category

        // Read the binary data of the image
        mappingObj.prod_image = fs.readFileSync(req.files[i].path);

        productMapper.push(mappingObj)
    }

    return productMapper
}


exports.updateCartMapper = function (req) {
    let cartMapper = {}

    cartMapper.pid = req.body.pid
    cartMapper.quantity = req.body.addToCart ? (req.body.quantity || 0) + 1 : req.body.quantity - 1

    return cartMapper
}