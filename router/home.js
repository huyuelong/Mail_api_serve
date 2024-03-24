
const express = require('express')
const router = express.Router()
const home_handler = require('../router_handler/home')

// 轮播图
router.get('/home/banners', home_handler.getBanners)
// 新品
router.get('/home/news', home_handler.getNews)
// 热门
router.get('/home/hot', home_handler.getHot)

module.exports = router
