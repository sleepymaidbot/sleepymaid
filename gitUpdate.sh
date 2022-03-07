unlink yarn.lock
git pull
yarn install
yarn build
pm2 restart sleepymaid-ts
