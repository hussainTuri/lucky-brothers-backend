# Ads metrics API service

![npm test](https://github.com/allermedia/se-ads-stats-service/workflows/npm%20test/badge.svg)

## Summary

ExpressJs application serving APIs.

## Local development

- Copy .env-example as .env file and update the variables.
-

### Install packages

`npm i`

### Mysql

1. create todo-dev and todo-test databases on server
2. copy `lib/mysql/config/config-example.json` as `lib/mysql/config/config.json`
3. update configs in `lib/mysql/config/config.json`
4. Run migrations to create
   tables `npx sequelize-cli db:migrate -- dialect mysql && npx sequelize-cli db:migrate --env test -- dialect mysql`

### Sqlite

2. Copy `lib/sqlite/config/config-example.json` as `lib/mysql/config/config.json`
3. update configs in `lib/sqlite/config/config.json`
4. Run migrations to create tables `npx sequelize-cli db:migrate && npx sequelize-cli db:migrate --env test`

### Build and run

1. To run server using default database (Sqlite) use `npm run dev-sqlite`
2. To run server using Mysql database use `npm run dev-mysql`

Server is listening on port 3000, visit [http://localhost:3000/](http://localhost:3000/)

### Testing

`npm run test` runs all tests.

Tests use sqlite by default, you can force them to use mysql by passing DB_DIALECT=mysql like:

`NODE_ENV=test DB_DIALECT=mysql run-s test:*`
