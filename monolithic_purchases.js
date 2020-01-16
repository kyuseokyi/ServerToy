const mysql = require('mysql');
const conn = {
    host: '35.221.122.70',
    user: 'micro',
    password: 'rbtjrl79',
    database: 'monolithic'
}

exports.onRequest = function (res, method, pathname, params, cb) {
    switch (method) {
        case "POST":
            return register(method, pathname, params, (reponse) => {
                process.nextTick(cb, res, reponse);
            });

        case "GET":
            return inquiry(method, pathname, params, (response) => {
                process.nextTick(cb, res, response);
            });
        default:
            return process.nextTick(cb, res, null);
    }
}

/**
 * 구매기능
 * @param method
 * @param pathname
 * @param params
 * @param cb
 */
function register (method, pathname, params, cb) {
    var response = {
        key: params.key,
        errorcode: 0,
        errormessage: "success"
    };

    if (params.username == null) {
        response.errorcode = 1;
        response.errormessage = "Invalid Parameters";
        cb(response);
    } else {
        var connection = mysql.createConnection(conn);
        connection.connect();
        connection.query("insert into pucrchases(userid, goodsid) values(? , ?)", [params.userid, params.goodsid], (error, results, fields) => {
            if (error) {
                response.errorcode = 1;
                response.errormessage = error;
            } else {
                response.results = results;
            }
            cb(response);
        });
        connection.end();
    }
}

/**
 * 구매 내역 조회 기능
 * @param method
 * @param pathname
 * @param params
 * @param cb
 */
function inquiry (method, pathname, params, cb) {
    var response = {
        key: params.key,
        errorcode: 0,
        errormessage: "success"
    };

    if (params.username == null) {
        response.errorcode = 1;
        response.errormessage = "Invalid Parameters";
        cb(response);
    } else {
        var connection = mysql.createConnection(conn);
        connection.connect();
        connection.query("select id, goodsid, date from purchases where userid = ?", [params.userid], (error, results, fields) => {
            if (error) {
                response.errorcode = 1;
                response.errormessage = error;
            } else {
                response.results = results;
            }
            cb(response);
        });
        connection.end();
    }
}