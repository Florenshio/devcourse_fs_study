let http = require("http");
let router = require("./router.js");

function onRequest(request, response) {
    router.route(response, request)
}

function start() {
    http.createServer(onRequest).listen(8888);
}

exports.start = start;