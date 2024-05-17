const db = require('../db/index');
const jwt = require('jsonwebtoken');
const config = require('../config');

// 计算两个数组的Jaccard相似度
function calculateJaccardSimilarity(array1, array2) {
    const set1 = new Set(array1);
    const set2 = new Set(array2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    const similarity = intersection.size / union.size;
    return similarity;
}

// 获取购物车中所有商品的相似商品
async function getSimilarProductsForUser(userId) {
    try {
        // 获取用户购物车中的商品skuId
        const userCart = await db.query(`SELECT skuId FROM cart WHERE userId = ?`, [userId]);
        const skuIds = userCart.map(item => item.skuId);

        // 获取购物车中商品的商品ID
        const productIds = skuIds.map(skuId => skuId.substring(0, 6));

        // 获取购物车中商品的相似商品
        const similarProducts = await getSimilarProductsByIds(productIds);
        return similarProducts;
    } catch (error) {
        console.error("Error getting similar products for user:", error);
        return [];
    }
}

// 获取随机的推荐商品
async function getRandomRecommendations() {
    try {
        const randomProducts = await db.query(`SELECT * FROM products ORDER BY RAND() LIMIT 4`);
        return randomProducts;
    } catch (error) {
        console.error("Error getting random recommendations:", error);
        return [];
    }
}

// 获取推荐商品的路由处理函数
exports.getRecommendations = async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({ code: 0, msg: "未提供授权的访问令牌" });
    }
    const userId = getUserIdFromToken(token);

    if (!userId) {
        return res.status(401).json({ code: 0, msg: "未授权的访问" });
    }

    try {
        // 获取购物车中商品的相似商品
        const similarProducts = await getSimilarProductsForUser(userId);

        // 如果没有找到相似商品，则随机选择四个商品作为推荐
        if (!similarProducts || similarProducts.length === 0) {
            const recommendations = await getRandomRecommendations();
            return res.json({ code: 1, msg: "Success", recommendations });
        }

        // 返回相似商品信息列表作为推荐
        return res.json({ code: 1, msg: "Success", recommendations: similarProducts });

    } catch (error) {
        console.error("Error getting recommendations:", error);
        return res.status(500).json({ code: 0, msg: "Internal Server Error" });
    }
};

// 从授权的 token 中获取用户 ID
function getUserIdFromToken(token) {
    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecretKey);
        return decoded.id;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}
