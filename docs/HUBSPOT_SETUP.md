# HubSpot CRM Integration Setup Guide

This guide will help you set up HubSpot CRM integration for your e-commerce platform to track contacts, orders, and customer engagement.

## What HubSpot Integration Does

The integration automatically:
- ✅ Creates/updates contacts in HubSpot when customers place orders
- ✅ Tracks order history and customer lifetime value
- ✅ Creates deals (orders) and updates their stages
- ✅ Captures UTM parameters for marketing attribution
- ✅ Tracks customer journey from first visit to purchase
- ✅ Records order statistics (total orders, revenue, average order value)
- ✅ Syncs order status changes to deal stages

## Prerequisites

- A HubSpot account (Free or Paid)
- Access to HubSpot Settings (requires Admin permissions)

## Step 1: Create a HubSpot Private App

1. **Log in to HubSpot**
   - Go to https://app.hubspot.com

2. **Navigate to Private Apps**
   - Click on Settings (gear icon in top right)
   - In the left sidebar, go to: **Integrations** → **Private Apps**
   - Click **Create a private app**

3. **Configure the App**
   - **Basic Info tab:**
     - Name: `Olayemi E-commerce Integration`
     - Description: `Automated contact and order sync from e-commerce platform`

   - **Scopes tab:** Enable the following scopes:
     - `crm.objects.contacts.read`
     - `crm.objects.contacts.write`
     - `crm.objects.deals.read`
     - `crm.objects.deals.write`
     - `crm.schemas.contacts.read`
     - `crm.schemas.deals.read`
     - `crm.objects.notes.write`

