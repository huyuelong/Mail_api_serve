const db = require('../db/index')
const jwt = require('jsonwebtoken')
const config = require('../config')

// 创建订单
exports.createOrder = async (req, res) => {
    const authorizationHeader = req.headers['authorization']
    const token = authorizationHeader?.replace("Bearer ", "")

    if (!token) {
        return res.status(401).json({ code: 0, msg: "未提供授权的访问令牌" })
    }

    const userId = getUserIdFromToken(token)

    if (!userId) {
        return res.status(401).json({ code: 0, msg: "未授权的访问" })
    }

    const {
        deliveryType,
        payMethod,
        deliveryFee,
        productPrice,
        totalAmount,
        remark,
        cartIds,
        addressId
    } = req.body

    // 验证必需参数是否存在
    if (
        deliveryType === undefined || payMethod === undefined ||
        deliveryFee === undefined || productPrice === undefined ||
        totalAmount === undefined || remark === undefined || cartIds === undefined || addressId === undefined
    ) {
        return res.status(400).json({ code: 0, msg: "缺少必需的参数" })
    }

    try {
        const timeZoneOffset = 8; // 中国北京时间的时区偏移量为 +8
        const createTime = new Date(Date.now() + timeZoneOffset * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
        const payLatestTime = new Date(Date.now() + timeZoneOffset * 60 * 60 * 1000 + 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

        // 计算倒计时
        // const countdown = calculateCountdown();
        // const countdown = '24:00:00'
        const countdown = '-1'

        // 将购物车标识符数组转换为 JSON 字符串
        const cartIdsJSON = JSON.stringify(cartIds);

        // 插入订单到数据库
        const insertQuery = `
            INSERT INTO orders
                (createTime, payMethod, orderState, payLatestTime, deliveryFee, productPrice, totalAmount, countdown, userId, deliveryType, addressId, cartIds) 
            VALUES 
                (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(insertQuery, [createTime, payMethod, payLatestTime, deliveryFee, productPrice, totalAmount, countdown, userId, deliveryType, addressId, cartIdsJSON])

        return res.status(200).json({ code: 1, msg: "订单创建成功", result: cartIdsJSON })
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({ code: 0, msg: "订单创建失败" })
    }
}

// // 计算倒计时
// function calculateCountdown() {
//     const now = new Date();
//     const payLatestTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
//     const timeDiff = payLatestTime - now;
//     if (timeDiff <= 0) {
//         return '-1'; // 超时
//     }
//     const hours = Math.floor(timeDiff / (1000 * 60 * 60));
//     const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
//     const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
//     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
// }

// // 更新倒计时
// function updateCountdown() {
//     const updateQuery = `
//         UPDATE orders 
//         SET countdown = ? 
//         WHERE payLatestTime > NOW()
//     `;
//     const countdown = calculateCountdown();
//     db.query(updateQuery, [countdown], (error, result) => {
//         if (error) {
//             console.error('Error updating countdown:', error);
//         } else {
//             console.log('Countdown updated successfully');
//         }
//     });
// }

// // 每秒更新一次倒计时
// setInterval(updateCountdown, 1000);

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


// 获取用户最新订单的全部数据
exports.getLatestOrder = async (req, res) => {
    const authorizationHeader = req.headers['authorization']
    const token = authorizationHeader?.replace("Bearer ", "")

    if (!token) {
        return res.status(401).json({ code: 0, msg: "未提供授权的访问令牌" })
    }

    const userId = getUserIdFromToken(token)

    if (!userId) {
        return res.status(401).json({ code: 0, msg: "未授权的访问" })
    }

    try {
        // 查询用户最新订单
        const query = `
            SELECT *
            FROM orders
            WHERE userId = ?
            ORDER BY createTime DESC
            LIMIT 1
        `

        // const result = await db.query(query, [userId]);

        const result = await new Promise((resolve, reject) => {
            db.query(query, [userId], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            })
        })

        if (result.length === 0) {
            return res.status(404).json({ code: 0, msg: "找不到用户的订单" })
        }

        const latestOrder = result[0];
        // console.log('latestOrder: ', latestOrder)

        // 解析订单中的 cartIds
        const cartIds = JSON.parse(latestOrder.cartIds)

        // 更新购物车中相关条目的istraded值为1
        const updateCartQuery = `
            UPDATE cart
            SET istraded = 1
            WHERE id IN (?)
        `

        await new Promise((resolve, reject) => {
            db.query(updateCartQuery, [cartIds], (error, result) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(result)
                }
            });
        });

        // 查询购物车中的商品信息
        const cartInfoQuery = `
            SELECT skuId, count
            FROM cart
            WHERE id IN (?)
        `

        // const cartInfoResult = await db.query(cartInfoQuery, [cartIds]);
        const cartInfoResult = await new Promise((resolve, reject) => {
            db.query(cartInfoQuery, [cartIds], (error, result) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(result)
                }
            })
        })

        // console.log('cartInfoResult: ', cartInfoResult)

        // 计算总数量
        const totalCount = cartInfoResult.reduce((total, item) => total + parseInt(item.count), 0)
        console.log('totalCount: ', totalCount)

        // 将购物车信息与订单信息合并
        const getLatestOrderResult = {
            latestOrder,
            products: cartInfoResult,
            totalCount
        }
        // console.log('getLatestOrderResult: ', getLatestOrderResult)
        return res.status(200).json({ code: 1, msg: "获取用户最新订单成功", result: getLatestOrderResult })
    } catch (error) {
        console.error('Error fetching latest order:', error);
        return res.status(500).json({ code: 0, msg: "获取用户最新订单失败" });
    }
}


