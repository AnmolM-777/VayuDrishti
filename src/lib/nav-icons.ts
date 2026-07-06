import {
  LayoutDashboard,
  Map,
  FileText,
  Flame,
  TrendingUp,
  Trophy,
  Bell,
  ClipboardCheck,
  Truck,
  Radio,
  BarChart3,
  Package,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const NAV_ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Map,
  FileText,
  Flame,
  TrendingUp,
  Trophy,
  Bell,
  ClipboardCheck,
  Truck,
  Radio,
  BarChart3,
};

export function resolveNavIcon(iconName: string): LucideIcon {
  return NAV_ICON_MAP[iconName] ?? Package;
}
