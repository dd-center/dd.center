const got = require('got')

exports.getLatestURL = async ({ file, repo, owner = 'dd-center' }) => {
  const releases = await got(`https://api.github.com/repos/${owner}/${repo}/releases`).json()
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
