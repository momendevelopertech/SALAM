# SALAM | سلام
# Document 09 — API & Server Actions Specification

**Status: APPROVED FOR IMPLEMENTATION**

## 1. Objective

Define the application mutation/query contract for SALAM so OpenCode can implement the backend consistently without inventing business behavior.

The preferred internal architecture is:

```text
UI
↓
Server Action / Route Handler
↓
Validation
↓
Authentication
↓
Authorization
↓
Domain Service
↓
Repository / Prisma
↓
Neon PostgreSQL
```

Route Handlers are reserved for HTTP-facing integrations, webhooks, and intentionally exposed APIs.

---

# 2. General Rules

Every mutation must:

1. Validate input on the server.
2. Authenticate when required.
3. Check authorization.
4. Execute business rules in a service.
5. Use a database transaction when multiple related writes must succeed together.
6. Return a typed safe result.
7. Never trust client-calculated prices, discounts, stock, totals, roles, or statuses.
8. Create an audit record for sensitive admin actions.

Standard result shape:

```ts
type ActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };
```

Never return raw Prisma errors to the browser.

---

# 3. Error Codes

Use stable error codes:

```text
VALIDATION_ERROR
UNAUTHENTICATED
FORBIDDEN
NOT_FOUND
CONFLICT
INVALID_STATE
OUT_OF_STOCK
RESERVATION_EXPIRED
INVALID_COUPON
PAYMENT_ERROR
PAYMENT_REJECTED
SHIPPING_ERROR
RETURN_NOT_ALLOWED
EXCHANGE_NOT_ALLOWED
RATE_LIMITED
INTERNAL_ERROR
```

Customer-facing messages should be Arabic-first.

---

# 4. Authentication Actions

## registerCustomer

```text
Input:
- firstName
- lastName
- email optional
- phone
- password
```

Rules:

- Validate all fields.
- Normalize email/phone.
- Check uniqueness where applicable.
- Hash password using the selected auth system.
- Create Customer.
- Create authenticated session after successful registration if supported.
- Never return password/hash.

---

## loginCustomer

```text
Input:
- email or phone
- password
```

Rules:

- Validate credentials.
- Rate-limit repeated failures.
- Create secure session.
- Do not reveal whether an email/phone exists in a security-sensitive error.

---

## logoutCustomer

Requires authenticated session.

Invalidate session securely.

---

## forgotPassword

Input:

```text
email
```

Do not reveal whether the account exists.

---

## resetPassword

Input:

```text
token
newPassword
```

Validate token, expiration, and password requirements.

---

# 5. Customer Profile

## getCustomerProfile

Requires authentication.

Returns safe profile data only.

---

## updateCustomerProfile

Input:

```text
firstName
lastName
email
phone
```

Validate uniqueness and format.

---

# 6. Address Actions

## listAddresses

Authenticated Customer.

---

## createAddress

Input:

```text
label
recipientName
phone
governorate
city
area
street
building
floor
apartment
landmark
isDefault
```

If `isDefault = true`, unset the previous default inside a transaction.

---

## updateAddress

Customer can update only their own address.

---

## deleteAddress

Customer can delete only their own address.

Do not allow deletion of an address required as an immutable historical order snapshot.

---

## setDefaultAddress

Use a transaction to guarantee one default address.

---

# 7. Catalog Queries

Catalog reads should generally use Server Components/server-side queries.

## getFeaturedProducts

Input:

```text
limit
```

Returns active published products.

---

## getProducts

Filters:

```text
search
category
collection
occasion
size
color
minPrice
maxPrice
availability
page
limit
sort
```

Sort options:

```text
NEWEST
PRICE_ASC
PRICE_DESC
POPULAR
FEATURED
```

Only active/published products appear publicly.

---

## getProductBySlug

Input:

```text
slug
```

Return:

- Product
- Variants
- Images
- Pricing
- Availability
- Categories
- Collections
- Reviews summary
- Related products

Do not expose internal cost price.

---

## getCategoryBySlug

Return category metadata and paginated products.

---

