const Router = require('koa-router')
const yaml = require('js-yaml')

const { getLatestURL, relays, downloadText, getCache } = require('./shared')

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
    const yml = await downloadText(ymlUrl)
    const { files } = yaml.safeLoad(yml)
    const { url: file, sha512 } = files
      .find(({ url }) => ['exe', 'dmg', 'AppImage'].find(ext => url.endsWith(ext))) || {}
    if (file) {
      const url = await getLatestURL({ file, ...match })
      const fileName = url.split('/').reverse()[0]
      ctx.response.attachment(fileName)
      ctx.body = await getCache(url, { sha512 })
    }
  }
})

module.exports = latest
