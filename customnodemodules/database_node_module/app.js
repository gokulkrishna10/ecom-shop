// const mysql = require("mysql");
const mysql = require('mysql2')
const rdsConfigVal = require("../project_config/rds_config/rdsconfig");

const read_connection = mysql.createConnection({
    host: rdsConfigVal.rds_host,
    user: rdsConfigVal.rds_user,
    password: rdsConfigVal.rds_password,
    database: rdsConfigVal.rds_data_base,
    connectionLimit: rdsConfigVal.rds_no_of_connections, //important
    debug: false,
    //acquireTimeout: rdsConfigVal.rds_connections_timeout,
    waitForConnections: true,
    connectTimeout: rdsConfigVal.rds_connections_timeout
});

const read_pool = mysql.createPool({
    connectionLimit: rdsConfigVal.rds_no_of_connections, //important
    host: rdsConfigVal.rds_host,
    user: rdsConfigVal.rds_user,
    password: rdsConfigVal.rds_password,
    database: rdsConfigVal.rds_data_base,
    debug: false,
    //acquireTimeout: rdsConfigVal.rds_connections_timeout,
    waitForConnections: true,
    connectTimeout: rdsConfigVal.rds_connections_timeout
});


const failover_read_pool = mysql.createPool({
    connectionLimit: rdsConfigVal.rds_no_of_connections, //important
    host: rdsConfigVal.rds_host,
    user: rdsConfigVal.rds_user,
    password: rdsConfigVal.rds_password,
    database: rdsConfigVal.rds_data_base,
    debug: false,
    //acquireTimeout: rdsConfigVal.rds_connections_timeout,
    waitForConnections: true,
    connectTimeout: rdsConfigVal.rds_failover_no_of_connection
});

function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}

function pingService(conn) {
    conn.ping(pingErr => {
        if (pingErr) {
            return pingErr;
        } else {
            return false;
        }
    })
}


function getReadConnection(callback) {
    read_pool.getConnection(async (err, conn) => {
        if (err) {
            console.log(err);
            await sleep(500);
            getFailoverReadConnection(async (failOverErr, failOverConn) => {
                if (failOverErr) {
                    console.log(failOverErr);
                    callback(failOverErr, null)
                } else {
                    let pingFlag = pingService(failOverConn);
                    if (pingFlag) {
                        console.log(pingFlag)
                        await sleep(500);
                        callback(pingFlag, null)
                    } else {
                        callback(null, failOverConn);
                    }
                }
            })
        } else {
            let pingFlag = pingService(conn)
            if (pingFlag) {
                console.log(pingFlag)
                await sleep(500);
                getFailoverReadConnection(async (failOverErr, failOverConn) => {
                    if (failOverErr) {
                        console.log(failOverErr);
                        callback(failOverErr, null)
                    } else {
                        let pingFlagFail = pingService(failOverConn)
                        if (pingFlagFail) {
                            console.log(pingFlagFail)
                            await sleep(500);
                            callback(pingFlagFail, null)
                        } else {
                            callback(null, failOverConn);
                        }
                    }
                })
            } else {
                callback(null, conn);
            }
        }
    });
}

function getFailoverReadConnection(callback) {
    failover_read_pool.getConnection(async (err, conn) => {
        if (err) {
            console.log(err);
            await sleep(500);
            read_connection.connect();
            let pingFlag = pingService(read_connection)
            if (pingFlag) {
                console.log(pingFlag)
                callback(pingFlag, null)
            } else {
                callback(null, read_connection);
            }
        } else {
            let pingFlag = pingService(conn)
            if (pingFlag) {
                console.log(pingFlag);
                await sleep(500);
                read_connection.connect();
                let pingFlagRead = pingService(read_connection)
                if (pingFlagRead) {
                    console.log(pingFlagRead)
                    callback(pingFlagRead, null)
                } else {
                    callback(null, read_connection);
                }
            } else {
                callback(null, conn);
            }
        }
    });
}


/*** to Use for GET requests */


exports.queryWithOptions = function (options, callback) {
    getReadConnection(function (err, con) {
        if (err) {
            callback(err, null);
        } else {
            con.query(options, function (err, rows) {

                releaseConnection(con);

                if (err) {
                    callback(err, null);
                } else {
                    callback(null, rows);
                }
            });
        }
    });
};


/** Multiple sequenced updates/inserts with/without transaction support */

exports.executeMultipleWithOptions = function (mOptions, isTransaction, callback) {

    if (!mOptions || (!(mOptions instanceof Array)) || mOptions.length <= 0) {
        callback(null, null);
    } else {
        getReadConnection(function (err, con) {
            if (err) {
                callback(err, null);
            } else {
                if (isTransaction) {
                    con.beginTransaction(function (err) {
                        if (err) {
                            callback(err, null);
                        } else {
                            var resultList = new Array(mOptions.length);
                            executeSequencedQuery(mOptions, 0, con, resultList, function (err) {
                                if (err) {
                                    rollbackTransaction(con, err, callback);
                                } else {
                                    commitTransaction(con, resultList, callback);
                                }
                            });
                        }
                    });
                } else {
                    var resultList = new Array(mOptions.length);
                    executeSequencedQuery(mOptions, 0, con, resultList, function (err) {
                        releaseConnection(con);
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, resultList);
                        }
                    });
                }
            }
        });
    }
};

function executeSequencedQuery(mOptions, i, con, resultList, callback) {

    var options = mOptions[i];
    con.query(options, function (err, rows) {
        if (err) {
            callback(err);
        } else {
            resultList[i] = rows;
            if ((i + 1) < mOptions.length) {
                executeSequencedQuery(mOptions, i + 1, con, resultList, function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            } else {
                callback(null);
            }
        }
    });

}

function rollbackTransaction(con, err, callback) {
    con.rollback(function () {
        releaseConnection(con);
        callback(err, null);
    });
}

function commitTransaction(con, result, callback) {
    con.commit(function (err) {
        if (err) {
            rollbackTransaction(con, err, callback);
        } else {
            try {
                con.release();
            } catch (e) {
            }
            callback(null, result);
        }

    });
}

function releaseConnection(con) {
    try {
        con.release();
    } catch (e) {
    }
}

exports.getReadConnection = getReadConnection;
