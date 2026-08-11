# SALAM | سلام
# Document 04 — Admin Dashboard Requirements

**Status: APPROVED**

---

## 1. Dashboard Overview

The admin dashboard is the operational control center for SALAM.

It must provide a clear overview of:

- Sales
- Orders
- Revenue
- Average Order Value
- Pending Orders
- Pending Payments
- Low Stock
- Pending Returns / Exchanges

### Date Filters

- Today
- Yesterday
- Last 7 Days
- Last 30 Days
- This Month
- Last Month
- Custom Range

---

## 2. Sales Analytics

The dashboard must provide:

- Sales overview chart
- Current period vs previous period
- Gross sales
- Discounts
- Returns
- Net sales
- Shipping revenue/cost where applicable
- Estimated profit

---

## 3. Orders Overview

Quick status counts:

- Pending
- Confirmed
- Preparing
- Ready for Shipping
- Shipped
- Out for Delivery
- Delivered
- Cancelled

Clicking a status should open the corresponding filtered order list.

---

## 4. Top Products

Reports should support:

- Top products by units sold
- Top products by revenue
- Top products by estimated profit

Columns may include:

- Product
- Units Sold
- Revenue
- Estimated Profit

---

# 5. Products Management

## Product List

Columns:

- Image
- Product
- Category
- Collection
- Price
- Stock
- Status
- Created At
- Actions

Actions:

- View
- Edit
- Duplicate
- Archive
- Delete
- Manage Stock

## Add / Edit Product

Use organized sections or tabs:

### Basic Information

- Arabic Name
- English Name
- Description
- Category
- Collection
- Occasion
- Tags

### Pricing

- Cost Price
- Selling Price
- Sale Price

### Media

- Main Image
- Gallery
- Optional Video

### Variants

- Colors
- Sizes
- SKU
- Stock
- Variant Images

### Product Details

- Fabric
- Fit
- Length
- Care Instructions

### Fulfillment

- In Stock
- Made to Order

### SEO

- Slug
- SEO Title
- Meta Description
- OG Image

---

# 6. Categories

Admin can manage:

- Categories
- Optional subcategories
- Category image
- Description
- SEO
- Active / Inactive

Initial categories:

- Abayas
- Esdals
- Modest Dresses

---

# 7. Collections

Collections are separate from categories.

Initial examples:

- New Arrivals
- Signature
- Everyday Elegance
- Limited Edition

Admin can:

- Create collection
- Add/remove products
- Set cover image
- Set description
- Feature collection
- Schedule visibility

---

# 8. Occasions

Manage occasions such as:

- Everyday
- Work & Outings
- Special Occasions
- Prayer

A product may belong to multiple occasions.

---

# 9. Inventory Management

Inventory dashboard should show:

- Total Products
- Total Units
- Low Stock
- Out of Stock
- Reserved Stock
- Inventory Value

## Stock Table

Columns:

- Product
- Variant
- Available
- Reserved
- Total

Actions:

- Adjust Stock
- View History

---

## 10. Stock Adjustment

Supported operations:

### Add Stock

Example:

`+20 Black / M`

### Remove Stock

Example:

`-2 Damaged`

### Inventory Correction

For physical-count differences.

Every adjustment must record:

- User
- Date/time
- Quantity before
- Quantity changed
- Quantity after
- Reason
- Notes

Reasons may include:

- Damaged
- Lost
- Inventory Correction
- Sample
- Internal Use
- Other

---

# 11. Low Stock

Admin can configure a low-stock threshold.

Example:

`5 units`

Rules:

- Stock <= threshold → Low Stock
- Stock = 0 → Out of Stock

---

# 12. Purchasing

Because SALAM uses an external manufacturer, purchasing is managed separately from production.

## Suppliers / Manufacturers

Fields:

- Name
- Contact Person
- Phone
- Email
- Address
- Notes
- Active / Inactive

---

# 13. Purchase Orders

Example:

`PO-2026-001`

Fields:

- Supplier
- Products
- Variants
- Ordered Quantity
- Unit Cost
- Total Cost
- Notes

Statuses:

```text
Draft
↓
Ordered
↓
Partially Received
↓
Received
↓
Cancelled
```

---

# 14. Receiving

Admin can receive a purchase order partially or fully.

Example:

Ordered: `20`

Received: `18`

Result:

`Partially Received`

