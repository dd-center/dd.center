# dd.center

<https://dd.center> 的首页

如何让好多个dist重合到一起?

只要设置baseURL

就能通过自定义router写页面了

### Deploy

```sh
npm install # install
sh deploy.sh # Download dist from github release
pm2 start ecosystem.config.js
```

### Build (Github Actions)

```sh
sh build.sh # 构建并打包dist
```

