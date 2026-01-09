import { TrafficUsage } from '../models/traffic-usage.model';

/**
 * Column mapping for Traffic Usage Excel export
 * Maps TrafficUsage model keys to translation keys
 */
export const TRAFFIC_USAGE_EXCEL_MAPPING: Record<keyof TrafficUsage, string> = {
  country: 'analytics.reports.trafficUsage.country',
  company: 'analytics.reports.trafficUsage.company',
  usageMb: 'analytics.reports.trafficUsage.usageMb',
  totalCost: 'analytics.reports.trafficUsage.totalCost',
  costPerMb: 'analytics.reports.trafficUsage.costPerMb'
};
