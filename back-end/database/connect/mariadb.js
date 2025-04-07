const db = require("mysql");

const conn = db.createConnection(
    {
        host: "localhost",
        port: 3306,
        user: "root",
        password: "root",
        database: "Tennis"
    }
);

module.exports = conn;