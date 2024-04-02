const express = require('express')
const router = express.Router()
const detail_handler = require('../router_handler/detail')

// 根据产品ID获取产品图片集合
router.get('/detail/pictrues', detail_handler.getProductPictures)
// 根据产品ID获取产品详细信息
router.get('/detail', detail_handler.getProductDetails)
// 获取商品规格信息
router.get('/detail/spec', detail_handler.getProductSpecs)
// 获取详情图片
router.get('/detail/detail_pictrues', detail_handler.getDetailPictures)


module.exports = router