import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LocalStorageUtil } from '../utils/local-storage.util';

export interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeSellers: number;
  pendingApprovals: number;
  lowStockProducts: number;
  topSellingProducts: any[];
}

export interface AnalyticsData {
  salesData: any[];
  userGrowth: any[];
  productPerformance: any[];
  categoryStats: any[];
  revenueTrends: any[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin: string;
  totalOrders: number;
  totalSpent: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'pending';
  seller: string;
  createdAt: string;
  sales: number;
  revenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private dashboardStatsSubject = new BehaviorSubject<DashboardStats | null>(null);
  public dashboardStats$ = this.dashboardStatsSubject.asObservable();

  constructor(private localStorageUtil: LocalStorageUtil) {}

  // Dashboard Statistics
  getDashboardStats(): Observable<DashboardStats> {
    try {
      const stats = this.calculateDashboardStats();
      this.dashboardStatsSubject.next(stats);
      return of(stats);
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return of(this.getDefaultStats());
    }
  }

  private calculateDashboardStats(): DashboardStats {
    const products = this.getProductsFromStorage();
    const users = this.getUsersFromStorage();
    const orders = this.getOrdersFromStorage();

    const totalProducts = products.length;
    const totalUsers = users.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const activeSellers = users.filter(user => user.role === 'seller' && user.status === 'active').length;
    const pendingApprovals = products.filter(product => product.status === 'pending').length;
    const lowStockProducts = products.filter(product => product.stock < 10).length;
    const topSellingProducts = this.getTopSellingProducts(products, 5);

    return {
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
      activeSellers,
      pendingApprovals,
      lowStockProducts,
      topSellingProducts
    };
  }

  private getDefaultStats(): DashboardStats {
    return {
      totalProducts: 0,
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      activeSellers: 0,
      pendingApprovals: 0,
      lowStockProducts: 0,
      topSellingProducts: []
    };
  }

  // Analytics Data
  getAnalyticsData(): Observable<AnalyticsData> {
    try {
      const analytics = this.calculateAnalyticsData();
      return of(analytics);
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return of(this.getDefaultAnalytics());
    }
  }

  private calculateAnalyticsData(): AnalyticsData {
    const products = this.getProductsFromStorage();
    const orders = this.getOrdersFromStorage();
    const users = this.getUsersFromStorage();

    return {
      salesData: this.generateSalesData(orders),
      userGrowth: this.generateUserGrowth(users),
      productPerformance: this.generateProductPerformance(products),
      categoryStats: this.generateCategoryStats(products),
      revenueTrends: this.generateRevenueTrends(orders)
    };
  }

  private getDefaultAnalytics(): AnalyticsData {
    return {
      salesData: [],
      userGrowth: [],
      productPerformance: [],
      categoryStats: [],
      revenueTrends: []
    };
  }

  // User Management
  getUsers(): Observable<User[]> {
    try {
      const users = this.getUsersFromStorage();
      return of(users);
    } catch (error) {
      console.error('Error getting users:', error);
      return of([]);
    }
  }

  updateUserStatus(userId: number, status: string): Observable<boolean> {
    try {
      const users = this.getUsersFromStorage();
      const userIndex = users.findIndex(user => user.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].status = status as any;
        this.saveUsersToStorage(users);
        return of(true);
      }
      return of(false);
    } catch (error) {
      console.error('Error updating user status:', error);
      return of(false);
    }
  }

  deleteUser(userId: number): Observable<boolean> {
    try {
      const users = this.getUsersFromStorage();
      const filteredUsers = users.filter(user => user.id !== userId);
      this.saveUsersToStorage(filteredUsers);
      return of(true);
    } catch (error) {
      console.error('Error deleting user:', error);
      return of(false);
    }
  }

  // Product Management
  getProducts(): Observable<Product[]> {
    try {
      const products = this.getProductsFromStorage();
      return of(products);
    } catch (error) {
      console.error('Error getting products:', error);
      return of([]);
    }
  }

  updateProductStatus(productId: number, status: string): Observable<boolean> {
    try {
      const products = this.getProductsFromStorage();
      const productIndex = products.findIndex(product => product.id === productId);
      
      if (productIndex !== -1) {
        products[productIndex].status = status as any;
        this.saveProductsToStorage(products);
        return of(true);
      }
      return of(false);
    } catch (error) {
      console.error('Error updating product status:', error);
      return of(false);
    }
  }

  deleteProduct(productId: number): Observable<boolean> {
    try {
      const products = this.getProductsFromStorage();
      const filteredProducts = products.filter(product => product.id !== productId);
      this.saveProductsToStorage(filteredProducts);
      return of(true);
    } catch (error) {
      console.error('Error deleting product:', error);
      return of(false);
    }
  }

