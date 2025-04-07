let handle = {};

function main(response) {
    console.log("Main Page")

    response.writeHead(200, {'Content-Type' : 'text/html'});
    response.write('Main Page - Cho YoungRae');
    response.end();
}

function login(response) {
    console.log("Login Page")

    response.writeHead(200, {'Content-Type' : 'text/html'});
    response.write('Login Page - Cho YoungRae');
    response.end();
}

handle['/'] = main;
handle['/login'] = login;

exports.handle = handle;
