# SALAM | سلام
# Document 08 — UI/UX Design System

**Status: APPROVED FOR IMPLEMENTATION**

## 1. Design Objective

SALAM is a **Premium Modest Fashion** brand in Egypt focused on:

- Women's modest fashion
- Abayas
- Esdals
- Elegant modest clothing

Primary audience:

- Mothers
- Women 30+
- Broadly inclusive of women across age groups

The visual direction must feel:

> Premium, calm, elegant, feminine, modest, refined, trustworthy, and modern.

Avoid:

- Overly flashy fashion aesthetics
- Excessive gradients
- Cheap-looking ecommerce patterns
- Aggressive animations
- Cluttered layouts
- Excessive decorative elements
- Overly youthful visual language

---

# 2. Brand Direction

Brand name:

**سلام | SALAM**

The visual identity should communicate:

- Peace
- Modesty
- Elegance
- Confidence
- Quality
- Simplicity

The Quranic inspiration behind the brand name should be respected through an elegant and tasteful identity, without turning the ecommerce UI into religious decoration.

---

# 3. Color System

The exact logo colors provided by the brand owner are the primary reference.

Create CSS variables/design tokens rather than hardcoding colors throughout components.

Example structure:

```css
--color-primary
--color-primary-hover
--color-primary-soft

--color-background
--color-surface
--color-surface-muted

--color-text
--color-text-muted
--color-text-soft

--color-border

--color-success
--color-warning
--color-error
--color-info
```

The final values must be derived from the approved SALAM logo/brand assets.

Do not invent an unrelated color palette.

---

# 4. Typography

Arabic is the primary customer-facing language.

Typography must prioritize:

- Excellent Arabic readability
- Premium editorial appearance
- Clear hierarchy
- Comfortable reading on mobile

Use a modern Arabic-capable font.

Recommended candidates may include:

- Cairo
- IBM Plex Sans Arabic
- Noto Sans Arabic
- Tajawal

The final font should be selected based on the visual result and performance.

English typography must remain visually compatible with Arabic.

Use a consistent type scale:

```text
Display
H1
H2
H3
H4
Body Large
Body
Body Small
Caption
```

Avoid excessive font weights.

---

# 5. RTL

The customer storefront is RTL-first.

HTML should support:

```html
dir="rtl"
lang="ar"
```

The architecture must remain compatible with English LTR.

RTL must be handled correctly for:

- Navigation
- Breadcrumbs
- Forms
- Tables
- Icons
- Product cards
- Checkout
- Modals
- Pagination
- Drawers
- Sidebars

Do not simply mirror the UI visually.

---

# 6. Layout Philosophy

SALAM should use generous whitespace.

Design characteristics:

```text
Large whitespace
+
Clean typography
+
High-quality imagery
+
Subtle borders
+
Controlled contrast
=
Premium appearance
```

Avoid dense ecommerce layouts.

Content should breathe.

---

# 7. Container System

Use a consistent responsive container.

Concept:

```text
Mobile
→ full width with side padding

Tablet
→ centered constrained content

Desktop
→ large max-width container
```

Recommended token:

```text
max-width: 1280px–1440px
```

The exact value can be tuned during implementation.

---

# 8. Responsive Breakpoints

Use Tailwind responsive conventions.

Target:

```text
Mobile
Tablet
Desktop
Large Desktop
```

Design mobile-first.

The website must work correctly at approximately:

```text
360px
390px
430px
768px
1024px
1280px
1440px+
```

---

# 9. Header

The storefront header is a major brand element.

Desktop structure:

```text
Logo
Navigation
Search
Wishlist
Cart
Account
```

Mobile:

```text
Menu
Logo
Search
Wishlist
Cart
```

Header should remain visually lightweight.

Avoid oversized navigation bars.

Sticky behavior may be used when it improves usability.

---

# 10. Navigation

Primary navigation should be simple.

Suggested categories:

```text
الرئيسية
عبايات
إسدالات
فساتين محتشمة
مجموعاتنا
وصل حديثًا
العروض
```

The exact categories are managed from the Admin where appropriate.

---

# 11. Homepage

Homepage should feel editorial rather than like a generic marketplace.

Suggested structure:

```text
Hero
↓
Featured Categories
↓
New Arrivals
↓
Signature Collection
↓
Brand Story
↓
Featured Products
↓
Style Finder
↓
Customer Reviews
↓
Instagram / Social Proof
↓
Newsletter / WhatsApp CTA
↓
Footer
```

