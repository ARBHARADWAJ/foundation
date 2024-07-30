const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Replace with your MySQL root password
  database: 'ecommers'
});

db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('Connected to database');
});

module.exports = db;
