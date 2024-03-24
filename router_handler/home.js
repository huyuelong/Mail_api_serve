const db = require('../db/index')

// 获取banner轮播图数据
exports.getBanners = (req, res) => {
    const sql = 'SELECT * FROM banners';
    db.query(sql, (error, results, fields) => {
        if (error) {
            console.error(error)
            res.status(500).json({
                code: -1,
                msg: '服务器错误',
                result: []
            })
        } else {
            res.status(200).json({
                code: 1,
                msg: '获取成功',
                result: results
            })
        }
    })
}

// 获取新品数据
exports.getNews = async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 4
    db.query(`SELECT * FROM news LIMIT ?`, [limit], (err, products) => {
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
            result: products
        })
    })
}

// 获取热门数据
exports.getHot = async (req, res) => {
    db.query(`SELECT * FROM hot`, (err, hot) => {
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
            result: hot
        })
    })
}

