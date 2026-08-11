# SALAM | سلام
# Document 07 — Next.js Production Architecture

**Status: APPROVED FOR IMPLEMENTATION**

## 1. Objective

Build SALAM as a production-ready full-stack Next.js application suitable for deployment on Vercel.

The application must contain:

- Customer storefront
- Customer account area
- Admin dashboard
- Server-side business logic
- API/Route Handlers where needed
- Server Actions where appropriate
- Prisma data access
- Neon PostgreSQL
- Cloudinary media
- Authentication and RBAC
- Payment verification
- Shipping integration
- Returns/exchanges
- Notifications
- Audit logging

The architecture must be serverless-friendly and must not depend on a persistent Node.js server.

---

# 2. Approved Technology Stack

```text
Next.js
TypeScript
React
Tailwind CSS
Prisma
Neon PostgreSQL
Cloudinary
Vercel
```

Additional libraries may be introduced only when they solve a clear requirement and do not conflict with this architecture.

---

# 3. Application Architecture

Use a modular monolithic architecture inside one Next.js repository.

```text
Next.js Application
│
├── Storefront
├── Customer Account
├── Admin Dashboard
│
├── Server Actions
├── Route Handlers
├── Services
├── Validation
├── Authorization
├── Prisma
│
└── External Services
    ├── Neon
    ├── Cloudinary
    ├── Payment Services
    └── Shipping Provider
```

Do not create a separate backend application unless a future requirement explicitly requires one.

---

# 4. Recommended Project Structure

```text
salam/
├── app/
│   ├── (store)/
│   │   ├── page.tsx
│   │   ├── shop/
│   │   ├── products/
│   │   ├── collections/
│   │   ├── categories/
│   │   ├── wishlist/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── account/
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── products/
│   │   ├── categories/
│   │   ├── collections/
│   │   ├── inventory/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── payments/
│   │   ├── shipping/
│   │   ├── returns/
│   │   ├── exchanges/
│   │   ├── coupons/
│   │   ├── reviews/
│   │   ├── banners/
│   │   ├── notifications/
│   │   ├── reports/
│   │   ├── users/
│   │   ├── roles/
│   │   ├── audit-logs/
│   │   └── settings/
│   │
│   ├── api/
│   │   ├── webhooks/
│   │   ├── uploads/
│   │   └── ...
│   │
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   ├── storefront/
│   ├── admin/
│   ├── forms/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   └── shared/
│
├── actions/
│   ├── auth/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── payments/
│   ├── returns/
│   ├── exchanges/
│   ├── reviews/
│   ├── wishlist/
│   └── admin/
│
├── server/
│   ├── services/
│   ├── repositories/
│   ├── permissions/
│   ├── validations/
│   ├── inventory/
│   ├── payments/
│   ├── shipping/
│   ├── notifications/
│   └── audit/
│
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── cloudinary.ts
│   ├── env.ts
│   ├── logger.ts
│   ├── utils.ts
│   └── constants.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── types/
├── hooks/
├── config/
├── public/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

The exact folders may evolve during implementation, but the separation of responsibilities must remain.

---

# 5. Route Groups

Use Next.js route groups to separate concerns without changing public URLs.

### Storefront

```text
app/(store)/
```

### Authentication

```text
app/(auth)/
```

### Admin

```text
app/admin/
```

Admin must have a dedicated protected layout.

---

# 6. Storefront Routes

Initial public routes:

```text
/
 /shop
 /products/[slug]
 /collections/[slug]
 /categories/[slug]
 /search
 /wishlist
 /cart
 /checkout
 /account
 /account/orders
 /account/orders/[orderNumber]
 /account/returns
 /account/exchanges
 /account/profile
 /account/addresses
 /about
 /contact
 /faq
 /shipping-policy
 /return-policy
 /privacy-policy
 /terms
```

Arabic is the primary customer-facing language.

The architecture should remain ready for English localization.

---

# 7. Admin Routes

```text
/admin
/admin/products
/admin/products/new
/admin/products/[id]
/admin/categories
/admin/collections
/admin/inventory
/admin/orders
/admin/orders/[id]
/admin/customers
/admin/customers/[id]
/admin/payments
/admin/shipping
/admin/returns
/admin/exchanges
/admin/coupons
/admin/reviews
/admin/banners
/admin/notifications
/admin/reports
/admin/users
/admin/roles
/admin/audit-logs
/admin/settings
```

Every admin route must enforce authentication and permission checks.

---

# 8. Server vs Client Components

Default rule:

> Prefer React Server Components.

Use Client Components only when interaction requires browser state or APIs.

Examples requiring Client Components:

- Add-to-cart interactive controls
- Variant selectors
- Quantity selectors
- Image galleries with interactive behavior
- Filters with client interaction
- Modals
- Dropdowns
- Checkout form interactions
- Admin tables requiring client-side interactions

Do not add `"use client"` to large page trees unnecessarily.

---

# 9. Server Actions

Use Server Actions for internal mutations where they improve simplicity and security.

Examples:

```text
addToCart()
updateCartItem()
removeCartItem()

