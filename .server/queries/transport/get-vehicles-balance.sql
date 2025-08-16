/* This SQL query retrieves the balance of vehicles by calculating the total transaction amount, due amount,
and total outstanding amount for each vehicle. */

/* 1. Total vehicle transaction amount where transactionTypeId != 1 */
/* 2. Due amount = sum of rentalCycle.amount - sum of payments */
/* 3. Sum of (1 + 2) */
SELECT

  v.id AS vehicleId,
  v.vehicleName,
  v.model,

  COALESCE((
    SELECT SUM(vt.amount)
    FROM TransportVehicleTransaction vt
    WHERE vt.vehicleId = v.id
      AND vt.deleted IS NULL
      AND vt.transactionTypeId != 1
  ), 0) AS totalTransactionAmount,

  COALESCE((
    SELECT SUM(rc.amount)
    FROM TransportVehicleReservation r
    JOIN TransportVehicleReservationRentalCycle rc ON rc.vehicleReservationId = r.id
    WHERE r.vehicleId = v.id
      AND r.deleted IS NULL
      AND rc.deleted IS NULL
  ), 0)
  -
  COALESCE((
    SELECT SUM(p.amount)
    FROM TransportVehicleReservation r
    JOIN TransportVehicleReservationRentalCycle rc ON rc.vehicleReservationId = r.id
    JOIN TransportVehicleReservationRentalCyclePayment p ON p.vehicleReservationRentalCycleId = rc.id
    WHERE r.vehicleId = v.id
      AND r.deleted IS NULL
      AND rc.deleted IS NULL
      AND p.deleted IS NULL
  ), 0) AS dueAmount,

  (
    COALESCE((
      SELECT SUM(vt.amount)
      FROM TransportVehicleTransaction vt
      WHERE vt.vehicleId = v.id
        AND vt.deleted IS NULL
        AND vt.transactionTypeId != 1
    ), 0)
    +
    (
      COALESCE((
        SELECT SUM(rc.amount)
        FROM TransportVehicleReservation r
        JOIN TransportVehicleReservationRentalCycle rc ON rc.vehicleReservationId = r.id
        WHERE r.vehicleId = v.id
          AND r.deleted IS NULL
          AND rc.deleted IS NULL
      ), 0)
      -
      COALESCE((
        SELECT SUM(p.amount)
        FROM TransportVehicleReservation r
        JOIN TransportVehicleReservationRentalCycle rc ON rc.vehicleReservationId = r.id
        JOIN TransportVehicleReservationRentalCyclePayment p ON p.vehicleReservationRentalCycleId = rc.id
        WHERE r.vehicleId = v.id
          AND r.deleted IS NULL
          AND rc.deleted IS NULL
          AND p.deleted IS NULL
      ), 0)
    )
  ) AS totalOutstandingAmount

FROM `TransportVehicle` v;
