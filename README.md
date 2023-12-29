# Lucky Brothers Backend

## Node

- use version 18. Sharp package was having issues running on Mac M2 machine when using node 16.
  - The work around was:
  - `nvm use 18`
  - rm -rf node_modules/sharp
  - npm install --arch=x64 --platform=darwin sharp
