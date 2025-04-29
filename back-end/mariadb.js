const mysql = require("mysql2");

const conn = mysql.createConnection(
    {
        host: "127.0.0.1",
        port: 3306,
        user: "root",
        password: "root",
        database: "Board",
        dateStrings: true
    }
);
    
module.exports = conn;