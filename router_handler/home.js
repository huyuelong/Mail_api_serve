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


