# SALAM | سلام
# Document 03 — E-commerce Requirements

**Status: APPROVED**

---

## 1. Scope

This document defines the customer-facing e-commerce requirements for SALAM, including products, variants, pricing, inventory behavior, cart, checkout, payments, orders, wishlist, reviews, size guidance, Style Finder, WhatsApp, and returns/exchanges.

---

## 2. Product Structure

Each product should support:

- Arabic name
- English name
- Product description
- Category
- Collection
- Occasion
- Cost price
- Selling price
- Sale price
- Main image
- Gallery images
- Optional product video
- Fabric
- Fit
- Length
- Care instructions
- SKU
- Product tags
- SEO title
- Meta description
- SEO slug
- Open Graph image
- Active / inactive status
- Fulfillment type

### Fulfillment Types

The system must support:

1. **In Stock** — current operating model.
2. **Made to Order** — supported by the system for future use.

---

## 3. Product Variants

Fashion products must support variants.

A variant may be defined by:

- Color
- Size
- SKU
- Stock quantity
- Optional variant-specific price
- Optional variant-specific image

Different colors may have different available sizes.

Example:

```text
Black
S ✓
M ✓
L ✓
XL ✓
XXL ✓

Mocha
S ✕
M ✓
L ✓
XL ✓
XXL ✕

Sand
S ✓
M ✓
L ✕
XL ✕
XXL ✕
```

---

## 4. Pricing

The system must distinguish:

- Cost Price
- Selling Price
- Sale Price

The system should calculate gross profit for reporting.

Example:

```text
Cost Price:    700 EGP
Selling Price: 1500 EGP
Sale Price:    1250 EGP
Gross Profit:   550 EGP
```

---

## 5. Product Listing

Product cards should support:

- Product image
- Product name
- Current price
- Original price when discounted
- Discount indicator
- Available colors
- Wishlist action
- New badge
- Best Seller badge
- Limited badge
- Sale badge
- Sold Out badge

---

## 6. Search & Filtering

Customer search should support:

- Product name
- SKU
- Category
- Collection
- Color
- Tags

Customer filters:

- Category
- Collection
- Size
- Color
- Price range
- Occasion
- Availability

Sorting:

- Newest
- Best Selling
- Price: Low to High
- Price: High to Low

---

## 7. Wishlist

Customers can:

- Add products to wishlist
- Remove products
- Move products to cart
- View wishlist from their account

If a wished product becomes unavailable:

> Notify me when available

can be supported.

---

## 8. Cart

Cart must support:

- Product variant
- Color
- Size
- Quantity
- Increase quantity
- Decrease quantity
- Remove item
- Move item to wishlist

Cart summary:

- Subtotal
- Product discount
- Coupon discount
- Shipping fee
- Total

---

## 9. Inventory Reservation

The system must prevent overselling.

Inventory concepts:

- Total Stock
- Available Stock
- Reserved Stock
- Sold Stock

When an order reserves 2 units:

```text
Total Stock:      10
Reserved:          2
Available:         8
```

If the reservation/order is cancelled before fulfillment, reserved stock returns to available stock.

---

## 10. Checkout

Guest checkout must be supported.

### Customer Information

- Full name
- Mobile number
- Email (optional)

### Address

- Governorate
- City
- Area
- Address
- Building
- Floor
- Apartment
- Landmark (optional)

### Shipping

The order must store:

- Shipping company
- Shipping method
- Shipping cost
- Tracking number when available

### Payment Methods

- Cash on Delivery
- InstaPay
- Vodafone Cash

---

## 11. Payment Verification

For InstaPay and Vodafone Cash:

1. Customer selects payment method.
2. System displays transfer instructions.
3. Customer uploads payment screenshot.
4. Customer enters transaction reference.
5. Order payment status becomes `Pending Verification`.
6. Admin reviews the proof.
7. Admin can approve or reject payment.

Payment statuses should include:

- Pending
- Pending Verification
- Paid
- Rejected
- Failed
- Refunded
- Partially Refunded

---

## 12. Order Status

Primary order flow:

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

Additional statuses:

- Cancelled
- Delivery Failed
- Returned

Payment status and order status must remain separate.

---

## 13. Reviews

Only **Verified Purchases** can submit product reviews.

Review features:

- Rating (1–5)
- Written review
- Optional customer photos
- Fit feedback:
  - Small
  - Perfect
  - Large

Reviews should be associated with the purchased product variant when possible.

---

## 14. Size Guide

Each category may have its own size guide.

