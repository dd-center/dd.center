require('dotenv').config()
const http = require('http')
const createHandler = require('github-webhook-handler')
const handler = createHandler({ path: '/', secret: process.env.S })
const { exec } = require('child_process')
const { promisify } = require('util')
const asyncExec = promisify(exec)

http.createServer((req, res) => {
  handler(req, res, () => {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(7777)

handler.on('error', console.error)

handler.on('release', async ({ payload: { action } }) => {
  if (action === '') {
    console.log('release')
    const { stdout, stderr } = await asyncExec('sh deploy.sh')
    console.log(stdout)
    console.error(stderr)
  }
});
(async () => {
  console.log('release')
  const { stdout, stderr } = await asyncExec('sh deploy.sh')
  console.log(stdout)
  console.error(stderr)
})()