createOrder()
cancelOrder()

submitPaymentProof()

requestReturn()
requestExchange()

addReview()
addWishlistItem()

updateProduct()
updateInventory()
approvePayment()
approveReturn()
processRefund()
```

Every Server Action must:

1. Validate input.
2. Authenticate when required.
3. Authorize the action.
4. Execute business logic.
5. Use a transaction when required.
6. Return a safe typed result.
7. Log important failures.
8. Create an audit record for sensitive admin operations.

Never trust client-submitted prices, totals, stock, discounts, permissions, or status values.

---

# 10. Route Handlers

Use Route Handlers for:

- External webhooks
- Public API endpoints that are intentionally exposed
- Shipping callbacks
- Payment callbacks
- Cloudinary-related server endpoints when needed
- Integration endpoints

Example:

```text
app/api/webhooks/payment/route.ts
app/api/webhooks/shipping/route.ts
```

Webhook handlers must verify authenticity before processing.

---

# 11. Services Layer

Business logic must not be duplicated across pages, Server Actions, and Route Handlers.

Use domain services such as:

```text
ProductService
InventoryService
CartService
OrderService
PaymentService
ShippingService
ReturnService
ExchangeService
RefundService
CouponService
ReviewService
NotificationService
AuditService
```

Example:

```text
createOrder()
```

should be implemented in an Order Service, not independently inside multiple UI components.

---

# 12. Repository / Data Access

Database access must be centralized enough to avoid random Prisma calls throughout UI components.

Example:

```text
server/repositories/product.repository.ts
server/repositories/order.repository.ts
server/repositories/inventory.repository.ts
```

Repositories handle data access.

Services handle business rules.

Components handle presentation and user interaction.

---

# 13. Validation

Use a schema validation library compatible with TypeScript.

Zod is the preferred default.

Validation must exist on the server for all mutations.

Examples:

```text
CreateProductSchema
UpdateProductSchema
CheckoutSchema
PaymentProofSchema
ReturnRequestSchema
ExchangeRequestSchema
CouponSchema
AddressSchema
```

Client-side validation improves UX but never replaces server validation.

---

# 14. Authentication

Authentication must support:

- Customer accounts
- Admin users
- Secure sessions
- Password reset
- Account protection
- Logout
- Session expiration

The exact authentication library may be selected during implementation based on current Next.js compatibility.

Do not build insecure custom authentication if a mature solution satisfies the requirements.

---

# 15. Authorization / RBAC

Authorization is permission-based.

Example permissions:

```text
products.view
products.create
products.update
products.delete

inventory.view
inventory.adjust

orders.view
orders.update
orders.cancel

payments.view
payments.verify

returns.view
returns.approve
returns.reject

refunds.view
refunds.process

customers.view
customers.update

reviews.moderate

users.manage
roles.manage

