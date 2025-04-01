/**
 * This script is used to generate monthly reservation cycles for all the reservations
 * It also adds a rent transaction to customer transactions for each reservation cycle
 *
 */
import prisma from '../../middleware/prisma';
import { getReservationCyclesObjects } from '../utils/getReservationCycles';
import {
  checkIfReservationCycleByMonthExists,
  saveVehicleReservationCycle,
} from '../../prisma/repositories/transport';

const runGenerateMonthlyReservationCyclesTask = async (dryRun = true) => {
  console.log(`[${new Date().toISOString()}] Running cron job ... ${dryRun ? '(dry run)' : ''}`);

  try {
    // 1. Collect all reservations
    const reservations = await prisma.transportVehicleReservation.findMany({});

    // 2. For reach reservation, build periods and map them to a cycle row object
    const tableDataReservationToBeAdded = []; // cycles that wil be added at the end of this script execution
    const tableDataReservationsAlreadyExisted = []; // This should be empty under normal circumstances
    // const tableDataReservationsWithoutCycles = []; // Reservation whose start and end dates doesn't generate any cycles anymore
    for (const reservation of reservations) {
      const tableReservation = {} as any;
      tableReservation.id = reservation.id;
      tableReservation.customerId = reservation.customerId;
      tableReservation.vehicleId = reservation.vehicleId;
      tableReservation.reservationStart = reservation.reservationStart;
      tableReservation.reservationEnd = reservation.reservationEnd;
      tableReservation.monthlyRate = reservation.monthlyRate;

      const cycles = getReservationCyclesObjects(reservation);
      if (cycles.length === 0) {
        // tableDataReservationsWithoutCycles.push({ ...tableReservation, CycleToAdd: 'None' });
        continue;
      }

      // 3. Check a cycle object against cycle table for its existence
      for (const cycle of cycles) {
        const tableReservationCycle = {} as any;

        const exist = await checkIfReservationCycleByMonthExists(reservation.id, cycle.rentFrom);
        if (!exist) {
          // console.log('New cycle found', cycle);
          tableReservationCycle.cycleRentFrom = cycle.rentFrom;
          tableReservationCycle.cycleRentTo = cycle.rentTo;
          tableReservationCycle.cycleAmount = cycle.amount;

          // 4 Add non existing periods to cycle table and rent to customer transactions
          if (!dryRun) {
            await saveVehicleReservationCycle(cycle);
          }
          tableDataReservationToBeAdded.push({ ...tableReservation, ...tableReservationCycle });
        } else {
          tableDataReservationsAlreadyExisted.push({
            ...tableReservation,
            ...tableReservationCycle,
            CycleAlreadyExisted: true,
          });
        }
      }
    }

    // console.log('Following reservations have no cycles generated, probably because end period for the reservation is before march 2025. We only consider cycles starting with march 2025');
    // console.table(tableDataReservationsWithoutCycles);

    console.log('Following cycles already existed');
    console.table(tableDataReservationsAlreadyExisted);

    console.log('Following cycles are added');
    console.table(tableDataReservationToBeAdded);

    console.log(`[${new Date().toISOString()}] Done running cron job`);
  } catch (error) {
    console.error('Error running cron job:', error);
  }
};

// Execute the task when the script runs
runGenerateMonthlyReservationCyclesTask(false);
