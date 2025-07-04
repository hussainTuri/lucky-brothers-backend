# ADR 003: Implement VAT Reporting Page in Admin Portal

## Status

Accepted

## Context

There is currently no dedicated interface for tracking VAT obligations. VAT reporting is critical for ensuring timely payments and audits.

## Decision

An admin-facing VAT reporting page will be developed with the following features:

- **Date range filters** (Start Date, End Date).
- Display total **Sales VAT** for the selected period.
- Display total **Purchase VAT** for the selected period.
- Show calculated **VAT Payable**: `Sales VAT - Purchase VAT`.

## Consequences

- Provides real-time, self-service VAT reporting to admin users.
- Simplifies quarterly VAT submission.
- Reduces manual VAT calculations and improves accuracy.

## Date

2025-07-02
