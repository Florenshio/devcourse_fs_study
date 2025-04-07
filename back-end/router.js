let handler = require("./requestHandler.js");
let url = require("url");

function route(response, request) {
    let pathname = url.parse(request.url).pathname;
    const query_data = url.parse(request.url, true).query;

    console.log(pathname)

    let requestHandle = handler.handle[pathname]

    if (query_data.productId) {
        handler.insertOrder(query_data)
    }

    if ( typeof requestHandle == 'function') {
        requestHandle(response)
    } else {
        response.writeHead(200, {'Content-Type' : 'text/html'});
        response.write('Not Found - Cho YoungRae');
        response.end();
    }
}

exports.route = route;
