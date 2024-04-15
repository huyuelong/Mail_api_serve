const express = require('express')
const router = express.Router()
const cart_handler = require('../router_handler/cart')

// 添加购物车
router.post('/cart', cart_handler.addCart)
// 获取购物车
router.get('/cart', cart_handler.getCart)
// 删除购物车
router.delete('/delCart', cart_handler.deleteCart)


module.exports = router