## getCollectionBySlug

Return collection metadata and paginated products.

---

## searchProducts

Input:

```text
query
filters
page
limit
```

Search:

- Arabic product name
- English product name
- SKU
- Tags
- Category
- Collection

---

# 8. Wishlist

## getWishlist

Authenticated Customer.

---

## addToWishlist

Input:

```text
productId
```

Rules:

- Verify product exists.
- Customer can modify only own wishlist.
- Duplicate item must not be created.

---

## removeFromWishlist

Input:

```text
productId
```

---

# 9. Cart

The cart may be guest or customer-owned.

## getCart

Returns:

```text
items
subtotal
discount
shipping
total
```

All financial values are calculated server-side.

---

## addToCart

Input:

```text
variantId
quantity
```

Rules:

- Validate variant.
- Validate active product.
- Validate quantity.
- Validate availability.
- Do not trust client price.
- Do not permanently reserve stock merely by adding to cart unless the configured reservation strategy explicitly does so.

---

## updateCartItem

Input:

```text
cartItemId
quantity
```

Revalidate stock.

---

## removeCartItem

Input:

```text
cartItemId
```

---

## applyCoupon

Input:

```text
cartId
code
```

Rules:

- Validate coupon.
- Validate date.
- Validate usage limit.
- Validate customer limit.
- Validate minimum order.
- Validate sale-item rules.
- Calculate discount server-side.

---

## removeCoupon

Remove coupon from cart.

---

# 10. Checkout

## prepareCheckout

Input:

```text
cart
addressId or address data
shippingOption
coupon
paymentMethod
```

Server must:

1. Load authoritative cart.
2. Load authoritative products/variants.
3. Revalidate stock.
4. Recalculate prices.
5. Recalculate discount.
6. Calculate shipping.
7. Calculate final total.
8. Return checkout summary.

Client totals are display-only.

---

# 11. Inventory Reservation

## reserveInventory

Internal service operation.

Input:

```text
orderId
items[]
```

Rules:

- Run transactionally.
- Lock/check relevant inventory rows.
- Reject if stock is insufficient.
- Increase reserved quantity.
- Decrease available quantity.
- Create InventoryMovement.
- Create InventoryReservation.

---

## releaseInventoryReservation

Internal service operation.

Used when:

- Checkout fails
- Order is canceled before fulfillment
- Reservation expires
- Payment is rejected where applicable

---

## convertReservationToSale

Internal operation after successful order confirmation.

Creates SALE movement and finalizes reservation state.

---

# 12. Create Order

## createOrder

This is one of the most critical operations.

Input:

```text
cart/session identifier
customer information
shipping address
payment method
shipping option
coupon code optional
idempotencyKey
```

Server workflow:

```text
Authenticate/validate
↓
Load cart
↓
Validate items
↓
Validate stock
↓
Calculate prices
↓
Calculate coupon
↓
Calculate shipping
↓
Create reservation
↓
Create order
↓
Create order items with snapshots
↓
Create payment
↓
Create status history
↓
Commit transaction
```

The operation must be idempotent.

A repeated request with the same idempotency key must not create a duplicate order.

---

# 13. Order Snapshot Rules

Order items must store historical snapshots.

Never rebuild historical order information from the current Product record.

Snapshot:

```text
product name
variant name
SKU
unit price
discount
quantity
relevant product data
```

Shipping address must also be snapshotted.

---

# 14. Customer Order Queries

## getMyOrders

Authenticated customer.

Supports:

```text
page
limit
status
```

Customer can only access own orders.

---

## getMyOrder

Input:

```text
orderNumber
```

Verify ownership.

---

## cancelMyOrder

Input:

```text
orderNumber
reason
```

Rules:

- Verify ownership.
- Check whether cancellation is allowed based on current order state.
- Release inventory reservation where applicable.
- Update order status.
- Create status history.
- Create audit event if required.

---

# 15. Payment Actions

## createPayment

Internal operation called during order creation.

Methods:

```text
COD
INSTAPAY
VODAFONE_CASH
```

---

