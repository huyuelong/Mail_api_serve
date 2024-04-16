const express = require('express')
const router = express.Router()
const address_handler = require('../router_handler/addresses')

// 获取收货地址
router.get('/getaddress', address_handler.getAddress)
// 添加收货地址
router.post('/addaddress', address_handler.addAddress)
// 删除收货地址
router.delete('/deladdress', address_handler.deleteAddress)
// 修改收货地址
router.put('/updateaddress/:addressId', address_handler.updateAddress)



module.exports = router
