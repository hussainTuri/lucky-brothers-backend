# ADR 002: Add VAT Tracking Fields to ProductStock

## Status

Accepted

## Context

To enable accurate VAT reporting and better inventory tracking, we need to capture VAT-specific data at the product stock level.

## Decision

The `ProductStock` table will be extended with the following fields:

- `vat`: The VAT amount paid per stock entry.
- `vatRate`: The percentage VAT rate applied.
- `pricePerItemIncVat`: The purchase price per item including VAT.

**Notes:**

- These fields will only apply to **new stock entries**.
- Existing records will remain unchanged to avoid migration overhead.

## Consequences

- Enables granular VAT reporting and auditability.
- No disruption to existing stock records.
- Systems must ensure VAT is provided for new stock entries moving forward.

## Date

2025-07-02
