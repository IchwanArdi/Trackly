import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

/**
 * Sends one GA4 page_view per SPA navigation. The timeout lets Unhead update
 * the document title first, so the event carries the right page title.
 *
 * Only the pathname is sent. The query string is deliberately excluded because
 * it can contain OAuth codes, email addresses, or other sensitive values.
 */
export function AnalyticsPageView() {
  const location = useLocation();

  useEffect(() => {
    const id = window.setTimeout(() => {
      trackPageView(location.pathname, document.title);
    }, 0);

    return () => window.clearTimeout(id);
  }, [location.pathname]);

  return null;
}
