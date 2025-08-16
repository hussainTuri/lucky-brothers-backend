-- Calculate the total amount for reservations in July 2025 that are not deleted
SELECT SUM(amount) FROM `TransportVehicleReservationRentalCycle`
WHERE `rentFrom` >= '2025-07-01 00:00:00.000'
    AND `rentTo` <= '2025-07-31 23:59:59.999'
    AND deleted IS NULL;

-- Calculate the total amount customers have PAID for reservations in July 2025
SELECT SUM(tct.amount) as total_paid_amount
FROM `TransportCustomerTransaction` tct
JOIN `TransportCustomerTransactionType` tctt ON tct.customerTransactionTypeId = tctt.id
WHERE tctt.typeName = 'Payment'
    AND tct.createdAt >= '2025-07-01 00:00:00.000'
    AND tct.createdAt <= '2025-07-31 23:59:59.999'
    AND tct.deleted IS NULL

-- calculate the total amount each customer has PAID in July 2025
select `customerId`, SUM(tct.amount) as total_paid_amount
FROM `TransportCustomerTransaction` tct
JOIN `TransportCustomerTransactionType` tctt ON tct.customerTransactionTypeId = tctt.id
WHERE tctt.typeName = 'Payment'
    AND tct.createdAt >= '2025-07-01 00:00:00.000'
    AND tct.createdAt <= '2025-07-31 23:59:59.999'
    AND tct.deleted IS NULL
    group by tct.`customerId`
