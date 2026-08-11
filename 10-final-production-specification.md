# SALAM | سلام
# Document 10 — Final Production Specification (Documents 10–18)

**Status: APPROVED FOR IMPLEMENTATION**  
**Purpose:** This file consolidates the remaining technical requirements into one implementation-ready specification for OpenCode.

> Documents 01–09 remain the primary detailed source of truth. This document completes the remaining architecture, security, integrations, quality, deployment, and implementation rules.

---

# 10. Authentication, Authorization & Security

## Authentication

Support:

- Customer registration/login/logout
- Secure sessions
- Password reset
- Account protection
- Admin authentication
- Secure cookies
- Session expiration

Use a mature Next.js-compatible authentication solution. Do not build insecure custom authentication.

## Roles

Minimum roles:

```text
CUSTOMER
ADMIN
SUPER_ADMIN
```

Admin access is permission-based.

## Authorization

Enforce permissions on the server, never only in the UI.

Examples:

```text
products.create
products.update
products.delete
inventory.view
inventory.adjust
orders.view
orders.update
payments.view
payments.verify
refunds.process
returns.view
returns.approve
exchanges.view
exchanges.approve
reviews.moderate
customers.view
reports.view
users.manage
roles.manage
settings.manage
audit_logs.view
```

## Security Requirements

Implement:

- Server-side validation
- Secure password hashing
- Rate limiting for authentication and sensitive actions
- Secure HTTP-only cookies
- CSRF protection where applicable
- XSS-safe rendering
- SQL injection protection through Prisma
- Secure headers
- Upload type/size validation
- Webhook signature verification
- Authorization checks on every protected mutation
- No secrets in client code
- No sensitive data in logs
- Audit logging for sensitive admin operations

Never trust client-submitted:

```text
price
discount
stock
total
role
permission
payment status
order status
refund amount
```

---

# 11. Payments & Shipping

## Payment Methods

Initial methods:

```text
COD
INSTAPAY
VODAFONE_CASH
```

### COD

```text
Order Created
→ Pending Confirmation
→ Confirmed
→ Preparing
→ Shipped
→ Delivered
```

### Manual Online Payment

Customer:

```text
Select payment method
→ See payment instructions
→ Submit transaction reference
→ Upload proof
→ Pending Verification
```

Admin:

```text
Review proof
→ Approve / Reject
```

Only server/admin verification can mark the payment as paid.

## Payment Architecture

Use:

```text
PaymentService
```

with provider-independent interfaces.

Future online payment providers must be addable without rewriting checkout.

## Shipping

Use:

```text
ShippingService
```

with:

```text
calculateShipping()
createShipment()
trackShipment()
cancelShipment()
```

Store:

- Provider
- Tracking number
- Shipment status
- Tracking events
- Shipment timestamps

Shipping provider must be replaceable.

## Webhooks

Webhook endpoints must:

- Verify authenticity
- Validate payload
- Be idempotent
- Update normalized internal statuses
- Create tracking/payment events
- Trigger notifications where required

---

# 12. SEO & Performance

## SEO

Implement:

- Arabic-first metadata
- Product titles/descriptions
- Canonical URLs
- Open Graph
- Product structured data
- Breadcrumb structured data where useful
- XML sitemap
- robots.txt
- SEO-friendly slugs
- 404 handling
- Proper redirects

Every important product/category/collection page must have unique metadata.

## Performance

Target excellent Core Web Vitals.

Use:

- Server Components by default
- Optimized Cloudinary images
- Lazy loading below-the-fold media
- Minimal client JavaScript
- Proper image dimensions
- Caching/revalidation for public catalog content
- Pagination for large datasets
- No unnecessary API calls
- No loading thousands of records into the browser

Never cache personalized data incorrectly.

---

# 13. Testing & Quality Assurance

## Unit Tests

Cover critical business rules:

```text
Price calculation
Discount calculation
Coupon validation
Inventory reservation
Inventory release
Return eligibility
Exchange eligibility
Refund calculation
Shipping calculation
Order status transitions
```

## Integration Tests

Cover:

```text
Registration/login
Checkout
Order creation
Payment verification
Inventory updates
Return workflow
Exchange workflow
Refund workflow
Shipping workflow
```

## E2E Tests

Critical flows:

```text
Customer:
Browse → Product → Cart → Checkout → Order

Customer:
Order → Return → Refund

Customer:
Order → Exchange

Admin:
Login → Payment Verification → Order Processing

Admin:
Inventory → Adjustment → Audit Log
```

## Quality Gates

Before completion:

```text
TypeScript passes
Lint passes
Tests pass
Production build passes
No critical security issues
No broken routes
No console errors in critical flows
```

---

# 14. Deployment & DevOps

## Hosting

Frontend/application:

```text
Vercel
```

Database:

```text
Neon PostgreSQL
```

Images/media:

```text
Cloudinary
```

The application must not depend on:

- Persistent local filesystem
- Long-running Node process
- Local-only storage
- In-memory state for critical business data

## Environments

Support:

```text
Development
Preview
Production
```

Use separate environment variables/configuration.

Required environment configuration must be documented in:

```text
.env.example
```

Never commit `.env`.

## Database

Use Prisma migrations.

Production database changes must be migration-based.

Never manually modify production schema as the normal deployment process.

## Vercel Deployment

Production deployment must verify:

```text
Install
→ Prisma Generate
→ Build
→ Environment Variables
→ Database Connectivity
→ Health Check
```

---

# 15. Notifications & Integrations

## Notification Service

Centralize notifications through:

```text
NotificationService
```

Initial channels:

```text
In-App
WhatsApp
```