// 获取用户全部订单的全部数据或特定状态的订单数据
exports.getAllOrders = async (req, res) => {
    const authorizationHeader = req.headers['authorization']
    const token = authorizationHeader?.replace("Bearer ", "")

    if (!token) {
        return res.status(401).json({ code: 0, msg: "未提供授权的访问令牌" })
    }

    const userId = getUserIdFromToken(token)

    if (!userId) {
        return res.status(401).json({ code: 0, msg: "未授权的访问" })
    }

    // 提取查询参数中的 orderState，若不存在则默认为 '0'
    const orderState = req.query.orderState || '0'
    console.log('orderState:', orderState)

    try {
        let query, queryParams

        if (orderState === '0') {
            // 获取用户全部订单的全部数据
            query = `
                SELECT *
                FROM orders
                WHERE userId = ?
                ORDER BY createTime DESC
            `;
            queryParams = [userId];
        } else {
            // 根据 orderState 获取特定状态的订单数据
            query = `
                SELECT *
                FROM orders
                WHERE userId = ? AND orderState = ?
                ORDER BY createTime DESC
            `;
            queryParams = [userId, orderState]
        }

        const result = await new Promise((resolve, reject) => {
            db.query(query, queryParams, (error, result) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(result)
                }
            })
        })

        // 如果没有找到订单数据，则返回空数组
        if (result.length === 0) {
            return res.status(200).json({ code: 1, msg: "用户订单数据为空", result: [] })
        }

        // 存储所有订单信息的数组
        const allOrders = []

        for (const order of result) {
            const cartIds = JSON.parse(order.cartIds)

            // 查询购物车中的商品信息
            if (cartIds.length > 0) {
                const cartInfoQuery = `  
                    SELECT c.skuId, c.count, s.picture, s.attrsText, p.name
                    FROM cart c
                    INNER JOIN skus s ON c.skuId = s.id
                    INNER JOIN products p ON s.productId = p.id
                    WHERE c.id IN (?)
                `

                const cartInfoResult = await new Promise((resolve, reject) => {
                    db.query(cartInfoQuery, [cartIds], (error, result) => {
                        if (error) {
                            reject(error)
                        } else {
                            resolve(result)
                        }
                    })
                })

                // 计算总数量
                const totalCount = cartInfoResult.reduce((total, item) => total + parseInt(item.count), 0)

                // 将购物车信息与订单信息合并
                const orderDetails = {
                    order,
                    products: cartInfoResult,
                    totalCount
                };

                allOrders.push(orderDetails)
            }
        }

        return res.status(200).json({ code: 1, msg: "获取用户订单数据成功", result: allOrders })
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ code: 0, msg: "获取用户订单数据失败" })
    }
}

