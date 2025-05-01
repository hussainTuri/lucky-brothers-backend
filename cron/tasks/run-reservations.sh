#!/bin/bash
export PATH=/home/webuser/.nvm/versions/node/v20.11.0/bin:$PATH
cd /var/www/lucky-brothers-backend/cron/tasks
npx ts-node generateMonthlyReservationCycles.ts >> cron.log 2>&1
