
const express = require('express')
const router = express.Router()
const home_handler = require('../router_handler/home')

// 轮播图
router.get('/home/banners', home_handler.getBanners)

module.exports = router
