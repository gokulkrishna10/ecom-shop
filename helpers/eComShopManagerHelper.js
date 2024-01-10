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

// exports.updateTaskMapper = function (req) {
//     let updateTaskMapper = {}
//
//     if (utils.isNotNull(req.query.task_label)) updateTaskMapper.task_label = req.query.task_label
//     if (utils.isNotNull(req.query.task_description)) updateTaskMapper.task_description = req.query.task_description
//     if (utils.isNotNull(req.query.status)) updateTaskMapper.status = req.query.status
//     updateTaskMapper.modified_date = getDateTime(new Date())
//
//     return updateTaskMapper
// }
//
// function getDateTime(today) {
//
//     let year = today.getFullYear();
//     let month = today.getMonth() + 1; // getMonth() returns 0-11
//     let day = today.getDate();
//
//     let hours = today.getHours();
//     let minutes = today.getMinutes();
//     let seconds = today.getSeconds();
//
//     // Pad single digits with a leading zero
//     month = month < 10 ? '0' + month : month;
//     day = day < 10 ? '0' + day : day;
//     hours = hours < 10 ? '0' + hours : hours;
//     minutes = minutes < 10 ? '0' + minutes : minutes;
//     seconds = seconds < 10 ? '0' + seconds : seconds;
//
//     let dateStr = year + '-' + month + '-' + day;
//     let timeStr = hours + ':' + minutes + ':' + seconds;
//
//     return dateStr + ' ' + timeStr
// }
//
// exports.getDateTime = getDateTime