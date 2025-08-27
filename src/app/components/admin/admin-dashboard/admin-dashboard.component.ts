import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AdminService, DashboardStats } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  dashboardStats: DashboardStats | null = null;
  loading = true;
  currentUser: any = null;
  
  // Chart data
  salesChartData: any[] = [];
  userGrowthChartData: any[] = [];
  revenueChartData: any[] = [];
  
  // Quick actions
  quickActions = [
    {
      title: 'Add Product',
      icon: 'fas fa-plus',
      color: 'primary',
      action: () => this.router.navigate(['/admin/products/add'])
    },
    {
      title: 'Manage Users',
      icon: 'fas fa-users',
      color: 'success',
      action: () => this.router.navigate(['/admin/users'])
    },
    {
      title: 'View Analytics',
      icon: 'fas fa-chart-line',
      color: 'info',
      action: () => this.router.navigate(['/admin/analytics'])
    },
    {
      title: 'Pending Approvals',
      icon: 'fas fa-clock',
      color: 'warning',
      action: () => this.router.navigate(['/admin/products'])
    }
  ];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.checkAdminAccess();
    this.loadDashboardData();
    this.initializeDefaultData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkAdminAccess(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.authService.hasRole('admin')) {
      this.toastr.error('Access denied. Admin privileges required.');
      this.router.navigate(['/']);
    }
  }

  private loadDashboardData(): void {
    this.loading = true;
    
    this.adminService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.dashboardStats = stats;
          this.loading = false;
          this.prepareChartData();
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.loading = false;
          this.toastr.error('Failed to load dashboard data');
        }
      });
  }

  private initializeDefaultData(): void {
    this.adminService.initializeDefaultData();
  }

  private prepareChartData(): void {
    if (!this.dashboardStats) return;

    // Prepare sales chart data
    this.salesChartData = this.dashboardStats.topSellingProducts.map(product => ({
      name: product.name,
      value: product.sales,
      revenue: product.revenue
    }));

    // Generate mock user growth data for chart
    this.userGrowthChartData = this.generateUserGrowthData();

    // Generate mock revenue data for chart
    this.revenueChartData = this.generateRevenueData();
  }

  private generateUserGrowthData(): any[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      users: Math.floor(Math.random() * 100) + 50,
      growth: Math.floor(Math.random() * 20) + 5
    }));
  }

  private generateRevenueData(): any[] {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      revenue: Math.floor(Math.random() * 5000) + 1000,
      orders: Math.floor(Math.random() * 50) + 10
    }));
  }

  // Navigation methods
  navigateToProducts(): void {
    this.router.navigate(['/admin/products']);
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToAnalytics(): void {
    this.router.navigate(['/admin/analytics']);
  }

  navigateToSellerPanel(): void {
    this.router.navigate(['/admin/seller-panel']);
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'danger';
      default: return 'secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active': return 'fas fa-check-circle';
      case 'pending': return 'fas fa-clock';
      case 'inactive': return 'fas fa-times-circle';
      default: return 'fas fa-question-circle';
    }
  }

  // Refresh dashboard
  refreshDashboard(): void {
    this.loadDashboardData();
    this.toastr.success('Dashboard refreshed successfully');
  }

  // Export data
  exportDashboardData(): void {
    if (!this.dashboardStats) return;

    const data = {
      timestamp: new Date().toISOString(),
      stats: this.dashboardStats,
      charts: {
        sales: this.salesChartData,
        userGrowth: this.userGrowthChartData,
        revenue: this.revenueChartData
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.toastr.success('Dashboard data exported successfully');
  }
}
