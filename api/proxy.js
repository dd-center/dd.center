const Router = require('koa-router')
const got = require('got')
const koaBody = require('koa-body')

const proxy = new Router({
  prefix: '/proxy'
})

proxy.use(koaBody())

proxy.post('/access_token', async ctx => {
  ctx.set('Access-Control-Allow-Origin', 'https://submit.vtbs.moe')
  ctx.set('Access-Control-Allow-Headers', 'Content-Type')
  ctx.body = await got.post('https://github.com/login/oauth/access_token', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }, body: ctx.request.body
  }).json()
})

module.exports = proxy
