const Router = require('koa-router')
const got = require('got')

const update = new Router({
  prefix: '/update'
})

const getLatestURL = async ({ file, repo, owner = 'dd-center' }) => {
  const { body: releases } = await got(`https://api.github.com/repos/${owner}/${repo}/releases`, { json: true })
  const asset = releases
    .flatMap(({ assets }) => assets)
    .find(({ name }) => name === file)
  if (asset) {
    return asset.browser_download_url
  }
}

const relays = {
  ddatelectron: { repo: 'DDatElectron' },
  ddmonitor: { repo: 'bili-dd-monitor' }
}

update.get('/:name/:file', async ctx => {
  const { name, file } = ctx.params
  const match = relays[name]
  if (match) {
    const url = await getLatestURL({ file, ...match })
    if (url) {
      ctx.body = got(url, { stream: true })
    }
  }
})

module.exports = update
