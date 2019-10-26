const Router = require('koa-router')

const update = require('./update')
const latest = require('./latest')

const api = new Router({
  prefix: '/api'
})

api.use(update.routes())
api.use(latest.routes())

module.exports = api
