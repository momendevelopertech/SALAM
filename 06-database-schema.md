# SALAM | سلام
# Document 06 — Database Schema

**Status: APPROVED**

## 1. Technology

- Database: Neon PostgreSQL
- ORM: Prisma
- Application: Next.js + TypeScript
- Hosting: Vercel
- Media: Cloudinary

The schema is designed specifically for PostgreSQL/Neon and must be implementable as a Prisma schema.

---

## 2. Domain Structure

```text
AUTH
├── User
├── Role
├── Permission
└── AuditLog

CATALOG
├── Product
├── Category
├── Collection
├── Occasion
├── ProductVariant
├── Color
├── Size
├── ProductImage
└── ProductTag

INVENTORY
├── InventoryItem
├── InventoryMovement
└── InventoryReservation

PURCHASING
├── Supplier
├── PurchaseOrder
└── PurchaseOrderItem

CUSTOMERS
├── Customer
├── Address
├── Wishlist
└── WishlistItem

ORDERS
├── Order
├── OrderItem
├── OrderStatusHistory
└── OrderNote

PAYMENTS
├── Payment
├── PaymentProof
├── Refund
└── CODSettlement

SHIPPING
├── ShippingProvider
├── Shipment
└── ShipmentTrackingEvent

RETURNS
├── ReturnRequest
├── ReturnItem
├── ExchangeRequest
└── ExchangeItem

MARKETING
├── Coupon
├── CouponUsage
├── Banner
└── Promotion

REVIEWS
├── Review
└── ReviewImage

CONTENT
├── StyleFinderQuestion
├── StyleFinderOption
└── ProductRecommendation

SYSTEM
├── Notification
└── Setting
```

---

# 3. Product

A Product is the parent entity for product variants.

Example:

```text
Signature Abaya
├── Black / S
├── Black / M
├── Black / L
├── Beige / S
└── Beige / M
```

Fields:

```text
id
slug
nameAr
nameEn
descriptionAr
descriptionEn

categoryId
collection relations

fulfillmentType
status

costPrice
sellingPrice
salePrice

fabric
fit
length
careInstructions

seoTitle
seoDescription

createdAt
updatedAt
deletedAt
```

`fulfillmentType`:

- STOCK
- MADE_TO_ORDER

Current SALAM operation is STOCK, but the schema must support Made-to-Order.

---

# 4. Product Variant

Each variant represents a sellable SKU.

Fields:

```text
id
productId
sku
colorId
sizeId

costPrice
sellingPrice
salePrice

status
createdAt
updatedAt
deletedAt
```

Variant-level pricing is supported.

Example:

```text
S  = 1500
M  = 1500
L  = 1600
XL = 1700
```

---

# 5. Inventory

Inventory is separate from Product Variant and is the source of truth for stock.

## InventoryItem

```text
id
variantId

availableQuantity
reservedQuantity
damagedQuantity

lowStockThreshold

createdAt
updatedAt
```

Do not rely on a simple Product stock field as the authoritative inventory value.

---

# 6. Inventory Movement

Every inventory change must be traceable.

Fields:

```text
id
inventoryItemId

type
quantity

beforeQuantity
afterQuantity

referenceType
referenceId

reason
notes

createdBy
createdAt
```

Movement types:

- PURCHASE
- SALE
- RESERVATION
- RELEASE
- RETURN
- EXCHANGE
- DAMAGE
- ADJUSTMENT
- LOSS
- SAMPLE

---

# 7. Inventory Reservation

Used during checkout.

Fields:

```text
id
variantId
orderId
quantity
status
expiresAt
createdAt
releasedAt
```

Statuses:

- ACTIVE
- CONVERTED
- RELEASED
- EXPIRED

Reservations must be concurrency-safe.

---

# 8. Categories

Fields:

```text
id
nameAr
nameEn
slug
descriptionAr
descriptionEn
imagePublicId
imageUrl
seoTitle
seoDescription
isActive
createdAt
updatedAt
deletedAt
```

