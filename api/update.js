const Router = require('koa-router')
const { stream } = require('got')

const { getLatest, relays, getCache } = require('./shared')

const update = new Router({
  prefix: '/update'
})

update.get('/:name/:file', async ctx => {
  const { name, file } = ctx.params
  const match = relays[name]
  if (match) {
    const { browser_download_url: url, size } = await getLatest({ file, ...match })
    if (url) {
      if (url.endsWith('yml')) {
        ctx.body = stream(url)
      } else {
        const fileName = url.split('/').reverse()[0]
        ctx.response.attachment(fileName)
        ctx.response.length = size
        ctx.body = await getCache(url, { size })
      }
    }
  }
})

module.exports = update