Example measurements:

- Size
- Length
- Bust
- Sleeve

The product page should provide easy access to the relevant size guide.

### Find My Size

The system should support a guided recommendation based on customer-provided information such as:

- Height
- Weight
- Preferred fit
- Optional body measurements

The result should recommend the most suitable available size.

---

## 15. Style Finder

Style Finder is an approved feature.

Suggested flow:

### Step 1 — Occasion

- Everyday
- Work
- Occasion
- Prayer

### Step 2 — Preferred Style

- Classic
- Modern
- Elegant

### Step 3 — Preferred Fit

- Relaxed
- Regular

The system returns recommended products based on product tags, occasion, style, fit, category, availability, and other configured attributes.

---

## 16. WhatsApp Integration

WhatsApp is an approved customer-support channel.

Supported touchpoints:

- Floating WhatsApp button
- Ask about this product
- Order assistance
- Checkout assistance
- Order tracking assistance
- General customer support

The WhatsApp number and default message templates should be configurable from the admin dashboard.

---

# 17. Returns & Exchanges

Returns and exchanges are both supported.

## Return / Exchange Window

The approved period is:

> **7 days from delivery.**

## Product Eligibility

The item must be:

- Unused
- Unwashed
- Unaltered
- In original packaging
- With original tags attached

Products that do not meet these conditions may be rejected after inspection.

---

## 18. Return Reasons

Customer may select:

- Size does not fit
- Changed my mind
- Different from expected
- Damaged / defective
- Wrong item received
- Other

For defective or incorrect items, customer should be able to upload photos.

---

## 19. Exchange Flow

```text
Requested
↓
Under Review
↓
Approved
↓
Pickup Scheduled
↓
Received
↓
Inspection
↓
Replacement Prepared
↓
Shipped
↓
Completed
```

The system must check availability of the requested replacement variant.

### Exchange Price Difference

If replacement price is higher:

> Customer pays the difference.

If replacement price is lower:

> Customer receives the difference according to the approved refund process.

---

## 20. Return Flow

```text
Requested
↓
Under Review
↓
Approved
↓
Pickup Scheduled
↓
Received
↓
Inspection
↓
Accepted / Rejected
↓
Refunded
```

---

## 21. Return Shipping Policy

For normal customer-initiated returns/exchanges such as:

- Change of mind
- Wrong size
- Customer preference

> **Customer pays return shipping.**

For cases caused by SALAM, such as:

- Wrong item sent
- Defective item

> **SALAM pays the return shipping.**

---

## 22. Original Shipping Fee

The original shipping fee is:

> **Non-refundable**

Exception:

If the issue is caused by SALAM or the product is defective, the original shipping fee may be refunded according to the approved return decision.

---

## 23. Refund Methods

Refunds should support:

- InstaPay
- Vodafone Cash

For COD orders, the refund should normally be processed through InstaPay or Vodafone Cash rather than cash.

The system must record:

- Refund amount
- Refund method
- Refund reference
- Refund date
- Refund status
- Admin notes

---

## 24. Customer Account

Customer account should include:

- Profile
- Orders
- Order details
- Wishlist
- Addresses
- Saved contact information
- Return / exchange requests
- Notifications
- Account settings

Guest customers can place orders, but account creation can be offered after checkout.

---

## 25. Product Recommendations

The storefront should support:

- Related Products
- Complete the Look
- Recently Viewed
- Best Sellers
- New Arrivals
- Personalized Style Finder Results

---

## 26. SEO

Products and important storefront pages should support:

- SEO title
- Meta description
- SEO-friendly slug
- Open Graph image
- Structured product data
- Search-friendly category pages

---

## 27. Mobile-first Requirements

The customer storefront must be designed mobile-first.

Priority:

1. Product discovery
2. Product images
3. Product information
4. Size and color selection
5. Add to cart
6. Simple checkout
7. Order tracking
8. WhatsApp support

The experience must remain clear and comfortable for the primary audience of Women 30+.

---

## 28. E-commerce Principles

- Premium but simple.
- Arabic-first and RTL.
- Clear pricing.
- Clear availability.
- Clear sizing.
- Trust-focused checkout.
- Guest checkout.
- Verified reviews.
- Strong product photography.
- Minimal unnecessary animation.
- No dark patterns.
- Customer should always understand the current order/payment state.

---

# Approval Status

**DOCUMENT 03 IS APPROVED**

The above requirements are the current source of truth for SALAM's e-commerce customer experience.

Future changes must be explicitly marked as revisions.
