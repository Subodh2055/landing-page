import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000'; // JSON Server URL
  private products: Product[] = [];
  private useLocalStorage = false;
  private readonly STORAGE_KEY = 'products_data';

  constructor(private http: HttpClient) {
    this.initializeData();
  }

  private initializeData(): void {
    // Try to load from localStorage first
    const storedData = this.loadFromLocalStorage();
    if (storedData.length > 0) {
      this.products = storedData;
      this.useLocalStorage = true;
    }
  }

  private loadFromLocalStorage(): Product[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored).map((p: any) => Product.fromJson(p)) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private handleApiError(error: any, fallbackData?: any[]): Observable<any> {
    console.warn('API Error, falling back to localStorage:', error);
    this.useLocalStorage = true;
    
    if (fallbackData) {
      return of(fallbackData);
    }
    
    return throwError(() => new Error('Service unavailable, using local storage'));
  }

  // Get all products from JSON server with fallback
  getProducts(): Observable<Product[]> {
    if (this.useLocalStorage) {
      return of(this.products);
    }

    return this.http.get<Product[]>(`${this.apiUrl}/products`).pipe(
      timeout(5000), // 5 second timeout
      map(products => {
        this.products = products.map(p => Product.fromJson(p));
        this.saveToLocalStorage();
        return this.products;
      }),
      catchError(error => this.handleApiError(error, this.products))
    );
  }

  // Get product by ID
  getProductById(id: number): Observable<Product> {
    if (this.useLocalStorage) {
      const product = this.products.find(p => p.id === id);
      return product ? of(product) : throwError(() => new Error('Product not found'));
    }

    return this.http.get<Product>(`${this.apiUrl}/products/${id}`).pipe(
      timeout(5000),
      map(product => Product.fromJson(product)),
      catchError(error => this.handleApiError(error))
    );
  }

  // Add new product
  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    const newProduct = {
      ...product,
      id: this.getNextId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.useLocalStorage) {
      this.products.push(Product.fromJson(newProduct));
      this.saveToLocalStorage();
      return of(Product.fromJson(newProduct));
    }

    return this.http.post<Product>(`${this.apiUrl}/products`, newProduct).pipe(
      timeout(5000),
      map(addedProduct => {
        const product = Product.fromJson(addedProduct);
        this.products.push(product);
        this.saveToLocalStorage();
        return product;
      }),
      catchError(error => this.handleApiError(error))
    );
  }

  // Update product
  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    const updatedProduct = {
      ...product,
      updatedAt: new Date().toISOString()
    };

    if (this.useLocalStorage) {
      const index = this.products.findIndex(p => p.id === id);
      if (index !== -1) {
        const updatedProductObj = {
          ...this.products[index],
          ...updatedProduct,
          updatedAt: new Date(updatedProduct.updatedAt || new Date())
        };
        this.products[index] = Product.fromJson(updatedProductObj);
        this.saveToLocalStorage();
        return of(this.products[index]);
      }
      return throwError(() => new Error('Product not found'));
    }

    return this.http.patch<Product>(`${this.apiUrl}/products/${id}`, updatedProduct).pipe(
      timeout(5000),
      map(updatedProduct => {
        const product = Product.fromJson(updatedProduct);
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products[index] = product;
        }
        this.saveToLocalStorage();
        return product;
      }),
      catchError(error => this.handleApiError(error))
    );
  }

  // Delete product
  deleteProduct(id: number): Observable<boolean> {
    if (this.useLocalStorage) {
      const initialLength = this.products.length;
      this.products = this.products.filter(p => p.id !== id);
      this.saveToLocalStorage();
      return of(this.products.length < initialLength);
    }

    return this.http.delete<void>(`${this.apiUrl}/products/${id}`).pipe(
      timeout(5000),
      map(() => {
        this.products = this.products.filter(p => p.id !== id);
        this.saveToLocalStorage();
        return true;
      }),
      catchError(error => this.handleApiError(error))
    );
  }

  // Search products
  searchProducts(query: string): Observable<Product[]> {
    if (this.useLocalStorage) {
      const filtered = this.products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );
      return of(filtered);
    }

    return this.http.get<Product[]>(`${this.apiUrl}/products?q=${query}`).pipe(
      timeout(5000),
      map(products => products.map(p => Product.fromJson(p))),
      catchError(error => this.handleApiError(error))
    );
  }

  // Get products by category
  getProductsByCategory(category: string): Observable<Product[]> {
    if (this.useLocalStorage) {
      const filtered = this.products.filter(product => product.category === category);
      return of(filtered);
    }

    return this.http.get<Product[]>(`${this.apiUrl}/products?category=${category}`).pipe(
      timeout(5000),
      map(products => products.map(p => Product.fromJson(p))),
      catchError(error => this.handleApiError(error))
    );
  }

  // Get categories
  getCategories(): Observable<any[]> {
    if (this.useLocalStorage) {
      const categories = [...new Set(this.products.map(p => p.category))];
      return of(categories.map((name, id) => ({ id: id + 1, name })));
    }

    return this.http.get<any[]>(`${this.apiUrl}/categories`).pipe(
      timeout(5000),
      catchError(error => this.handleApiError(error))
    );
  }

  // Get category count
  getCategoryCount(category: string, role?: string): number {
    let filteredProducts = this.products.filter(p => p.category === category);
    
    if (role) {
      if (role === 'admin') {
        filteredProducts = filteredProducts.filter(p => p.role === 'admin');
      } else if (role === 'user') {
        filteredProducts = filteredProducts.filter(p => p.role === 'public' || p.role === 'user');
      } else {
        filteredProducts = filteredProducts.filter(p => p.role === 'public');
      }
    }
    
    return filteredProducts.length;
  }

  // Export products to JSON
  exportProducts(): Observable<string> {
    return this.getProducts().pipe(
      map(products => {
        const dataStr = JSON.stringify(products, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `products_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        return 'Products exported successfully';
      }),
      catchError(error => {
        console.error('Error exporting products:', error);
        return throwError(() => new Error('Failed to export products'));
      })
    );
  }

  // Import products from JSON
  importProducts(file: File): Observable<string> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const products = JSON.parse(e.target.result);
          if (Array.isArray(products)) {
            // Add each product to the server
            const importPromises = products.map(product => 
              this.addProduct(product).toPromise()
            );
            
            Promise.all(importPromises)
              .then(() => {
                observer.next('Products imported successfully');
                observer.complete();
              })
              .catch(error => {
                observer.error(new Error('Failed to import products'));
              });
          } else {
            observer.error(new Error('Invalid file format'));
          }
        } catch (error) {
          observer.error(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => {
        observer.error(new Error('Failed to read file'));
      };
      reader.readAsText(file);
    });
  }

  // Import from JSON data
  importFromJson(jsonData: any[]): Observable<string> {
    return new Observable(observer => {
      if (Array.isArray(jsonData)) {
        const importPromises = jsonData.map(product => 
          this.addProduct(product).toPromise()
        );
        
        Promise.all(importPromises)
          .then(() => {
            observer.next('Products imported successfully');
            observer.complete();
          })
          .catch(error => {
            observer.error(new Error('Failed to import products'));
          });
      } else {
        observer.error(new Error('Invalid data format'));
      }
    });
  }

  // Get filtered products
  getFilteredProducts(filters: any): Observable<Product[]> {
    if (this.useLocalStorage) {
      let filtered = [...this.products];

      if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      if (filters.minPrice) {
        filtered = filtered.filter(p => p.price >= filters.minPrice);
      }
      if (filters.maxPrice) {
        filtered = filtered.filter(p => p.price <= filters.maxPrice);
      }
      if (filters.search) {
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      if (filters.inStock) {
        filtered = filtered.filter(p => p.stock > 0);
      }
      if (filters.rating) {
        filtered = filtered.filter(p => p.rating >= filters.rating);
      }

      return of(filtered);
    }

    let url = `${this.apiUrl}/products`;
    const params = new URLSearchParams();

    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.minPrice) {
      params.append('price_gte', filters.minPrice.toString());
    }
    if (filters.maxPrice) {
      params.append('price_lte', filters.maxPrice.toString());
    }
    if (filters.search) {
      params.append('q', filters.search);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.http.get<Product[]>(url).pipe(
      timeout(5000),
      map(products => {
        // Apply additional filters that can't be done via URL
        return products.filter(product => {
          if (filters.inStock && product.stock <= 0) return false;
          if (filters.rating && product.rating < filters.rating) return false;
          return true;
        }).map(p => Product.fromJson(p));
      }),
      catchError(error => this.handleApiError(error))
    );
  }

  // Get paginated products
  getPaginatedProducts(page: number = 1, limit: number = 50): Observable<{products: Product[], total: number, totalPages: number}> {
    if (this.useLocalStorage) {
      const total = this.products.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedProducts = this.products.slice(start, end);
      
      return of({
        products: paginatedProducts,
        total,
        totalPages
      });
    }

    const start = (page - 1) * limit;
    const end = start + limit;

    return this.http.get<Product[]>(`${this.apiUrl}/products`).pipe(
      timeout(5000),
      map(products => {
        const total = products.length;
        const totalPages = Math.ceil(total / limit);
        const paginatedProducts = products.slice(start, end).map(p => Product.fromJson(p));
        
        return {
          products: paginatedProducts,
          total,
          totalPages
        };
      }),
      catchError(error => this.handleApiError(error))
    );
  }

  // Get sample products
  getSampleProducts(): Product[] {
    return this.products.slice(0, 5); // Return first 5 products as samples
  }

  // Save products to storage
  saveProductsToStorage(): void {
    this.saveToLocalStorage();
  }

  // Get storage info
  getStorageInfo(): { products: number; totalSize: number } {
    const productsJson = JSON.stringify(this.products);
    return {
      products: this.products.length,
      totalSize: productsJson.length
    };
  }

  // Clear all products
  clearAllProducts(): Observable<boolean> {
    if (this.useLocalStorage) {
      this.products = [];
      this.saveToLocalStorage();
      return of(true);
    }

    return this.http.delete<void>(`${this.apiUrl}/products`).pipe(
      timeout(5000),
      map(() => {
        this.products = [];
        this.saveToLocalStorage();
        return true;
      }),
      catchError(error => this.handleApiError(error))
    );
  }

  // Auto save to file
  autoSaveToFile(): Observable<string> {
    return this.exportProducts();
  }

  // Save to specific file
  saveToSpecificFile(): Observable<string> {
    return this.exportProducts();
  }

  // Create product (alias for addProduct)
  createProduct(productData: Omit<Product, 'id'>): Observable<Product> {
    return this.addProduct(productData);
  }

  // Get product (alias for getProductById)
  getProduct(id: number): Observable<Product> {
    return this.getProductById(id);
  }

  private getNextId(): number {
    const maxId = Math.max(...this.products.map(p => p.id), 0);
    return maxId + 1;
  }

  // Check if using localStorage
  isUsingLocalStorage(): boolean {
    return this.useLocalStorage;
  }

  // Force refresh from server
  refreshFromServer(): void {
    this.useLocalStorage = false;
  }
}
