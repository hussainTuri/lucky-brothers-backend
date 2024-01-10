# Lucky Brothers Backend

## Node

- use version 18. Sharp package was having issues running on Mac M2 machine when using node 16. (Nops, can't use 18 on old ubuntu server so removed sharp for now)
  - The work around was:
  - `nvm use 18`
  - rm -rf node_modules/sharp
  - npm install --arch=x64 --platform=darwin sharp

## CI/CD
### On Server
- ssh into server using webuser
- cd /home/webuser/repositories
- mkdir lucky-brothers-backend.git
- git init --bare && cd hooks
- vi post-receive and paste the following lines
  - #!/bin/sh
  - git --work-tree=/usr/share/nginx/lucky-brothers-backend --git-dir=/home/webuser/repositories/lucky-brothers-backend.git checkout -f
  - cd /usr/share/nginx/lucky-brothers-backend
- chmod +x post-receive
- cd ..
- vi HEAD
- update the branch name to your prod branch name: for instance ref: refs/heads/master -> ref: refs/heads/main. Now it will only accept main branch pushes
- cd /usr/share/nginx
- mkdir lucky-brothers-backend

### client / Github action
 - make sure you are on `main` branch
 - git remote add live ssh://webuser@146.185.128.11/home/webuser/repositories/lucky-brothers-backend.git
 - git push live main

## Server
 - Installed nvm and using node v16.20.2 since it's a old version of ubuntu(14)
 - nvm is installed as webuser - NOT as root. Nvm is installed user specific 
 - On each push, run `npm ci && npm run build` followed by `npm  start` (Note: start it using pm2, see below)


# [PM2 for daemonize app](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-14-04)
- start app
  - cd into app root `cd /usr/share/nginx/lucky-brothers-backend`
  - `pm2 start dist/app.js`
  - Applications that are running under PM2 will be restarted automatically if the application crashes or is killed, but an additional step needs to be taken to get the application to launch on system startup (boot or reboot). Luckily, PM2 provides an easy way to do this, the startup subcommand. The startup subcommand generates and configures a startup script to launch PM2 and its managed processes on server boots. You must also specify the platform you are running on, which is ubuntu, in our case:
    - pm2 startup ubuntu (I did not set it up as it required me to add websuer to sudoer, i just got lazy, so next time droplet restarts, you musht run `pm2 start dist/app.js --name lucky-brothers-backend` and any other apps running through pm2)

