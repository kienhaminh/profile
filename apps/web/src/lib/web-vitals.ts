import type { Metric } from 'web-vitals';
import { logger } from './logger';

/**
 * Reports web vitals metrics
 */
export function reportWebVitals(metric: Metric): void {
  // Log the metric
  logger.info('Web vital metric', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  });

  // You can also send metrics to an analytics endpoint
  // Example: sendToAnalytics(metric);
}
