# SALAM | سلام
# Document 05 — Business Logic

**Status: APPROVED**

---

## 1. Purpose

This document defines the operational rules that connect SALAM's storefront, inventory, payments, orders, shipping, returns, exchanges, refunds, coupons, notifications, and audit system.

The backend and database implementation must follow these rules unless a future revision explicitly changes them.

---

## 2. Order Creation

When a customer submits checkout, the system must validate:

- Product exists
- Variant exists
- Product is active
- Variant is available
- Requested quantity is available
- Current price is valid
- Coupon is valid, if provided
- Shipping is available for the selected address

Flow:

```text
Cart
↓
Validate
↓
Calculate Total
↓
Reserve Stock
↓
Create Order
↓
Create Order Items
↓
Create Payment
↓
Clear Cart
```

Order creation must use a database transaction.

---

## 3. Stock Reservation

When an order is created, requested units move from Available Stock to Reserved Stock.

Example:

```text
Before:
Total = 10
Available = 10
Reserved = 0
Sold = 0

Order requests 2:

Available = 8
Reserved = 2
Sold = 0
```

Reserved stock is not considered available for another order.

---

## 4. Reservation to Sold

When an order is confirmed:

```text
Reserved → Sold
```

Example:

```text
Available = 8
Reserved = 2
Sold = 0

After Confirmation:

Available = 8
Reserved = 0
Sold = 2
```

This provides clear inventory and sales reporting.

---

## 5. Order Cancellation

If an order is cancelled before confirmation/sale recognition:

```text
Reserved → Available
```

If an already-confirmed/sold order is cancelled under an allowed business case:

```text
Sold → Available
```

All resulting inventory changes must be recorded in inventory history and audit logs.

---

## 6. Payment Logic

SALAM supports:

- Cash on Delivery
- InstaPay
- Vodafone Cash

### COD

Initial payment state:

```text
Payment Status = Pending
Order Status = Pending
```

COD orders require **admin confirmation** before preparation.

After admin confirmation:

```text
Order Status = Confirmed
```

Payment is collected at delivery.

### InstaPay / Vodafone Cash

After checkout:

```text
Payment Status = Pending Verification
Order Status = Pending
```

Customer submits:

- Payment screenshot
- Transaction reference

Admin reviews the payment.

### Approved

```text
Payment = Paid
Order = Confirmed
```

### Rejected

```text
Payment = Rejected
Order = Pending Payment
```

Customer can submit payment proof again.

---

## 7. Payment Amount Validation

Manual payment approval must compare:

- Expected order amount
- Reported/received amount

Example:

```text
Expected = 1,850 EGP
Received = 1,850 EGP
→ Valid
```

If the amount differs, payment must not be automatically approved.

The admin should see an amount-mismatch warning and decide according to the business process.

---

## 8. Coupon Logic

Before applying a coupon, the system validates:

- Active status
- Start date
- End date
- Global usage limit
- Customer usage limit
- Minimum order value
- Maximum discount
- Applicable products
- Applicable collections

Coupon usage must be recorded against the order/customer.

---

## 9. Coupons and Sale Products

Default rule:

> Coupons do not apply to already-discounted products.

However, each coupon can have:

`Apply to Sale Items = Yes / No`

This allows SALAM to explicitly permit stacking when desired.

---

## 10. Shipping Calculation

Shipping fee may depend on:

- Governorate
- City / Zone
- Shipping company
- Shipping method
- Configured order rules

Example:

```text
Cairo       70 EGP
Giza        75 EGP
Alexandria  90 EGP
```

Admin must be able to configure shipping rules and fees.

---

## 11. Order Total

Calculation:

```text
Subtotal
- Product Discounts
- Coupon Discount
+ Shipping Fee
= Grand Total
```

Example:

```text
Products            2,000 EGP
Product Discount     -200 EGP
Coupon                -100 EGP
Shipping                 80 EGP
--------------------------------
Grand Total          1,780 EGP
```

---

## 12. Order Status Rules

Primary flow:

```text
Pending
↓
Confirmed
↓
Preparing
↓
Ready for Shipping
↓
Shipped
↓
Out for Delivery
↓
Delivered
```

Additional states:

- Cancelled
- Delivery Failed
- Returned

Payment status must remain separate from order status.

---

## 13. Customer Cancellation

Customer cancellation is supported.

Customer can cancel before:

`Shipped`

Once the order is shipped, it is no longer treated as a normal cancellation.