Initial examples:

- Abayas
- Esdals
- Modest Dresses

Categories use soft delete.

---

# 9. Collections

Collections are independent from categories.

Fields:

```text
id
nameAr
nameEn
slug
descriptionAr
descriptionEn
imagePublicId
imageUrl
isFeatured
isActive
startAt
endAt
createdAt
updatedAt
deletedAt
```

Product ↔ Collection is Many-to-Many.

Examples:

- New Arrivals
- Signature
- Everyday Elegance
- Limited Edition

---

# 10. Occasions

Manage configurable occasions such as:

- Everyday
- Work & Outings
- Special Occasions
- Prayer

A product may belong to multiple occasions.

---

# 11. Colors

```text
id
nameAr
nameEn
slug
hexCode
```

Examples:

- Black
- Beige
- Mocha
- Olive

---

# 12. Sizes

```text
id
name
sortOrder
isActive
```

Examples:

- S
- M
- L
- XL

Sizes remain database records so the Admin can manage them without migrations.

---

# 13. Product Images / Cloudinary

Images are stored on Cloudinary.

The database stores metadata only:

```text
id
productId
variantId nullable

publicId
secureUrl

width
height
format

altText

sortOrder
isPrimary

createdAt
```

A product supports multiple images.

Variant-specific images are supported.

Example:

Black variant can have a different gallery from Beige variant.

---

# 14. Product Tags

```text
ProductTag

id
name
slug
```

Product ↔ Tags is Many-to-Many.

Tags support:

- Search
- Filtering
- Style Finder
- Recommendations
- Marketing segmentation

---

# 15. Customers

Customer and Admin User are separate concepts.

```text
Customer

id

firstName
lastName

phone
email

isGuest
isActive

createdAt
updatedAt
```

Guest checkout is supported.

A guest order may exist without a registered customer account.

---

# 16. Addresses

A customer can have multiple saved addresses.

```text
id
customerId

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

createdAt
updatedAt
```

Historical orders store their own address snapshot.

---

# 17. Orders

```text
id
orderNumber

customerId nullable

status
paymentStatus
fulfillmentStatus

subtotal
discount
couponDiscount
shippingFee
total

currency

shippingAddressSnapshot

customerNote

createdAt
updatedAt
cancelledAt
deliveredAt
```

Guest orders can have `customerId = null`.

Order-level historical data must remain immutable after creation except for legitimate operational fields.

---

# 18. Order Items

```text
id
orderId

productId
variantId

productName
variantName
sku

unitPrice
discount
quantity
total

productSnapshot

createdAt
```

Snapshots preserve historical product information.

---

# 19. Order Status History

```text
id
orderId

fromStatus
toStatus

note

createdBy
createdAt
```

This powers the order timeline.

---

# 20. Order Notes

Admin/internal notes may be stored separately:

```text
id
orderId
userId
note
isInternal
createdAt
```

---

# 21. Payments

```text
id
orderId

method
status

amount

transactionReference

createdAt
paidAt
```

Payment methods:

- COD
- INSTAPAY
- VODAFONE_CASH

Payment statuses:

- PENDING
- PENDING_VERIFICATION
- PAID
- REJECTED
- FAILED
- REFUNDED
- PARTIALLY_REFUNDED

Payment status is separate from order status.

---

# 22. Payment Proof

For manual payments:

```text
id
paymentId

cloudinaryPublicId
secureUrl

submittedAt

verifiedAt
verifiedBy

rejectionReason
```

---

# 23. Refund

```text
id
orderId
paymentId

amount
method

status

reference
reason

processedBy
processedAt
```

Supported refund methods:

- InstaPay
- Vodafone Cash

---

# 24. COD Settlement

```text
id
orderId
shipmentId nullable

codAmount
shippingFee
collectedAmount
netSettlementAmount

status

settlementDate
reference
notes

createdAt
updatedAt
```

