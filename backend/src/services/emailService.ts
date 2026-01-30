import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderConfirmationEmail {
    to: string;
    orderNumber: string;
    customerName: string;
    orderItems: Array<{
        productName: string;
        quantity: number;
        price: number;
    }>;
    subtotal: number;
    discountAmount?: number;
    voucherCode?: string;
    finalSubtotal?: number;
    deliveryFee: number;
    total: number;
    deliveryAddress: any;
    deliverySlot: {
        date: Date;
        startTime: string;
        endTime: string;
    };
}

interface SubstitutionEmail {
    to: string;
    orderNumber: string;
    customerName: string;
    originalProduct: string;
    substitutionProduct: string;
    acceptUrl: string;
    refundUrl: string;
}

export class EmailService {
    private fromEmail = process.env.FROM_EMAIL || 'orders@olayemi.com';

    async sendOrderConfirmation(data: OrderConfirmationEmail) {
        try {
            await resend.emails.send({
                from: this.fromEmail,
                to: data.to,
                subject: `Order Confirmation - ${data.orderNumber}`,
                html: this.generateOrderConfirmationHTML(data)
            });
        } catch (error) {
            console.error('Failed to send order confirmation email:', error);
            throw error;
        }
    }

    async sendOrderPacked(to: string, orderNumber: string, customerName: string) {
        try {
            await resend.emails.send({
                from: this.fromEmail,
                to,
                subject: `Your Order is Being Packed - ${orderNumber}`,
                html: `
                    <h1>Hi ${customerName},</h1>
                    <p>Great news! Your order ${orderNumber} is currently being packed and prepared for delivery.</p>
                    <p>We'll send you another update when your order is out for delivery.</p>
                    <p>Thank you for shopping with Olayemi!</p>
                `
            });
        } catch (error) {
            console.error('Failed to send order packed email:', error);
        }
    }

    async sendOutForDelivery(to: string, orderNumber: string, customerName: string, deliverySlot: { date: Date; startTime: string; endTime: string }) {
        try {
            await resend.emails.send({
                from: this.fromEmail,
                to,
                subject: `Your Order is Out for Delivery - ${orderNumber}`,
                html: `
                    <h1>Hi ${customerName},</h1>
                    <p>Your order ${orderNumber} is on its way!</p>
                    <p><strong>Expected Delivery:</strong> ${deliverySlot.date.toLocaleDateString()} between ${deliverySlot.startTime} - ${deliverySlot.endTime}</p>
                    <p>Please ensure someone is available to receive your frozen goods.</p>
                    <p><strong>Important:</strong> All frozen items must be stored immediately upon delivery to maintain freshness.</p>
                    <p>Thank you for shopping with Olayemi!</p>
                `
            });
        } catch (error) {
            console.error('Failed to send out for delivery email:', error);
        }
    }

    async sendDeliveryFailed(to: string, orderNumber: string, customerName: string, reason: string) {
        try {
            await resend.emails.send({
                from: this.fromEmail,
                to,
                subject: `Delivery Attempt Failed - ${orderNumber}`,
                html: `
                    <h1>Hi ${customerName},</h1>
                    <p>We attempted to deliver your order ${orderNumber} but were unable to complete the delivery.</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <p>Please contact our customer service team to reschedule your delivery.</p>
                    <p>We apologize for any inconvenience.</p>
                `
            });
        } catch (error) {
            console.error('Failed to send delivery failed email:', error);
        }
    }

    async sendSubstitutionAlert(data: SubstitutionEmail) {
        try {
            await resend.emails.send({
                from: this.fromEmail,
                to: data.to,
                subject: `Product Substitution Required - ${data.orderNumber}`,
                html: `
                    <h1>Hi ${data.customerName},</h1>
                    <p>We're preparing your order ${data.orderNumber}, but unfortunately "${data.originalProduct}" is currently out of stock.</p>
                    <p>We'd like to offer you a substitution: <strong>${data.substitutionProduct}</strong></p>

                    <h3>What would you like to do?</h3>
                    <p>
                        <a href="${data.acceptUrl}" style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 6px; margin-right: 10px;">
                            Accept Substitution
                        </a>
                        <a href="${data.refundUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px;">
                            Request Refund
                        </a>
                    </p>

                    <p>Please respond within 24 hours to avoid delays in your delivery.</p>
                    <p>Thank you for your understanding!</p>
                `
            });
        } catch (error) {
            console.error('Failed to send substitution alert email:', error);
        }
    }

    async sendRefundProcessed(to: string, orderNumber: string, customerName: string, amount: number) {
        try {
            await resend.emails.send({
                from: this.fromEmail,
                to,
                subject: `Refund Processed - ${orderNumber}`,
                html: `
                    <h1>Hi ${customerName},</h1>
                    <p>Your refund for order ${orderNumber} has been processed.</p>
                    <p><strong>Refund Amount:</strong> £${amount.toFixed(2)}</p>
                    <p>The refund will appear in your account within 5-10 business days.</p>
                    <p>Thank you for shopping with Olayemi!</p>
                `
            });
        } catch (error) {
            console.error('Failed to send refund processed email:', error);
        }
    }

