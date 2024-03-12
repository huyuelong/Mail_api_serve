const express = require('express')
// 创建路由对象
const router = express.Router()

// 导入用户路由处理函数对应的模块
const user_handler = require('../router_handler/user')

// 注册新用户
router.post('/reguser', user_handler.regUser)

// 登录
router.post('/login', user_handler.login)


module.exports = router