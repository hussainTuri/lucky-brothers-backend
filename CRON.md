# 🚀 Cron Jobs - Lucky Brothers Backend

This project uses **cron jobs** to automate database backups, reservation cycle generation, and log maintenance.

---

## 📌 1. Database Backup (Dropbox)

**🕒 Runs:** Every day at **2:00 PM and 11:00 PM**  
**📄 Task:** Backs up the database and syncs it with Dropbox.

### 🛠 Cron Job Command:

0 14,23 \* \* \* /bin/bash /home/webuser/scripts/dropbox-backup/db/main.sh /home/webuser/scripts/dropbox-backup/db/saalmo.musaffah.config.sh >> /home/webuser/scripts/dropbox-backup/db/saalmo.musaffah.cron.log 2>&1

✅ **Logs are stored in `saalmo.musaffah.cron.log`**

---

## 📌 2. Cleanup Old Database Logs

**🕒 Runs:** Every **14 days at 12:05 AM**  
**📄 Task:** Deletes the old database backup logs.

### 🛠 Cron Job Command:

5 0 _/14 _ \* /bin/rm -f /home/webuser/scripts/dropbox-backup/db/saalmo.musaffah.cron.log

✅ **Prevents log files from consuming too much space.**

---

## 📌 3. Add Reservation Cycles (Monthly)

**🕒 Runs:** **On the 1st of every month at 4:00 AM**  
**📄 Task:** Processes reservations and generates rental cycles.

### 🛠 Cron Job Command:

```bash
0 4 1 * * cd /var/www/lucky-brothers-backend/cron/tasks && npx ts-node generateMonthlyReservationCycles.ts >> cron.log 2>&1
```

✅ **Logs are written to `cron.log`**

---

## 📌 4. Log Rotation (Yearly)

**🕒 Runs:** **On January 1st at 12:05 AM**  
**📄 Task:** Moves `cron.log` to a new file with a timestamp and creates a fresh `cron.log`.

### 🛠 Cron Job Command:

```bash
5 0 1 1 * cd /var/www/lucky-brothers-backend/cron/tasks && mv cron.log cron.$(date +\%Y-\%m-\%d).log && touch cron.log
```

✅ **Prevents logs from growing indefinitely.**  
✅ **Keeps yearly logs stored with a timestamp.**

---

## 📌 Log Management & Troubleshooting

- **View live logs:**

```bash
  tail -f /var/www/lucky-brothers-backend/cron/tasks/cron.log
```

- **Check past logs:**

```bash
  ls -lh /var/www/lucky-brothers-backend/cron/tasks/cron.\*
```

- **Test a cron job manually:**

```bash
  cd /var/www/lucky-brothers-backend/cron/tasks && npx ts-node generateMonthlyReservationCycles.ts
```

- **List all scheduled cron jobs:**

```bash
  crontab -l
```

---

### 📌 (Optional) Auto-Delete Old Logs

To automatically delete logs **older than 6 months**, add this cron job:  
0 3 1 \* _ find /var/www/lucky-brothers-backend/cron/tasks/cron._ -mtime +600 -delete

✅ Runs **monthly on the 1st at 3:00 AM**  
✅ Deletes logs older than **600 days**

---

This ensures that **cron jobs run smoothly and logs remain manageable**! 🚀  
Let me know if you want to tweak anything! 😊
