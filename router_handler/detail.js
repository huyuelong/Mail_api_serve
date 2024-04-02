const db = require('../db/index')

// 获取商品图片
exports.getProductPictures = (req, res) => {
    const productId = parseInt(req.query.product_id) // 从查询字符串中获取product_id
    const sql = 'SELECT * FROM pictures WHERE product_id = ?'
    db.query(sql, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching pictures from db: ' + err)
            res.status(500).json({ error: 'Database error' })
            return
        }
        res.json({ code: 1, msg: '获取成功', result: results })
    })
}


// 根据产品ID获取产品详细信息
exports.getProductDetails = (req, res) => {
    const productId = parseInt(req.query.id) // 从查询字符串中获取id
    const sql = 'SELECT * FROM products WHERE id = ?'
    db.query(sql, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching product details from db: ' + err)
            res.status(500).json({ error: 'Database error' })
            return
        }
        res.json({ code: 1, msg: '获取成功', result: results })
    })
}



// 获取商品规格信息的处理函数
exports.getProductSpecs = (req, res) => {
    const productId = req.query.id; // 从查询字符串中获取productId
    const query = `
      SELECT 
          s.id AS specId, 
          s.name AS specName,
          ss.valueName AS valueName,
          sk.id AS skuId,
          sk.skuCode,
          sk.price,
          sk.oldPrice,
          sk.inventory
      FROM 
          specs s
          INNER JOIN skus_specs ss ON s.id = ss.specId
          INNER JOIN skus sk ON ss.skuId = sk.id
      WHERE 
          sk.productId = ?
      ORDER BY 
          sk.id, s.id;
    `

    db.query(query, [productId], (error, results) => {
        if (error) {
            console.error('获取商品规格信息失败:', error)
            res.status(500).json({ code: -1, msg: "获取商品规格信息失败", error })
        } else {
            let formattedResults = {
                code: 1,
                msg: "获取成功",
                result: {
                    productId: productId,
                    specs: [],
                    skus: []
                }
            }

            let specsMap = new Map() // 使用Map来存储规格信息，以便去重

            results.forEach(row => {
                const specId = row.specId.toString() // 将specId转换为字符串以避免Map的键值类型不匹配问题
                if (!specsMap.has(specId)) {
                    specsMap.set(specId, {
                        id: specId,
                        name: row.specName,
                        values: new Set() // 使用Set来存储values，以确保唯一性
                    })
                }
                specsMap.get(specId).values.add(row.valueName);
            })

            formattedResults.result.specs = Array.from(specsMap.values()).map(spec => ({
                ...spec,
                values: Array.from(spec.values).map(value => ({ name: value })) // 将Set转换为数组
            }))

            let skusMap = new Map() // 使用Map来存储SKU信息，以便去重

            results.forEach(row => {
                const skuId = row.skuId.toString() // 将skuId转换为字符串以避免Map的键值类型不匹配问题
                if (!skusMap.has(skuId)) {
                    skusMap.set(skuId, {
                        id: skuId,
                        productId: productId,
                        skuCode: row.skuCode,
                        price: row.price.toString(),
                        oldPrice: row.oldPrice ? row.oldPrice.toString() : null,
                        inventory: row.inventory,
                        specs: formattedResults.result.specs.map(spec => ({
                            id: spec.id,
                            name: spec.name,
                            valueName: spec.values.find(value => value.name === row.valueName) ? row.valueName : null
                        }))
                    })
                } else {
                    const sku = skusMap.get(skuId)
                    sku.specs.forEach(spec => {
                        if (spec.valueName === null && spec.name === row.specName) {
                            spec.valueName = row.valueName;
                        }
                    })
                }
            })

            formattedResults.result.skus = Array.from(skusMap.values())

            res.json(formattedResults)
        }
    })
}


// 获取商品图片
exports.getDetailPictures = (req, res) => {
    const productId = parseInt(req.query.product_id) // 从查询字符串中获取product_id
    const sql = 'SELECT * FROM detail_picture WHERE product_id = ?'
    db.query(sql, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching pictures from db: ' + err)
            res.status(500).json({ error: 'Database error' })
            return
        }
        res.json({ code: 1, msg: '获取成功', result: results })
    })
}