/**
 * This script is used to generate monthly reservation cycles for all the reservations
 * It also adds a rent transaction to customer transactions for each reservation cycle
 *
 */
import prisma from '../../middleware/prisma';
import { fixRentalCyclesDates, getReservationCyclesObjects } from '../utils/getReservationCycles';
import {
  checkIfReservationCycleByMonthExists,
  saveVehicleReservationCycle,
} from '../../prisma/repositories/transport';
import { DateTime } from 'luxon';
import { DUBAI_TZ } from '../../lib/constants';

const runGenerateMonthlyReservationCyclesTask = async () => {
  console.log(`[${new Date().toISOString()}] Running cron job...`);

  try {
    // 1. Collect all reservations
    // Get all reservations. filter old reservations where we have created a cycle that cover not just a month but
    // all previous months or years.
    const startOfMonth = DateTime.now().setZone(DUBAI_TZ).startOf('month').toJSDate(); // toJSDate() becomes UTC
    const reservations = await prisma.transportVehicleReservation.findMany({
      where: {
        reservationStart: {
          lt: startOfMonth,
        },
      },
    });

    // 2. For reach reservation, build periods and map them to a cycle row object
    for (const reservation of reservations) {
      const cycles = getReservationCyclesObjects(reservation);
      if (cycles.length === 0) {
        console.log('No cycles found for reservation:', reservation.id);
        continue;
      }

      // 3. Check a cycle object against cycle table for its existence
      for (const cycle of cycles) {
        const exist = await checkIfReservationCycleByMonthExists(reservation.id, cycle.rentFrom);
        if (!exist) {
          console.log('New cycle found', cycle);

          // 4 Add non existing periods to cycle table and rent to customer transactions
          await saveVehicleReservationCycle(cycle);
        }
      }
    }
    console.log(`[${new Date().toISOString()}] Done running cron job`);
  } catch (error) {
    console.error('Error running cron job:', error);
  }
};

// Execute the task when the script runs
// runGenerateMonthlyReservationCyclesTask();
// fixReservationsDates();
fixRentalCyclesDates();
