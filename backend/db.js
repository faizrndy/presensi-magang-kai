const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // sesuaikan dengan password kamu
  database: "absensi_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true, // Menjaga koneksi tetap hidup
  keepAliveInitialDelay: 0
});

module.exports = db;