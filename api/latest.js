const Router = require('koa-router')
const got = require('got')
const yaml = require('js-yaml')
const { promises: { stat, writeFile, unlink }, createReadStream, createWriteStream } = require('fs')
const { join } = require('path')
const { createHash } = require('crypto')

const { getLatestURL, relays, downloadText } = require('./shared')

const latest = new Router({
  prefix: '/latest'
})

const fileMap = {
  mac: 'latest-mac.yml',
  linux: 'latest-linux.yml',
  windows: 'latest.yml'
}

const cachingMap = new Map()

const calculateHash = path => new Promise(resolve => {
  const hash = createHash('sha512')
  const stream = createReadStream(path)
  stream.on('readable', () => {
    const data = stream.read()
    if (data) {
      hash.update(data)
    } else {
      resolve(hash.digest())
    }
  })
})

const checkCache = async (url, sha512) => {
  console.log('check cache', url)
  const fileName = url.split('/').reverse()[0]
  const cachePath = join('./cache', fileName)
  const hash = Buffer.from(sha512, 'base64')
  const cacheHash = await calculateHash(cachePath)
  if (!hash.equals(cacheHash)) {
    console.log('remake cache', url)
    await unlink(cachePath)
    return makeCache(url, sha512)
  }
}

const makeCache = async (url, sha512) => {
  console.log('make cache', url)
  const fileName = url.split('/').reverse()[0]
  const cachePath = join('./cache', fileName)
  await writeFile(cachePath, '')
  cachingMap.set(url, new Promise(resolve => {
    const writeStream = createWriteStream(cachePath, { emitClose: true })
    got.stream(url).pipe(writeStream)
    writeStream.on('close', async () => {
      await checkCache(url, sha512)
      resolve()
    })
  }))
  return cachingMap.get(url)
}

const getCache = async (url, sha512) => {
  const fileName = url.split('/').reverse()[0]
  const cachePath = join('./cache', fileName)
  const cacheExist = await stat(cachePath).catch(() => false)
  if (!cacheExist) {
    await makeCache(url, sha512)
  }
  if (cachingMap.has(url)) {
    await cachingMap.get(url)
  } else {
    cachingMap.set(url, checkCache(url, sha512))
    await cachingMap.get(url)
  }
  return createReadStream(cachePath)
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
      ctx.body = await getCache(url, sha512)
    }
  }
})

module.exports = latest
