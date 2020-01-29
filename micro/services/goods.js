'use strict';

const business = require('../../monolithic_goods');
const server = require('../server')

class goods extends server {

    constructor() {
        super("goods", process.argv[2] ? Number(process.argv[2]) : 9010, ["POST/goods", "GET/goods", "DELETE/goods"]);

        this.connectToDistributor("127.0.0.1", 9000, (data) => {
            console.log("Distrubutor Notification", data);
        });
    }
}

new goods();