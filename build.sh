cd demo1
npm install
npm run build
cd ..

cd demo2
npm install
npm run build
cd ..

mkdir dist
mv demo1/dist dist/demo1
mv demo2/dist dist/demo2

tar -czf dist.tar.gz dist
