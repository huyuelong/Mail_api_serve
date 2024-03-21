// 导入数据库操作模块
const db = require('../db/index')


// 获取所有分类以及每个分类下的商品信息
exports.getAllCategories = (req, res) => {
    const sql = 'SELECT * FROM categories'
    db.query(sql, (err, categories) => {
        if (err) {
            res.json({ code: 0, msg: '获取分类失败', result: [] })
        } else {
            // 循环遍历每个分类，获取其对应的商品信息
            const promises = categories.map(category => {
                return new Promise((resolve, reject) => {
                    const subcategorySql = `SELECT * FROM subcategories WHERE category_id = ${category.id}`
                    db.query(subcategorySql, (err, subcategories) => {
                        if (err) {
                            reject(err);
                        } else {
                            // 循环遍历每个子分类，获取其对应的商品信息
                            const subcategoryPromises = subcategories.map(subcategory => {
                                return new Promise((resolve, reject) => {
                                    const productSql = `SELECT * FROM goods WHERE subcategory_id = ${subcategory.id}`
                                    db.query(productSql, (err, products) => {
                                        if (err) {
                                            reject(err)
                                        } else {
                                            subcategory.goods = products
                                            resolve()
                                        }
                                    });
                                });
                            });
                            // 等待所有子分类的商品信息查询完成后，再将子分类信息存入分类对象中
                            Promise.all(subcategoryPromises)
                                .then(() => {
                                    category.children = subcategories
                                    resolve()
                                })
                                .catch(reject)
                        }
                    })
                })
            })

            // 等待所有分类的商品信息查询完成后，再返回所有分类信息
            Promise.all(promises)
                .then(() => {
                    res.json({ code: 1, msg: '获取分类及商品成功', result: categories })
                })
                .catch(() => {
                    res.json({ code: 0, msg: '获取商品失败', result: [] })
                });
        }
    });
}


// 根据分类ID获取分类及其子分类和商品信息
exports.getCategoryById = (req, res) => {
    const categoryId = req.params.categoryId;
    const sql = `SELECT * FROM categories WHERE id = ${categoryId}`
    db.query(sql, (err, categoryResults) => {
        if (err || categoryResults.length === 0) {
            res.json({ code: 0, msg: '未找到分类', result: null })
        } else {
            const subcategorySql = `SELECT * FROM subcategories WHERE category_id = ${categoryId}`
            db.query(subcategorySql, (err, subcategoryResults) => {
                if (err) {
                    res.json({ code: 0, msg: '获取子分类失败', result: null })
                } else {
                    const category = categoryResults[0]
                    category.children = subcategoryResults

                    // Fetch products for each subcategory
                    const promises = subcategoryResults.map(subcategory => {
                        return new Promise((resolve, reject) => {
                            const goodsSql = `SELECT * FROM goods WHERE subcategory_id = ${subcategory.id}`
                            db.query(goodsSql, (err, goodsResults) => {
                                if (err) {
                                    reject(err)
                                } else {
                                    subcategory.goods = goodsResults
                                    resolve()
                                }
                            })
                        })
                    })

                    Promise.all(promises)
                        .then(() => {
                            res.json({ code: 1, msg: '获取分类及商品成功', result: category })
                        })
                        .catch(() => {
                            res.json({ code: 0, msg: '获取商品失败', result: category })
                        })
                }
            });
        }
    });
}


// 获取一级分类下的所有商品
exports.getGoodsByCategory = (req, res) => {
    const categoryId = req.params.categoryId;
    const sql = `
        SELECT goods.id, goods.name, goods.description, goods.price, goods.picture, goods.discount, goods.order_num
        FROM goods
        INNER JOIN subcategories ON goods.subcategory_id = subcategories.id
        INNER JOIN categories ON subcategories.category_id = categories.id
        WHERE categories.id = ?
    `;
    db.query(sql, [categoryId], (error, results) => {
        if (error) {
            res.status(500).json({ code: '0', msg: 'Server Error', result: [] });
        } else {
            if (results.length > 0) {
                res.status(200).json({ code: '1', msg: '获取商品成功', result: results });
            } else {
                res.status(404).json({ code: '0', msg: '获取商品失败', result: [] });
            }
        }
    });
};

