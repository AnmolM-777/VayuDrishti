import { ROUTES } from '@/constants/routes';

export interface NavItem {
  readonly title: string;
  readonly href: string;
  readonly iconName: string;
  readonly description: string;
}

export const CITIZEN_NAV_ITEMS: readonly NavItem[] = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD.HOME,
    iconName: 'LayoutDashboard',
    description: 'Overview of air quality and activity',
  },
  {
    title: 'Pollution Map',
    href: ROUTES.DASHBOARD.MAP,
    iconName: 'Map',
    description: 'Live pollution map with sensor data',
  },
  {
    title: 'Reports',
    href: ROUTES.DASHBOARD.REPORTS,
    iconName: 'FileText',
    description: 'Submit and track pollution reports',
  },
  {
    title: 'Hotspots',
    href: ROUTES.DASHBOARD.HOTSPOTS,
    iconName: 'Flame',
    description: 'AI-detected pollution hotspots',
  },
  {
    title: 'Predictions',
    href: ROUTES.DASHBOARD.PREDICTIONS,
    iconName: 'TrendingUp',
    description: '24-hour AQI predictions',
  },
  {
    title: 'Leaderboard',
    href: ROUTES.DASHBOARD.LEADERBOARD,
    iconName: 'Trophy',
    description: 'Community trust scores',
  },
  {
    title: 'Alerts',
    href: ROUTES.DASHBOARD.ALERTS,
    iconName: 'Bell',
    description: 'Pollution and air quality alerts',
  },
] as const;

export const MUNICIPAL_NAV_ITEMS: readonly NavItem[] = [
  {
    title: 'Review Reports',
    href: ROUTES.MUNICIPAL.REVIEW,
    iconName: 'ClipboardCheck',
    description: 'Review citizen pollution reports',
  },
  {
    title: 'Dispatch',
    href: ROUTES.MUNICIPAL.DISPATCH,
    iconName: 'Truck',
    description: 'Dispatch cleanup resources',
  },
  {
    title: 'Deployments',
    href: ROUTES.MUNICIPAL.DEPLOYMENTS,
    iconName: 'Radio',
    description: 'Track active deployments',
  },
  {
    title: 'Analytics',
    href: ROUTES.MUNICIPAL.ANALYTICS,
    iconName: 'BarChart3',
    description: 'Pollution analytics dashboard',
  },
] as const;
