rm -rf dist
mkdir dist

git submodule init
git submodule update

cd ddcenterhome
npm install
npm run build
cd ..
mv ddcenterhome/build/* dist

tar -czf dist.tar.gz dist
