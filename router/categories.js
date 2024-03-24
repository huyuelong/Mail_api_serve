const express = require('express')
const router = express.Router()
const categories_handler = require('../router_handler/categories')

// 获取全部一级分类
router.get('/categories', categories_handler.getAllCategories)
// router.get('/allcategories', categories_handler.getAllCategories)

module.exports = router
