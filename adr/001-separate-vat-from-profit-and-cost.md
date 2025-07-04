# ADR 001: Separate VAT from Profit and Cost Calculations

## Status

Accepted

## Context

Lucky Brother is required to submit VAT reports and make payments to the government every quarter.

Currently:

- **Sales VAT** is recorded but not included in financial reporting or cash register workflows.
- **Purchase VAT** is embedded in the cost of goods, distorting profit calculations.
- VAT Payable (Sales VAT - Purchase VAT) is not actively tracked or reported.

## Decision

Sales VAT and Purchase VAT will be handled **separately** from core profit and cost calculations.

- VAT amounts will be tracked for reporting and cash register journal entries only.
- Profit, cost, and margin calculations will **exclude** VAT.
- VAT Payable will be calculated as: `Sales VAT - Purchase VAT`.
  If the result is negative (i.e., a credit with the government), the credit will be carried forward to the next period.

## Consequences

- Financial reports will reflect true operational profit without VAT distortion.
- VAT reporting will be accurate and compliant.
- Adjustments may be required in cash register workflows to ensure VAT is isolated correctly.
- Historical data will remain unchanged; new handling applies to future transactions.

## Date

2025-07-02
