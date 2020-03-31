const got = require('got')

const jsonCache = new Map()
const textCache = new Map()

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

exports.getLatestURL = async ({ file, repo, owner = 'dd-center' }) => {
  const releases = await downloadJson(`https://api.github.com/repos/${owner}/${repo}/releases`)
  const asset = releases
    .flatMap(({ assets }) => assets)
    .find(({ name }) => name === file)
  if (asset) {
    return asset.browser_download_url
  }
}

exports.relays = {
  ddatelectron: { repo: 'DDatElectron' },
  ddmonitor: { repo: 'bili-dd-monitor' },
  lavender: { repo: 'Lavendelhonig' }
}
