// 导入数据库操作模块
const db = require('../db/index')
// 导入 bcryptjs 
const bcrypt = require('bcryptjs')

// 注册新用户的处理函数
exports.regUser = (req, res) => {
    // 获取客户端提交到服务器的用户信息
    const userinfo = req.body
    // 对表单中的数据，进行合法性的校验
    if (!userinfo.username || !userinfo.password) {
        return res.send({ status: 1, message: '用户名或密码不合法' })
    }

    // 定义 SQL 语句, 查询用户名是否被占用
    const sqlStr = 'select * from users where username=?'
    db.query(sqlStr, userinfo.username, (err, results) => {
        // 执行 SQL 语句失败
        if (err) {
            return res.send({ status: 1, message: err.message })
        }
        // 判断用户名是否占用
        if (results.length > 0) {
            return res.send({ status: 1, message: '用户名被占用, 请更换其他用户名' })
        }
        // 用户名可以使用
        // 调用 bcrypt.hashSync() 对密码进行加密
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)
        // 定义插入新用户的 SQL 语句
        const sql = 'insert into users set ?'
        // 执行 SQL 语句
        db.query(sql, { username: userinfo.username, password: userinfo.password }, (err, results) => {
            if (err) return res.send({ status: 1, message: err.message })
            // 判断影响行数是否为 1
            if (results.affectedRows != 1) return res.send({ status: 1, message: '注册用户失败， 请稍后再试！' })
            // 注册用户成功
            res.send({status: 0, message: '注册用户成功！'})
        })
    })
}    

// 登录的处理函数
exports.login = (req, res) => {
    res.send('login OK')
}