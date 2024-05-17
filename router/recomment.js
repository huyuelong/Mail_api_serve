const express = require('express')
const router = express.Router()
const recommend_handler = require('../router_handler/recommend')

router.get('/getrecommend', recommend_handler.getRecommendations)


module.exports = router