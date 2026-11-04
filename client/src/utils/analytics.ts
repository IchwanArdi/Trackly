/**
 * Lightweight GA4 wrapper.
 *
 * The app must keep working when no measurement ID is configured (local dev,
 * preview builds, CI). Every helper becomes a no-op in that case.
 */

type AnalyticsParams = Record<string, string | number | boolean | undefined>;

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

export function isAnalyticsEnabled() {
  return Boolean(GA_MEASUREMENT_ID);
}

export function initAnalytics() {
  if (!GA_MEASUREMENT_ID || initialized || typeof window === 'undefined') return;
  initialized = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function () {
    // GTM expects an Arguments object, not a real array. Pushing an array
    // makes gtag.js silently ignore the command.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };

  // Page views are sent manually by AnalyticsPageView so SPA navigations are
  // counted exactly once.
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });

  // Pre-rendered pages already contain the gtag script tag. Avoid loading it
  // twice while still injecting it for client-only development builds.
  if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.appendChild(script);
  }
}

export function trackEvent(name: string, params: AnalyticsParams = {}) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, params);
}

export function trackPageView(path: string, title?: string) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title ?? document.title,
  });
}
