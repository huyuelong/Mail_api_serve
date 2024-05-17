const db = require('../db/index')
const jwt = require('jsonwebtoken');
const config = require('../config');

// 处理搜索请求
exports.Search = (req, res) => {

    const authorizationHeader = req.headers['authorization']
    const token = authorizationHeader?.replace("Bearer ", "")

    if (!token) {
        return res.status(401).json({ code: 0, msg: "未提供授权的访问令牌" })
    }

    const userId = getUserIdFromToken(token)

    if (!userId) {
        return res.status(401).json({ code: 0, msg: "未授权的访问" })
    }

    const searchTerm = req.query.term; // 获取搜索关键词
    console.log('term', searchTerm)

    // 构建SQL查询语句，模糊搜索商品名称和描述
    const query = `
    SELECT * FROM products
    WHERE 
        CONVERT(name USING utf8mb4) LIKE '%${searchTerm}%' COLLATE utf8mb4_general_ci OR 
        CONVERT(\`desc\` USING utf8mb4) LIKE '%${searchTerm}%' COLLATE utf8mb4_general_ci OR 
        CONVERT(brandname USING utf8mb4) LIKE '%${searchTerm}%' COLLATE utf8mb4_general_ci 
    `;
    // 执行查询
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ code: -1, msg: "获取错误" });
            return;
        }
        // 查询成功，将结果发送回前端
        res.json({
            code: 1,
            msg: "获取成功",
            result: results
        });
    });
}

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