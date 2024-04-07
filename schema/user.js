// 导入定义验证规则的包
const joi = require('joi')

// 定义用户名和密码的验证规则
const username = joi.string().alphanum().min(1).max(12).required()
const password = joi.string().pattern(/^[\S]{6,12}$/).required()
// const repassword = joi.string().pattern(/^[\S]{6,12}$/).required()


// 注册和登录表单的验证规则对象
exports.reg_log_schema = {
    body: {
        username,
        password
    }
}

