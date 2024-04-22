// 导入数据库操作模块
const db = require('../db/index')
// 导入 bcryptjs 
const bcrypt = require('bcryptjs')
// 导入生成 Token 的包
const jwt = require('jsonwebtoken')
// 导入全局配置文件
const config = require('../config');
const fs = require('fs');
const path = require('path');
const { result } = require('@hapi/joi/lib/base');

// 注册新用户的处理函数
exports.regUser = (req, res) => {
    // 获取客户端提交到服务器的用户信息
    const { username, password } = req.body

    // 定义 SQL 语句, 查询用户名是否被占用
    const sqlStr = 'SELECT * FROM users WHERE username=?'
    db.query(sqlStr, username, (err, results) => {
        // 执行 SQL 语句失败
        if (err) {
            return res.cc(err)
        }
        // 判断用户名是否占用
        if (results.length > 0) {
            return res.cc('用户名被占用, 请更换其他用户名！')
        }

        // 调用 bcrypt.hashSync() 对密码进行加密
        const hashedPassword = bcrypt.hashSync(password, 10)

        // 定义插入新用户的 SQL 语句
        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)'

        // 执行 SQL 语句，插入新用户
        db.query(sql, [username, hashedPassword], (err, results) => {
            if (err) return res.cc(err)
            // 判断影响行数是否为 1
            if (results.affectedRows != 1) return res.cc('注册用户失败，请稍后再试！')
            // 注册用户成功
            res.cc('注册用户成功！', 0)
        });
    });
};


// 用户登录处理函数
exports.login = (req, res) => {
    const { username, password } = req.body

    // 检查请求体中是否包含用户名或密码
    if (!username || !password) {
        return res.status(400).json({ status: 0, message: '用户名或密码不能为空', result: null })
    }

    const sql = 'SELECT * FROM users WHERE username=?'

    // 执行 SQL 查询，根据用户名获取用户信息
    db.query(sql, username, (err, results) => {
        if (err) {
            console.error('数据库查询出错:', err)
            return res.status(500).json({ status: 0, message: '服务器内部错误', result: null })
        }

        // 检查是否找到唯一用户
        if (results.length !== 1) {
            return res.status(401).json({ status: 0, message: '用户名或密码错误', result: null })
        }

        const user = results[0]

        // 比较提供的密码与数据库中的哈希密码
        const compareResult = bcrypt.compareSync(password, user.password)
        if (!compareResult) {
            return res.status(401).json({ status: 0, message: '用户名或密码错误', result: null })
        }

        // 生成包含用户信息的 JWT 令牌
        const tokenstr = jwt.sign({
            name: user.username,
            id: user.id,
        }, config.jwtSecretKey, { expiresIn: config.expiresIn })

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
        })
    })
}


// 获取用户全部信息
exports.getUserInfo = (req, res) => {
    const authorizationHeader = req.headers['authorization']
    const token = authorizationHeader?.replace("Bearer ", "")
    if (!token) {
        return res.status(401).json({ code: 0, msg: "未提供授权的访问令牌" })
    }
    const userId = getUserIdFromToken(token)

    if (!userId) {
        return res.status(401).json({ code: 0, msg: "未授权的访问" })
    }

    const sql = `select * from users where id = ?`
    db.query(sql, userId, (err, result) => {
        if (err) {
            console.log("error fetching userinfo:", err)
            return res.status(500).json({ code: -1, msg: "服务器错误" })
        }
        return res.json({
            code: 1,
            msg: "获取用户信息成功",
            result: result
        })
    })
}


// 修改用户信息
exports.updateUserInfo = (req, res) => {
    const authorizationHeader = req.headers['authorization']
    const token = authorizationHeader?.replace("Bearer ", "")

    if (!token) {
        return res.status(401).json({ code: 0, msg: "未提供授权的访问令牌" })
    }

    const userId = getUserIdFromToken(token)

    if (!userId) {
        return res.status(401).json({ code: 0, msg: "未授权的访问" })
    }

    // 从请求参数中获取地址 ID 和新的地址信息
    console.log(req.body)
    const { user_avatar, nickname, gender, phone, email, birthday, profession } = req.body

    // 在这里执行数据库更新操作
    const sql = `UPDATE users SET user_avatar=?, nickname=?, gender=?, phone=?, email=?, birthday=?, profession=? WHERE id=?`
    const values = [user_avatar, nickname, gender, phone, email, birthday, profession, userId]
    db.query(sql, values, (error, results) => {
        if (error) {
            return res.status(500).json({ code: "-1", msg: "服务器错误", result: req.body })
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ code: "0", msg: "未找到要修改的信息或权限不足", result: { user_avatar, nickname, gender, phone, email, birthday, profession } })
        }
        return res.status(200).json({ code: "1", msg: "修改用户信息成功", result: req.body })
    })
}


// 更新用户头像
exports.updateUserAvatar = (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({ code: 0, msg: "未提供授权的访问令牌" });
    }
    const userId = getUserIdFromToken(token);

    if (!userId) {
        return res.status(401).json({ code: 0, msg: "未授权的访问" });
    }
    // console.log(req.body)
    console.log(req.body.user_avatar)
    const user_avatar_base64 = req.body.user_avatar;
    if (!user_avatar_base64) {
        return res.status(400).json({ code: 0, msg: "未提供用户头像数据" });
    }

    // 从Base64解码用户头像数据
    const user_avatar_buffer = Buffer.from(user_avatar_base64.split(',')[1], 'base64');
    const user_avatar_filename = `avatar_${userId}.png`;
    // 
    const avatarDirectory = 'C:\\Users\\94991\\Desktop\\Mail\\web\\public\\assets\\avatars';
    const user_avatar_path = path.join(avatarDirectory, user_avatar_filename);

    // 将二进制数据保存为图像文件
    fs.writeFile(user_avatar_path, user_avatar_buffer, (err) => {
        if (err) {
            console.log("error saving user avatar:", err);
            return res.status(500).json({ code: -1, msg: "服务器错误" });
        }

        // 更新数据库
        const sql = `UPDATE users SET user_avatar = ? WHERE id = ?`;
        db.query(sql, [user_avatar_path, userId], (err, result) => {
            if (err) {
                console.log("error updating user avatar:", err);
                return res.status(500).json({ code: -1, msg: "服务器错误" });
            }
            return res.json({
                code: 1,
                msg: "更新用户头像成功",
                result: { user_avatar: user_avatar_path }
            });
        });
    });
};




// 自定义函数：从授权的 token 中获取用户 ID
function getUserIdFromToken(token) {
    if (!token) {
        return null
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecretKey)
        return decoded.id
    } catch (error) {
        console.error('Error decoding token:', error)
        return null
    }
}
