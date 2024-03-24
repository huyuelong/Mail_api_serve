const db = require('../db/index')


exports.getAllCategories = (req, res) => {
    const sql = 'SELECT * FROM categories';
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error getting categories:', error);
            res.status(500).json({ code: '0', msg: '获取分类失败' });
        } else {
            // 创建一个空数组来存储一级分类
            const topLevelCategories = [];

            // 将所有二级分类按照父分类ID进行分组
            const categorizedResults = {};
            results.forEach(category => {
                if (category.parentId) {
                    if (!categorizedResults[category.parentId]) {
                        categorizedResults[category.parentId] = [];
                    }
                    categorizedResults[category.parentId].push(category);
                } else {
                    topLevelCategories.push(category);
                }
            });

            // 将二级分类嵌套进一级分类的 children 中
            topLevelCategories.forEach(category => {
                category.children = categorizedResults[category.id] || [];
            });

            res.json({ code: '1', msg: '成功', result: topLevelCategories });
        }
    });
}
