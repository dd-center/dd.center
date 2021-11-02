git pull

rm -r dist

curl -s https://api.github.com/repos/dd-center/dd.center/releases/latest \
| grep "browser_download_url" \
| cut -d '"' -f 4 \
| wget -qi -

tar -xzf dist.tar.gz

rm dist.tar.gz

npm i

pm2 stop ecosystem.config.js
pm2 start ecosystem.config.js
