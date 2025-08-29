export class AnalyticsData {
  constructor(
    public id: string,
    public period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    public startDate: Date,
    public endDate: Date,
    public revenue: number,
    public orders: number,
    public customers: number,
    public products: number,
    public averageOrderValue: number,
    public conversionRate: number,
    public topProducts: TopProduct[] = [],
    public topCategories: TopCategory[] = [],
    public salesByDay: SalesByDay[] = [],
    public customerMetrics: CustomerMetrics,
    public createdAt: Date = new Date()
  ) {}

  getFormattedRevenue(): string {
    return `NPR ${this.revenue.toFixed(2)}`;
  }

  getFormattedAverageOrderValue(): string {
    return `NPR ${this.averageOrderValue.toFixed(2)}`;
  }

  getFormattedConversionRate(): string {
    return `${this.conversionRate.toFixed(2)}%`;
  }

  getRevenueGrowth(previousPeriod: AnalyticsData): number {
    if (previousPeriod.revenue === 0) return 0;
    return ((this.revenue - previousPeriod.revenue) / previousPeriod.revenue) * 100;
  }

  getFormattedRevenueGrowth(previousPeriod: AnalyticsData): string {
    const growth = this.getRevenueGrowth(previousPeriod);
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(2)}%`;
  }

  getRevenueGrowthColor(previousPeriod: AnalyticsData): string {
    const growth = this.getRevenueGrowth(previousPeriod);
    return growth >= 0 ? '#27ae60' : '#e74c3c';
  }

  toJson(): any {
    return {
      id: this.id,
      period: this.period,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      revenue: this.revenue,
      orders: this.orders,
      customers: this.customers,
      products: this.products,
      averageOrderValue: this.averageOrderValue,
      conversionRate: this.conversionRate,
      topProducts: this.topProducts.map(product => product.toJson()),
      topCategories: this.topCategories.map(category => category.toJson()),
      salesByDay: this.salesByDay.map(sale => sale.toJson()),
      customerMetrics: this.customerMetrics.toJson(),
      createdAt: this.createdAt.toISOString()
    };
  }

  static fromJson(json: any): AnalyticsData {
    return new AnalyticsData(
      json.id,
      json.period,
      new Date(json.startDate),
      new Date(json.endDate),
      json.revenue,
      json.orders,
      json.customers,
      json.products,
      json.averageOrderValue,
      json.conversionRate,
      json.topProducts?.map((product: any) => TopProduct.fromJson(product)) || [],
      json.topCategories?.map((category: any) => TopCategory.fromJson(category)) || [],
      json.salesByDay?.map((sale: any) => SalesByDay.fromJson(sale)) || [],
      CustomerMetrics.fromJson(json.customerMetrics),
      new Date(json.createdAt)
    );
  }
}

export class TopProduct {
  constructor(
    public productId: number,
    public productName: string,
    public category: string,
    public sales: number,
    public revenue: number,
    public unitsSold: number,
    public averageRating: number
  ) {}

  getFormattedRevenue(): string {
    return `NPR ${this.revenue.toFixed(2)}`;
  }

  getFormattedSales(): string {
    return `NPR ${this.sales.toFixed(2)}`;
  }

  getFormattedRating(): string {
    return this.averageRating.toFixed(1);
  }

  toJson(): any {
    return {
      productId: this.productId,
      productName: this.productName,
      category: this.category,
      sales: this.sales,
      revenue: this.revenue,
      unitsSold: this.unitsSold,
      averageRating: this.averageRating
    };
  }

  static fromJson(json: any): TopProduct {
    return new TopProduct(
      json.productId,
      json.productName,
      json.category,
      json.sales,
      json.revenue,
      json.unitsSold,
      json.averageRating
    );
  }
}

export class TopCategory {
  constructor(
    public categoryName: string,
    public sales: number,
    public revenue: number,
    public orders: number,
    public products: number
  ) {}

  getFormattedRevenue(): string {
    return `NPR ${this.revenue.toFixed(2)}`;
  }

  getFormattedSales(): string {
    return `NPR ${this.sales.toFixed(2)}`;
  }

  toJson(): any {
    return {
      categoryName: this.categoryName,
      sales: this.sales,
      revenue: this.revenue,
      orders: this.orders,
      products: this.products
    };
  }

  static fromJson(json: any): TopCategory {
    return new TopCategory(
      json.categoryName,
      json.sales,
      json.revenue,
      json.orders,
      json.products
    );
  }
}

export class SalesByDay {
  constructor(
    public date: Date,
    public revenue: number,
    public orders: number,
    public customers: number
  ) {}

  getFormattedRevenue(): string {
    return `NPR ${this.revenue.toFixed(2)}`;
  }

  getFormattedDate(): string {
    return this.date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  toJson(): any {
    return {
      date: this.date.toISOString(),
      revenue: this.revenue,
      orders: this.orders,
      customers: this.customers
    };
  }

  static fromJson(json: any): SalesByDay {
    return new SalesByDay(
      new Date(json.date),
      json.revenue,
      json.orders,
      json.customers
    );
  }
}

export class CustomerMetrics {
  constructor(
    public totalCustomers: number,
    public newCustomers: number,
    public returningCustomers: number,
    public averageCustomerLifetimeValue: number,
    public customerRetentionRate: number,
    public averageOrderFrequency: number
  ) {}

  getFormattedLifetimeValue(): string {
    return `NPR ${this.averageCustomerLifetimeValue.toFixed(2)}`;
  }

  getFormattedRetentionRate(): string {
    return `${this.customerRetentionRate.toFixed(2)}%`;
  }

  getFormattedOrderFrequency(): string {
    return this.averageOrderFrequency.toFixed(1);
  }

  toJson(): any {
    return {
      totalCustomers: this.totalCustomers,
      newCustomers: this.newCustomers,
      returningCustomers: this.returningCustomers,
      averageCustomerLifetimeValue: this.averageCustomerLifetimeValue,
      customerRetentionRate: this.customerRetentionRate,
      averageOrderFrequency: this.averageOrderFrequency
    };
  }

  static fromJson(json: any): CustomerMetrics {
    return new CustomerMetrics(
      json.totalCustomers,
      json.newCustomers,
      json.returningCustomers,
      json.averageCustomerLifetimeValue,
      json.customerRetentionRate,
      json.averageOrderFrequency
    );
  }
}

export class DashboardStats {
  constructor(
    public totalRevenue: number,
    public totalOrders: number,
    public totalCustomers: number,
    public totalProducts: number,
    public averageOrderValue: number,
    public conversionRate: number,
    public revenueGrowth: number,
    public orderGrowth: number,
    public customerGrowth: number,
    public productGrowth: number
  ) {}

  getFormattedTotalRevenue(): string {
    return `NPR ${this.totalRevenue.toFixed(2)}`;
  }

  getFormattedAverageOrderValue(): string {
    return `NPR ${this.averageOrderValue.toFixed(2)}`;
  }

  getFormattedConversionRate(): string {
    return `${this.conversionRate.toFixed(2)}%`;
  }

  getFormattedGrowth(metric: 'revenue' | 'orders' | 'customers' | 'products'): string {
    let growth: number;
    switch (metric) {
      case 'revenue': growth = this.revenueGrowth; break;
      case 'orders': growth = this.orderGrowth; break;
      case 'customers': growth = this.customerGrowth; break;
      case 'products': growth = this.productGrowth; break;
      default: growth = 0;
    }
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(2)}%`;
  }

  getGrowthColor(metric: 'revenue' | 'orders' | 'customers' | 'products'): string {
    let growth: number;
    switch (metric) {
      case 'revenue': growth = this.revenueGrowth; break;
      case 'orders': growth = this.orderGrowth; break;
      case 'customers': growth = this.customerGrowth; break;
      case 'products': growth = this.productGrowth; break;
      default: growth = 0;
    }
    return growth >= 0 ? '#27ae60' : '#e74c3c';
  }

  toJson(): any {
    return {
      totalRevenue: this.totalRevenue,
      totalOrders: this.totalOrders,
      totalCustomers: this.totalCustomers,
      totalProducts: this.totalProducts,
      averageOrderValue: this.averageOrderValue,
      conversionRate: this.conversionRate,
      revenueGrowth: this.revenueGrowth,
      orderGrowth: this.orderGrowth,
      customerGrowth: this.customerGrowth,
      productGrowth: this.productGrowth
    };
  }

  static fromJson(json: any): DashboardStats {
    return new DashboardStats(
      json.totalRevenue,
      json.totalOrders,
      json.totalCustomers,
      json.totalProducts,
      json.averageOrderValue,
      json.conversionRate,
      json.revenueGrowth,
      json.orderGrowth,
      json.customerGrowth,
      json.productGrowth
    );
  }
}