4. **Create the App**
   - Click **Create app**
   - Review the warning and click **Continue creating**
   - **Copy the Access Token** (you'll need this for the next step)

## Step 2: Add Custom Properties to HubSpot

To track order statistics, you need to create custom contact properties:

1. **Navigate to Properties**
   - Settings → **Data Management** → **Properties**
   - Select **Contact properties**

2. **Create the following properties:**

   | Property Name | Field Type | Description |
   |--------------|------------|-------------|
   | `total_orders` | Number | Total number of orders |
   | `total_revenue` | Number | Total revenue from all orders (£) |
   | `average_order_value` | Number | Average order value (£) |
   | `first_order_date` | Date picker | Date of first order |
   | `last_order_date` | Date picker | Date of most recent order |
   | `order_number` | Single-line text | Current order number |
   | `order_status` | Single-line text | Current order status |

3. **For each property:**
   - Click **Create property**
   - Object type: **Contact**
   - Group: Create a new group called "Order History"
   - Field type: (see table above)
   - Label: (use the Property Name from table)
   - Name: (use the exact name from table - this is important!)
   - Click **Create**

## Step 3: Configure Deal Pipeline (Optional)

1. **Navigate to Pipelines**
   - Settings → **Objects** → **Deals** → **Pipelines**

2. **Use Default Pipeline** or create a custom one
   - The integration maps order statuses to deal stages as follows:
     - `PENDING` → Qualified to buy
     - `CONFIRMED` → Presentation scheduled
     - `PACKING` → Decision maker bought-in
     - `OUT_FOR_DELIVERY` → Contract sent
     - `DELIVERED` → Closed won
     - `CANCELLED` / `REFUNDED` → Closed lost

3. **Customize Stage Names** (if desired)
   - You can rename stages to match your business process
   - The automation will still work with the default mappings

## Step 4: Add HubSpot API Key to Your Application

1. **Open your `.env` file** in the backend folder
   ```bash
   cd backend
   nano .env  # or use your preferred editor
   ```

2. **Add the HubSpot API Key**
   ```env
   # HubSpot CRM
   HUBSPOT_API_KEY=your_access_token_from_step_1
   ```

3. **Save and restart your server**
   ```bash
   npm run dev
   ```

## Step 5: Test the Integration

1. **Place a test order** through your website

2. **Check HubSpot Contacts**
   - Go to **Contacts** → **Contacts** in HubSpot
   - Search for the customer email
   - Verify the contact was created with:
     - Name, email, phone, address
     - Order statistics populated
     - UTM parameters (if available)

3. **Check HubSpot Deals**
   - Go to **Sales** → **Deals**
   - Look for a deal named "Order [ORDER_NUMBER]"
   - Verify:
     - Deal amount matches order total
     - Deal is associated with the contact
     - Deal stage reflects order status

## Tracking UTM Parameters

UTM parameters are automatically captured when users visit your site with tracking links.

### How It Works

1. **First Visit:** User clicks a marketing link like:
   ```
   https://yoursite.com?utm_source=facebook&utm_medium=cpc&utm_campaign=summer_sale
   ```

2. **Storage:** UTM parameters are stored in the browser (localStorage)

3. **Order Creation:** When the user places an order, UTM data is sent to HubSpot

4. **HubSpot Records:** Contact is created/updated with:
   - `utm_source` → facebook
   - `utm_medium` → cpc
   - `utm_campaign` → summer_sale
   - Additional fields: `utm_term`, `utm_content`

### Creating Tracking Links

Use this format for your marketing campaigns:
```
https://yoursite.com?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN

Examples:
- Facebook Ad: ?utm_source=facebook&utm_medium=cpc&utm_campaign=winter_sale
- Email: ?utm_source=newsletter&utm_medium=email&utm_campaign=weekly_deals
- Instagram: ?utm_source=instagram&utm_medium=social&utm_campaign=influencer_collab
```

## Order Lifecycle in HubSpot

1. **Order Created (PENDING)**
   - Contact created/updated with customer info
   - Deal created with order details
   - Deal stage: "Qualified to buy"

2. **Order Confirmed (CONFIRMED)**
   - Deal stage updated: "Presentation scheduled"

3. **Order Being Packed (PACKING)**
   - Deal stage updated: "Decision maker bought-in"

4. **Out for Delivery (OUT_FOR_DELIVERY)**
   - Deal stage updated: "Contract sent"

5. **Delivered (DELIVERED)**
   - Deal stage updated: "Closed won"
   - Contact stats updated (total orders, revenue, etc.)

6. **Cancelled/Refunded**
   - Deal stage updated: "Closed lost"

## Viewing Reports in HubSpot

### Customer Lifetime Value Report
1. Go to **Reports** → **Reports**
2. Create **Custom Report**
3. Data source: **Contacts**
4. Metrics: `total_revenue`, `total_orders`, `average_order_value`
5. Filters: Add any segmentation you need

### Marketing Attribution Report
1. Go to **Reports** → **Analytics Tools** → **Attribution**
2. View which marketing channels drive the most orders
3. Filter by UTM parameters to see campaign performance

### Deal Pipeline Report
1. Go to **Reports** → **Reports**
2. Select **Deal** reports
3. View order funnel and conversion rates

## Troubleshooting

### Integration Not Working

1. **Check API Key**
   ```bash
   # In backend folder
   echo $HUBSPOT_API_KEY
   ```
   - Should show your access token
   - If empty, add it to `.env` file

2. **Check Server Logs**
   ```bash
   # Look for HubSpot-related errors
   tail -f logs/app.log
   ```
   - Common errors:
     - "HubSpot API key not configured" → Add HUBSPOT_API_KEY to .env
     - "401 Unauthorized" → Check API key is correct
     - "403 Forbidden" → Verify scopes in Private App

3. **Verify Custom Properties**
   - Go to HubSpot Settings → Properties
   - Check that all custom properties exist
   - Property names must match exactly (case-sensitive)

### Contacts Not Syncing

1. **Check Contact Email**
   - HubSpot requires a valid email address
   - Guest checkout must include email

2. **Manual Sync**
   - Orders are synced automatically
   - If sync failed, it won't retry automatically
   - Contact support to manually trigger sync

### Deals Not Creating

1. **Verify Deal Scopes**
   - Private App must have `crm.objects.deals.write` scope

2. **Check Contact Association**
   - Deals require an associated contact
   - If contact creation failed, deal won't be created

## Data Privacy & GDPR Compliance

- **Customer Consent:** Ensure you have proper consent to send data to HubSpot
- **Privacy Policy:** Update your privacy policy to mention HubSpot integration
- **Data Retention:** Configure HubSpot data retention policies as needed
- **Right to Deletion:** Process customer deletion requests in both your system and HubSpot

## Disabling the Integration

If you need to temporarily disable HubSpot sync:

1. **Remove API Key from .env**
   ```env
   # Comment out or remove this line
   # HUBSPOT_API_KEY=your_access_token
   ```

2. **Restart Server**
   ```bash
   npm run dev
   ```

The application will continue to work normally, but won't sync to HubSpot.

## Support

For issues with:
- **HubSpot Setup:** Contact HubSpot Support or check https://knowledge.hubspot.com
- **Integration Issues:** Check server logs and ensure environment variables are set
- **Custom Requirements:** The integration can be extended in `backend/src/services/hubspotService.ts`

## Next Steps

After setup:
1. ✅ Test with a real order
2. ✅ Set up HubSpot workflows for automated follow-ups
3. ✅ Create email sequences for abandoned carts
4. ✅ Build reports for customer insights
5. ✅ Set up deal automation rules
