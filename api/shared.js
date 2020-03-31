const got = require('got')
const { promises: { stat, writeFile, unlink }, createReadStream, createWriteStream } = require('fs')
const { join } = require('path')
const { createHash } = require('crypto')

const jsonCache = new Map()
const textCache = new Map()

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

const checkCache = async (url, { sha512, size }) => {
  console.log('check cache', url)
  const fileName = url.split('/').reverse()[0]
  const cachePath = join('./cache', fileName)
  if (sha512) {
    const hash = Buffer.from(sha512, 'base64')
    const cacheHash = await calculateHash(cachePath)
    if (!hash.equals(cacheHash)) {
      console.log('remake cache', url)
      await unlink(cachePath)
      return makeCache(url, { sha512 })
    }
  } else {
    const cacheStat = await stat(cachePath)
    if (cacheStat.size !== size) {
      console.log('remake cache', url)
      await unlink(cachePath)
      return makeCache(url, { size })
    }
  }
}

const makeCache = async (url, { sha512, size }) => {
  console.log('make cache', url)
  const fileName = url.split('/').reverse()[0]
  const cachePath = join('./cache', fileName)
  await writeFile(cachePath, '')
  cachingMap.set(url, new Promise(resolve => {
    const writeStream = createWriteStream(cachePath, { emitClose: true })
    got.stream(url).pipe(writeStream)
    writeStream.on('close', async () => {
      await checkCache(url, { sha512, size })
      resolve()
    })
  }))
  return cachingMap.get(url)
}

exports.getCache = async (url, { sha512, size }) => {
  const fileName = url.split('/').reverse()[0]
  const cachePath = join('./cache', fileName)
  const cacheExist = await stat(cachePath).catch(() => false)
  if (!cacheExist) {
    await makeCache(url, { sha512, size })
  }
  if (cachingMap.has(url)) {
    await cachingMap.get(url)
  } else {
    cachingMap.set(url, checkCache(url, { sha512, size }))
    await cachingMap.get(url)
  }
  return createReadStream(cachePath)
}

const download = async ({ url, method, cache }) => {
  if (!cache.has(url)) {
    const wait = method(url)
    cache.set(url, wait)
    const timeoutN = setTimeout(() => {
      cache.delete(url)
    }, 1000 * 60 * 60)
    const result = await wait.catch(() => {
      cache.delete(url)
      clearTimeout(timeoutN)
      return download({ url, method, cache })
    })
    cache.set(url, result)
  }
  return cache.get(url)
}

const downloadJson = url => download({ url, method: url => got(url).json(), cache: jsonCache })
exports.downloadText = url => download({ url, method: url => got(url).text(), cache: textCache })

const getLatest = async ({ file, repo, owner = 'dd-center' }) => {
  const releases = await downloadJson(`https://api.github.com/repos/${owner}/${repo}/releases`)
  const asset = releases
    .flatMap(({ assets }) => assets)
    .find(({ name }) => name === file)
  if (asset) {
    return asset
  }
}
exports.getLatest = getLatest

exports.getLatestURL = async ({ file, repo, owner }) => (await getLatest({ file, repo, owner })).browser_download_url

exports.relays = {
  ddatelectron: { repo: 'DDatElectron' },
  ddmonitor: { repo: 'bili-dd-monitor' },
  lavender: { repo: 'Lavendelhonig' }
}