Future-ready:

```text
Email
SMS
Push
```

Business services should not directly depend on a specific notification provider.

## Important Notifications

Customer:

```text
Order Created
Order Confirmed
Payment Approved
Payment Rejected
Order Shipped
Out for Delivery
Delivered
Return Requested
Return Approved
Return Rejected
Refund Processed
Exchange Approved
Exchange Completed
```

Admin:

```text
New Order
Payment Awaiting Verification
Return Request
Exchange Request
Low Stock
Shipping Exception
```

Notification sending should be retryable and idempotent.

---

# 16. Analytics & Reporting

## Admin Dashboard KPIs

At minimum:

```text
Revenue
Orders
Average Order Value
Pending Orders
Pending Payments
Low Stock
Returns
Exchanges
Refunds
COD Pending Settlement
```

## Reports

Support:

```text
Sales
Products
Categories
Collections
Customers
Payment Methods
COD
Returns
Exchanges
Refunds
Inventory
```

Filters:

```text
Today
7 Days
30 Days
This Month
Previous Month
Custom Range
```

All reports must use server-side aggregation.

Do not expose unnecessary customer/payment data.

## Analytics Readiness

Architecture should allow future integration with analytics tools without coupling business logic to them.

Track meaningful events such as:

```text
product_view
add_to_cart
begin_checkout
purchase
wishlist_add
search
coupon_apply
```

Do not send sensitive personal/payment information to analytics systems.

---

# 17. Final Project Structure & Engineering Standards

Recommended structure:

```text
app/
  (store)/
  (auth)/
  admin/
  api/
components/
actions/
server/
  services/
  repositories/
  validations/
  permissions/
lib/
prisma/
types/
hooks/
config/
public/
tests/
docs/
```

## Engineering Rules

- TypeScript strict mode
- Avoid `any`
- Reusable components
- Domain-based services
- No duplicated business logic
- Server-side authorization
- Typed action results
- Centralized validation
- Centralized business rules
- Small focused modules
- No unnecessary dependencies
- No secrets in source code
- No destructive deletion of historical business records

## Data Integrity

Historical orders must remain accurate even if the current product changes.

Store snapshots for:

```text
Product information
Variant information
Price
Shipping address
Relevant order data
```

---

# 18. MASTER IMPLEMENTATION RULES FOR OPENCODE

## Before Coding

OpenCode must:

1. Read all files in `/docs`.
2. Understand the approved business rules.
3. Identify conflicts or missing requirements.
4. Do not silently invent business rules.
5. Create an implementation plan.
6. Work incrementally.

## Implementation Order

```text
1. Project bootstrap
2. Database + Prisma + Neon
3. Authentication
4. RBAC
5. Core services
6. Admin shell
7. Catalog
8. Inventory
9. Cart
10. Checkout
11. Orders
12. Payments
13. Shipping
14. Returns
15. Exchanges
16. Reviews
17. Wishlist
18. Notifications
19. Reports
20. SEO
21. Testing
22. Security hardening
23. Deployment
```

## Rules During Coding

OpenCode must:

- Follow approved documents as source of truth.
- Never rewrite working architecture unnecessarily.
- Never change approved business rules without asking.
- Never trust client financial values.
- Never expose secrets.
- Add tests for critical business logic.
- Keep production build working.
- Update documentation when an implementation decision changes.
- Use transactions for critical multi-step operations.
- Use idempotency for retryable operations.
- Keep customer and admin permissions isolated.

## Feature Definition of Done

A feature is complete only when:

```text
UI
+
Validation
+
Authorization
+
Business Logic
+
Database
+
Error Handling
+
Loading/Empty States
+
Audit Logging when required
+
Tests
+
TypeScript
+
Lint
+
Production Build
```

## Do Not

```text
Do not create fake payment confirmation.
Do not trust client prices.
Do not trust client stock.
Do not expose admin APIs without permission checks.
Do not store uploaded files on local disk.
Do not hardcode secrets.
Do not delete historical order data.
Do not create unnecessary REST endpoints.
Do not over-engineer with microservices.
Do not add dependencies without justification.
Do not mark features complete without testing.
```

---

# FINAL ACCEPTANCE CRITERIA

SALAM is considered technically production-ready only when:

- Storefront works responsively on mobile and desktop.
- Admin dashboard is permission-controlled.
- Authentication is secure.
- Customer data is isolated.
- Catalog and inventory are authoritative.
- Checkout recalculates everything server-side.
- Orders are idempotent.
- Inventory is transaction-safe.
- Payments require proper verification.
- Shipping is provider-abstracted.
- Returns/exchanges follow approved policy.
- Reviews enforce verified purchase.
- Cloudinary is securely integrated.
- Neon + Prisma migrations work.
- Vercel deployment works.
- SEO foundation is implemented.
- Critical workflows have tests.
- Sensitive operations are audited.
- No critical security vulnerabilities remain.
- TypeScript, lint, tests, and production build pass.

---

# SOURCE OF TRUTH

Priority order:

```text
1. Explicit approved user decision
2. Documents 01–09
3. This Document 10
4. Existing implementation
5. OpenCode judgment
```

If two requirements conflict:

> Stop and ask for clarification. Do not silently choose.

---

# PROJECT COMPLETION

After implementation, OpenCode must produce:

```text
README.md
.env.example
Database migration history
Seed instructions
Deployment instructions
Testing instructions
Admin access setup instructions
Integration configuration instructions
Final implementation summary
Known limitations
```

**DOCUMENT 10 IS APPROVED FOR IMPLEMENTATION.**

This document consolidates Documents 10–18 into one concise production specification for OpenCode.
