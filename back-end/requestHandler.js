let handle = {};
const mariadb = require("./database/connect/mariadb");
let fs = require('fs');

let html_doc = fs.readFileSync('../front-end/market/main.html', 'utf8');
let orderlist_html = fs.readFileSync('../front-end/market/orderlist.html', 'utf8');

// 메인화면
function main(response) {       // main화면면
    console.log("Main Page")

    function consoleDB(err, row) {
        console.log(row)
    }

    mariadb.query('select * from product', consoleDB);

    response.writeHead(200, {'Content-Type' : 'text/html'});
    response.write(html_doc);
    response.end();
}

// 주문 성공 화면
function order(response) {

    function consoleDB(err, row) {
        console.log(row)
    }

    mariadb.query('select * from orderlist', consoleDB);

    response.writeHead(200, {'Content-Type' : 'text/html'});
    response.write('Order Success');
    response.end();
}

// 주문 리스트 화면
function orderlist_page(response) {

    function make_new_table(err, orderlist_tabledata) {
        if (err) {
            console.error(err);
            response.writeHead(500, {'Content-Type': 'text/html'});
            response.end('Database error');
            return;
        }

        let table_row = "";
        for (let row of orderlist_tabledata) {
            table_row += `<tr>
                <td>${row.productId}</td>
                <td>${row.orderDate}</td>
            </tr>`;
        }

        const modifiedHtml = orderlist_html.replace('</table>', table_row + '</table>')

        response.writeHead(200, {'Content-Type' : 'text/html'});
        response.write(modifiedHtml);
        response.end();
    }

    const orderlist_tabledata = mariadb.query("select * from orderlist", make_new_table);
}

// 주문 데이터 Insert
function insertOrder(query_data) {    // 주문 내용을 DB에 insert한다.
    const column_value = query_data.productId;
    mariadb.query(`insert into orderlist values (${column_value}, '${new Date().toLocaleDateString()}')`);
}

/* 이미지 불러오기 */
function redRacket(response) {
    function racket_callback(err, data) {
        response.writeHead(200, {'Content-Type' : 'text/html'});
        response.write(data);
        response.end();
    }
    fs.readFile('../front-end/market/img/redRacket.png', racket_callback)
}

function blueRacket(response) {
    function racket_callback(err, data) {
        response.writeHead(200, {'Content-Type' : 'text/html'});
        response.write(data);
        response.end();
    }
    fs.readFile('../front-end/market/img/blueRacket.png', racket_callback)
}

function blackRacket(response) {
    function racket_callback(err, data) {
        response.writeHead(200, {'Content-Type' : 'text/html'});
        response.write(data);
        response.end();
    }
    fs.readFile('../front-end/market/img/blackRacket.png', racket_callback)
}

/* 함수 dictionary */
handle['/'] = main;
handle['/order'] = order;
handle['/orderlist'] = orderlist_page;
handle['/img/redRacket.png'] = redRacket;
handle['/img/blueRacket.png'] = blueRacket;
handle['/img/blackRacket.png'] = blackRacket;

module.exports = {
    handle: handle,
    insertOrder: insertOrder
};
