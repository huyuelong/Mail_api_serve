const express = require('express')
const router = express.Router()
const order_handler = require('../router_handler/order')

// 创建订单
router.post('/order', order_handler.createOrder)
// 获取当前最新订单
router.get('/getLatestOrder', order_handler.getLatestOrder)
// 获取用户全部订单
router.get('/getAllOrder', order_handler.getAllOrders)


module.exports = router