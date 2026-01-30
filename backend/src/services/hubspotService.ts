import axios from 'axios';
import prisma from '../prisma';

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const HUBSPOT_API_URL = 'https://api.hubapi.com';

interface HubSpotContact {
  properties: {
    email: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    hs_lead_status?: string;
    lifecyclestage?: string;
    // UTM parameters
    hs_analytics_source?: string;
    hs_analytics_source_data_1?: string;
    hs_analytics_source_data_2?: string;
    utm_campaign?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_term?: string;
    utm_content?: string;
    // Custom properties
    first_order_date?: string;
    total_orders?: string;
    total_revenue?: string;
    average_order_value?: string;
    last_order_date?: string;
  };
}

interface HubSpotDeal {
  properties: {
    dealname: string;
    amount: string;
    dealstage: string;
    pipeline: string;
    closedate?: string;
    order_number?: string;
    order_status?: string;
  };
}

export class HubSpotService {
  private apiKey: string | undefined;
  private headers: Record<string, string>;

  constructor() {
    this.apiKey = HUBSPOT_API_KEY;
    this.headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` })
    };
  }

  private isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Create or update a contact in HubSpot
   */
  async syncContact(params: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    postcode?: string;
    userId?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
    referrer?: string;
    landingPage?: string;
  }): Promise<string | null> {
    if (!this.isConfigured()) {
      console.warn('HubSpot API key not configured. Skipping contact sync.');
      return null;
    }

    try {
      const contactData: HubSpotContact = {
        properties: {
          email: params.email,
          ...(params.firstName && { firstname: params.firstName }),
          ...(params.lastName && { lastname: params.lastName }),
          ...(params.phone && { phone: params.phone }),
          ...(params.address && { address: params.address }),
          ...(params.city && { city: params.city }),
          ...(params.postcode && { zip: params.postcode }),
          ...(params.utmSource && { utm_source: params.utmSource }),
          ...(params.utmMedium && { utm_medium: params.utmMedium }),
          ...(params.utmCampaign && { utm_campaign: params.utmCampaign }),
          ...(params.utmTerm && { utm_term: params.utmTerm }),
          ...(params.utmContent && { utm_content: params.utmContent }),
          lifecyclestage: 'customer'
        }
      };

      // Try to create or update contact
      const response = await axios.post(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts`,
        contactData,
        { headers: this.headers }
      ).catch(async (error) => {
        // If contact exists, update it
        if (error.response?.status === 409) {
          const existingContactId = error.response.data.message.match(/Existing ID: (\d+)/)?.[1];
          if (existingContactId) {
            await axios.patch(
              `${HUBSPOT_API_URL}/crm/v3/objects/contacts/${existingContactId}`,
              contactData,
              { headers: this.headers }
            );
            return { data: { id: existingContactId } };
          }
        }
        throw error;
      });

      const hubspotId = response.data.id;

      // Save or update HubSpot contact record in database
      await prisma.hubSpotContact.upsert({
        where: params.userId
          ? { userId: params.userId }
          : { guestEmail: params.email },
        create: {
          userId: params.userId || null,
          guestEmail: params.userId ? null : params.email,
          hubspotId,
          utmSource: params.utmSource || null,
          utmMedium: params.utmMedium || null,
          utmCampaign: params.utmCampaign || null,
          utmTerm: params.utmTerm || null,
          utmContent: params.utmContent || null,
          referrer: params.referrer || null,
          landingPage: params.landingPage || null
        },
        update: {
          hubspotId,
          lastSynced: new Date(),
          utmSource: params.utmSource || undefined,
          utmMedium: params.utmMedium || undefined,
          utmCampaign: params.utmCampaign || undefined,
          utmTerm: params.utmTerm || undefined,
          utmContent: params.utmContent || undefined
        }
      });

