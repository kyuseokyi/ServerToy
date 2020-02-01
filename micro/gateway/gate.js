const http = require('http');
const url = require('url');
const querystring = require('querystring');
const tcpClient = require('../tcpClient')

var mapClients = {};
var mapUrls = {};
var mapRespnose = {};
var mapRR = {};
var index = 0;

var server = http.createServer((req, res) => {
   var method = req.method;
   var uri = url.parse(req.url, true);
   var pathname = uri.pathname;

   if (method === "POST" || method === "PUT") {
       var body = "";

       req.on('data', function (data) {
          body += data;
       });

       req.on('end', function () {
          var params;
          if (req.headers['content-type'] == "application/json") {
              params = JSON.parse(body);
          } else {
              params = querystring.parse(body);
          }

          onRequest(res, method, pathname, params);
       });
   } else {
       onRequest(res, method, pathname, uri.query);
   }
}).listen(8000, () => {
    console.log('listen', server.address());

    // Distributor 전달 패킷
    var packet = {
        uri: "/distributes",
        method: "POST",
        key: 0,
        params: {
            port: 8000,
            name: "gate",
            urls: []
        }
    };

    var isConnectedDistributor = false;

    this.clientDistributor = new tcpClient(
        "127.0.0.1",
        9000,
        (options) => {
            isConnectedDistributor = true;
            this.clientDistributor.write(packet);
        },
        (options, data) => { onDistribute(data); },
        (options) => { isConnectedDistributor = false; },
        (options) => { isConnectedDistributor = false; }
    );

    //Distributor 서버 지속적인 접속 확인.
    setInterval(() => {
       if (isConnectedDistributor != true) {
           this.clientDistributor.connect();
       }
    }, 3000);
});

/**
 * api 호출 처리.
 * @param res
 * @param method
 * @param pathname
 * @param params
 */
function onRequest(res, method, pathname, params) {
   var key = method + pathname;
   var client = mapUrls[key];
   if (client == null) {
       res.writeHead(404);
       res.end();
       return;
   } else {
       params.key = index; // api 호출에 대한 고유키 값 설정.
       var packet = {
           uri: pathname,
           method: method,
           params: params
       }

       mapRespnose[index] = res;
       index++;

       if (mapRR[key] == null) {  // 라운드 로빈 처리.
           mapRR[key] = 0;
       }
       mapRR[key]++;
       client[mapRR[key] % client.length].write(packet);
   }
}

/**
 * Distibutor   접속 처리.
 * @param data
 */
function onDistribute(data) {
    for (var n in data.params) {
        var node = data.params[n];
        var key = node.host + ":" + node.port;
        if (mapClients[key] == null && node.name != "gate") {
            var client = new tcpClient(node.host, node.port, onCreateClient, onReadClient, onEndClient, onErrorClient);

            //마이크로서비스 연결 정보 저장.
            mapClients[key] = {
                client: client,
                info: node
            };

            //마이크로서비스  url 정보 저장.
            for (var m in node.urls) {
                var key = node.urls[m];
                if (mapUrls[key] == null) {
                    mapUrls[key] = [];
                }
                mapUrls[key].push(client);
            }
            client.connect()
        }
    }
}

/**
 * 마이크로서비스 접속 이벤트 처리.
 */
function onCreateClient() {
    console.log("onCreateClient");
}

/**
 * 마이크로서비스 응답처리.
 * @param options
 * @param packet
 */
function onReadClient(options, packet) {
    console.log("onReadClient", packet);
    mapRespnose[packet.key].writeHead(200, { 'Content-Type': 'application/json' });
    mapRespnose[packet.key].end(JSON.stringify(packet));
    delete mapRespnose[packet.key]; //http 응답 객체 삭제
}

/**
 * 마이크로서비스 접속 종료 처리.
 * @param options
 */
function onEndClient(options) {
    var key = options.host + ":" + options.port;
    console.log("onEndClient", mapClients[key]);
    for (var n in mapClients[key].info.urls) {
        var node = mapclients[key].info.urls[n];
        delete mapUrls[node];
    }

    delete mapClients[key];
}

/**
 *
 * @param options
 */
function onErrorClient(options) {
    console.log("onErrorClient");
}