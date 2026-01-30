import { useEffect } from 'react';

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
}

const UTM_STORAGE_KEY = 'utm_params';
const UTM_EXPIRY_DAYS = 30;

/**
 * Hook to capture and store UTM parameters from URL
 * Used for marketing attribution in HubSpot
 */
export function useUTMTracking() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const hasUTMParams = Array.from(urlParams.keys()).some(key => key.startsWith('utm_'));

    // If URL has UTM parameters, capture them
    if (hasUTMParams) {
      const utmParams: UTMParams = {
        utm_source: urlParams.get('utm_source') || undefined,
        utm_medium: urlParams.get('utm_medium') || undefined,
        utm_campaign: urlParams.get('utm_campaign') || undefined,
        utm_term: urlParams.get('utm_term') || undefined,
        utm_content: urlParams.get('utm_content') || undefined,
        referrer: document.referrer || undefined,
        landing_page: window.location.href
      };

      // Store with expiry timestamp
      const data = {
        params: utmParams,
        timestamp: new Date().getTime(),
        expiresAt: new Date().getTime() + (UTM_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
      };

      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(data));
    }
  }, []);

  return null;
}

/**
 * Get stored UTM parameters (if not expired)
 */
export function getStoredUTMParams(): UTMParams | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    const now = new Date().getTime();

    // Check if expired
    if (data.expiresAt && data.expiresAt < now) {
      localStorage.removeItem(UTM_STORAGE_KEY);
      return null;
    }

    return data.params;
  } catch (error) {
    console.error('Error reading UTM params:', error);
    return null;
  }
}

/**
 * Clear stored UTM parameters
 */
export function clearUTMParams(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(UTM_STORAGE_KEY);
}
