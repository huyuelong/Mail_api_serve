const express = require('express')
// 创建路由对象
const router = express.Router()

// 导入用户路由处理函数对应的模块
const user_handler = require('../router_handler/user')

// 1.导入验证数据的中间件
// const expressJoi = require('@escook/express-joi')
const bodyParser = require('body-parser')
// 2.导入需要的验证规则对象
const { reg_log_schema } = require('../schema/user')

// 注册新用户
// router.post('/reguser', expressJoi(reg_log_schema), user_handler.regUser)
router.post('/reguser', bodyParser(reg_log_schema) , user_handler.regUser)
// 登录
// router.post('/login', expressJoi(reg_log_schema), user_handler.login)
router.post('/login', bodyParser(reg_log_schema), user_handler.login)

// 获取用户全部信息
router.get('/getuserinfo', user_handler.getUserInfo)
// 修改用户信息
router.put('/updateuserinfo', user_handler.updateUserInfo)
// 更新头像
router.put('/updateavatar', user_handler.updateUserAvatar)



module.exports = router

