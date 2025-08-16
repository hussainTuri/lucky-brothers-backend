# Expense for each vehicle in certain month
SELECT
    vehicleId, SUM(amount) expense
FROM
    TransportVehicleTransaction
WHERE
    transactionTypeId = 4
        AND deleted IS NULL
        AND createdAt >= '2025-07-01 00:54:41.201'
        AND createdAt <= '2025-07-31 00:54:41.201'
GROUP BY vehicleId
ORDER BY expense DESC

# Total expense for all vehicles in certain month
SELECT
    SUM(amount) expense
FROM
    TransportVehicleTransaction
WHERE
    transactionTypeId = 4
        AND deleted IS NULL
        AND createdAt >= '2025-07-01 00:54:41.201'
        AND createdAt <= '2025-07-31 00:54:41.201'
GROUP BY transactionTypeId;


