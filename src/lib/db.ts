import mysql from 'mysql2/promise';
// ket noi csdl
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Cuongchi03',
    database: 'web_management',
});

export default db;
