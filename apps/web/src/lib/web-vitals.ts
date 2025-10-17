'use client';

import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';

function sendToAnalytics(metric: Metric): void {
  // Send to Google Analytics
  trackEvent('web_vitals', {
    event_category: 'Web Vitals',
    event_label: metric.name,
    value: Math.round(
      metric.name === 'CLS' ? metric.value * 1000 : metric.value
    ),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
  });

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric.name, metric.value);
  }
}

let initialized = false;

export function reportWebVitals(): void {
  if (initialized) return;
  initialized = true;

  try {
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onINP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  } catch (error) {
    console.error('Failed to report web vitals:', error);
  }
}

// Performance budgets (in milliseconds)
export const PERFORMANCE_BUDGETS = {
  LCP: 2500, // Largest Contentful Paint - should be under 2.5s
  INP: 200, // Interaction to Next Paint - should be under 200ms
  CLS: 0.1, // Cumulative Layout Shift - should be under 0.1
  FCP: 1800, // First Contentful Paint - should be under 1.8s
  TTFB: 800, // Time to First Byte - should be under 800ms
} as const;
