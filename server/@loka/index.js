
//计划loka构建为npm包，再次配置开发文件路径
let srcPath = __dirname.split('/');
srcPath = srcPath.slice(0, srcPath.length - 2).join('/') + '/src';

const Koa = require("koa");
const fs = require("fs");
const router = require('koa-router')();
const views = require('koa-views');
const session = require('koa-session');

global.app = new Koa();

//模板处理
app.use(views(srcPath + '/views', {
    extension: 'ejs'
}))


app.keys = ['some secret hurr'];

const SESSION_CONFIG = {
    key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 10000,
    autoCommit: true, /** (boolean) automatically commit headers (default true) */
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};

// app.use(session(SESSION_CONFIG, app));


let API_SET = {};  //action挂载的对象
global.API = {};   //api数据请求的挂载对象
global.CONFIG = {}  //配置项，Config下的每一个文件内容为 exports.xx = ()=>{return {}}  形式，导出为函数，执行后返回一个对象




//ctx新增简化处理的方法
const { ctxMothed } = require('./core/ctx');

//导入逻辑处理
const { action, static, configHandle } = require('./core/fileHandle');

//与后端ajax请求逻辑
const { api } = require('./core/ajax');

//验证登陆
const { checkLogin } = require('./core/checkLogin');



action(srcPath + '/Action', API_SET)   //读取开发者的api文件信息，即ajax请求的文件名称
action(__dirname + '/Action', API_SET)   //读取默认api文件信息，即ajax请求的文件名称
api(srcPath + '/Apis', API)   //读取api文件信息，与后端数据交互的逻辑
static('/public', srcPath + '/Static', app, router) //静态资源处理逻辑



app.use(async (ctx, next) => {
    ctxMothed(ctx);
    // checkLogin(ctx)
    // login(ctx) && await next();
    checkLogin(ctx) !== false && await next();


})
// 对于任何请求，app将调用该异步函数处理请求：
app.use(async (ctx, next) => {


    //加载自定义的ctx方法

    let url = ctx.url.split('?')[0];//提取正式的url（解决api是get带参数）
    // console.log(API_SET)
    if (url == '/') {
        await API_SET['/index'](ctx)
        return;
    }

    API_SET[url] && await API_SET[url](ctx)


})


exports.index = async () => {
    await configHandle(CONFIG) //读取Config文件夹下的配置文件配置信息




    app.listen(CONFIG.app.port)
    console.log('\033[K \033[42;34m DONE \033[40;32m app run at 0.0.0.0:'+CONFIG.app.port+'  \033[0m');
};
