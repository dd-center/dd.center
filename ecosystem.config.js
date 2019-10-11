module.exports = {
  apps: [{
    name: 'dd.center',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false
  }]
}