Statuses:

- PENDING
- COLLECTED
- SETTLED
- DISPUTED

---

# 25. Shipping Provider

```text
id

name
phone
email

isActive

apiBaseUrl nullable
```

Secrets/API keys must not be stored as plain database data when environment/secrets management is available.

---

# 26. Shipment

```text
id
orderId
providerId

trackingNumber

status

shippingCost

shippedAt
deliveredAt

createdAt
updatedAt
```

---

# 27. Shipment Tracking Events

```text
id
shipmentId

status
description

occurredAt

rawData nullable
```

This allows future integration with a shipping company API.

---

# 28. Return Request

```text
id
orderId
customerId nullable

status

reason
customerNotes

shippingResponsibility

requestedAt
approvedAt
receivedAt
completedAt

reviewedBy
```

Statuses:

- REQUESTED
- UNDER_REVIEW
- APPROVED
- REJECTED
- SHIPPED_BACK
- RECEIVED
- INSPECTING
- COMPLETED

---

# 29. Return Item

```text
id
returnRequestId
orderItemId

quantity

condition
inspectionNotes
```

Conditions:

- RESELLABLE
- DAMAGED
- USED
- REJECTED

Partial returns are supported.

---

# 30. Exchange Request

```text
id
orderId
customerId nullable

status

reason

priceDifference
paymentStatus

requestedAt
approvedAt
completedAt
```

Partial exchanges are supported.

---

# 31. Exchange Item

```text
id
exchangeRequestId

originalOrderItemId
originalVariantId

replacementVariantId

quantity
priceDifference
```

---

# 32. Coupons

```text
id

code

type
value

minimumOrder
maximumDiscount

usageLimit
usageCount

perCustomerLimit

startsAt
endsAt

applyToSaleItems

isActive

createdAt
updatedAt
```

Types:

- PERCENTAGE
- FIXED

Coupon rules are validated before application.

---

# 33. Coupon Usage

```text
id
couponId
customerId nullable
orderId

discountAmount

usedAt
```

---

# 34. Banners

Homepage/marketing banners:

```text
id

imagePublicId
imageUrl

titleAr
titleEn
descriptionAr
descriptionEn

ctaTextAr
ctaTextEn
link

startAt
endAt

isActive
sortOrder

createdAt
updatedAt
```

---

# 35. Reviews

```text
id
productId
customerId
orderId

rating
title
content

status

isVerifiedPurchase
isFeatured

createdAt
updatedAt
```

Only verified-purchase reviews are allowed.

The backend must verify that the customer actually purchased the reviewed product.

---

# 36. Review Images

```text
id
reviewId

cloudinaryPublicId
secureUrl

sortOrder
createdAt
```

---

# 37. Wishlist

```text
Wishlist

id
customerId
createdAt
updatedAt
```

```text
WishlistItem

id
wishlistId
productId
createdAt
```

Unique constraint:

```text
wishlistId + productId
```

---

# 38. Admin Users

```text
User

id
name
email
phone

passwordHash

isActive

lastLoginAt

createdAt
updatedAt
deletedAt
```

Authentication implementation must be compatible with Next.js/Vercel.

---

# 39. Roles

```text
Role

id
name
slug
description
createdAt
updatedAt
```

---

# 40. Permissions

```text
Permission

id
name
slug
description
```

User/Role and Role/Permission relationships must support granular authorization.

---

# 41. Audit Logs

```text
AuditLog

id

userId

action

entityType
entityId

oldValues
newValues

ipAddress
userAgent

createdAt
```

`oldValues` and `newValues` should use PostgreSQL JSONB-compatible Prisma fields.

Audit logs are read-only for normal admins.

---

# 42. Notifications

```text
Notification

id

userId nullable
customerId nullable

type

title
message

data

readAt

createdAt
```