## submitPaymentProof

Input:

```text
orderId
paymentId
cloudinaryPublicId
secureUrl
transactionReference
```

Rules:

- Verify order ownership or authorized admin flow.
- Validate image metadata.
- Validate payment state.
- Set payment to `PENDING_VERIFICATION`.
- Notify admins.

---

## verifyPayment

Admin permission:

```text
payments.verify
```

Input:

```text
paymentId
decision
reason optional
```

Decision:

```text
APPROVE
REJECT
```

Approve:

```text
Payment = PAID
Order paymentStatus = PAID
```

Reject:

```text
Payment = REJECTED
```

The related order state must be updated according to the approved business workflow.

Every decision must create an audit log.

---

# 16. Refunds

## createRefund

Admin permission:

```text
refunds.process
```

Input:

```text
orderId
amount
method
reason
```

Rules:

- Amount cannot exceed refundable amount.
- Validate order/payment state.
- Create Refund record.
- Update Payment status appropriately.
- Record audit event.

---

# 17. Shipping

## calculateShipping

Input:

```text
address
cart/items
```

Return:

```text
shippingFee
estimatedDelivery
provider
```

---

## createShipment

Admin/system operation.

Input:

```text
orderId
providerId
```

Rules:

- Validate order state.
- Create provider shipment.
- Save tracking number.
- Update order fulfillment state.
- Record status history.

---

## trackShipment

Input:

```text
shipmentId
```

Return normalized tracking events.

---

# 18. Shipping Webhook

Route:

```text
POST /api/webhooks/shipping/[provider]
```

Workflow:

```text
Receive request
↓
Verify signature/authentication
↓
Validate payload
↓
Find shipment
↓
Normalize status
↓
Update shipment
↓
Create tracking event
↓
Update order if applicable
↓
Notify customer
```

Webhook processing must be idempotent.

---

# 19. Return Eligibility

Return policy:

```text
7 days
```

Product must be:

- Unused
- Unwashed
- Unaltered
- In original packaging/tags

Customer pays return shipping.

Original shipping fee is non-refundable except when:

- SALAM made the error
- Product is defective

The server must enforce these rules.

---

# 20. Return Actions

## createReturnRequest

Input:

```text
orderId
items[]
reason
notes
images optional
```

Rules:

- Verify ownership.
- Verify order eligibility.
- Verify 7-day window.
- Verify item has not already been returned/exchanged beyond allowed quantity.
- Create return request.
- Create return items.
- Set status to `REQUESTED`.

---

## reviewReturn

Admin permission:

```text
returns.approve
```

Actions:

```text
APPROVE
REJECT
```

Every decision is audited.

---

## receiveReturn

Admin operation.

Input:

```text
returnRequestId
inspection results
```

Update item condition.

Only approved/resellable items should return to available inventory.

Damaged/used items must not automatically become sellable.

---

## completeReturn

Admin operation.

Process:

```text
Return accepted
↓
Inventory updated
↓
Refund calculated
↓
Refund created
↓
Return completed
```

---

# 21. Exchange Actions

## createExchangeRequest

Input:

```text
orderId
originalItemId
replacementVariantId
quantity
reason
```

Rules:

- Verify ownership.
- Verify exchange eligibility.
- Verify replacement stock.
- Calculate price difference server-side.

---

## reviewExchange

Admin permission:

```text
exchanges.approve
```

Actions:

```text
APPROVE
REJECT
```

---

## completeExchange

Workflow:

```text
Original item received
↓
Inspect condition
↓
Return original inventory appropriately
↓
Reserve replacement inventory
↓
Calculate price difference
↓
Collect/refund difference
↓
Create exchange completion
```

---

# 22. Reviews

## createReview

Input:

```text
productId
orderId
rating
title
content
images
```

Rules:

- Customer must be authenticated.
- Customer must have purchased the product.
- Order must meet review eligibility rules.
- Mark `isVerifiedPurchase = true`.
- Prevent duplicate review if policy allows one review per order item.

---

## moderateReview

Admin permission:

