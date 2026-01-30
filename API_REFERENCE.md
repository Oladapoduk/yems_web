# API Reference

Base URL: `http://localhost:3000/api` (development)

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+44 1234 567890"
}

Response: 201 Created
{
  "user": { ... },
  "token": "jwt_token_here"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: 200 OK
{
  "user": { ... },
  "token": "jwt_token_here"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER"
}
```

## Products

### List Products
```http
GET /api/products?category=frozen-fish&limit=20&offset=0

Response: 200 OK
{
  "products": [ ... ],
  "total": 100
}
```

### Get Product Details
```http
GET /api/products/:id

Response: 200 OK
{
  "id": "uuid",
  "name": "Fresh Salmon",
  "price": "15.99",
  "description": "...",
  "allergens": ["fish"],
  "imageUrls": ["url1", "url2"],
  ...
}
```

### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Fresh Salmon",
  "slug": "fresh-salmon",
  "categoryId": "category-uuid",
  "price": 15.99,
  "priceType": "FIXED",
  "description": "Premium Atlantic salmon",
  "allergens": ["fish"],
  "imageUrls": ["url"],
  "weightMin": 800,
  "weightMax": 1200,
  "stockQuantity": 50
}

Response: 201 Created
```

## Categories

### List All Categories
```http
GET /api/categories

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Frozen Fish",
    "slug": "frozen-fish",
    "description": "Fresh frozen fish products",
    "imageUrl": "url",
    "products": [ ... ]
  },
  ...
]
```

## Delivery Zones

### Get Active Delivery Zones
```http
GET /api/delivery-zones

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Central London",
    "postcodePrefixes": ["SE", "SW", "E"],
    "deliveryFee": "5.99",
    "minimumOrder": "30.00"
  },
  ...
]
```

### Validate Postcode
```http
POST /api/delivery-zones/validate-postcode
Content-Type: application/json

{
  "postcode": "SE1 7PB"
}

Response: 200 OK
{
  "isValid": true,
  "zone": {
    "id": "uuid",
    "name": "Central London",
    "deliveryFee": "5.99",
    "minimumOrder": "30.00"
  }
}
```

### Create Delivery Zone (Admin)
```http
POST /api/delivery-zones/admin
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Central London",
  "postcodePrefixes": ["SE", "SW", "E", "W"],
  "deliveryFee": 5.99,
  "minimumOrder": 30.00
}

Response: 201 Created
```

## Delivery Slots

### Get Available Slots
```http
GET /api/delivery-slots?startDate=2025-12-01&endDate=2025-12-07

Response: 200 OK
{
  "2025-12-01": [
    {
      "id": "uuid",
      "startTime": "09:00",
      "endTime": "12:00",
      "available": 15,
      "maxOrders": 20
    },
    ...
  ],
  "2025-12-02": [ ... ]
}
```

### Create Delivery Slot (Admin)
```http
POST /api/delivery-slots/admin
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "date": "2025-12-01",
  "startTime": "09:00",
  "endTime": "12:00",
  "maxOrders": 20
}

Response: 201 Created
```

### Bulk Create Slots (Admin)
```http
POST /api/delivery-slots/admin/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "startDate": "2025-12-01",
  "endDate": "2025-12-07",
  "timeSlots": [
    { "startTime": "09:00", "endTime": "12:00", "maxOrders": 20 },
    { "startTime": "12:00", "endTime": "15:00", "maxOrders": 20 },
    { "startTime": "15:00", "endTime": "18:00", "maxOrders": 20 }
  ]
}

Response: 201 Created
{
  "message": "Delivery slots created successfully",
  "count": 21
}
```

## Orders

### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "userId": "uuid-or-null-for-guest",
  "guestEmail": "guest@example.com",
  "items": [
    { "productId": "uuid", "quantity": 2 },
    { "productId": "uuid", "quantity": 1 }
  ],
  "deliveryAddress": {
    "addressLine1": "123 Main St",
    "addressLine2": "",
    "city": "London",
    "postcode": "SE1 7PB"
  },
  "deliveryPostcode": "SE1 7PB",
  "deliveryZoneId": "zone-uuid",
  "deliverySlotId": "slot-uuid",
  "isBusinessOrder": false,
  "vatNumber": null,
  "notes": ""
}

