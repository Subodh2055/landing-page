import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

interface Product {
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
  brand?: string;
  weight?: number;
  tags?: string;
  createdAt: Date;
}

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss']
})
export class ProductManagementComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProducts: number[] = [];
  categories: string[] = [];
  
  searchTerm = '';
  categoryFilter = '';
  statusFilter = '';
  priceFilter = '';
  
  showProductModal = false;
  showViewModal = false;
  editingProduct: Product | null = null;
  viewingProduct: Product | null = null;
  isSaving = false;
  
  productForm!: FormGroup;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  Math = Math; // Make Math available in template
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      sku: ['', Validators.required],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      status: ['active'],
      imageUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      description: ['', Validators.required],
      brand: [''],
      weight: [0],
      tags: ['']
    });
  }

  private setupSearch(): void {
    // Debounce search input
    const searchInput = document.querySelector('input[placeholder="Search products..."]') as HTMLInputElement;
    if (searchInput) {
      // This would be implemented with a proper search service in a real app
    }
  }

  private loadProducts(): void {
    // Generate mock products
    this.products = [
      {
        id: 1,
        name: 'Wireless Bluetooth Headphones',
        sku: 'WH-001',
        category: 'Electronics',
        price: 99.99,
        stock: 25,
        status: 'active',
        sales: 45,
        imageUrl: 'https://via.placeholder.com/150',
        description: 'High-quality wireless headphones with noise cancellation',
        brand: 'AudioTech',
        weight: 0.3,
        tags: 'wireless, bluetooth, headphones, audio',
        createdAt: new Date('2024-01-15')
      },
      {
        id: 2,
        name: 'Smart Fitness Watch',
        sku: 'SW-002',
        category: 'Electronics',
        price: 199.99,
        stock: 10,
        status: 'active',
        sales: 32,
        imageUrl: 'https://via.placeholder.com/150',
        description: 'Advanced fitness tracking with heart rate monitor',
        brand: 'FitTech',
        weight: 0.05,
        tags: 'fitness, smartwatch, health, tracking',
        createdAt: new Date('2024-01-20')
      },
      {
        id: 3,
        name: 'Premium Running Shoes',
        sku: 'RS-003',
        category: 'Sports',
        price: 129.99,
        stock: 0,
        status: 'out-of-stock',
        sales: 28,
        imageUrl: 'https://via.placeholder.com/150',
        description: 'Comfortable running shoes with advanced cushioning',
        brand: 'RunFast',
        weight: 0.8,
        tags: 'running, shoes, sports, fitness',
        createdAt: new Date('2024-01-10')
      },
      {
        id: 4,
        name: 'Organic Coffee Beans',
        sku: 'CB-004',
        category: 'Food & Beverages',
        price: 24.99,
        stock: 50,
        status: 'active',
        sales: 67,
        imageUrl: 'https://via.placeholder.com/150',
        description: 'Premium organic coffee beans from high-altitude farms',
        brand: 'BeanMaster',
        weight: 0.5,
        tags: 'coffee, organic, beans, premium',
        createdAt: new Date('2024-01-25')
      },
      {
        id: 5,
        name: 'Yoga Mat Premium',
        sku: 'YM-005',
        category: 'Sports',
        price: 39.99,
        stock: 15,
        status: 'active',
        sales: 23,
        imageUrl: 'https://via.placeholder.com/150',
        description: 'Non-slip yoga mat with carrying strap',
        brand: 'YogaLife',
        weight: 1.2,
        tags: 'yoga, mat, fitness, exercise',
        createdAt: new Date('2024-01-18')
      }
    ];

    this.filteredProducts = [...this.products];
    this.extractCategories();
    this.calculatePagination();
  }

  private extractCategories(): void {
    this.categories = [...new Set(this.products.map(p => p.category))];
  }

  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
  }

  // Search and Filter Methods
  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = !this.categoryFilter || product.category === this.categoryFilter;
      
      const matchesStatus = !this.statusFilter || product.status === this.statusFilter;
      
      const matchesPrice = !this.priceFilter || this.matchesPriceRange(product.price, this.priceFilter);

      return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
    });

    this.calculatePagination();
    this.currentPage = 1;
  }

  private matchesPriceRange(price: number, range: string): boolean {
    switch (range) {
      case '0-50': return price >= 0 && price <= 50;
      case '50-100': return price > 50 && price <= 100;
      case '100-200': return price > 100 && price <= 200;
      case '200+': return price > 200;
      default: return true;
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.categoryFilter = '';
    this.statusFilter = '';
    this.priceFilter = '';
    this.applyFilters();
    this.toastr.info('Filters cleared');
  }

  // Selection Methods
  toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.selectedProducts = [];
    } else {
      this.selectedProducts = this.filteredProducts.map(p => p.id);
    }
  }

  toggleProductSelection(productId: number): void {
    const index = this.selectedProducts.indexOf(productId);
    if (index > -1) {
      this.selectedProducts.splice(index, 1);
    } else {
      this.selectedProducts.push(productId);
    }
  }

  get isAllSelected(): boolean {
    return this.filteredProducts.length > 0 && 
           this.selectedProducts.length === this.filteredProducts.length;
  }

  // Product CRUD Methods
  openAddProductModal(): void {
    this.editingProduct = null;
    this.productForm.reset({
      status: 'active',
      price: 0,
      stock: 0,
      weight: 0
    });
    this.showProductModal = true;
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    this.productForm.patchValue({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status,
      imageUrl: product.imageUrl,
      description: product.description,
      brand: product.brand || '',
      weight: product.weight || 0,
      tags: product.tags || ''
    });
    this.showProductModal = true;
  }

  viewProduct(product: Product): void {
    this.viewingProduct = product;
    this.showViewModal = true;
  }

  duplicateProduct(product: Product): void {
    const newProduct = {
      ...product,
      id: this.products.length + 1,
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-COPY`,
      sales: 0,
      createdAt: new Date()
    };
    
    this.products.push(newProduct);
    this.applyFilters();
    this.toastr.success('Product duplicated successfully');
  }

  saveProduct(): void {
    if (this.productForm.valid) {
      this.isSaving = true;
      
      setTimeout(() => {
        const formValue = this.productForm.value;
        
        if (this.editingProduct) {
          // Update existing product
          const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
          if (index > -1) {
            this.products[index] = {
              ...this.editingProduct,
              ...formValue
            };
            this.toastr.success('Product updated successfully');
          }
        } else {
          // Add new product
          const newProduct: Product = {
            id: this.products.length + 1,
            ...formValue,
            sales: 0,
            createdAt: new Date()
          };
          this.products.push(newProduct);
          this.toastr.success('Product added successfully');
        }
        
        this.applyFilters();
        this.closeProductModal();
        this.isSaving = false;
      }, 1000);
    }
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.products = this.products.filter(p => p.id !== product.id);
      this.applyFilters();
      this.toastr.success('Product deleted successfully');
    }
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.editingProduct = null;
    this.productForm.reset();
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewingProduct = null;
  }

  // Bulk Actions
  bulkEdit(): void {
    if (this.selectedProducts.length === 0) {
      this.toastr.warning('Please select products to edit');
      return;
    }
    this.toastr.info('Bulk edit functionality will be implemented');
  }

  bulkUpdateStatus(status: string): void {
    if (this.selectedProducts.length === 0) {
      this.toastr.warning('Please select products to update');
      return;
    }

    this.products.forEach(product => {
      if (this.selectedProducts.includes(product.id)) {
        product.status = status;
      }
    });

    this.applyFilters();
    this.selectedProducts = [];
    this.toastr.success(`${this.selectedProducts.length} products updated to ${status}`);
  }

  bulkDelete(): void {
    if (this.selectedProducts.length === 0) {
      this.toastr.warning('Please select products to delete');
      return;
    }

    if (confirm(`Are you sure you want to delete ${this.selectedProducts.length} products?`)) {
      this.products = this.products.filter(p => !this.selectedProducts.includes(p.id));
      this.applyFilters();
      this.selectedProducts = [];
      this.toastr.success('Products deleted successfully');
    }
  }

  bulkExport(): void {
    if (this.selectedProducts.length === 0) {
      this.toastr.warning('Please select products to export');
      return;
    }

    const selectedProductsData = this.products.filter(p => this.selectedProducts.includes(p.id));
    this.exportData(selectedProductsData, 'selected-products');
  }

  // Export Methods
  exportProducts(): void {
    this.exportData(this.products, 'all-products');
  }

  private exportData(data: Product[], filename: string): void {
    const exportData = data.map(product => ({
      ...product,
      createdAt: product.createdAt.toISOString()
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.toastr.success('Export completed successfully');
  }

  // Pagination Methods
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }



  // Utility Methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'text-danger fw-bold';
    if (stock < 10) return 'text-warning fw-bold';
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
}
