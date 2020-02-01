'use strict';

const business = require('../../monolithic_members')
const server = require('../server')

class members extends server {

    constructor() {
        super("members", process.argv[2] ? Number(process.argv[2]) : 9020, ["POST/members", "GET/members", "DELETE/members"]);

        this.connectToDistributor("127.0.0.1", 9000, (data) => {
            console.log("Distrubutor Notification", data);
        });
    }

    // 클라이언트 요청에 따른 비즈니스 로직 호출
    onRead(socekt, data) {
        console.log("onRead", socket.remoteAddress, socket.remotePort, data);
        business.onRequest(socket, data.method, data.uri, data.params, (s, packet) => {
           socket.write(JSON.stringify(packet) + '¶');
        });
    }
}

new members();