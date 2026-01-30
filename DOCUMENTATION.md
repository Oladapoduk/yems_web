# Olayemi Website - V1.0 Documentation

This document provides a comprehensive overview of the features, technical architecture, and operational logic implemented for the Olayemi e-commerce platform.

---

## 1. Customer Shopping Experience

### A. Dynamic Catalog & Search
- **Digital Aisles**: Products are categorized into logical aisles (e.g., Seafood, Meat, Pantry) for easy navigation.
- **Smart Search**: Integrated keyword synonyms (e.g., "fish" → "titus", "mackerel") to ensure customers find products regardless of the terms used.
- **Real-time Filtering**: Instant filtering by category and availability.

### B. Intelligent Cart & Reordering
- **Persistent Cart**: Powered by Zustand for a seamless experience across browser sessions.
- **Order Again**: Customers can re-add all items from a past order to their cart with a single click from their order history.

### C. Multi-Step Interactive Checkout
- **Postcode Validation**: Real-time validation against served delivery zones.
- **Delivery Slot Fetching**: Dynamic scheduling that only shows available time windows for the selected delivery area.
- **Secure Payment**: Integrated **Stripe Payment Element**, providing a PCI-compliant, high-trust checkout experience without exposing sensitive data.

---

## 2. Order Realization & Tracking

### A. Live Order Tracking
- **Dynamic Stepper**: A visual progress bar on the order confirmation page that reflects real-time status updates:
  - `Order Received` → `Confirmed` → `Being Packed` → `On Its Way` → `Delivered`.
- **Automated Refreshes**: The tracking page polls for status changes initiated by the fulfillment team.

### B. Product Substitutions & Refunds
- **Substitution Flow**: If an item is out of stock, admins can propose a substitute. Customers receive an email and can Accept or Decline via a secure link.
- **Automated Refunds**: If a customer declines a substitution, the system automatically processes a partial refund via **Stripe API** and notifies the customer via email.

---

## 3. Operations & Admin Management

### A. Centralized Admin Dashboard
A high-performance management suite for store owners:
- **Order Management**: View detailed order breakdowns, update fulfillment statuses, and manage substitution requests.
- **Product Management**: Create, edit, and toggle visibility for the entire inventory.
- **Category (Aisle) Control**: Manage aisle names, images, descriptions, and their display order.
- **Logistics**: Configure delivery zones (by postcode) and manage weekly delivery time slots.

### B. Analytics
- High-level sales performance tracking and order volume visualization.

---

## 4. Technical Architecture

### Frontend Layer
- **Framework**: React with Vite.
- **Styling**: Vanilla CSS with modern components for high aesthetics.
- **State Management**: Zustand (Cart & Auth).
- **Data Fetching**: React Query (for robust caching and background synchronization).
- **Icons**: Lucide React.

### Backend Layer
- **Runtime**: Node.js & Express (TypeScript).
- **Database**: PostgreSQL with **Prisma ORM**.
- **Security**: 
  - JWT-based authentication.
  - Role-based access control (RBAC) for Admin features.
  - Stripe webhook signature verification for secure payment processing.

### Integrations
- **Payment**: Stripe.
- **Emails**: Resend (Transactional emails for Order Confirmation, Packing, Dispatch, and Refunds).

---

## 5. Security Summary
- **PCI Compliance**: No credit card data enters our server; all payment logic is handled via Stripe's secure infrastructure.
- **Data Protection**: Sensitive environment variables (API keys) are siloed on the backend.
- **Webhook Integrity**: All incoming triggers from Stripe are cryptographically verified using `STRIPE_WEBHOOK_SECRET`.

---

## 6. Testing & Quality Assurance

The Olayemi platform has undergone rigorous testing to ensure reliability, security, and a premium user experience.

### A. Automated Test Suites
We utilize **Vitest** for frontend unit testing and custom integration tests for the backend.
- **Frontend Tests**: 
  - `SearchBar.test.tsx`: Validates autocomplete logic and search synonym mapping.
  - `productService.test.ts`: Ensures reliable data fetching and error handling for the product catalog.
- **Backend Tests**:
  - `order.test.ts`: Verifies order creation logic and status transition rules.
  - `product.test.ts`: Validates product CRUD operations and category associations.

### B. Manual Verification & Results
Comprehensive manual end-to-end tests were conducted for the following critical flows:
1. **Checkout Lifecycle**: 
   - **Result**: Successfully processed multiple test payments using Stripe's test environment. 
   - **Validation**: Confirmed that the database accurately reflects `PAID` status after webhook triggers.
2. **Admin Real-time Controls**: 
   - **Result**: Verified that changing a delivery zone or slot in the Admin panel immediately impacts the frontend checkout options.
   - **Validation**: Tested multi-step status updates (Packing → Dispatch) and ensured tracking progress bars updated in real-time.
3. **Refund Logic**: 
   - **Result**: Triggered automated partial refunds for declined substitutions.
   - **Validation**: Verified that the user received both the refund notification and the Stripe status update correctly.

---

**Status**: Production Ready (Phase 1-3 Completed)
**Version**: 1.0.0
