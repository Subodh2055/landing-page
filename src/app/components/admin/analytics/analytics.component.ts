import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, interval, takeUntil } from 'rxjs';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
  aovGrowth: number;
}

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface TopProduct {
  name: string;
  category: string;
  sales: number;
  revenue: number;
  growth: number;
}

interface CategorySale {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

interface Demographic {
  label: string;
  value: number;
  percentage: number;
}

interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
}

interface Activity {
  type: string;
  icon: string;
  message: string;
  time: string;
}

interface Insight {
  type: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  analyticsData: AnalyticsData = {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    customerGrowth: 0,
    aovGrowth: 0
  };

  selectedTimeRange = '30';
  revenueChartData: ChartData[] = [];
  ordersChartData: ChartData[] = [];
  customerChartData: ChartData[] = [];
  customerChartPoints = '';
  maxRevenue = 0;
  maxOrders = 0;
  topProducts: TopProduct[] = [];
  categorySales: CategorySale[] = [];
  customerDemographics: Demographic[] = [];
  conversionFunnel: FunnelStage[] = [];
  realtimeActivities: Activity[] = [];
  quickInsights: Insight[] = [];

  Math = Math; // Make Math available in template
  private destroy$ = new Subject<void>();

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
    this.startRealtimeUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAnalyticsData(): void {
    this.generateMockData();
    this.calculateChartPoints();
    this.toastr.success('Analytics data loaded successfully!');
  }

  private generateMockData(): void {
    // Generate mock analytics data
    this.analyticsData = {
      totalRevenue: 125000,
      totalOrders: 1250,
      totalCustomers: 850,
      avgOrderValue: 100.00,
      revenueGrowth: 15.5,
      orderGrowth: 12.3,
      customerGrowth: 8.7,
      aovGrowth: 2.9
    };

    // Generate chart data for the last 7 days
    const dates = this.getLastNDays(7);
    this.revenueChartData = dates.map(date => ({
      date: date,
      revenue: Math.floor(Math.random() * 20000) + 5000,
      orders: Math.floor(Math.random() * 200) + 50,
      customers: Math.floor(Math.random() * 100) + 20
    }));

    this.ordersChartData = this.revenueChartData.map(data => ({
      date: data.date,
      revenue: data.revenue,
      orders: data.orders,
      customers: data.customers
    }));

    this.customerChartData = this.revenueChartData.map(data => ({
      date: data.date,
      revenue: data.revenue,
      orders: data.orders,
      customers: data.customers
    }));

    // Calculate max values for chart scaling
    this.maxRevenue = Math.max(...this.revenueChartData.map(d => d.revenue));
    this.maxOrders = Math.max(...this.ordersChartData.map(d => d.orders));

    // Generate top products
    this.topProducts = [
      {
        name: 'Wireless Headphones',
        category: 'Electronics',
        sales: 245,
        revenue: 24455,
        growth: 12.5
      },
      {
        name: 'Smart Watch',
        category: 'Electronics',
        sales: 189,
        revenue: 37789,
        growth: 8.3
      },
      {
        name: 'Running Shoes',
        category: 'Sports',
        sales: 156,
        revenue: 12444,
        growth: -2.1
      },
      {
        name: 'Coffee Maker',
        category: 'Home & Garden',
        sales: 134,
        revenue: 10720,
        growth: 15.7
      },
      {
        name: 'Yoga Mat',
        category: 'Sports',
        sales: 98,
        revenue: 2940,
        growth: 22.4
      }
    ];

    // Generate category sales
    this.categorySales = [
      { name: 'Electronics', amount: 62244, percentage: 49.8, color: '#667eea' },
      { name: 'Sports', amount: 15384, percentage: 12.3, color: '#11998e' },
      { name: 'Home & Garden', amount: 10720, percentage: 8.6, color: '#f093fb' },
      { name: 'Fashion', amount: 8960, percentage: 7.2, color: '#4facfe' },
      { name: 'Books', amount: 6692, percentage: 5.4, color: '#ffd700' }
    ];

    // Generate customer demographics
    this.customerDemographics = [
      { label: '18-24 years', value: 156, percentage: 18.4 },
      { label: '25-34 years', value: 289, percentage: 34.0 },
      { label: '35-44 years', value: 204, percentage: 24.0 },
      { label: '45-54 years', value: 136, percentage: 16.0 },
      { label: '55+ years', value: 65, percentage: 7.6 }
    ];

    // Generate conversion funnel
    this.conversionFunnel = [
      { name: 'Website Visitors', count: 10000, percentage: 100 },
      { name: 'Product Views', count: 3500, percentage: 35 },
      { name: 'Add to Cart', count: 1750, percentage: 17.5 },
      { name: 'Checkout Started', count: 1400, percentage: 14 },
      { name: 'Orders Completed', count: 1250, percentage: 12.5 }
    ];

    // Generate real-time activities
    this.realtimeActivities = [
      {
        type: 'order',
        icon: 'fas fa-shopping-cart',
        message: 'New order #ORD-2024-001 received',
        time: '2 minutes ago'
      },
      {
        type: 'user',
        icon: 'fas fa-user-plus',
        message: 'New customer registered',
        time: '5 minutes ago'
      },
      {
        type: 'product',
        icon: 'fas fa-box',
        message: 'Product "Smart Watch" stock updated',
        time: '8 minutes ago'
      },
      {
        type: 'review',
        icon: 'fas fa-star',
        message: 'New 5-star review for "Wireless Headphones"',
        time: '12 minutes ago'
      }
    ];

    // Generate quick insights
    this.quickInsights = [
      {
        type: 'success',
        icon: 'fas fa-arrow-up',
        title: 'Revenue Growth',
        description: 'Revenue increased by 15.5% compared to last period'
      },
      {
        type: 'warning',
        icon: 'fas fa-exclamation-triangle',
        title: 'Low Stock Alert',
        description: '3 products are running low on inventory'
      },
      {
        type: 'info',
        icon: 'fas fa-chart-line',
        title: 'Trend Analysis',
        description: 'Electronics category shows strongest growth'
      }
    ];
  }