Sections can be reordered based on content performance.

---

# 12. Hero Section

Hero should communicate the brand immediately.

Requirements:

- High-quality fashion imagery
- Short headline
- Supporting copy
- Primary CTA
- Optional secondary CTA

Example direction:

```text
أناقة هادئة...
مصممة لتشبهكِ

اكتشفي المجموعة
```

Copy must remain concise.

Do not overload the hero with text.

---

# 13. Product Card

Product cards are central to the storefront.

Each card should support:

- Product image
- Product name
- Price
- Sale price where applicable
- Discount badge
- Available colors
- Wishlist action
- Quick add when appropriate
- Out-of-stock state
- New badge where applicable

Hover behavior on desktop may show:

- Secondary image
- Quick action

Mobile must not depend on hover.

---

# 14. Product Grid

Desktop:

```text
4 columns
```

Large screens may use:

```text
4–5 columns
```

Tablet:

```text
2–3 columns
```

Mobile:

```text
2 columns
```

The mobile product grid must preserve sufficient image size and readable pricing.

---

# 15. Product Page

Product page hierarchy:

```text
Breadcrumb
↓
Image Gallery
↓
Product Information
↓
Price
↓
Color
↓
Size
↓
Size Guide
↓
Stock Status
↓
Quantity
↓
Add to Cart
↓
Wishlist
↓
Shipping / Return Information
↓
Description
↓
Details / Fabric / Care
↓
Reviews
↓
Related Products
```

On mobile, purchase actions should remain easy to reach.

A sticky Add to Cart bar may be used on mobile.

---

# 16. Product Gallery

Support:

- Large primary image
- Thumbnail navigation
- Variant-specific gallery
- Zoom
- Swipe on mobile
- Optimized Cloudinary images

Image quality is a priority because this is a fashion brand.

---

# 17. Product Information

The visual hierarchy should be:

```text
Product Name
↓
Short descriptor
↓
Price
↓
Discount
↓
Color
↓
Size
↓
Availability
↓
CTA
```

Price must be visually prominent but not overpower the product name.

---

# 18. Size Selection

Use clear size buttons.

Example:

```text
S   M   L   XL
```

Selected state must be obvious.

Unavailable size:

- Visually disabled
- Not selectable

Size Guide opens in a modal/drawer.

---

# 19. Stock States

Support:

```text
متوفر
متبقي القليل
غير متوفر
```

Do not expose exact stock quantities to customers unless intentionally configured.

---

# 20. Cart

Cart should be clean and easy to scan.

Each item:

```text
Image
Product
Variant
Price
Quantity
Subtotal
Remove
```

Summary:

```text
Subtotal
Discount
Shipping
Total
```

Primary CTA:

```text
إتمام الطلب
```

---

# 21. Checkout

Checkout should minimize friction.

Sections:

```text
Customer Information
↓
Address
↓
Shipping
↓
Payment
↓
Order Review
↓
Place Order
```

Avoid unnecessary fields.

Mobile checkout should be especially concise.

---

# 22. Payment UI

Payment options:

```text
الدفع عند الاستلام
InstaPay
Vodafone Cash
```

For manual payment:

```text
Payment Instructions
+
Amount
+
Transaction Reference
+
Upload Screenshot
```

Clearly explain the verification process.

Never ask customers for unnecessary sensitive financial credentials.

---

# 23. Account Area

Customer account should include:

```text
Overview
Orders
Returns
Exchanges
Wishlist
Addresses
Profile
```

Order history should be visually clear.

---

# 24. Order Tracking

Order detail should show a timeline:

```text
تم الطلب
↓
تم التأكيد
↓
جاري التجهيز
↓
تم الشحن
↓
خرج للتوصيل
↓
تم التسليم
```

Canceled/failed/returned states should appear distinctly.

---

# 25. Returns & Exchanges UI

Customer should be guided step-by-step.

Return:

```text
Select Order
↓
Select Items
↓
Select Reason
↓
Add Notes/Photos
↓
Submit
```

Exchange:

```text
Select Item
↓
Select Replacement Variant
↓
Review Price Difference
↓
Submit
```

Show the 7-day policy clearly.

---

# 26. Reviews

Reviews should feel trustworthy.

Display:

- Rating
- Customer name
- Verified Purchase badge
- Date
- Review content
- Images when available

Only verified purchases can submit reviews.

---

# 27. Wishlist