settings.manage
audit_logs.view
reports.view
```

Never rely only on hiding an Admin UI button.

The server must enforce the permission.

---

# 16. Middleware / Route Protection

Admin routes must be protected before rendering protected content when practical.

However, middleware must not be treated as the only authorization layer.

Final permission checks happen server-side inside the operation being executed.

---

# 17. Prisma

Create a singleton Prisma client appropriate for Next.js development and Vercel/serverless execution.

Do not instantiate unlimited Prisma clients per request.

The schema source of truth is:

```text
prisma/schema.prisma
```

Migrations must be version controlled.

---

# 18. Neon

Use Neon PostgreSQL as the production database.

Environment variable:

```text
DATABASE_URL
```

Connection configuration must follow Neon/Prisma serverless recommendations.

Do not hardcode credentials.

---

# 19. Cloudinary

Cloudinary handles:

- Product images
- Variant images
- Category images
- Collection images
- Banners
- Review images
- Payment proof images

Database stores Cloudinary identifiers and URLs.

Never expose Cloudinary API secrets to the browser.

Uploads should use secure signed server-generated parameters or an approved secure upload architecture.

---

# 20. Image Rules

Product images must support:

- Multiple images
- Primary image
- Variant-specific image
- Alt text
- Ordering
- Responsive rendering
- Optimized formats

Use Cloudinary transformations rather than manually generating multiple copies.

---

# 21. Cart Architecture

Cart must support:

- Guest cart
- Customer cart
- Quantity updates
- Variant selection
- Stock validation
- Coupon application
- Shipping calculation
- Checkout conversion

At checkout, prices and inventory must be revalidated server-side.

The client cart is never the source of truth.

---

# 22. Checkout Architecture

Checkout flow:

```text
Cart
↓
Customer Information
↓
Address
↓
Shipping Calculation
↓
Coupon Validation
↓
Stock Revalidation
↓
Order Total Calculation
↓
Inventory Reservation
↓
Order Creation
↓
Payment Creation
↓
Confirmation
```

The critical section must run transactionally.

---

# 23. Duplicate Checkout Protection

Prevent duplicate orders caused by:

- Double-click
- Browser retry
- Network retry
- Refresh
- Multiple requests

Use an idempotency mechanism for order creation/payment creation.

---

# 24. Inventory Concurrency

For the final stock reservation:

```text
available = available - requested
reserved = reserved + requested
```

The operation must be concurrency-safe.

Two customers cannot successfully reserve the same final unit.

Use PostgreSQL transaction/locking strategies as appropriate.

---

# 25. Payment Architecture

Supported:

```text
COD
INSTAPAY
VODAFONE_CASH
```

COD:

```text
Order Pending
↓
Admin Confirmation
↓
Confirmed
```

Manual online payment:

```text
Pending Verification
↓
Admin Review
↓
Paid / Rejected
```

Never mark an online payment as paid based solely on client input.

---

# 26. Shipping Architecture

Shipping must be abstracted behind a service interface.

Example:

```text
ShippingService
├── createShipment()
├── cancelShipment()
├── trackShipment()
└── calculateShipping()
```

This prevents the application from becoming tightly coupled to one shipping company.

The initial shipping company can be implemented as the first provider.

---

# 27. Returns / Exchanges Architecture

Use dedicated services:

```text
ReturnService
ExchangeService
RefundService
```

They must implement the approved rules from Document 05.

Partial return and partial exchange must be supported.

---

# 28. Notifications

Notification Service:

```text
NotificationService
```

Initial channels:

- In-app
- WhatsApp

Future-ready:

- Email
- SMS
- Push

The core business service should not be tightly coupled to one notification provider.

---

# 29. Audit Logging

Sensitive operations must create audit records.

Examples:

```text
Product price changed
Stock adjusted
Order status changed
Payment approved
Payment rejected
Refund processed
Return approved
Return rejected
Exchange approved
Coupon changed
Permission changed
```

Audit logging should happen at the service/business layer.

---

# 30. Error Handling

Use consistent typed error responses.

Categories:

```text
VALIDATION_ERROR
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
NOT_FOUND
CONFLICT
STOCK_ERROR
PAYMENT_ERROR
SHIPPING_ERROR
BUSINESS_RULE_ERROR
INTERNAL_ERROR
```

Do not expose stack traces, database errors, secrets, or internal implementation details to customers.

---

# 31. Logging

Production logs must be useful without leaking sensitive data.

Never log:

- Passwords
- Payment credentials
- API secrets
- Full payment proofs
- Sensitive authentication tokens

Use structured logging where practical.

---

# 32. Environment Variables

At minimum:

```text
DATABASE_URL

AUTH_SECRET

CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

NEXT_PUBLIC_APP_URL

PAYMENT_PROVIDER_CONFIG
SHIPPING_PROVIDER_CONFIG
WHATSAPP_PROVIDER_CONFIG
```

Only variables explicitly prefixed with `NEXT_PUBLIC_` may be exposed to browser code.

Create:

```text
.env.example
```

with placeholders and documentation.

Never commit `.env`.

---

# 33. Vercel

The application must be deployable to Vercel without a persistent server.

Required:

- Production build passes
- TypeScript passes
- ESLint passes
- Prisma generation works
- Database migrations are controlled
- Environment variables are configured
- No local filesystem dependency for persistent data
- No long-running process dependency

---

# 34. Background Jobs

Do not assume a permanent worker exists.

For scheduled or delayed tasks, use a Vercel-compatible scheduled mechanism or an external job service when required.

Potential jobs:

- Expire inventory reservations
- Payment verification reminders
- Abandoned cart processing
- Notification retries
- COD settlement reminders

Jobs must be idempotent.

---

# 35. Security Baseline

The application must implement:

- Secure authentication
- RBAC
- Server-side authorization
- Input validation
- Rate limiting where appropriate
- CSRF protection where applicable
- Secure cookies
- Secure headers
- Webhook verification
- Upload validation
- File type/size validation
- SQL injection protection through Prisma
- XSS-safe rendering
- Secret management
- Audit logging

Never trust client-side role or price information.

---

# 36. SEO Architecture

Use Next.js metadata APIs.

Each product page should support:

- Title
- Description
- Canonical URL
- Open Graph metadata
- Product structured data
- Images

Generate:

```text
/sitemap.xml
/robots.txt
```

Use clean SEO-friendly slugs.

Arabic SEO is a first-class requirement.

---

# 37. Caching / Revalidation

Use Next.js caching strategically.

Good candidates:

- Product catalog
- Categories
- Collections
- Public content
- SEO data

Do not cache personalized or sensitive information incorrectly.

Inventory, cart, checkout, payment, account, and admin operations must always use fresh authoritative data where required.

---

# 38. Search

Search must support:

- Product name
- SKU
- Category
- Collection
- Tags
- Arabic text

The initial implementation can use PostgreSQL search capabilities.

A dedicated search engine is not required for the initial version.

---

# 39. Admin Dashboard Data

Admin pages should use server-side data loading whenever practical.

High-volume tables should use:

- Pagination
- Filtering
- Sorting
- Search
- Server-side querying

Do not load thousands of records into the browser unnecessarily.

---

# 40. API Design Principle

Internal operations should prefer:

```text
Server Actions
+
Services
```

Use Route Handlers when:

- An external client needs an endpoint
- A webhook requires an HTTP endpoint
- A public API is intentionally exposed

Do not create unnecessary REST endpoints for every internal operation.

---

# 41. Testing Architecture

Required testing layers:

### Unit Tests

For:

- Price calculation
- Coupon calculation
- Inventory logic
- Return eligibility
- Exchange difference
- Shipping calculation

### Integration Tests

For:

- Checkout
- Order creation
- Payment verification
- Inventory reservation
- Return processing
- Exchange processing

### E2E Tests

Critical customer flows:

```text
Browse
→ Product
→ Cart
→ Checkout
→ Order

