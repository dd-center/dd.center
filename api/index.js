const Router = require('koa-router')

const update = require('./update')

const api = new Router({
  prefix: '/api'
})

api.use(update.routes())

module.exports = api
