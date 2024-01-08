const db = require('../customnodemodules/database_node_module/app')
const eComShopHelper = require('../helpers/eComShopManagerHelper')
const constants = require('../constants/constants')


exports.getProducts = function (req, callback) {

    let options = {
        sql: `select pid,prod_name,price,short_description,category from ${constants.db_tables['ECOMMERCE_PRODUCTS']}`
    }

    db.queryWithOptions(options, (dbErr, dbResp) => {
        if (dbErr) {
            callback(dbErr, null)
        } else {
            callback(null, dbResp)
        }
    })
}

exports.getAllTasks = function (req, callback) {
    let options = {
        sql: `select * from ${constants.db_tables['TASK_MANAGER']};`
    }

    db.queryWithOptions(options, (dbErr, dbResp) => {
        if (dbErr) {
            callback(dbErr, null)
        } else {
            if (dbResp && dbResp.length > 0) {
                for (let i = 0; i < dbResp.length; i++) {
                    if (dbResp[i].created_date) dbResp[i].created_date = eComShopHelper.getDateTime(dbResp[i].created_date)
                    if (dbResp[i].modified_date) dbResp[i].modified_date = eComShopHelper.getDateTime(dbResp[i].modified_date)
                }
                callback(null, dbResp)
            } else {
                callback(null, null)
            }
        }
    })
}

exports.deleteTask = function (req, callback) {
    req.params.task_id = parseInt(req.params.task_id)
    let options = {
        sql: `delete from ${constants.db_tables['TASK_MANAGER']} where task_id = ${req.params.task_id}`
    }

    db.queryWithOptions(options, (dbErr, dbResp) => {
        if (dbErr) {
            callback(dbErr, null)
        } else {
            if (dbResp.affectedRows > 0) {
                callback(null, dbResp)
            } else {
                callback(null, null)
            }
        }
    })
}

exports.updateTask = function (req, callback) {
    req.params.task_id = parseInt(req.params.task_id)
    req.query.status = (req.query.status).toUpperCase()
    let updateTaskObject = eComShopHelper.updateTaskMapper(req)
    let options = {
        sql: `update ${constants.db_tables['TASK_MANAGER']} set ? where task_id = ?`,
        values: [updateTaskObject, req.params.task_id]
    }

    db.queryWithOptions(options, (dbErr, dbResp) => {
        if (dbErr) {
            callback(dbErr, null)
        } else {
            if (dbResp.affectedRows > 0) {
                callback(null, dbResp)
            } else {
                callback(null, null)
            }
        }
    })
}

