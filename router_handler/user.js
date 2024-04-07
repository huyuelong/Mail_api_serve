// 导入数据库操作模块
const db = require('../db/index');
// 导入 bcryptjs 
const bcrypt = require('bcryptjs');
// 导入生成 Token 的包
const jwt = require('jsonwebtoken');
// 导入全局配置文件
const config = require('../config');

// 注册新用户的处理函数
exports.regUser = (req, res) => {
    // 获取客户端提交到服务器的用户信息
    const { username, password } = req.body;

    // 定义 SQL 语句, 查询用户名是否被占用
    const sqlStr = 'SELECT * FROM users WHERE username=?';
    db.query(sqlStr, username, (err, results) => {
        // 执行 SQL 语句失败
        if (err) {
            return res.cc(err);
        }
        // 判断用户名是否占用
        if (results.length > 0) {
            return res.cc('用户名被占用, 请更换其他用户名！');
        }

        // 调用 bcrypt.hashSync() 对密码进行加密
        const hashedPassword = bcrypt.hashSync(password, 10);

        // 定义插入新用户的 SQL 语句
        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';

        // 执行 SQL 语句，插入新用户
        db.query(sql, [ username, hashedPassword ], (err, results) => {
            if (err) return res.cc(err);
            // 判断影响行数是否为 1
            if (results.affectedRows != 1) return res.cc('注册用户失败，请稍后再试！');
            // 注册用户成功
            res.cc('注册用户成功！', 0);
        });
    });
};


// 用户登录处理函数
exports.login = (req, res) => {
    const { username, password } = req.body;

    // 检查请求体中是否包含用户名或密码
    if (!username || !password) {
        return res.status(400).json({ status: 0, message: '用户名或密码不能为空', result: null });
    }

    const sql = 'SELECT * FROM users WHERE username=?';

    // 执行 SQL 查询，根据用户名获取用户信息
    db.query(sql, username, (err, results) => {
        if (err) {
            console.error('数据库查询出错:', err);
            return res.status(500).json({ status: 0, message: '服务器内部错误', result: null });
        }

        // 检查是否找到唯一用户
        if (results.length !== 1) {
            return res.status(401).json({ status: 0, message: '用户名或密码错误', result: null });
        }

        const user = results[0];

        // 比较提供的密码与数据库中的哈希密码
        const compareResult = bcrypt.compareSync(password, user.password);
        if (!compareResult) {
            return res.status(401).json({ status: 0, message: '用户名或密码错误', result: null });
        }

        // 生成包含用户信息的 JWT 令牌
        const tokenstr = jwt.sign({
            name: user.username,
            id: user.id,
        }, config.jwtSecretKey, { expiresIn: config.expiresIn });

        // 返回指定格式的成功登录响应
        res.json({
            code: '1',
            msg: '登录成功',
            result: {
                id: user.id,
                username: user.username,
                mobile: user.mobile, // 添加了手机字段
                token: 'Bearer ' + tokenstr,  // 方便前端直接拼接
                user_avatar: user.user_avatar,
                nickname: user.nickname,
                gender: user.gender,
                birthday: user.birthday,
                cityCode: user.cityCode,
                provinceCode: user.provinceCode,
                profession: user.profession
            }
        });
    });
};