```text
reviews.moderate
```

Actions:

```text
APPROVE
REJECT
FEATURE
UNFEATURE
```

---

# 23. Coupons

## validateCoupon

Input:

```text
code
cartId
customerId optional
```

Validate:

- Active state
- Date range
- Usage limit
- Per-customer limit
- Minimum order
- Sale item restrictions

---

## createCoupon

Admin permission:

```text
coupons.create
```

---

## updateCoupon

Admin permission:

```text
coupons.update
```

---

## deactivateCoupon

Admin permission:

```text
coupons.update
```

---

# 24. Admin Catalog

## createProduct

Permission:

```text
products.create
```

Must support:

- Arabic/English content
- Category
- Collections
- Tags
- Occasions
- Pricing
- Variants
- Images
- SEO
- Publishing

Product creation and variant creation should be transaction-safe.

---

## updateProduct

Permission:

```text
products.update
```

Price changes must create an audit event.

---

## archiveProduct

Permission:

```text
products.delete
```

Use soft delete/archive behavior.

Never destroy historical order data.

---

## manageProductImages

Permission:

```text
products.update
```

Supports:

- Upload
- Reorder
- Set primary
- Delete
- Assign to variant

Cloudinary metadata must be persisted.

---

# 25. Admin Inventory

## getInventory

Permission:

```text
inventory.view
```

Filters:

```text
search
SKU
product
lowStock
outOfStock
```

---

## adjustInventory

Permission:

```text
inventory.adjust
```

Input:

```text
variantId
quantity
reason
notes
```

Rules:

- Transactional update.
- Create InventoryMovement.
- Audit admin identity.

---

## getInventoryMovements

Permission:

```text
inventory.view
```

---

# 26. Admin Orders

## getAdminOrders

Permission:

```text
orders.view
```

Filters:

```text
orderNumber
customer
status
paymentStatus
fulfillmentStatus
dateRange
paymentMethod
```

Paginated.

---

## getAdminOrder

Permission:

```text
orders.view
```

Return full operational order information.

---

## updateOrderStatus

Permission:

```text
orders.update
```

Validate allowed state transitions.

Never allow arbitrary client-supplied status changes.

---

## addOrderNote

Permission:

```text
orders.update
```

---

# 27. Admin Customers

## getCustomers

Permission:

```text
customers.view
```

Support:

- Search
- Pagination
- Orders count
- Total spend
- Last order
- Customer status

---

## getCustomer

Permission:

```text
customers.view
```

Show:

- Profile
- Addresses
- Orders
- Returns
- Exchanges
- Reviews
- Customer activity where appropriate

---

# 28. Admin Shipping

## getShipments

Permission:

```text
orders.view
```

Filters:

- Provider
- Status
- Tracking number
- Date

---

## updateShipmentStatus

Normally system/provider-driven.

Manual admin updates require appropriate permission and audit logging.

---

# 29. Admin Returns

## getReturns

Permission:

```text
returns.view
```

Filters:

```text
status
date
orderNumber
customer
```

---

## getReturn

Permission:

```text
returns.view
```

---

# 30. Admin Exchanges

## getExchanges

Permission:

```text
exchanges.view
```

---

## getExchange

Permission:

```text
exchanges.view
```

---

# 31. Admin Payments

## getPendingPayments

Permission:

```text
payments.view
```

Return:

- Order
- Customer
- Amount
- Method
- Proof
- Reference
- Submitted date

---

## getPayment

Permission:

```text
payments.view
```

---

# 32. Admin Reports

Reports should use server-side aggregation.

Examples:

```text
Revenue
Orders
Average Order Value
Top Products
Top Categories
Top Collections
Payment Methods
COD Collection
Returns
Exchanges
Refunds
Inventory Value
Low Stock
```

Date filters:

```text
Today
7 Days
30 Days
This Month
Previous Month
Custom
```

---

# 33. Admin Dashboard

## getDashboardSummary

Permission:

```text
reports.view
```

Return KPI data.

Avoid returning unnecessary detailed records.

---

# 34. Banners