Admin
→ Payment Verification
→ Order Processing

Customer
→ Return
→ Exchange
→ Refund
```

---

# 42. Type Safety

Use TypeScript strictly.

Avoid:

```text
any
```

unless explicitly justified.

Shared domain types should be derived from validation schemas or database-safe domain models where appropriate.

---

# 43. Code Quality

Required:

- ESLint
- Prettier
- TypeScript strict mode
- Reusable components
- Small focused services
- No duplicated business logic
- No magic numbers for business rules
- Constants/configuration for configurable rules

---

# 44. Development Sequence

OpenCode should implement in this approximate order:

```text
1. Project Bootstrap
2. Next.js Configuration
3. Tailwind/UI Foundation
4. Prisma + Neon
5. Database Schema + Migrations
6. Seed Data
7. Authentication
8. RBAC
9. Core Services
10. Admin Shell
11. Catalog
12. Inventory
13. Cart
14. Checkout
15. Orders
16. Payments
17. Shipping
18. Returns
19. Exchanges
20. Reviews
21. Wishlist
22. Notifications
23. Reports
24. SEO
25. Testing
26. Security Hardening
27. Production Deployment
```

Do not implement the entire application in one uncontrolled generation step.

---

# 45. OpenCode Working Rules

OpenCode must:

1. Read all approved documents before implementation.
2. Treat approved documents as the source of truth.
3. Never silently change an approved business rule.
4. Ask for clarification when a requirement conflicts with an approved document.
5. Prefer existing project patterns over introducing unnecessary dependencies.
6. Keep business logic in services.
7. Keep database access controlled.
8. Keep secrets out of source code.
9. Add tests for critical business rules.
10. Update documentation when an approved implementation decision changes.
11. Keep the project deployable throughout implementation.
12. Never claim a feature is complete without validating it.

---

# 46. Definition of Done

A feature is considered complete only when:

```text
Requirement implemented
+
Server validation implemented
+
Authorization checked
+
Database operation correct
+
Error handling implemented
+
Audit logging added when required
+
Loading/empty/error UI handled
+
Tests added for critical logic
+
TypeScript passes
+
Lint passes
+
Build passes
```

---

# 47. Acceptance Criteria

Document 07 is considered successfully implemented when:

- Next.js project runs locally.
- Production build succeeds.
- Vercel deployment architecture is valid.
- Neon PostgreSQL is integrated through Prisma.
- Cloudinary is integrated securely.
- Storefront/Admin are separated logically.
- Server and Client Components are used appropriately.
- Business logic is centralized in services.
- Server Actions are validated and authorized.
- Route Handlers are used for external HTTP concerns.
- RBAC is enforced server-side.
- Inventory operations are transaction-safe.
- Checkout is protected against duplicates.
- Payments are verified server-side.
- Shipping is abstracted behind a provider interface.
- Returns/exchanges use dedicated services.
- Audit logging is implemented for sensitive actions.
- Secrets are environment-based.
- SEO architecture is included.
- Testing structure exists.
- The project remains compatible with Vercel serverless deployment.

---

# Approval Status

**DOCUMENT 07 IS APPROVED FOR IMPLEMENTATION**

This document is the source of truth for the SALAM Next.js application architecture.

Any architectural change must be explicitly documented as a revision.