`data` may use PostgreSQL JSONB.

---

# 43. Style Finder

## Question

```text
id
questionAr
questionEn
sortOrder
isActive
```

## Option

```text
id
questionId

labelAr
labelEn

sortOrder
```

Product recommendation mappings can use product tags or an explicit recommendation relation.

---

# 44. Settings

```text
Setting

id

key
value
type

isPublic

createdAt
updatedAt
```

Sensitive secrets must be stored in Vercel Environment Variables, not normal Settings records.

Examples:

- Cloudinary secret
- Payment credentials
- Shipping API credentials
- Authentication secrets

---

# 45. PostgreSQL Enums

Use PostgreSQL/Prisma enums for stable system states, including:

- OrderStatus
- PaymentStatus
- PaymentMethod
- ReturnStatus
- ExchangeStatus
- InventoryMovementType
- ShipmentStatus
- FulfillmentType

Dynamic business data such as Categories, Tags, Settings, Colors, Sizes, and Collections remain database records.

---

# 46. Soft Delete

Soft delete is approved for entities where historical references matter, including:

- Products
- Categories
- Collections
- Admin Users

Use:

```text
deletedAt
```

Historical orders must remain valid even when catalog entities are archived/deactivated.

---

# 47. Guest Orders

Guest checkout is supported.

A guest order may have:

```text
customerId = null
```

The order itself must preserve:

- Customer name
- Phone
- Email when supplied
- Delivery address
- Product snapshots
- Financial snapshot

This guarantees historical integrity.

---

# 48. Important Relationships

```text
Customer
├── Addresses
├── Orders
├── Wishlist
├── Reviews
└── Returns

Order
├── OrderItems
├── Payment
├── Shipment
├── Returns
├── Exchanges
└── StatusHistory

Product
├── Variants
├── Images
├── Reviews
├── Tags
├── Collections
└── Occasions

Variant
├── Inventory
├── Reservations
├── OrderItems
├── ReturnItems
└── ExchangeItems
```

---

# 49. Database Integrity

The schema must use:

- Primary keys
- Foreign keys
- Unique constraints
- Composite unique constraints where required
- Appropriate indexes
- Referential actions
- Transaction-safe operations
- PostgreSQL JSONB where appropriate
- Timestamps on operational entities

Critical relations must not be allowed to silently orphan historical data.

---

# 50. Performance / Indexing

Important indexes should cover:

- Product slug
- Product status
- Variant SKU
- Customer phone
- Customer email
- Order number
- Order status
- Payment status
- Payment transaction reference
- Shipment tracking number
- Coupon code
- Review product/status
- Inventory variant
- Notification read status
- Audit entity + entity ID
- CreatedAt on high-volume transactional tables

Indexes should be implemented based on actual query patterns and validated with PostgreSQL query plans as the system grows.

---

# 51. Data Integrity Rules

The database layer must support the approved business logic:

- Inventory reservation is transaction-safe.
- Duplicate checkout is prevented.
- Historical order prices remain unchanged.
- Historical addresses remain unchanged.
- Payment status is independent from order status.
- Partial returns are supported.
- Partial exchanges are supported.
- Refunds can be partial.
- Inventory changes are auditable.
- Verified reviews are linked to actual purchases.
- Guest orders preserve their own customer snapshot.
- Product deletion must not destroy historical order information.

---

# 52. Approved Architecture Decisions

The following four decisions are explicitly approved:

1. Product supports multiple images.
2. Variant-specific images are supported.
3. Each Variant may have its own price.
4. Soft delete is used where historical integrity requires it.
5. Guest checkout is supported with optional Customer relation and mandatory order snapshots.

---

# Approval Status

**DOCUMENT 06 IS APPROVED**

This document is the source of truth for the SALAM PostgreSQL/Neon database architecture.

The implementation target is Prisma + Neon PostgreSQL.

Future schema changes must be explicitly marked as revisions.
