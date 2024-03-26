const express = require('express')
const router = express.Router()
const categories_handler = require('../router_handler/categories')

// 获取全部一级分类
router.get('/categories', categories_handler.getAllCategories)

// 获取全部分类及商品
router.get('/allCategoriesProducts', categories_handler.getCategoryWithProductsData)

// 通过一级分类id获取二级分类及商品
router.get('/subCategories', categories_handler.getCategories)

// 通过二级分类id获取商品
router.get('/subCategories/sub', categories_handler.getProductsBySubCategoryId)


module.exports = router
