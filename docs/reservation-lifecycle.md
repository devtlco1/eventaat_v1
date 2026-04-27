# Reservation lifecycle (blueprint)

Reservation **states and transitions** as defined in
[`eventaat_product_execution_blueprint_v1.md`](./eventaat_product_execution_blueprint_v1.md) (Part 6 —
دورة حياة الحجز). **This is a specification note only;** no reservation engine is implemented in Step 0.

## Core rule

A reservation is not a single “status”; it is a full journey, and the state must be clear to
customer, restaurant, call center, and administration (per blueprint).

## States

| State (as in blueprint) | Description (blueprint) |
|-------------------------|-------------------------|
| **Draft** | Customer is selecting; request not sent. |
| **Pending** | Request sent; waiting for restaurant approval. |
| **Approved** | Restaurant approved; booking confirmed. |
| **Rejected** | Restaurant rejected. |
| **Alternative Proposed** | Restaurant proposed a different time, branch, or session. |
| **Customer Confirmed Alternative** | Customer accepted the alternative. |
| **Pending Change Approval** | Customer asked to change a **confirmed** booking; awaiting restaurant. |
| **Customer On The Way** | Customer indicated they are en route. |
| **Arrived** | Customer arrived at the restaurant. |
| **Waiting** | Arrived, but the table is not ready yet. |
| **Seated** | Customer seated. |
| **Completed** | Visit completed. |
| **Cancelled by Customer** | Customer cancelled. |
| **Cancelled by Restaurant** | Restaurant cancelled. |
| **Cancelled by Admin** | eventaat admin cancelled (operational or policy). |
| **No Show** | Customer did not attend. |
| **Expired** | Request expired (e.g. restaurant did not respond in time). |

## Allowed transitions (summary)

- **From Draft** → Pending, or Cancelled by Customer.
- **From Pending** → Approved, Rejected, Alternative Proposed, Expired, Cancelled by Customer, Cancelled by
  Admin.
- **From Approved** → Customer On The Way, Arrived, Pending Change Approval, Cancelled by
  Customer, Cancelled by Restaurant, Cancelled by Admin, No Show.
- **From Alternative Proposed** → Customer Confirmed Alternative, *Rejected by Customer* (as in
  blueprint transition list), Expired, Cancelled by Customer.
- **From Arrived** → Waiting, Seated, Cancelled by Restaurant, or Completed in a quick path (per
  blueprint).
- **From Seated** → Completed.

*(See the full transition matrix in the blueprint, section “انتقالات الحالة المسموحة”.)*

## State rules (as listed in the blueprint)

Examples include: no restaurant review before **Completed**; no **No Show** before the grace
period; restaurant cannot change a confirmed time without customer approval; customer cannot change
a **confirmed** booking in ways that affect the table without restaurant approval; every
cancellation and rejection has reason/logging rules; prior bookings keep the cancellation policy
visible at creation; and operational alerts for repeated **Expired** or **No Show** patterns (per
blueprint).

---

*State machine and persistence will be implemented in later phases, aligned with Phases 4 and 5 of
the implementation plan.*
