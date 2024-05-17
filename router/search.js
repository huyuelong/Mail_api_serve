const express = require('express')
const router = express.Router()
const search_handler = require('../router_handler/search')

// 搜索
router.get('/search', search_handler.Search)

module.exports = router