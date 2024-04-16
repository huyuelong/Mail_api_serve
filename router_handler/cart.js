const db = require('../db/index')
const jwt = require('jsonwebtoken')
const config = require('../config')

// 添加购物车
exports.addCart = (req, res) => {
    console.log("Request body:", req.body); // 打印请求体
    const { skuId, count } = req.body
    const authorizationHeader = req.headers['authorization']
    const token = authorizationHeader?.replace("Bearer ", "")

    if (!token) {
        return res.status(401).json({ code: 0, msg: "未提供授权的访问令牌" })
    }

    const userId = getUserIdFromToken(token)

    if (!userId) {
        return res.status(401).json({ code: 0, msg: "未授权的访问" })
    }

    // 查询用户购物车中是否已经存在相同的 skuId
    const checkExistingCartQuery = 'SELECT * FROM cart WHERE userId = ? AND skuId = ?'
    const checkExistingCartValues = [userId, skuId]

    db.query(checkExistingCartQuery, checkExistingCartValues, (checkErr, checkResult) => {
        if (checkErr) {
            console.error("Error checking existing cart:", checkErr)
            return res.status(500).json({ code: -1, msg: "服务器错误" })
        }

        if (checkResult.length > 0) {
            // 如果购物车中已经存在相同的 skuId，则更新数量
            const updateCartQuery = 'UPDATE cart SET count = count + ? WHERE userId = ? AND skuId = ?'
            const updateCartValues = [count, userId, skuId]

            db.query(updateCartQuery, updateCartValues, (updateErr, updateResult) => {
                if (updateErr) {
                    console.error("Error updating cart:", updateErr)
                    return res.status(500).json({ code: -1, msg: "服务器错误" })
                }

                return res.json({
                    code: 1,
                    msg: "更新购物车成功",
                    result: updateResult
                });
            });
        } else {
            // 如果购物车中不存在相同的 skuId，则插入新记录
            const insertCartQuery = 'INSERT INTO cart (userId, skuId, count) VALUES (?, ?, ?)'
            const insertCartValues = [userId, skuId, count]

            db.query(insertCartQuery, insertCartValues, (insertErr, insertResult) => {
                if (insertErr) {
                    console.error("Error adding to cart:", insertErr);
                    return res.status(500).json({ code: -1, msg: "服务器错误" })
                }

                return res.json({
                    code: 1,
                    msg: "添加购物车成功",
                    // result: insertResult,
                    result: {
                        skuId: skuId,
                        count: count
                    },
                });
            });
        }
    });
};


// 获取购物车列表
exports.getCart = (req, res) => {
    const authorizationHeader = req.headers['authorization']
    const token = authorizationHeader?.replace("Bearer ", "")
    if (!token) {
        return res.status(401).json({ code: 0, msg: "未提供授权的访问令牌" })
    }
    const userId = getUserIdFromToken(token)

    if (!userId) {
        return res.status(401).json({ code: 0, msg: "未授权的访问" })
    }

    const sql = `
        SELECT cart.id, cart.userId, cart.skuId, cart.count, cart.selected,
               skus.productId, skus.skuCode, skus.price, skus.oldPrice, skus.inventory, skus.picture, skus.attrsText,
               products.name
        FROM cart
        INNER JOIN skus ON cart.skuId = skus.id
        INNER JOIN products ON skus.productId = products.id
        WHERE cart.userId = ?
    `;
    const values = [userId]

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error fetching cart items:", err)
            return res.status(500).json({ code: -1, msg: "服务器错误" })
        }

        return res.json({
            code: 1,
            msg: "获取购物车列表成功",
            result: result
        })
    })
}

// 删除购物车
exports.deleteCart = (req, res) => {
    const authorizationHeader = req.headers['authorization']
    const token = authorizationHeader?.replace("Bearer ", "")
    const { skuIds } = req.body;
    if (!token) {
        return res.status(401).json({ code: 0, msg: "未提供授权的访问令牌" })
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
        return res.status(401).json({ code: 0, msg: "未授权的访问" })
    }

    // 确保skuIds是一个数组
    if (!Array.isArray(skuIds)) {
        return res.status(400).json({ code: 0, msg: "skuIds 应为数组" })
    }

    // 根据userId和skuIds删除购物车中的商品项
    const sql = `DELETE FROM cart WHERE userId = ? AND skuId IN (?)`
    const values = [userId, skuIds]

    db.query(sql, values, (deleteErr, deleteResult) => {
        if (deleteErr) {
            console.error("Error deleting cart items:", deleteErr)
            return res.status(500).json({ code: -1, msg: "服务器错误" })
        }

        // 返回成功响应
        return res.json({
            code: 1,
            msg: "删除购物车商品成功",
            result: deleteResult
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
