let handler = require("./requestHandler.js");
let url = require("url");

function route(response, request) {
    let pathname = url.parse(request.url).pathname;

    let requestHandle = handler.handle[pathname]

    if ( typeof requestHandle == 'function') {
        requestHandle(response)
    } else {
        response.writeHead(200, {'Content-Type' : 'text/html'});
        response.write('Not Found - Cho YoungRae');
        response.end();
    }
}

exports.route = route;
