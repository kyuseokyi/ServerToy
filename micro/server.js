'use strict';

const net = require('net');
const tcpClient = require('./tcpClient');

class tcpServer {
    //생성자 서버정보
    constructor(name, port, urls) {
        this.context = {
            port: port,
            name: name,
            urls: urls
        };

        this.merge = {};

        this.server = net.createServer((socket) => {
           this.onCreate(socket);

           //에러 이벤트 처리
           socket.on('error', (exception) => {
               this.onClose(socket);
           });

           //클라이언트 접속 종료 이벤트
           socket.on('close', () => {
               this.onClose(socket);
           });

           //데이터 수신 처리.
           socket.on('data', (data) => {
               var key = socket.remoteAddress + ":" + socket.remotePort;
               var sz = this.merge[key] ? this.merge[key] + data.toString() : data.toString();

               var arr = sz.split('¶');

               for (var n in arr) {
                   if (sz.charAt(sz.length -1) !== '¶' && n === arr.length -1) {
                       this.merge[key] = arr[n];
                       break;
                   } else if (arr[n] === "") {
                       break;
                   } else {
                       this.onRead(socket, JSON.parse(arr[n]));
                   }
               }
           });
        });

        //서버 객체 에러처리
        this.server.on('error', (err) => {
            console.log(err);
        });

        this.server.listen(port, () => {
            console.log('listen', this.server.address());
        });
    }

    onCreate(socket) {
        console.log("onCreate", socket.remoteAddress, socket.remotePort);
    }

    onClose(socket) {
        console.log("onClose", socket.remoteAddress, socket.remotePort);
    }

    //Distributor 접속 함수
    connectToDistributor(host, port, onNoti) {
        var packet = {
            uri: "/distributes",
            method: "POST",
            key: 0,
            params: this.context
        };

        var isConnectedDistributor = false;

        this.clientDistributor = new tcpClient(
            host,
            port,
            (options) => {
                isConnectedDistributor = true;
                this.clientDistributor.write(packet);
            },
            (options, data) => { onNoti(data); },
            (options) => { isConnectedDistributor = false; },
            (options) => { isConnectedDistributor = false; }
        );

        //지속적인 접속 시도
        setInterval(() => {
           if (isConnectedDistributor !== true) {
               this.clientDistributor.connect();
           }
        }, 3000);
    }

    connect() {

    }
}

module.exports = tcpServer;