The customer may instead use the applicable return/refusal process.

---

## 14. Failed Delivery

If the shipping company cannot complete delivery:

```text
Shipped
↓
Out for Delivery
↓
Delivery Failed
```

Admin can:

- Retry Delivery
- Contact Customer
- Mark Returned

---

## 15. COD Collection

When a COD order is delivered:

```text
COD Status = Collected
```

This does not mean SALAM has received the settlement yet.

Settlement lifecycle:

```text
Collected
↓
Pending Settlement
↓
Settled
```

Possible additional state:

`Disputed`

---

## 16. COD Settlement

Example:

```text
Order COD Amount = 2,000 EGP
Shipping Fee      = 100 EGP
Net Settlement    = 1,900 EGP
```

The system records:

- COD amount
- Shipping fee
- Collected amount
- Net settlement
- Settlement date
- Settlement reference
- Settlement status

---

## 17. Return Eligibility

Return and exchange requests are allowed within:

> **7 days from delivery**

Product must be:

- Unused
- Unwashed
- Unaltered
- In original packaging
- With original tags

The final eligibility decision is made during the approved return/inspection workflow.

---

## 18. Partial Returns

Customers may return **part of an order**.

Example:

```text
Order:
3 products

Customer returns:
1 product

Remaining:
2 products
```

The return request must identify the specific order items and quantities being returned.

---

## 19. Return Request

Flow:

```text
Order
↓
Request Return
↓
Select Item(s)
↓
Select Reason
↓
Upload Photos when applicable
↓
Submit
```

Initial status:

`Requested`

---

## 20. Return Review

Admin reviews the request.

Approved flow:

```text
Requested
↓
Under Review
↓
Approved
```

Rejected flow:

```text
Requested
↓
Under Review
↓
Rejected
```

Rejection requires a reason.

---

## 21. Return Shipping Responsibility

### Customer-Initiated / Customer-Related

Examples:

- Wrong size
- Change of mind
- Customer preference

Customer pays return shipping.

### SALAM-Related

Examples:

- Wrong product received
- Defective product

SALAM pays return shipping.

---

## 22. Return Inspection

Returned products do not automatically return to sellable inventory.

Inspection checks:

- Used?
- Washed?
- Altered?
- Original tags?
- Original packaging?
- Damage?

Result:

### Accepted / Resellable

```text
Returned → Available Stock
```

### Accepted but Non-Sellable

```text
Returned → Non-Sellable / Damaged Stock
```

### Rejected Return

Return request is rejected according to the applicable policy.

---

## 23. Return Shipping and Original Shipping Fee

Default policy:

> Customer pays return shipping for normal returns/exchanges.

> Original shipping fee is non-refundable.

Exception:

When the issue is caused by SALAM or the product is defective, SALAM may cover return shipping and the original shipping fee may be refunded.

---

## 24. Refund Calculation

Default:

```text
Refund =
Eligible Product Amount
- Applicable Non-Refundable Shipping
```

The exact refund must be calculated per returned order item for partial returns.

For SALAM-fault/defective cases, eligible original shipping may also be refunded.

---

## 25. Refund Processing

Refund statuses:

```text
Pending
↓
Processing
↓
Completed
```

Possible final failure/rejection state:

`Rejected`

Each refund records:

- Amount
- Method
- Reference
- Date
- Admin
- Notes

Supported refund methods:

- InstaPay
- Vodafone Cash

COD refunds are normally processed through InstaPay or Vodafone Cash rather than cash.

---

## 26. Exchange Logic

Customers may exchange individual items within an order.

Example:

```text
Order contains 3 items.

Customer exchanges:
1 item

Other 2 items remain unchanged.
```

Exchange flow:

```text
Request
↓
Review
↓
Check Replacement Stock
↓
Approve
↓
Reserve Replacement
↓
Receive Original
↓
Inspect
↓
Complete Exchange
```

---

## 27. Partial Exchanges

Partial exchange is supported.

The exchange request identifies:

- Original order item
- Original variant
- Requested replacement variant
- Quantity

The remaining order items are unaffected.

---

## 28. Exchange Price Difference

### More Expensive Replacement

Example:

```text
Original = 1,500 EGP
New      = 1,800 EGP

Difference = 300 EGP
```

Customer pays the difference.

### Cheaper Replacement

Example:

```text
Original = 1,800 EGP
New      = 1,500 EGP

Difference = 300 EGP
```

Customer receives the difference through the approved refund process.

---

## 29. Exchange Inventory

