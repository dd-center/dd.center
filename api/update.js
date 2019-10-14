const Router = require('koa-router')
const got = require('got')

const update = new Router({
  prefix: '/update'
})

update.get('/:name/:file', async ctx => {
  const { name, file } = ctx.params
  if (name === 'ddatelectron') {
    ctx.body = await got(`https://github.com/dd-center/DDatElectron/releases/latest/download/${file}`, { stream: true })
  }
  if (name === 'ddmonitor') {
    const releases = JSON.parse((await got(`https://api.github.com/repos/dd-center/bili-dd-monitor/releases`)).body);
    ctx.body = await got(await new Promise((resolve) => {
      releases.forEach(release => {
        release.assets.forEach(asset => {
          if (asset.name === file) {
            resolve(asset.browser_download_url);
          }
        })
      })
    }), { stream: true })
  }
})

module.exports = update
