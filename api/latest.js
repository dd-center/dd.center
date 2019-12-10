const Router = require('koa-router')
const got = require('got')
const yaml = require('js-yaml')

const { getLatestURL, relays } = require('./shared')

const latest = new Router({
  prefix: '/latest'
})

const fileMap = {
  mac: 'latest-mac.yml',
  linux: 'latest-linux.yml',
  windows: 'latest.yml'
}

latest.get('/:name/:platform', async ctx => {
  const { name, platform } = ctx.params
  const match = relays[name]
  const ymlFile = fileMap[platform]
  if (match && ymlFile) {
    const ymlUrl = await getLatestURL({ file: ymlFile, ...match })
    const yml = await got(ymlUrl).text()
    const { files } = yaml.safeLoad(yml)
    const file = files
      .map(({ url }) => url)
      .find(url => ['exe', 'dmg', 'AppImage'].find(ext => url.endsWith(ext)))
    if (file) {
      const url = await getLatestURL({ file, ...match })
      ctx.body = got.stream(url)
    }
  }
})

module.exports = latest
