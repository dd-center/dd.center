const Koa = require('koa')
const send = require('koa-send')
const fs = require('fs').promises
const { join } = require('path')

const api = require('./api')

const app = new Koa()

app.use(api.routes())

const subrouters = ['demo1', 'demo2']

const find = async url => {
  const path = join(__dirname, 'dist', url)
  const stat = await fs.stat(path).catch(() => undefined)
  if (!stat) {
    const match = subrouters.find(path => url.startsWith(`/${path}`))
    if (match) {
      return `${match}/index.html`
    }
    return undefined
  }
  if (stat.isFile()) {
    return url
  } else {
    return find(join(url, '/index.html'))
  }
}

app.use(async ctx => {
  const match = await find(ctx.path)
  if (match) {
    await send(ctx, match, { root: join(__dirname, '/dist') })
  }
})

app.listen(2333)
console.log('dd.center', 2333)
