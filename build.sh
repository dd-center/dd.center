rm -rf dist
mkdir dist

cd ddcenterhome
npm install
npm run build
cd ..
mv ddcenterhome/build/* dist

cd demo1
npm install
npm run build
cd ..
mv demo1/dist dist/demo1

cd demo2
npm install
npm run build
cd ..
mv demo2/dist dist/demo2

tar -czf dist.tar.gz dist
