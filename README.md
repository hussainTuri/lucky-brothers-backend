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
  - git --work-tree=/var/www/lucky-brothers-backend --git-dir=/home/webuser/repositories/lucky-brothers-backend.git checkout -f
  - cd /var/wwww/lucky-brothers-backend
- chmod +x post-receive
- cd ..
- vi HEAD
- update the branch name to your prod branch name: for instance ref: refs/heads/master -> ref: refs/heads/main. Now it will only accept main branch pushes
- cd /var/www
- mkdir lucky-brothers-backend

### client / Github action

- make sure you are on `main` branch
- git remote add live ssh://webuser@128.199.28.168/home/webuser/repositories/lucky-brothers-backend.git
- git push live main

## Server

- Installed nvm
- nvm is installed as webuser - NOT as root. Nvm is installed user specific
- On each push, run `npm ci && npm run build` followed by `npm  start` (Note: start it using pm2, see below)

# [PM2 for daemonize app](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-14-04)

- start app
  - cd into app root `cd /var/www/lucky-brothers-backend`
  - `pm2 start dist/app.js`

Note: all of the above has been taken care of through [post-receive](.server/post-receive) script.

## Mysql

```
CREATE USER 'lucky'@'%' IDENTIFIED BY 'EeheLcKcaVlD1qq*/yetIpseeeIese';
```

```
GRANT alter, alter routine, create, create routine, create temporary tables, create view, delete, drop, event, execute, index, insert, lock tables, references, select, show view, trigger, update  ON `lucky_prod`.* TO 'lucky'@'%';
```

```
FLUSH PRIVILEGES;
```

## Mysql Back to Dropbox

See your [Github repo](https://github.com/hussainTuri/dropbox-backups)


## deploy 

1. Make code changes and commit

2. Use npm script `npm run deploy`
