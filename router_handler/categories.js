const db = require('../db/index')


exports.getAllCategories = (req, res) => {
    const sql = 'SELECT * FROM categories'
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error getting categories:', error)
            res.status(500).json({ code: '0', msg: '获取分类失败' })
        } else {
            // 创建一个空数组来存储一级分类
            const topLevelCategories = []

            // 将所有二级分类按照父分类ID进行分组
            const categorizedResults = {}
            results.forEach(category => {
                if (category.parentId) {
                    if (!categorizedResults[category.parentId]) {
                        categorizedResults[category.parentId] = []
                    }
                    categorizedResults[category.parentId].push(category)
                } else {
                    topLevelCategories.push(category)
                }
            });

            // 将二级分类嵌套进一级分类的 children 中
            topLevelCategories.forEach(category => {
                category.children = categorizedResults[category.id] || []
            });

            res.json({ code: '1', msg: '成功', result: topLevelCategories })
        }
    })
}


// 获取全部分类及商品
exports.getCategoryWithProductsData = (req, res) => {
    db.query('SELECT * FROM categories', (error, categories) => {
        if (error) {
            res.status(500).json({ code: 0, msg: '获取分类数据失败' })
        } else {
            // 构建分类结构
            const categoryData = []
            categories.forEach(category => {
                if (category.layer === 1) {
                    // 一级分类
                    const topLevelCategory = { ...category, children: [] }
                    categories.forEach(subCategory => {
                        if (subCategory.parentId === category.id) {
                            // 二级分类
                            const secondLevelCategory = { ...subCategory, products: [] }
                            categories.forEach(thirdCategory => {
                                if (thirdCategory.parentId === subCategory.id) {
                                    // 三级分类
                                    const thirdCategoryWithProducts = { ...thirdCategory, products: [] }
                                    secondLevelCategory.products.push(thirdCategoryWithProducts)
                                }
                            })
                            topLevelCategory.children.push(secondLevelCategory)
                        }
                    })
                    categoryData.push(topLevelCategory)
                }
            })

            // 查询Products表数据，并将其插入到分类数据中
            db.query('SELECT * FROM products', (error, products) => {
                if (error) {
                    console.error('获取产品数据失败:', error);
                    res.status(500).json({ code: 0, msg: '获取产品数据失败' })
                } else {
                    // 将产品数据插入到相应的分类中
                    categoryData.forEach(category => {
                        category.children.forEach(subCategory => {
                            subCategory.products = products.filter(product => product.secondLevelCategoryId === subCategory.id)
                        })
                    })
                    res.json({ code: 1, msg: '获取成功', result: categoryData })
                }
            })
        }
    })
}



// 通过一级分类id获取二级分类及商品
exports.getCategories = (req, res) => {
    const topLevelCategoryId = req.query.id

    // 查询一级分类数据
    db.query('SELECT * FROM categories WHERE id = ?', topLevelCategoryId, (error, topLevelCategory) => {
        if (error) {
            res.status(500).json({ code: 0, msg: '获取一级分类数据失败' })
        } else {
            // 查询二级分类数据
            db.query('SELECT * FROM categories WHERE parentId = ?', topLevelCategoryId, (error, secondLevelCategories) => {
                if (error) {
                    res.status(500).json({ code: 0, msg: '获取二级分类数据失败' })
                } else {
                    // 查询产品数据
                    db.query('SELECT * FROM products WHERE secondLevelCategoryId IN (SELECT id FROM categories WHERE parentId = ?)', topLevelCategoryId, (error, products) => {
                        if (error) {
                            res.status(500).json({ code: 0, msg: '获取产品数据失败' })
                        } else {
                            // 构建分类结构
                            const topLevelCategoryWithProducts = { ...topLevelCategory[0], children: [] }
                            secondLevelCategories.forEach(secondLevelCategory => {
                                const secondLevelCategoryWithProducts = { ...secondLevelCategory, products: [] }
                                products.forEach(product => {
                                    if (product.secondLevelCategoryId === secondLevelCategory.id) {
                                        secondLevelCategoryWithProducts.products.push(product)
                                    }
                                })
                                topLevelCategoryWithProducts.children.push(secondLevelCategoryWithProducts)
                            })
                            res.json({ code: 1, msg: '获取成功', result: topLevelCategoryWithProducts })
                        }
                    })
                }
            })
        }
    })
}


// 通过二级分类id获取商品
exports.getProductsBySubCategoryId = (req, res) => {
    const secondLevelCategoryId = req.query.id;

    // 查询二级分类数据
    db.query('SELECT * FROM categories WHERE id = ?', secondLevelCategoryId, (error, secondLevelCategory) => {
        if (error) {
            res.status(500).json({ code: 0, msg: '获取二级分类数据失败' });
        } else {
            // 查询产品数据
            db.query('SELECT * FROM products WHERE secondLevelCategoryId = ?', secondLevelCategoryId, (error, products) => {
                if (error) {
                    res.status(500).json({ code: 0, msg: '获取产品数据失败' });
                } else {
                    // 构建分类结构
                    const secondLevelCategoryWithProducts = { ...secondLevelCategory[0], products: products };
                    res.json({ code: 1, msg: '获取成功', result: secondLevelCategoryWithProducts });
                }
            });
        }
    });
};
