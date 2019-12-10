const Router = require('koa-router')
const { stream } = require('got')

const { getLatestURL, relays } = require('./shared')

const update = new Router({
  prefix: '/update'
})

update.get('/:name/:file', async ctx => {
  const { name, file } = ctx.params
  const match = relays[name]
  if (match) {
    const url = await getLatestURL({ file, ...match })
    if (url) {
      ctx.body = stream(url)
    }
  }
})

module.exports = update
