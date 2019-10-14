const Router = require('koa-router')
const got = require('got')

const update = new Router({
  prefix: '/update'
})

update.get('/:name/:file', ctx => {
  const { name, file } = ctx.params
  if (name === 'ddatelectron') {
    ctx.body = got(`https://github.com/dd-center/DDatElectron/releases/latest/download/${file}`, { stream: true })
  }
  if (name === 'ddmonitor'){
    ctx.body = got(`https://github.com/dd-center/bili-dd-monitor/releases/latest/download/${file}`,{ stream: true })
  }
})

module.exports = update