When exchange is approved:

- Replacement variant is reserved.
- Original item remains part of the return/inspection flow.

After original item passes inspection:

```text
Original:
Sold → Available Stock
```

If not resellable:

```text
Original:
Sold → Non-Sellable / Damaged
```

Replacement:

```text
Reserved → Sold
```

---

## 30. Failed COD / Customer Refusal

If a customer refuses or fails to receive a COD order, the system records:

- Delivery Failed
- Return shipment where applicable
- Shipping/return cost
- Reason
- Customer history

The approved policy is:

> Customer is responsible for the applicable return shipping cost in normal refusal/customer-related cases.

This cost must be tracked separately for reporting and customer history.

---

## 31. Notifications

### Customer Notifications

- Order Created
- Payment Approved
- Payment Rejected
- Order Confirmed
- Preparing
- Ready for Shipping
- Shipped
- Out for Delivery
- Delivered
- Return Requested
- Return Approved
- Return Rejected
- Exchange Requested
- Exchange Approved
- Refund Completed

### Admin Notifications

- New Order
- Payment Verification Required
- Low Stock
- Out of Stock
- Return Request
- Exchange Request
- Delivery Failed
- COD Settlement Due

---

## 32. Notification Channels

Initial channels:

- In-app
- WhatsApp

Future-ready channels:

- Email
- SMS
- Push Notifications

The notification architecture should allow additional channels without changing the core business logic.

---

## 33. Audit Logic

Every sensitive operation must be traceable.

Examples:

- Product price changes
- Stock changes
- Order status changes
- Payment approval/rejection
- Refunds
- Returns
- Exchanges
- Coupon changes
- Admin permission changes

Audit record should contain:

- Actor
- Action
- Entity
- Entity ID
- Previous value when applicable
- New value when applicable
- Timestamp
- IP/device information when appropriate and legally/technically available

---

## 34. No Silent Changes

Important financial, inventory, permission, and order changes must never happen silently.

Every sensitive change must have an audit trail.

---

## 35. Order Data Snapshot

When an order is created, the order item must preserve a snapshot of:

- Product name
- Variant
- SKU
- Unit price
- Discount
- Quantity

Historical orders must not change when the current product is edited later.

Example:

```text
Order in 2026:
Price = 1,500 EGP

Product price changed later:
1,800 EGP

Historical order remains:
1,500 EGP
```

---

## 36. Customer Address Snapshot

The order must preserve the customer's delivery address at the time of purchase.

If the customer later changes their saved address, old orders must not change.

---

## 37. Idempotency / Duplicate Order Protection

Checkout must prevent accidental duplicate orders.

If the customer clicks `Place Order` multiple times because of slow connectivity, the system must not create duplicate orders or duplicate payment records.

The backend should use idempotency protection and transactional processing.

---

## 38. Concurrency / Stock Protection

Inventory operations must be protected against concurrent purchases.

Example:

```text
Stock = 1

Customer A → requests last item
Customer B → requests last item
```

Only one transaction may successfully reserve the final unit.

Database transactions and row-level locking or an equivalent concurrency-safe strategy must be used.

---

## 39. Made-to-Order Future Support

The system must support:

`Fulfillment Type = Made to Order`

Future Made-to-Order products may use:

- Production Lead Time
- Expected Ready Date
- Production Status
- Customer Notifications
- Special order status

Current SALAM operation remains:

> **Stock Only**

---

## 40. Approved Business Decisions

The following decisions are explicitly approved:

1. COD orders require admin confirmation.
2. Customer cancellation is allowed before shipping.
3. Failed/refused COD orders may create a return shipping cost for the customer.
4. Partial returns are supported.
5. Partial exchanges are supported.
6. Return/exchange window is 7 days from delivery.
7. Product must be unused, unwashed, unaltered, with original packaging/tags.
8. Customer pays normal return shipping.
9. SALAM pays return shipping for SALAM fault/defective cases.
10. Original shipping is non-refundable by default.
11. Eligible original shipping may be refunded for SALAM fault/defective cases.
12. Verified purchase reviews only.
13. Stock and Made-to-Order are both supported by the system.
14. Coupon codes and product discounts are both supported.
15. Multi-admin, granular permissions, audit logs, notifications, activity tracking, and exports are required.

---

# Approval Status

**DOCUMENT 05 IS APPROVED**

This document is the current source of truth for SALAM business rules and operational workflows.

Future changes must be explicitly marked as revisions.