      return hubspotId;
    } catch (error) {
      console.error('Failed to sync contact to HubSpot:', error);
      return null;
    }
  }

  /**
   * Create a deal (order) in HubSpot and associate with contact
   */
  async createDeal(params: {
    contactId: string;
    orderNumber: string;
    amount: number;
    orderStatus: string;
    deliveryDate?: Date;
  }): Promise<string | null> {
    if (!this.isConfigured()) {
      console.warn('HubSpot API key not configured. Skipping deal creation.');
      return null;
    }

    try {
      const dealData: HubSpotDeal = {
        properties: {
          dealname: `Order ${params.orderNumber}`,
          amount: params.amount.toString(),
          dealstage: this.mapOrderStatusToDealStage(params.orderStatus),
          pipeline: 'default',
          order_number: params.orderNumber,
          order_status: params.orderStatus,
          ...(params.deliveryDate && {
            closedate: params.deliveryDate.toISOString().split('T')[0]
          })
        }
      };

      const response = await axios.post(
        `${HUBSPOT_API_URL}/crm/v3/objects/deals`,
        dealData,
        { headers: this.headers }
      );

      const dealId = response.data.id;

      // Associate deal with contact
      await axios.put(
        `${HUBSPOT_API_URL}/crm/v3/objects/deals/${dealId}/associations/contacts/${params.contactId}/deal_to_contact`,
        {},
        { headers: this.headers }
      );

      return dealId;
    } catch (error) {
      console.error('Failed to create deal in HubSpot:', error);
      return null;
    }
  }

  /**
   * Update deal stage based on order status
   */
  async updateDealStage(dealId: string, orderStatus: string): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    try {
      await axios.patch(
        `${HUBSPOT_API_URL}/crm/v3/objects/deals/${dealId}`,
        {
          properties: {
            dealstage: this.mapOrderStatusToDealStage(orderStatus),
            order_status: orderStatus
          }
        },
        { headers: this.headers }
      );
    } catch (error) {
      console.error('Failed to update deal stage in HubSpot:', error);
    }
  }

  /**
   * Update contact with order statistics
   */
  async updateContactOrderStats(contactId: string, userId?: string, guestEmail?: string): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    try {
      // Get order statistics from database
      const orders = await prisma.order.findMany({
        where: userId ? { userId } : { guestEmail },
        select: {
          total: true,
          createdAt: true,
          status: true
        }
      });

      const completedOrders = orders.filter(o => o.status === 'DELIVERED');
      const totalOrders = completedOrders.length;
      const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total), 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const firstOrder = orders.length > 0 ? orders[orders.length - 1] : null;
      const lastOrder = orders.length > 0 ? orders[0] : null;

      await axios.patch(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts/${contactId}`,
        {
          properties: {
            total_orders: totalOrders.toString(),
            total_revenue: totalRevenue.toFixed(2),
            average_order_value: avgOrderValue.toFixed(2),
            ...(firstOrder && { first_order_date: firstOrder.createdAt.toISOString().split('T')[0] }),
            ...(lastOrder && { last_order_date: lastOrder.createdAt.toISOString().split('T')[0] })
          }
        },
        { headers: this.headers }
      );
    } catch (error) {
      console.error('Failed to update contact order stats in HubSpot:', error);
    }
  }

  /**
   * Track email engagement (opened, clicked)
   */
  async trackEmailEngagement(params: {
    email: string;
    eventType: 'OPEN' | 'CLICK';
    emailSubject?: string;
  }): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    try {
      // Get contact by email
      const searchResponse = await axios.post(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts/search`,
        {
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: params.email
            }]
          }]
        },
        { headers: this.headers }
      );

      if (searchResponse.data.results.length === 0) {
        return;
      }

      const contactId = searchResponse.data.results[0].id;

      // Create engagement (note/email event)
      await axios.post(
        `${HUBSPOT_API_URL}/crm/v3/objects/notes`,
        {
          properties: {
            hs_note_body: `Email ${params.eventType.toLowerCase()}: ${params.emailSubject || 'Order notification'}`,
            hs_timestamp: new Date().getTime().toString()
          },
          associations: [{
            to: { id: contactId },
            types: [{
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 202 // Note to Contact
            }]
          }]
        },
        { headers: this.headers }
      );
    } catch (error) {
      console.error('Failed to track email engagement in HubSpot:', error);
    }
  }

  /**
   * Map order status to HubSpot deal stage
   */
  private mapOrderStatusToDealStage(orderStatus: string): string {
    const stageMap: Record<string, string> = {
      'PENDING': 'qualifiedtobuy',
      'CONFIRMED': 'presentationscheduled',
      'PACKING': 'decisionmakerboughtin',
      'OUT_FOR_DELIVERY': 'contractsent',
      'DELIVERED': 'closedwon',
      'CANCELLED': 'closedlost',
      'REFUNDED': 'closedlost'
    };

    return stageMap[orderStatus] || 'qualifiedtobuy';
  }

  /**
   * Sync order to HubSpot (create contact, deal, and update stats)
   */
  async syncOrder(orderId: string): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('HubSpot not configured. Skipping order sync.');
      return;
    }

    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          deliverySlot: true
        }
      });

      if (!order) {
        return;
      }

      const deliveryAddress = order.deliveryAddress as any;
      const email = order.user?.email || order.guestEmail;

      if (!email) {
        return;
      }

      // Get or check HubSpot contact
      let hubspotContact = await prisma.hubSpotContact.findFirst({
        where: order.userId
          ? { userId: order.userId }
          : { guestEmail: order.guestEmail || undefined }
      });

      let contactId: string | null | undefined = hubspotContact?.hubspotId;

      // If no contact exists, create one
      if (!contactId) {
        contactId = await this.syncContact({
          email,
          firstName: order.user?.firstName || deliveryAddress?.firstName,
          lastName: order.user?.lastName || deliveryAddress?.lastName,
          phone: order.user?.phone || deliveryAddress?.phone,
          address: deliveryAddress?.addressLine1,
          city: deliveryAddress?.city,
          postcode: deliveryAddress?.postcode,
          userId: order.userId || undefined,
          utmSource: hubspotContact?.utmSource ?? undefined,
          utmMedium: hubspotContact?.utmMedium ?? undefined,
          utmCampaign: hubspotContact?.utmCampaign ?? undefined
        });
      }

      if (!contactId) {
        return;
      }

      // Create deal for the order
      await this.createDeal({
        contactId,
        orderNumber: order.orderNumber,
        amount: Number(order.total),
        orderStatus: order.status,
        deliveryDate: order.deliverySlot?.date
      });

      // Update contact stats
      await this.updateContactOrderStats(
        contactId,
        order.userId || undefined,
        order.guestEmail || undefined
      );
    } catch (error) {
      console.error('Failed to sync order to HubSpot:', error);
    }
  }
}

export const hubspotService = new HubSpotService();