    async sendAdminAlert(params: {
        to: string;
        subject: string;
        orderNumber: string;
        itemId: string;
        itemName: string;
        refundAmount: number;
        error: string;
    }) {
        try {
            await resend.emails.send({
                from: this.fromEmail,
                to: params.to,
                subject: params.subject,
                html: `
                    <div style="background-color: #fee; padding: 20px; border-left: 4px solid #dc2626;">
                        <h1 style="color: #dc2626; margin-top: 0;">⚠️ URGENT: Refund Processing Failed</h1>

                        <p><strong>Order Number:</strong> ${params.orderNumber}</p>
                        <p><strong>Item ID:</strong> ${params.itemId}</p>
                        <p><strong>Item Name:</strong> ${params.itemName}</p>
                        <p><strong>Refund Amount:</strong> £${params.refundAmount.toFixed(2)}</p>

                        <h3 style="color: #dc2626;">Error Details:</h3>
                        <p style="background-color: #fff; padding: 10px; border: 1px solid #ddd; font-family: monospace;">
                            ${params.error}
                        </p>

                        <h3>Required Action:</h3>
                        <ol>
                            <li>Log into Stripe Dashboard</li>
                            <li>Manually process refund of £${params.refundAmount.toFixed(2)} for order ${params.orderNumber}</li>
                            <li>Update order item status in database</li>
                            <li>Notify customer via email</li>
                        </ol>

                        <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
                            This is an automated alert from Tanti Foods E-commerce System.
                        </p>
                    </div>
                `
            });
        } catch (error) {
            console.error('Failed to send admin alert email:', error);
            throw error;
        }
    }

    private generateOrderConfirmationHTML(data: OrderConfirmationEmail): string {
        const itemsHTML = data.orderItems.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">£${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Order Confirmation</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0;">Order Confirmation</h1>
                </div>

                <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 18px;">Hi ${data.customerName},</p>
                    <p>Thank you for your order! We've received your order and will start preparing it soon.</p>

                    <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h2 style="margin-top: 0; color: #16a34a;">Order Details</h2>
                        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
                        <p><strong>Delivery Date:</strong> ${data.deliverySlot.date.toLocaleDateString()}</p>
                        <p><strong>Delivery Time:</strong> ${data.deliverySlot.startTime} - ${data.deliverySlot.endTime}</p>

                        <h3>Delivery Address:</h3>
                        <p>
                            ${data.deliveryAddress.addressLine1}<br>
                            ${data.deliveryAddress.addressLine2 ? data.deliveryAddress.addressLine2 + '<br>' : ''}
                            ${data.deliveryAddress.city}<br>
                            ${data.deliveryAddress.postcode}
                        </p>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 6px; overflow: hidden;">
                        <thead>
                            <tr style="background-color: #f3f4f6;">
                                <th style="padding: 10px; text-align: left;">Product</th>
                                <th style="padding: 10px; text-align: center;">Quantity</th>
                                <th style="padding: 10px; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
                                <td style="padding: 10px; text-align: right;">£${data.subtotal.toFixed(2)}</td>
                            </tr>
                            ${data.discountAmount && data.discountAmount > 0 ? `
                            <tr>
                                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; color: #16a34a;">Discount (${data.voucherCode}):</td>
                                <td style="padding: 10px; text-align: right; color: #16a34a;">-£${data.discountAmount.toFixed(2)}</td>
                            </tr>
                            ` : ''}
                            <tr>
                                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Delivery Fee:</td>
                                <td style="padding: 10px; text-align: right;">£${data.deliveryFee.toFixed(2)}</td>
                            </tr>
                            <tr style="background-color: #f3f4f6;">
                                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px;">Total:</td>
                                <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px;">£${data.total.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                        <p style="margin: 0;"><strong>Important:</strong> Our frozen products must be stored immediately upon delivery to maintain quality and freshness.</p>
                    </div>

                    <p style="margin-top: 30px;">We'll send you updates as your order is packed and dispatched.</p>
                    <p>Thank you for shopping with Olayemi!</p>
                </div>

                <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                    <p>This is an automated email. Please do not reply to this message.</p>
                    <p>&copy; ${new Date().getFullYear()} Olayemi. All rights reserved.</p>
                </div>

                <!-- Email tracking pixel for HubSpot engagement -->
                <img src="${process.env.FRONTEND_URL}/api/email-tracking/open?email=${encodeURIComponent(data.to)}&type=order_confirmation" width="1" height="1" style="display:none" alt="" />
            </body>
            </html>
        `;
    }
}

export const emailService = new EmailService();
