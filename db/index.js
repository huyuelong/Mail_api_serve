const mysql = require('mysql')

// 创建数据路连接对象
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: 'My_DB01',
    charset: 'utf8mb4'
})

// 向外共享 db 数据库连接对象
module.exports = db