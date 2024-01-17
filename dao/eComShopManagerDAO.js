const db = require('../customnodemodules/database_node_module/app')
const eComShopHelper = require('../helpers/eComShopManagerHelper')
const constants = require('../constants/constants')


exports.addProducts = function (req, callback) {
    let productMapper = eComShopHelper.addProducts(req)
    let options = []

    for (const obj of productMapper) {
        options.push({
            sql: `insert into ${constants.db_tables['ECOMMERCE_PRODUCTS']} set ?;`,
            values: [obj]
        })
    }

    db.executeMultipleWithOptions(options, true, (dbErr, dbResp) => {
        if (dbErr) {
            callback(dbErr, null)
        } else {
            if (dbResp && dbResp.length > 0) {
                callback(null, dbResp)
            } else {
                callback(null, null)
            }
        }
    })
}


exports.getProducts = function (req, callback) {

    let options = {
        sql: `SELECT pd.pid,pd.prod_name,pd.price,pd.short_description,pd.category,pd.prod_image,COALESCE(ct.quantity, 0) as quantity
              FROM ${constants.db_tables['ECOMMERCE_PRODUCTS']} pd 
              LEFT JOIN ${constants.db_tables['ECOMMERCE_CART']} ct on pd.pid = ct.pid`
    }

    db.queryWithOptions(options, (dbErr, dbResp) => {
        if (dbErr) {
            callback(dbErr, null)
        } else {
            if (dbResp && dbResp.length > 0) {
                for (const obj of dbResp) {
                    // Convert binary data of file to Base64 string
                    obj.prod_image = obj.prod_image.toString('base64');
                }
            }
            callback(null, dbResp)
        }
    })
}


exports.updateCart = function (req, callback) {
    let cartMapper = eComShopHelper.updateCartMapper(req)

    let options = {
        sql: `insert into ${constants.db_tables['ECOMMERCE_CART']} set ? ON DUPLICATE KEY UPDATE ?`,
        values: [cartMapper, cartMapper]
    }

    db.queryWithOptions(options, (dbErr, dbResp) => {
        if (dbErr) {
            callback(dbErr, null)
        } else {
            if (dbResp && dbResp.affectedRows > 0) {
                callback(null, dbResp)
            } else {
                callback(null, null)
            }
        }
    })
}

exports.getCartItems = function (req, callback) {

    let options = {
        sql: `SELECT pd.pid,pd.prod_name,pd.price,pd.short_description,pd.category,pd.prod_image,COALESCE(ct.quantity, 0) as quantity
              FROM ${constants.db_tables['ECOMMERCE_PRODUCTS']} pd 
              LEFT JOIN ${constants.db_tables['ECOMMERCE_CART']} ct on pd.pid = ct.pid
              WHERE ct.quantity > 0;`
    }

    db.queryWithOptions(options, (dbErr, dbResp) => {
        if (dbErr) {
            callback(dbErr, null)
        } else {
            if (dbResp && dbResp.length > 0) {
                for (const obj of dbResp) {
                    // Convert binary data of file to Base64 string
                    obj.prod_image = obj.prod_image.toString('base64');
                }
            }
            callback(null, dbResp)
        }
    })
}


exports.getFilteredProducts = function (req, callback) {
    let category = req.query.category.toLowerCase()

    let options = {
        sql: `SELECT pd.pid,pd.prod_name,pd.price,pd.short_description,pd.category,pd.prod_image,COALESCE(ct.quantity, 0) as quantity
              FROM ${constants.db_tables['ECOMMERCE_PRODUCTS']} pd 
              LEFT JOIN ${constants.db_tables['ECOMMERCE_CART']} ct on pd.pid = ct.pid 
              WHERE pd.category = '${category}';`
    }

    db.queryWithOptions(options, (dbErr, dbResp) => {
        if (dbErr) {
            callback(dbErr, null)
        } else {
            if (dbResp && dbResp.length > 0) {
                for (const obj of dbResp) {
                    // Convert binary data of file to Base64 string
                    obj.prod_image = obj.prod_image.toString('base64');
                }
            }
            callback(null, dbResp)
        }
    })
}