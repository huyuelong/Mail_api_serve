
const express = require('express')
const router = express.Router()
const home_handler = require('../router_handler/home')

// 轮播图
router.get('/home/banners', home_handler.getBanners)
// 新品
router.get('/home/news', home_handler.getNews)
// 热门
router.get('/home/hot', home_handler.getHot)
// 获取全部商品
router.get('/home/allproducts', home_handler.getAllProducts)

// 获取所有类别及其关联的产品
router.get('/home/products', home_handler.getCategoriesWithProducts)

module.exports = router
