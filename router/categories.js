const express = require('express')
const router = express.Router()
const categories_handler = require('../router_handler/categories')

// 获取所有分类以及每个分类下的商品信息
router.get('/categories', categories_handler.getAllCategories)
// 根据分类ID获取分类及其子分类和商品信息
router.get('/categories/:categoryId', categories_handler.getCategoryById)
// 获取一级分类下的所有商品
router.get('/categories/:categoryId/goods', categories_handler.getGoodsByCategory);

module.exports = router