  // Helper Methods
  private getUsersFromStorage(): User[] {
    try {
      const users = this.localStorageUtil.getItem<any[]>('users_data') || [];
      return users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user',
        status: user.status || 'active',
        createdAt: user.createdAt || new Date().toISOString(),
        lastLogin: user.lastLogin || null,
        totalOrders: user.totalOrders || 0,
        totalSpent: user.totalSpent || 0
      }));
    } catch (error) {
      console.error('Error loading users from storage:', error);
      return [];
    }
  }

  private saveUsersToStorage(users: User[]): void {
    try {
      this.localStorageUtil.setItem('users_data', users);
    } catch (error) {
      console.error('Error saving users to storage:', error);
    }
  }

  private getProductsFromStorage(): Product[] {
    try {
      const products = this.localStorageUtil.getItem<any[]>('products_data') || [];
      return products.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock || 0,
        status: product.status || 'active',
        seller: product.seller || 'Admin',
        createdAt: product.createdAt || new Date().toISOString(),
        sales: product.sales || 0,
        revenue: product.revenue || 0
      }));
    } catch (error) {
      console.error('Error loading products from storage:', error);
      return [];
    }
  }

  private saveProductsToStorage(products: Product[]): void {
    try {
      this.localStorageUtil.setItem('products_data', products);
    } catch (error) {
      console.error('Error saving products to storage:', error);
    }
  }

  private getOrdersFromStorage(): any[] {
    try {
      return this.localStorageUtil.getItem<any[]>('orders_data') || [];
    } catch (error) {
      console.error('Error loading orders from storage:', error);
      return [];
    }
  }

  private getTopSellingProducts(products: Product[], limit: number): any[] {
    return products
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit)
      .map(product => ({
        id: product.id,
        name: product.name,
        sales: product.sales,
        revenue: product.revenue,
        category: product.category
      }));
  }

  private generateSalesData(orders: any[]): any[] {
    // Generate mock sales data for the last 30 days
    const salesData = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });
      
      salesData.push({
        date: date.toISOString().split('T')[0],
        sales: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      });
    }
    
    return salesData;
  }

  private generateUserGrowth(users: User[]): any[] {
    // Generate mock user growth data for the last 12 months
    const userGrowth = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthUsers = users.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate.getMonth() === date.getMonth() && 
               userDate.getFullYear() === date.getFullYear();
      });
      
      userGrowth.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        newUsers: monthUsers.length,
        totalUsers: users.filter(user => new Date(user.createdAt) <= date).length
      });
    }
    
    return userGrowth;
  }

  private generateProductPerformance(products: Product[]): any[] {
    return products
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(product => ({
        id: product.id,
        name: product.name,
        revenue: product.revenue,
        sales: product.sales,
        category: product.category
      }));
  }

  private generateCategoryStats(products: Product[]): any[] {
    const categoryMap = new Map<string, { count: number; revenue: number; sales: number }>();
    
    products.forEach(product => {
      const category = product.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { count: 0, revenue: 0, sales: 0 });
      }
      
      const stats = categoryMap.get(category)!;
      stats.count++;
      stats.revenue += product.revenue;
      stats.sales += product.sales;
    });
    
    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      count: stats.count,
      revenue: stats.revenue,
      sales: stats.sales
    }));
  }

  private generateRevenueTrends(orders: any[]): any[] {
    // Generate mock revenue trends for the last 7 days
    const revenueTrends = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });
      
      revenueTrends.push({
        date: date.toISOString().split('T')[0],
        revenue: dayOrders.reduce((sum, order) => sum + (order.total || 0), 0),
        orders: dayOrders.length
      });
    }
    
    return revenueTrends;
  }

  // Initialize default data for testing
  initializeDefaultData(): void {
    try {
      // Initialize products if not exists
      const existingProducts = this.localStorageUtil.getItem<any[]>('products_data');
      if (!existingProducts || existingProducts.length === 0) {
        const defaultProducts = this.generateDefaultProducts();
        this.localStorageUtil.setItem('products_data', defaultProducts);
      }

      // Initialize orders if not exists
      const existingOrders = this.localStorageUtil.getItem<any[]>('orders_data');
      if (!existingOrders || existingOrders.length === 0) {
        const defaultOrders = this.generateDefaultOrders();
        this.localStorageUtil.setItem('orders_data', defaultOrders);
      }
    } catch (error) {
      console.error('Error initializing default admin data:', error);
    }
  }

  private generateDefaultProducts(): any[] {
    return [
      {
        id: 1,
        name: 'Premium Wireless Headphones',
        category: 'Electronics',
        price: 299.99,
        stock: 45,
        status: 'active',
        seller: 'TechCorp',
        createdAt: '2024-01-15T00:00:00.000Z',
        sales: 156,
        revenue: 46798.44
      },
      {
        id: 2,
        name: 'Organic Cotton T-Shirt',
        category: 'Fashion',
        price: 29.99,
        stock: 120,
        status: 'active',
        seller: 'FashionHub',
        createdAt: '2024-01-20T00:00:00.000Z',
        sales: 89,
        revenue: 2669.11
      },
      {
        id: 3,
        name: 'Smart Fitness Watch',
        category: 'Electronics',
        price: 199.99,
        stock: 23,
        status: 'active',
        seller: 'TechCorp',
        createdAt: '2024-02-01T00:00:00.000Z',
        sales: 234,
        revenue: 46797.66
      },
      {
        id: 4,
        name: 'Designer Handbag',
        category: 'Fashion',
        price: 599.99,
        stock: 8,
        status: 'active',
        seller: 'LuxuryFashion',
        createdAt: '2024-02-10T00:00:00.000Z',
        sales: 45,
        revenue: 26999.55
      },
      {
        id: 5,
        name: 'Gaming Laptop',
        category: 'Electronics',
        price: 1299.99,
        stock: 12,
        status: 'active',
        seller: 'TechCorp',
        createdAt: '2024-02-15T00:00:00.000Z',
        sales: 67,
        revenue: 87099.33
      }
    ];
  }

  private generateDefaultOrders(): any[] {
    const orders = [];
    const today = new Date();
    
    for (let i = 0; i < 50; i++) {
      const orderDate = new Date(today);
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
      
      orders.push({
        id: i + 1,
        userId: Math.floor(Math.random() * 10) + 1,
        total: Math.floor(Math.random() * 500) + 50,
        status: ['completed', 'pending', 'processing'][Math.floor(Math.random() * 3)],
        createdAt: orderDate.toISOString(),
        items: Math.floor(Math.random() * 5) + 1
      });
    }
    
    return orders;
  }
}
