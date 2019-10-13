rm -r dist

curl -s https://api.github.com/repos/dd-center/dd.center/releases/latest \
| grep "browser_download_url" \
| cut -d '"' -f 4 \
| wget -qi -

tar -xzf dist.tar.gz

rm dist.tar.gz
