'use strict';

const business = require('../../monolithic_purchases')
const server = require('../server')

class purchases extends server {
    constructor() {
        super("purchases", process.argv[2] ? Number(process.argv[2]) : 9030, ["POST/purchases", "GET/purchases"]);

        this.connectToDistributor("127.0.0.1", 9000, (data) => {
            console.log("Distrubutor Notification", data);
        });
    }

    // 클라이언트 요청에 따른 비즈니스 로직 호출
    onRead(socket, data) {
        console.log("onRead", socket.remoteAddress, socket.remotePort, data);
        business.onRequest(socket, data.method, data.uri, data.params, (s, packet) => {
           socket.write(JSON.stringify(packet) + '¶');
        });
    }
}

new purchases();