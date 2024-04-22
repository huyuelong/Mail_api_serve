const express = require('express')
const router = express.Router()
const pay_handler = require('../router_handler/pay')

router.post('/alipay', pay_handler.pay)
router.post('/querypay', pay_handler.querypay)

module.exports = router
