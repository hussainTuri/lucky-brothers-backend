# Lucky Brothers Backend

## Node

- use version 18. Sharp package was having issues running on Mac M2 machine when using node 16. (Nops, can't use 18 on old ubuntu server so removed sharp for now)
  - The work around was:
  - `nvm use 18`
  - rm -rf node_modules/sharp
  - npm install --arch=x64 --platform=darwin sharp


## Server
 - Installed nvm and using node v16.20.2 since it's a old version of ubuntu(14)
 - nvm is installed as webuser - NOT as root. Nvm is installed user specific 
 - On each push, run `npm ci && npm run build` followed by `npm  start`