Wishlist cards should support:

- Product image
- Name
- Price
- Availability
- Remove
- Add to cart

Out-of-stock items remain visible but clearly marked.

---

# 28. Search

Search UI should be accessible from the header.

Support:

- Product names
- SKU when relevant
- Categories
- Collections
- Tags
- Arabic search

Search suggestions may include:

- Products
- Categories
- Popular searches

---

# 29. Filters

Shop filters should support:

```text
Category
Collection
Size
Color
Price
Availability
Occasion
```

On desktop:

```text
Sidebar / Filter Bar
```

On mobile:

```text
Filter Drawer
```

Filters must be easy to reset.

---

# 30. Admin Dashboard Visual Direction

The Admin does not need to visually copy the storefront.

Admin should be:

- Clean
- Dense enough for productivity
- Professional
- Clear
- Fast
- Data-oriented

Use:

```text
Sidebar
Topbar
Breadcrumbs
Page Header
Filters
Tables
Cards
Charts
Dialogs
```

---

# 31. Admin Sidebar

Suggested structure:

```text
Dashboard

Catalog
├── Products
├── Categories
├── Collections
├── Banners
└── Reviews

Inventory
├── Stock
├── Movements
└── Reservations

Orders
├── All Orders
├── Pending
├── Preparing
├── Shipping
└── Delivered

Customers

Payments
├── Payment Verification
├── Refunds
└── COD Settlements

Shipping

Returns
Exchanges

Marketing
├── Coupons
└── Promotions

Reports

Users & Roles

Audit Logs

Settings
```

Visibility must depend on permissions.

---

# 32. Dashboard KPIs

Admin dashboard should provide:

```text
Revenue
Orders
Average Order Value
Pending Orders
Pending Payments
Low Stock
Returns
Exchanges
COD Pending Settlement
```

Time filters:

```text
Today
7 Days
30 Days
This Month
Custom
```

---

# 33. Admin Tables

Tables must support:

- Search
- Filters
- Sorting
- Pagination
- Bulk actions where safe
- Column visibility where useful
- Export where approved

Do not load all records into the browser.

---

# 34. Admin Product Editor

Product editor should be structured into sections:

```text
Basic Information
Pricing
Variants
Images
Inventory
Categories
Collections
Tags
SEO
Publishing
```

Product creation should support:

- Arabic content
- English content
- Multiple images
- Variant images
- Sizes
- Colors
- Pricing
- Sale pricing
- SKU
- Inventory

---

# 35. Admin Order Details

Order page should show:

```text
Order Summary
Customer
Address
Items
Payment
Shipment
Timeline
Notes
Returns
Exchanges
Refunds
Audit History
```

Admin actions must be permission-controlled.

---

# 36. Status Badges

Use consistent semantic badges.

Examples:

```text
Success
Confirmed
Paid
Delivered

Warning
Pending
Under Review

Error
Rejected
Failed
Cancelled

Neutral
Draft
Archived
```

Never rely on color alone.

---

# 37. Forms

Forms must provide:

- Clear labels
- Helpful descriptions
- Required indicators
- Inline validation
- Error messages
- Loading states
- Success feedback
- Disabled states

Arabic validation messages should be available.

---

# 38. Buttons

Button hierarchy:

```text
Primary
Secondary
Ghost
Destructive
```

Primary actions should be visually obvious.

Destructive actions require confirmation when irreversible.

---

# 39. Modals and Drawers

Use:

- Modal for focused confirmation/forms
- Drawer for mobile filters/details where appropriate

Avoid nested modal chains.

---

# 40. Loading States

Use skeletons for major content areas:

- Product grids
- Product page
- Admin tables
- Dashboard cards

Use button loading states for mutations.

Never leave the user wondering whether an action was submitted.

---

# 41. Empty States

Examples:

```text
لا توجد منتجات
لا توجد طلبات
قائمة المفضلة فارغة
لا توجد نتائج
لا توجد طلبات استرجاع
```

Each meaningful empty state should provide a useful next action where possible.

---

# 42. Error States

Customer-facing errors should be:

- Human-readable
- Arabic-first
- Actionable

Example:

```text
حدث خطأ أثناء إتمام الطلب.
حاولي مرة أخرى أو تواصلي معنا.
```

Avoid technical error messages.

---

# 43. Toasts

Use subtle toast notifications for:

- Added to cart
- Added to wishlist
- Saved successfully
- Payment proof uploaded
- Return submitted

