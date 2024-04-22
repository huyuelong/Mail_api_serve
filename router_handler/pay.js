const alipaySdk = require('../db/alipayUtil')
const AlipayFormData = require('alipay-sdk/lib/form').default
const db = require('../db/index')


exports.pay = (req, res) => {
    const { orderId, totalAmount } = req.body
    // 获取回调地址
    // const redirectUrl = decodeURIComponent(req.query.redirect)
    // 对接支付宝
    const formData = new AlipayFormData();
    formData.setMethod('get')

    // 支付时信息
    const bizContent = {
        out_trade_no: orderId, //订单号
        product_code: "FAST_INSTANT_TRADE_PAY",
        total_amount: totalAmount, //总价格
        subject: '商品', //商品名称
        body: "商品详情", //商品描述
    }
    formData.addField("bizContent", bizContent)

    //支付成功或失败的返回链接（前端页面）
    // formData.addField('returnUrl', redirectUrl)
    formData.addField('returnUrl', "http://localhost:5173/paycallback")

    // 返回promise
    const result = alipaySdk.exec(
        "alipay.trade.page.pay",
        // "alipay.trade.wap.pay",
        {},
        { formData: formData }
    ).catch(error => console.error('caught error!', error))

    //对接支付宝成功，支付宝返回的数据
    result.then((resp) => {
        res.send({
            data: {
                code: 200,
                success: true,
                msg: "支付中",
                paymentUrl: resp,
            },
        })
    })
}

// 引入axios
const axios = require("axios");
exports.querypay = (req, res) => {
    //订单号
    const out_trade_no = req.body.out_trade_no
    const trade_no = req.body.trade_no

    // 支付宝配置
    const formData = new AlipayFormData();
    //调用setMethod 并传入get,会返回可以跳转到支付页面的url,
    formData.setMethod("get")
    // 支付时信息
    const bizContent = {
        out_trade_no,
        trade_no
    }
    formData.addField("bizContent", bizContent)

    // 返回promise
    const result = alipaySdk.exec(
        "alipay.trade.query",
        {},
        { formData: formData }
    ).catch(error => console.error('caught error!', error))

    //对接支付宝API
    result.then(resData => {
        axios({
            method: "GET",
            url: resData
        }).then(resdata => {
            let respondeCode = resdata.data.alipay_trade_query_response;
            if (respondeCode.code == 10000) {
                switch (respondeCode.trade_status) {
                    case 'WAIT_BUYER_PAY':
                        res.send({
                            code: 10001,
                            message: "支付宝有交易记录，没付款"
                        })
                        break;
                    case 'TRADE_FINISHED':
                        // 完成交易的逻辑
                        updateOrderStatus(out_trade_no)
                        res.send({
                            code: 10002,
                            message: "交易完成(交易结束，不可退款)"
                        })
                        break;
                    case 'TRADE_SUCCESS':
                        // 完成交易的逻辑
                        updateOrderStatus(out_trade_no)
                        res.send({
                            code: 10002,
                            message: "交易完成"
                        })
                        break;
                    case 'TRADE_CLOSED':
                        // 交易关闭的逻辑
                        res.send({
                            code: 10003,
                            message: "交易关闭"
                        })
                        break;
                }
            } else if (respondeCode.code == 40004) {
                return res.send({
                    code: 40004,
                    message: "交易不存在"
                })
            }
        }).catch(err => {
            return res.send({
                code: 50000,
                message: "交易失败",
                data: err
            })
        })
    })
}


// 更新订单状态为已支付
function updateOrderStatus(orderId) {
    const updateQuery = `
        UPDATE orders
        SET ispay = 1, orderState = 2
        WHERE id = ?
    `;

    db.query(updateQuery, [orderId], (error, result) => {
        if (error) {
            console.error('Error updating order status:', error);
        } else {
            console.log('Order status updated successfully');
        }
    });
}           