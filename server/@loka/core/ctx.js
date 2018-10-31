/*
* 添加的ctx方法主要是统一拦截处理相关逻辑
* ajax 方法。给前端ajax请求的返回数据统一处理---接受参数{code,data,msg}格式数据  ，code为1时是正常，为-1时为异常
* renderStatic同上， 返回静态资源请求统一处理
*/

const fs = require("fs");
exports.ctxMothed = (ctx) => {
    ctx.ajax = (data) => {
        // console.log(data)
        // if (data.code === 1) {
        ctx.response.type = 'json';
        ctx.response.body = JSON.stringify(data.data);
        // } else {

        // }
    }
    ctx.renderStatic = (data) => {

        if (data.code === 1) {
            ctx.response.type =
                ctx.response.body = data.data;
        } else {

            return ctx.render('404')
        }
    }
}