Avoid excessive notifications.

---

# 44. Motion

Motion should be subtle and premium.

Allowed:

- Fade
- Small slide
- Image transitions
- Drawer transitions
- Button feedback

Avoid:

- Excessive bounce
- Large page transitions
- Continuous animation
- Distracting effects

Respect `prefers-reduced-motion`.

---

# 45. Accessibility

Required:

- Keyboard navigation
- Visible focus states
- Semantic HTML
- Accessible labels
- Alt text
- Sufficient contrast
- Screen-reader-friendly controls
- Error association with form fields
- Reduced-motion support

Do not use color as the only state indicator.

---

# 46. Mobile-First Rules

Mobile is a primary shopping experience.

The following must be excellent on mobile:

- Header
- Product grid
- Product gallery
- Variant selection
- Add to Cart
- Cart
- Checkout
- Payment proof upload
- Order tracking
- Returns/exchanges

Avoid desktop layouts simply compressed into mobile.

---

# 47. Image Direction

Photography should communicate:

- Modesty
- Premium quality
- Natural elegance
- Fabric details
- Realistic colors
- Clean composition

Avoid overly artificial stock-photo aesthetics.

Product images should remain the visual hero.

---

# 48. Brand Story

The About/Brand Story section should feel editorial.

Focus on:

- SALAM philosophy
- Quality
- Modesty
- Thoughtful design
- Craftsmanship
- Women's everyday elegance

Do not overuse text.

Use strong imagery and concise storytelling.

---

# 49. Social Proof

Use:

- Verified customer reviews
- Product ratings
- Instagram content where approved
- Customer photography when approved

Do not fabricate reviews or social proof.

---

# 50. Footer

Footer should include:

```text
Brand
Shop
Customer Service
Policies
Contact
Social Links
WhatsApp
```

Policies:

```text
Shipping Policy
Return & Exchange Policy
Privacy Policy
Terms & Conditions
```

---

# 51. Design Tokens

Create a centralized design token system for:

- Colors
- Typography
- Spacing
- Radius
- Shadows
- Borders
- Motion
- Z-index

Components must consume tokens rather than arbitrary values wherever practical.

---

# 52. Component Architecture

Reusable components should include:

```text
Button
Input
Select
Checkbox
Radio
Badge
Card
Modal
Drawer
Toast
Tabs
Accordion
Breadcrumb
Pagination
DataTable
Dropdown
Skeleton
EmptyState
ErrorState
```

Domain components:

```text
ProductCard
ProductGallery
ProductPrice
VariantSelector
SizeSelector
CartItem
OrderTimeline
PaymentMethodSelector
ReturnForm
ExchangeForm
ReviewCard
```

---

# 53. Dark Mode

Dark mode is **not required for the initial storefront**.

The architecture should not prevent adding it later.

Admin may use a dark-compatible component architecture if the chosen UI system supports it, but light mode is the initial production default.

---

# 54. Arabic Copy

Customer-facing copy should be natural Egyptian/Modern Arabic appropriate for a premium Egyptian fashion brand.

Avoid:

- Machine-translated phrasing
- Overly formal legal language in normal UI
- Excessive English terminology

English may be available as a secondary language.

---

# 55. Performance

The UI must prioritize:

- Fast first load
- Optimized images
- Server rendering where appropriate
- Minimal client JavaScript
- Lazy loading below-the-fold media
- Proper image dimensions
- Stable layouts
- Avoiding unnecessary re-renders

---

# 56. Acceptance Criteria

Document 08 is complete when:

- SALAM has a defined premium modest-fashion visual direction.
- Logo colors are treated as the primary brand reference.
- Arabic RTL is first-class.
- Typography is defined.
- Responsive behavior is defined.
- Storefront layout is defined.
- Product card is defined.
- Product page is defined.
- Cart and checkout UI are defined.
- Account UI is defined.
- Return/exchange UX is defined.
- Admin visual system is defined.
- Tables/forms/statuses are defined.
- Loading/error/empty states are defined.
- Accessibility requirements are defined.
- Motion rules are defined.
- Cloudinary imagery is treated as a core visual asset.
- Design tokens are centralized.
- The system is implementable with Next.js + Tailwind CSS.

---

# Approval Status

**DOCUMENT 08 IS APPROVED FOR IMPLEMENTATION**

This document is the source of truth for SALAM's UI/UX design system.

Future visual changes must be explicitly marked as revisions.
