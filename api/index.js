const Router = require('koa-router')

const update = require('./update')
const latest = require('./latest')
const proxy = require('./proxy')

const api = new Router({
  prefix: '/api'
})

api.use(update.routes())
api.use(latest.routes())
api.use(proxy.routes())

module.exports = api
