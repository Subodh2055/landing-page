import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface SellerStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  avgRating: number;
}

interface SellerProduct {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  sales: number;
  imageUrl: string;
  description: string;
}

interface SellerOrder {
  orderId: string;
  orderDate: Date;
  status: string;
  customerName: string;
  customerEmail: string;
  items: any[];
  total: number;
}

interface StoreSettings {
  emailNotifications: boolean;
  lowStockAlerts: boolean;
  salesReports: boolean;
}

@Component({
  selector: 'app-seller-panel',
  templateUrl: './seller-panel.component.html',
  styleUrls: ['./seller-panel.component.scss']
})
export class SellerPanelComponent implements OnInit {
  sellerStats: SellerStats = {
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    avgRating: 0
  };

  products: SellerProduct[] = [];
  filteredProducts: SellerProduct[] = [];
  orders: SellerOrder[] = [];
  filteredOrders: SellerOrder[] = [];
  topSellingProducts: any[] = [];

  searchTerm = '';
  filterStatus = '';
  orderFilter = '';

  showAddProductModal = false;
  productForm!: FormGroup;
  storeForm!: FormGroup;
  settings: StoreSettings = {
    emailNotifications: true,
    lowStockAlerts: true,
    salesReports: false
  };

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadSellerData();
    this.initializeMockData();
  }

  private initializeForms(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      sku: ['', Validators.required],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.storeForm = this.fb.group({
      storeName: ['My Store', Validators.required],
      description: [''],
      contactEmail: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required]
    });
  }

  private loadSellerData(): void {
    // In a real application, this would load data from a service
    this.calculateSellerStats();
    this.filterProducts();
    this.filterOrders();
  }

  private initializeMockData(): void {
    // Mock products data
    this.products = [
      {
        id: 1,
        name: 'Wireless Headphones',
        sku: 'WH-001',
        category: 'Electronics',
        price: 99.99,
        stock: 25,
        status: 'active',
        sales: 45,
        imageUrl: 'https://via.placeholder.com/150',
        description: 'High-quality wireless headphones'
      },
      {
        id: 2,
        name: 'Smart Watch',
        sku: 'SW-002',
        category: 'Electronics',
        price: 199.99,
        stock: 10,
        status: 'active',
        sales: 32,
        imageUrl: 'https://via.placeholder.com/150',
        description: 'Feature-rich smartwatch'
      },
      {
        id: 3,
        name: 'Running Shoes',
        sku: 'RS-003',
        category: 'Sports',
        price: 79.99,
        stock: 0,
        status: 'out-of-stock',
        sales: 28,
        imageUrl: 'https://via.placeholder.com/150',
        description: 'Comfortable running shoes'
      }
    ];

    // Mock orders data
    this.orders = [
      {
        orderId: 'ORD-001',
        orderDate: new Date(),
        status: 'pending',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        items: [
          { name: 'Wireless Headphones', quantity: 1, price: 99.99, imageUrl: 'https://via.placeholder.com/50' }
        ],
        total: 99.99
      },
      {
        orderId: 'ORD-002',
        orderDate: new Date(Date.now() - 86400000),
        status: 'processing',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        items: [
          { name: 'Smart Watch', quantity: 1, price: 199.99, imageUrl: 'https://via.placeholder.com/50' }
        ],
        total: 199.99
      }
    ];

    // Mock top selling products
    this.topSellingProducts = [
      { name: 'Wireless Headphones', sales: 45, revenue: 4499.55, imageUrl: 'https://via.placeholder.com/50' },
      { name: 'Smart Watch', sales: 32, revenue: 6399.68, imageUrl: 'https://via.placeholder.com/50' },
      { name: 'Running Shoes', sales: 28, revenue: 2239.72, imageUrl: 'https://via.placeholder.com/50' }
    ];
  }

  private calculateSellerStats(): void {
    this.sellerStats = {
      totalProducts: this.products.length,
      totalSales: this.products.reduce((sum, product) => sum + product.sales, 0),
      totalRevenue: this.products.reduce((sum, product) => sum + (product.sales * product.price), 0),
      avgRating: 4.2 // Mock average rating
    };
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.filterStatus || product.status === this.filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  filterOrders(): void {
    this.filteredOrders = this.orders.filter(order => {
      return !this.orderFilter || order.status === this.orderFilter;
    });
  }

  // Product Management Methods
  openAddProductModal(): void {
    this.showAddProductModal = true;
  }

  closeAddProductModal(): void {
    this.showAddProductModal = false;
    this.productForm.reset();
  }

  addProduct(): void {
    if (this.productForm.valid) {
      const newProduct: SellerProduct = {
        id: this.products.length + 1,
        ...this.productForm.value,
        status: 'active',
        sales: 0
      };

      this.products.push(newProduct);
      this.calculateSellerStats();
      this.filterProducts();
      this.closeAddProductModal();
      this.toastr.success('Product added successfully!');
    }
  }

  editProduct(product: SellerProduct): void {
    this.toastr.info('Edit product functionality will be implemented');
  }

  updateStock(product: SellerProduct): void {
    this.toastr.info('Update stock functionality will be implemented');
  }

  deleteProduct(product: SellerProduct): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.products = this.products.filter(p => p.id !== product.id);
      this.calculateSellerStats();
      this.filterProducts();
      this.toastr.success('Product deleted successfully!');
    }
  }

  exportInventory(): void {
    const data = JSON.stringify(this.products, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-export.json';
    a.click();
    window.URL.revokeObjectURL(url);
    this.toastr.success('Inventory exported successfully!');
  }

  // Order Management Methods
  viewOrderDetails(order: SellerOrder): void {
    this.toastr.info('Order details will be displayed');
  }

  updateOrderStatus(order: SellerOrder): void {
    order.status = 'processing';
    this.filterOrders();
    this.toastr.success('Order status updated!');
  }

  // Analytics Methods
  getTopSellingProducts(): void {
    // This would typically fetch from a service
    this.toastr.info('Analytics data loaded');
  }

  // Settings Methods
  updateStoreInfo(): void {
    if (this.storeForm.valid) {
      this.toastr.success('Store information updated successfully!');
    }
  }

  saveSettings(): void {
    this.toastr.success('Settings saved successfully!');
  }

  // Utility Methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'text-danger';
    if (stock < 10) return 'text-warning';
    return 'text-success';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-success';
      case 'inactive': return 'bg-secondary';
      case 'out-of-stock': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getOrderStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'processing': return 'bg-info';
      case 'shipped': return 'bg-primary';
      case 'delivered': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
