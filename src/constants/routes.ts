export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  DASHBOARD: {
    HOME: '/dashboard',
    MAP: '/map',
    REPORTS: '/reports',
    HOTSPOTS: '/hotspots',
    PREDICTIONS: '/predictions',
    LEADERBOARD: '/leaderboard',
    ALERTS: '/alerts',
  },
  MUNICIPAL: {
    REVIEW: '/review',
    DISPATCH: '/dispatch',
    DEPLOYMENTS: '/deployments',
    ANALYTICS: '/analytics',
  },
} as const;
