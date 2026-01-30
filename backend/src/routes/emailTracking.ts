import { Router, Request, Response } from 'express';
import { hubspotService } from '../services/hubspotService';

const router = Router();

// Track email opens (1x1 transparent pixel)
router.get('/open', async (req: Request, res: Response) => {
    const { email, type } = req.query;

    if (email && typeof email === 'string') {
        // Track asynchronously, don't wait
        hubspotService.trackEmailEngagement({
            email,
            eventType: 'OPEN',
            emailSubject: type === 'order_confirmation' ? 'Order Confirmation' : 'Email Notification'
        }).catch(err => {
            console.error('Failed to track email open:', err);
        });
    }

    // Return 1x1 transparent GIF
    const transparentGif = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
    );

    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': transparentGif.length,
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    res.end(transparentGif);
});

// Track email clicks (redirect to actual link)
router.get('/click', async (req: Request, res: Response) => {
    const { email, url } = req.query;

    if (email && typeof email === 'string') {
        // Track asynchronously
        hubspotService.trackEmailEngagement({
            email,
            eventType: 'CLICK',
            emailSubject: 'Email Link Clicked'
        }).catch(err => {
            console.error('Failed to track email click:', err);
        });
    }

    // Redirect to the actual URL
    if (url && typeof url === 'string') {
        res.redirect(url);
    } else {
        res.status(400).send('Missing URL parameter');
    }
});

export default router;
