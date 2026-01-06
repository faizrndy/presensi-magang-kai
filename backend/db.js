const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",          // sesuaikan
  password: "",          // sesuaikan
  database: "absensi_db",
});

module.exports = db;
