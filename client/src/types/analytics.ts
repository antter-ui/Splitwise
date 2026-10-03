export interface CategoryBreakdown {
  category: string;
  totalAmount: number;
  count: number;
  percentage: number;
}

export interface ActivityItem {
  id: string;
  type: 'expense' | 'settlement';
  title: string;
  subtitle: string;
  amount: number;
  currency: string;
  actor: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface GroupAnalyticsResponse {
  totalSpent: number;
  categoryBreakdown: CategoryBreakdown[];
  recentActivities: ActivityItem[];
}