  private getLastNDays(n: number): string[] {
    const dates: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return dates;
  }

  private calculateChartPoints(): void {
    const points = this.customerChartData.map((data, index) => {
      const x = (index / (this.customerChartData.length - 1)) * 100;
      const y = 200 - ((data.customers / Math.max(...this.customerChartData.map(d => d.customers))) * 180);
      return `${x},${y}`;
    }).join(' ');
    this.customerChartPoints = points;
  }

  private startRealtimeUpdates(): void {
    // Simulate real-time updates every 30 seconds
    interval(30000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.addRealtimeActivity();
    });
  }

  private addRealtimeActivity(): void {
    const activities = [
      {
        type: 'order',
        icon: 'fas fa-shopping-cart',
        message: 'New order received',
        time: 'Just now'
      },
      {
        type: 'user',
        icon: 'fas fa-user-plus',
        message: 'New customer registered',
        time: 'Just now'
      },
      {
        type: 'product',
        icon: 'fas fa-box',
        message: 'Product stock updated',
        time: 'Just now'
      }
    ];

    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    this.realtimeActivities.unshift(randomActivity);

    // Keep only last 10 activities
    if (this.realtimeActivities.length > 10) {
      this.realtimeActivities = this.realtimeActivities.slice(0, 10);
    }
  }

  onTimeRangeChange(): void {
    this.loadAnalyticsData();
    this.toastr.info(`Analytics updated for last ${this.selectedTimeRange} days`);
  }

  refreshAnalytics(): void {
    this.loadAnalyticsData();
    this.toastr.success('Analytics refreshed successfully!');
  }

  exportAnalytics(): void {
    const data = {
      analyticsData: this.analyticsData,
      chartData: this.revenueChartData,
      topProducts: this.topProducts,
      categorySales: this.categorySales,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.toastr.success('Analytics report exported successfully!');
  }

  toggleChartType(chartType: string): void {
    this.toastr.info(`${chartType} chart type toggled`);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