Only received quantities are added to inventory.

---

# 15. Orders Management

Filters:

- Order ID
- Customer
- Phone
- Status
- Payment Status
- Payment Method
- Date
- Shipping Status
- Total

Order list columns:

- Order ID
- Customer
- Total
- Payment
- Order Status
- Date

---

# 16. Order Details

## Customer

- Name
- Phone
- Email

## Address

Complete delivery address.

## Products

- Product
- Variant
- Quantity
- Unit Price
- Discount

## Financial Summary

- Subtotal
- Product Discount
- Coupon Discount
- Shipping
- Total
- Cost
- Estimated Profit

## Payment

- Method
- Status
- Proof
- Reference
- Payment Date

## Shipping

- Shipping Company
- Tracking Number
- Shipping Cost
- Shipping Status

---

# 17. Order Timeline

Every important order event must be recorded.

Example:

```text
10:32 AM — Order Created
10:35 AM — Payment Proof Uploaded
10:40 AM — Payment Approved
11:10 AM — Order Confirmed
12:20 PM — Preparing
02:00 PM — Ready for Shipping
Next Day — Shipped
After 2 Days — Delivered
```

Timeline events must include:

- Event
- User/system actor
- Date/time
- Optional note

---

# 18. Returns & Exchanges

Tabs:

- All
- Return Requests
- Exchange Requests
- Pending Review
- Approved
- Rejected
- Completed

Admin can:

- Review request
- View order
- View product
- View reason
- View uploaded photos
- Approve
- Reject
- Add notes
- Track inspection
- Process refund
- Process exchange

---

# 19. Exchange Management

Admin sees:

Current Variant:

`Black / M`

Requested Variant:

`Black / L`

System checks available stock.

Admin can:

- Approve
- Reject
- Record price difference
- Record additional payment
- Record refund difference

---

# 20. Customers

Customer table:

- Name
- Phone
- Email
- Orders
- Total Spent
- Last Order
- Status

Customer profile:

- Overview
- Orders
- Wishlist
- Returns
- Exchanges
- Payments
- Addresses
- Notes

---

# 21. Customer Groups

Supported groups:

- New Customers
- Returning Customers
- VIP
- High Value
- Inactive

Groups can later support marketing segmentation.

---

# 22. Payments

Central payment management.

Filters:

- Method
- Status
- Date
- Order

Payment methods:

- COD
- InstaPay
- Vodafone Cash

---

# 23. Payment Verification

For manual payments, admin sees:

- Order
- Amount
- Payment Method
- Transaction Reference
- Payment Screenshot
- Submission Date

Actions:

- Approve
- Reject

Rejection requires a reason.

---

# 24. COD Settlement

Because shipping is handled by a third-party shipping company, COD reconciliation is required.

Fields:

- Order
- COD Amount
- Shipping Fee
- Collected Amount
- Settlement Date
- Settlement Status
- Net Amount
- Settlement Reference

Statuses:

- Pending
- Collected
- Settled
- Disputed

---

# 25. Shipping Management

Shipping dashboard:

- Ready for Shipping
- Shipped
- Out for Delivery
- Delivered
- Failed
- Returned

Admin can manage:

- Shipping Company
- Tracking Number
- Shipping Cost
- Shipping Status

Future shipping API integration should be possible without redesigning the order system.

---

# 26. Marketing

## Coupons

Fields:

- Code
- Discount Type
- Value
- Minimum Order
- Maximum Discount
- Usage Limit
- Per Customer Limit
- Start Date
- End Date
- Applicable Products
- Applicable Collections
- Active / Inactive

Discount types:

- Percentage
- Fixed Amount

---

# 27. Homepage Banners

Admin can manage:

- Image
- Arabic Title
- English Title
- Description
- CTA
- Link
- Start Date
- End Date
- Active / Inactive

---

# 28. Reviews Management

Admin can:

- View
- Approve
- Hide
- Delete
- Feature

Only verified-purchase reviews are accepted.

---

# 29. Style Finder Management

The Style Finder must be configurable from the dashboard.

Admin can manage:

### Questions

### Answers

### Recommendation Tags

Example:

```text
Question:
What are you shopping for?

Answer:
Everyday

Tags:
everyday
comfortable
casual
```

Recommendations are generated using configured product attributes/tags.

---

# 30. WhatsApp Management

Admin settings:

