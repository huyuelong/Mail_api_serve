const express = require('express')
const router = express.Router()
const categories_handler = require('../router_handler/categories')

// 一级分类
router.get('/categories', categories_handler.getAllCategories)
// 二级分类
router.get('/categories/:categoryId/subcategories', categories_handler.getSubcategoriesByCategoryId)
// 商品列表
router.get('/subcategories/:subcategoryId/goods', categories_handler.getGoodsBySubcategoryId)

module.exports = router
