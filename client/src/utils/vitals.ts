import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { trackEvent } from './analytics';

function reportMetric(metric: Metric) {
  trackEvent('web_vitals', {
    metric_name: metric.name,
    metric_value: Math.round(metric.value * 1000) / 1000,
    metric_rating: metric.rating,
    metric_id: metric.id,
  });
}

/**
 * Sends real-user Core Web Vitals to GA4. No-op when analytics is disabled.
 */
export function initWebVitals() {
  if (typeof window === 'undefined') return;

  onCLS(reportMetric);
  onFCP(reportMetric);
  onINP(reportMetric);
  onLCP(reportMetric);
  onTTFB(reportMetric);
}