Response: 201 Created
{
  "order": { ... },
  "clientSecret": "stripe_client_secret_here"
}
```

### Get My Orders
```http
GET /api/orders/my-orders
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "uuid",
    "orderNumber": "ORD-123456",
    "status": "CONFIRMED",
    "total": "45.99",
    "createdAt": "2025-12-01T10:00:00Z",
    "orderItems": [ ... ],
    "deliverySlot": { ... }
  },
  ...
]
```

### Get Order by Number
```http
GET /api/orders/ORD-123456

Response: 200 OK
{
  "id": "uuid",
  "orderNumber": "ORD-123456",
  "status": "CONFIRMED",
  "orderItems": [ ... ],
  "deliverySlot": { ... },
  "deliveryZone": { ... }
}
```

### Update Order Status (Admin)
```http
PATCH /api/orders/admin/ORD-123456/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "PACKED"
}

Response: 200 OK
```

### Handle Substitution (Admin)
```http
POST /api/orders/admin/ORD-123456/items/:itemId/substitute
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "substitutionProductId": "uuid"
}

Response: 200 OK
```

## Search

### Autocomplete
```http
GET /api/search/autocomplete?q=salm

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Fresh Salmon",
    "slug": "fresh-salmon",
    "price": "15.99",
    "imageUrls": ["url"],
    "category": {
      "name": "Frozen Fish"
    }
  },
  ...
]
```

### Full Search
```http
GET /api/search?q=salmon&category=frozen-fish&minPrice=10&maxPrice=20&sort=price-asc&page=1&limit=20

Response: 200 OK
{
  "products": [ ... ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### Create Synonym (Admin)
```http
POST /api/search/admin/synonyms
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "term": "prawns",
  "synonyms": ["shrimp", "king prawns"]
}

Response: 201 Created
```

### Get All Synonyms (Admin)
```http
GET /api/search/admin/synonyms
Authorization: Bearer <admin_token>

Response: 200 OK
[
  {
    "id": "uuid",
    "term": "prawns",
    "synonyms": ["shrimp", "king prawns"]
  },
  ...
]
```

## Business (B2B)

### Create Business Profile
```http
POST /api/business/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyName": "Restaurant ABC Ltd",
  "vatNumber": "GB123456789",
  "businessAddress": "123 Business St, London",
  "purchaseOrderPrefix": "PO"
}

Response: 201 Created
```

### Get Business Profile
```http
GET /api/business/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "companyName": "Restaurant ABC Ltd",
  "vatNumber": "GB123456789",
  ...
}
```

### Update Business Profile
```http
PUT /api/business/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyName": "Restaurant ABC Ltd",
  "vatNumber": "GB123456789",
  ...
}

Response: 200 OK
```

### Get VAT Invoice
```http
GET /api/business/invoice/ORD-123456
Authorization: Bearer <token>

Response: 200 OK
{
  "invoiceNumber": "INV-ORD-123456",
  "invoiceDate": "2025-12-01T10:00:00Z",
  "company": { ... },
  "items": [ ... ],
  "totalNet": "45.99",
  "totalVAT": "0.00",
  "totalGross": "45.99"
}
```

### Get Reorder Data
```http
GET /api/business/reorder/ORD-123456
Authorization: Bearer <token>

Response: 200 OK
{
  "orderNumber": "ORD-123456",
  "originalDate": "2025-11-01T10:00:00Z",
  "items": [
    {
      "product": { ... },
      "quantity": 2
    },
    ...
  ],
  "unavailableCount": 1
}
```

## Webhooks

### Stripe Payment Webhook
```http
POST /api/orders/webhook/stripe
Stripe-Signature: <signature>

Body: <stripe event payload>

Response: 200 OK
{
  "received": true
}
```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "message": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "An error occurred"
}
```

## Rate Limiting

Currently no rate limiting is implemented. For production, implement rate limiting using express-rate-limit or similar.

## CORS

CORS is enabled for:
- Development: `http://localhost:5173`
- Production: Configure via `FRONTEND_URL` environment variable

## Testing with cURL

### Example: Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "guestEmail": "test@example.com",
    "items": [{"productId": "uuid", "quantity": 2}],
    "deliveryAddress": {
      "addressLine1": "123 Main St",
      "city": "London",
      "postcode": "SE1 7PB"
    },
    "deliveryPostcode": "SE1 7PB",
    "deliveryZoneId": "zone-uuid",
    "deliverySlotId": "slot-uuid"
  }'
```

---

For more information, see [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) and [SETUP_GUIDE.md](SETUP_GUIDE.md).