- WhatsApp Number
- Default Greeting
- Product Inquiry Template
- Order Support Template
- Checkout Support Template

Templates should support dynamic variables where applicable, such as:

- Customer name
- Order number
- Product name

---

# 31. Reports

## Sales Report

- Gross Sales
- Discounts
- Returns
- Net Sales
- Shipping
- Estimated Profit

## Product Report

- Units Sold
- Revenue
- Estimated Profit
- Best Sellers

## Inventory Report

- Stock
- Reserved
- Low Stock
- Inventory Value

## Customer Report

- New Customers
- Returning Customers
- Top Customers
- Average Order Value

## Returns Report

- Return Rate
- Exchange Rate
- Return Reasons
- Refund Amount

Reports should support date filtering and export.

---

# 32. Export

Admin must be able to export relevant data to:

- CSV
- Excel (XLSX)

Exportable areas should include:

- Orders
- Products
- Inventory
- Customers
- Payments
- Returns / Exchanges
- Reports

Exports must respect user permissions.

---

# 33. Notifications Center

An internal admin notification center is required.

Examples:

- New Order
- Payment Verification Required
- Low Stock
- Out of Stock
- Return Request
- Exchange Request
- Delivery Failed
- COD Settlement Due

Notifications should support:

- Read / Unread
- Mark as read
- Mark all as read
- Link to relevant record

---

# 34. Activity Dashboard

The dashboard should show recent operational activity.

Examples:

- Payment approved
- Order confirmed
- Order shipped
- Stock adjusted
- Return approved
- Exchange approved
- Product created

Each activity should show:

- Action
- User
- Date/time
- Related record

---

# 35. Audit Logs

Audit Logs are mandatory.

The system must track important changes, including:

- Who performed the action
- What action was performed
- Which record was affected
- Previous value
- New value
- Date/time
- IP/device information when appropriate and legally/technically available

Examples:

```text
Moamen approved Payment #123
Ahmed changed Stock: 10 → 8
Admin changed Product Price: 1500 → 1650
```

Audit logs should be read-only for normal administrators.

---

# 36. Multi-Admin

Multi-admin support is required from the beginning, even if SALAM initially has one administrator.

The system must support:

- Multiple users
- Roles
- Permissions
- Account activation/deactivation
- Last login
- Password/security management

---

# 37. Roles & Permissions

Initial roles:

### Super Admin

Full access.

### Store Manager

- Products
- Inventory
- Orders
- Customers

### Order Manager

- Orders
- Shipping
- Returns / Exchanges

### Finance Manager

- Payments
- COD Settlement
- Financial Reports

### Content Manager

- Product Content
- Collections
- Banners
- Reviews
- Style Finder Content

Permissions must be granular.

Examples:

```text
products.view
products.create
products.edit
products.delete

orders.view
orders.update
orders.cancel

payments.view
payments.verify

inventory.view
inventory.adjust

returns.view
returns.approve
returns.reject

reports.view
reports.export
```

---

# 38. Settings

## Store Settings

- Brand Name
- Logo
- Contact Information
- Address
- Currency
- Language

## Payment Settings

- COD
- InstaPay
- Vodafone Cash

## Shipping Settings

- Shipping Company
- Governorates
- Shipping Fees

## Return Policy

- Return Window
- Eligibility Rules
- Shipping Responsibility

## Notification Settings

## WhatsApp Settings

## SEO Settings

---

# 39. Admin UX Principles

- Clean and premium UI.
- Fast access to operational actions.
- Desktop-first but responsive.
- Clear status colors and labels.
- Strong filtering and search.
- Confirmation dialogs for destructive actions.
- Bulk actions where useful.
- Avoid unnecessary complexity.
- Every important financial/inventory operation must be traceable.

---

# 40. Approved Decisions

The following decisions are explicitly approved:

- Multi-admin from the beginning.
- Role-based and granular permissions.
- Audit Logs.
- Notifications Center.
- Activity Dashboard.
- CSV/XLSX exports.
- Purchasing module.
- Inventory history.
- COD reconciliation.
- Returns and Exchanges management.
- Configurable Style Finder.
- Configurable WhatsApp templates.

---

# Approval Status

**DOCUMENT 04 IS APPROVED**

This document is the current source of truth for the SALAM Admin Dashboard.

Future changes must be explicitly marked as revisions.
