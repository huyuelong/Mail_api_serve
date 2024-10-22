// 导入express
const express = require('express')
// 使用 body-parser 中间件来解析 JSON 格式的请求体
const bodyParser = require('body-parser');
// 创建服务器实例对象
const app = express()

// 全局注册 body-parser 中间件来解析 JSON 格式的请求体
app.use(bodyParser.json())

const joi = require('joi')

// 导入并配置 cors 中间件
const cors = require('cors')
app.use(cors({
    origin: '*'
}))

// 设置静态文件服务
app.use(express.static('public'))

// 配置解析表单数据的中间件, 解析 `application/x-www-form-urlencoded` 格式的表单数据
app.use(express.urlencoded({ extended: false }))

// 封装全局res.cc()函数
app.use((req, res, next) => {
    res.cc = (err, status = 1) => {
        res.send({
            status,
            message: err instanceof Error ? err.message : err
        })
    }
    next()
})

// 配置解析 Token 的中间件
const expressJWT = require('express-jwt')
const config = require('./config')
app.use(expressJWT.expressjwt({ secret: config.jwtSecretKey, algorithms: ["HS256"] }).unless({ path: [/^\/api/] }))

// 导入路由模块
const userRouter = require('./router/user')
const categoriesRouter = require('./router/categories')
const homeRouter = require('./router/home')
const detailRouter = require('./router/detail')
const cartRouter = require('./router/cart')
const addressRouter = require('./router/addresses')
const orderRouter = require('./router/order')
const payRouter = require('./router/pay')
const recommendRouter = require('./router/recomment')
const searchRouter = require('./router/search')
app.use('/api', userRouter)
app.use('/api', categoriesRouter)
app.use('/api', homeRouter)
app.use('/api', detailRouter)
app.use('/api', cartRouter)
app.use('/api', addressRouter)
app.use('/api', orderRouter)
app.use('/api', payRouter)
app.use('/api', recommendRouter)
app.use('/api', searchRouter)

// 定义错误级别中间件
app.use(function (err, req, res, next) {
    // 数据验证失败
    if (err instanceof joi.ValidationError) return res.cc(err)
    // 身份认证失败的错误
    if(err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
    // 未知错误
    res.cc(err)
})

// 启动服务器
app.listen(3007, () => {
    console.log('api serve running at http://127.0.0.1:3007')
})