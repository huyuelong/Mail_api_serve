const db = require('../db/index')

// 获取banner轮播图数据
exports.getBanners = (req, res) => {
    // 获取查询参数 distributionSite，如果没有提供则默认为 1
    const distribution_site = req.query.distribution_site || '1';

    const sql = 'SELECT * FROM banners WHERE distribution_site = ?';
    db.query(sql, distribution_site, (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({
                code: -1,
                msg: '服务器错误',
                result: []
            });
        } else {
            res.status(200).json({
                code: 1,
                msg: '获取成功',
                result: results
            });
        }
    });
};


// 获取新品数据
exports.getNews = async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 4
    db.query(`SELECT * FROM news LIMIT ?`, [limit], (err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).json({
                code: '-1',
                msg: '服务器错误'
            })
        }

        res.json({
            code: '1',
            msg: '成功',
            result: results
        })
    })
}

// 获取热门数据
exports.getHot = async (req, res) => {
    db.query(`SELECT * FROM hot`, (err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).json({
                code: '-1',
                msg: '服务器错误'
            })
        }

        res.json({
            code: '1',
            msg: '成功',
            result: results
        })
    })
}


// 获取全部商品信息的处理函数
exports.getAllProducts = (req, res) => {
    db.query(`SELECT * FROM products`, (err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).json({
                code: '-1',
                msg: '服务器错误'
            })
        }
        res.json({
            code: '1',
            msg: '成功',
            result: results
        })
    })
}


// 获取分类及其下属产品
exports.getCategoriesWithProducts = (req, res) => {
    // 查询类别数据
    db.query('SELECT * FROM categories WHERE id <= 7', (err, categories) => {
        if (err) {
            console.error('Error fetching categories:', err);
            res.status(500).json({
                code: '-1',
                msg: '获取类别数据失败',
                error: err.message,
            });
            return;
        }

        // 查询产品数据
        db.query('SELECT * FROM products', (err, products) => {
            if (err) {
                console.error('Error fetching products:', err);
                res.status(500).json({
                    code: '-1',
                    msg: '获取产品数据失败',
                    error: err.message,
                });
                return;
            }

            // 将产品数据嵌入到相应的类别中
            const categoriesWithProducts = categories.map(category => {
                const filteredProducts = products.filter(product => product.category_id === category.id);
                return {
                    ...category,
                    children: filteredProducts,
                };
            });

            res.json({
                code: '1',
                msg: '成功',
                result: categoriesWithProducts,
            });
        });
    });
};

