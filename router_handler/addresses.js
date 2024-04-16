const db = require('../db/index')
const jwt = require('jsonwebtoken')
const config = require('../config')

// 获取收货地址
exports.getAddress = (req, res) => {
    const authorizationHeader = req.headers['authorization']
    const token = authorizationHeader?.replace("Bearer ", "")

    if (!token) {
        return res.status(401).json({ code: 0, msg: "未提供授权的访问令牌" })
    }

    const userId = getUserIdFromToken(token)

    if (!userId) {
        return res.status(401).json({ code: 0, msg: "未授权的访问" })
    }

    const query = `SELECT * FROM addresses WHERE userId = ?`
    db.query(query, userId, (error, results) => {
        if (error) {
            return res.status(500).json({ code: "-1", msg: "服务器错误" })
        }
        const formattedResults = results.map(result => ({
            id: result.id,
            receiver: result.receiver,
            contact: result.contact,
            provinceCode: result.provinceCode,
            cityCode: result.cityCode,
            countyCode: result.countyCode,
            address: result.address,
            isDefault: result.isDefault,
            fullLocation: result.fullLocation,
            postalCode: result.postalCode,
            addressTags: result.addressTags
        }));
        return res.status(200).json({ code: "1", msg: "获取成功", result: formattedResults })
    })
}

// 添加收货地址
exports.addAddress = (req, res) => {
    const authorizationHeader = req.headers['authorization']
    const token = authorizationHeader?.replace("Bearer ", "")

    if (!token) {
        return res.status(401).json({ code: 0, msg: "未提供授权的访问令牌" })
    }

    const userId = getUserIdFromToken(token)

    if (!userId) {
        return res.status(401).json({ code: 0, msg: "未授权的访问" })
    }

    // 从请求体中获取收货地址信息
    const { receiver, contact, provinceCode, cityCode, countyCode, address, isDefault, fullLocation, postalCode, addressTags } = req.body

    // 在这里执行数据库插入操作
    const query = `INSERT INTO addresses (userId, receiver, contact, provinceCode, cityCode, countyCode, address, isDefault, fullLocation, postalCode, addressTags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    const values = [userId, receiver, contact, provinceCode, cityCode, countyCode, address, isDefault, fullLocation, postalCode, addressTags]
    db.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ code: "-1", msg: "服务器错误" })
        }
        return res.status(200).json({ code: "1", msg: "添加收货地址成功" })
    });
};

// 删除收货地址
exports.deleteAddress = (req, res) => {
    const authorizationHeader = req.headers['authorization']
    const token = authorizationHeader?.replace("Bearer ", "")

    if (!token) {
        return res.status(401).json({ code: 0, msg: "未提供授权的访问令牌" })
    }

    const userId = getUserIdFromToken(token)

    if (!userId) {
        return res.status(401).json({ code: 0, msg: "未授权的访问" })
    }

    // 从请求参数中获取地址 ID
    const { addressId } = req.body

    // 在这里执行数据库删除操作
    const query = `DELETE FROM addresses WHERE id = ? AND userId = ?`
    const values = [addressId, userId];
    db.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ code: "-1", msg: "服务器错误" })
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ code: "0", msg: "未找到要删除的地址" })
        }
        return res.status(200).json({ code: "1", msg: "删除收货地址成功" })
    })
}


// 修改收货地址
exports.updateAddress = (req, res) => {
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
    const { addressId, receiver, contact, provinceCode, cityCode, countyCode, address, isDefault, fullLocation, postalCode, addressTags } = req.body

    // 在这里执行数据库更新操作
    const query = `UPDATE addresses SET receiver=?, contact=?, provinceCode=?, cityCode=?, countyCode=?, address=?, isDefault=?, fullLocation=?, postalCode=?, addressTags=? WHERE id=? AND userId=?`
    const values = [receiver, contact, provinceCode, cityCode, countyCode, address, isDefault, fullLocation, postalCode, addressTags, addressId, userId]
    db.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ code: "-1", msg: "服务器错误" })
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ code: "0", msg: "未找到要修改的地址或权限不足", result: { addressId, receiver, contact, provinceCode, cityCode, countyCode, address, isDefault, fullLocation, postalCode, addressTags } })
        }
        return res.status(200).json({ code: "1", msg: "修改收货地址成功" })
    })
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