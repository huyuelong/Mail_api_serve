// 导入数据库操作模块
const db = require('../db/index')
// 获取所有分类项
exports.getAllCategories = (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => {
        if (err) {
            return res.cc(err)
        }
        res.json(results)
    })
}

// 获取二级分类 by category ID
exports.getSubcategoriesByCategoryId = (req, res) => {
    const categoryId = req.params.categoryId;
    db.query('SELECT * FROM subcategories WHERE category_id = ?', categoryId, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        res.json(results)
    })
}

// 获取商品 by subcategory ID
exports.getGoodsBySubcategoryId = (req, res) => {
    const subcategoryId = req.params.subcategoryId;
    db.query('SELECT * FROM goods WHERE subcategory_id = ?', subcategoryId, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        res.json(results)
    })
}