## getActiveBanners

Public read.

---

## createBanner

Permission:

```text
settings.manage
```

---

## updateBanner

Permission:

```text
settings.manage
```

---

## deleteBanner

Permission:

```text
settings.manage
```

Prefer archive/disable over destructive deletion when historical references exist.

---

# 35. Notifications

## createNotification

Internal/admin operation.

---

## markNotificationRead

Authenticated recipient.

---

## markAllNotificationsRead

Authenticated recipient.

---

# 36. Audit Logs

## getAuditLogs

Permission:

```text
audit_logs.view
```

Filters:

```text
user
action
entityType
entityId
dateRange
```

Audit logs are read-only.

---

# 37. Settings

## getPublicSettings

Public-safe settings only.

---

## getAdminSettings

Permission:

```text
settings.manage
```

Sensitive secrets must never be returned to browser UI.

---

## updateSetting

Permission:

```text
settings.manage
```

Secrets belong in environment variables, not normal settings.

---

# 38. Cloudinary Upload Architecture

Preferred flow:

```text
Admin/Customer
↓
Request signed upload configuration
↓
Server validates authorization
↓
Cloudinary upload
↓
Cloudinary returns metadata
↓
Server saves publicId + secureUrl
```

For payment proof, ensure the authenticated customer can associate the upload only with their own payment/order.

Validate:

- MIME type
- File size
- Allowed extensions
- Resource type

---

# 39. API Route Summary

Intentional HTTP endpoints:

```text
POST /api/webhooks/shipping/[provider]
POST /api/webhooks/payment/[provider]

POST /api/uploads/sign
```

Additional Route Handlers may be created only when a real HTTP integration requires them.

Do not build a REST endpoint for every Server Action.

---

# 40. Authorization Matrix

```text
Customer:
- Own profile
- Own addresses
- Own cart
- Own orders
- Own payments
- Own returns
- Own exchanges
- Own reviews
- Own wishlist

Admin:
- Permission-based access

Public:
- Published catalog
- Public content
- Public reviews
- Public categories/collections
```

---

# 41. Transactions

Transactions are mandatory for operations involving multiple dependent writes.

Critical examples:

```text
Create Order
Reserve Inventory
Release Reservation
Payment Approval
Return Completion
Exchange Completion
Refund Processing
Inventory Adjustment
Coupon Usage
```

---

# 42. Idempotency

Use idempotency for operations that may be retried:

```text
Create Order
Create Payment
Create Shipment
Process Webhook
Refund
```

The idempotency key/result must be stored safely where needed.

---

# 43. Pagination

Default server-side pagination:

```text
limit = 20
```

Maximum page size should be bounded.

For very large datasets, cursor pagination may be introduced.

---

# 44. Caching

Public catalog queries may be cached/revalidated.

Never cache personalized responses such as:

- Cart
- Checkout
- Account
- Orders
- Payment status
- Admin data

without explicit correctness guarantees.

---

# 45. Security

Every mutation must assume the client is untrusted.

Never accept from the browser as authoritative:

```text
price
discount
stock
total
paymentStatus
orderStatus
role
permissions
refundAmount
```

These are calculated/validated on the server.

---

# 46. Acceptance Criteria

Document 09 is complete when:

- All major domains have defined operations.
- Inputs are defined.
- Server validation is required.
- Authentication requirements are defined.
- Permission requirements are defined.
- Business logic ownership is clear.
- Critical transactions are identified.
- Idempotency requirements are defined.
- Payment flow is defined.
- Shipping flow is defined.
- Return/exchange flow is defined.
- Cloudinary upload flow is defined.
- Admin operations are permission-controlled.
- Customer operations are ownership-controlled.
- Errors have stable codes.
- No unnecessary REST API is required.
- The document can be directly used by OpenCode to implement the services/actions.

---

# Approval Status

**DOCUMENT 09 IS APPROVED FOR IMPLEMENTATION**

This document is the source of truth for SALAM application operations, Server Actions, and intentional Route Handlers.

Future changes must be explicitly marked as revisions.
