import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000'; // JSON Server URL
  private products: Product[] = [];

  constructor(private http: HttpClient) {}

  // Get all products from JSON server
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`).pipe(
      map(products => {
        this.products = products;
        return products;
      }),
      catchError(error => {
        console.error('Error fetching products:', error);
        return throwError(() => new Error('Failed to fetch products'));
      })
    );
  }

  // Get product by ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching product:', error);
        return throwError(() => new Error('Failed to fetch product'));
      })
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

    return this.http.post<Product>(`${this.apiUrl}/products`, newProduct).pipe(
      map(addedProduct => {
        this.products.push(addedProduct);
        return addedProduct;
      }),
      catchError(error => {
        console.error('Error adding product:', error);
        return throwError(() => new Error('Failed to add product'));
      })
    );
  }

  // Update product
  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    const updatedProduct = {
      ...product,
      updatedAt: new Date().toISOString()
    };

    return this.http.patch<Product>(`${this.apiUrl}/products/${id}`, updatedProduct).pipe(
      map(updatedProduct => {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
        return updatedProduct;
      }),
      catchError(error => {
        console.error('Error updating product:', error);
        return throwError(() => new Error('Failed to update product'));
      })
    );
  }

  // Delete product
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`).pipe(
      map(() => {
        this.products = this.products.filter(p => p.id !== id);
      }),
      catchError(error => {
        console.error('Error deleting product:', error);
        return throwError(() => new Error('Failed to delete product'));
      })
    );
  }

  // Search products
  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products?q=${query}`).pipe(
      catchError(error => {
        console.error('Error searching products:', error);
        return throwError(() => new Error('Failed to search products'));
      })
    );
  }

  // Get products by category
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products?category=${category}`).pipe(
      catchError(error => {
        console.error('Error fetching products by category:', error);
        return throwError(() => new Error('Failed to fetch products by category'));
      })
    );
  }

  // Get categories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`).pipe(
      catchError(error => {
        console.error('Error fetching categories:', error);
        return throwError(() => new Error('Failed to fetch categories'));
      })
    );
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

  // Get filtered products
  getFilteredProducts(filters: any): Observable<Product[]> {
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
      map(products => {
        // Apply additional filters that can't be done via URL
        return products.filter(product => {
          if (filters.inStock && product.stock <= 0) return false;
          if (filters.rating && product.rating < filters.rating) return false;
          return true;
        });
      }),
      catchError(error => {
        console.error('Error fetching filtered products:', error);
        return throwError(() => new Error('Failed to fetch filtered products'));
      })
    );
  }

  // Get paginated products
  getPaginatedProducts(page: number = 1, limit: number = 50): Observable<{products: Product[], total: number, totalPages: number}> {
    const start = (page - 1) * limit;
    const end = start + limit;

    return this.http.get<Product[]>(`${this.apiUrl}/products`).pipe(
      map(products => {
        const total = products.length;
        const totalPages = Math.ceil(total / limit);
        const paginatedProducts = products.slice(start, end);
        
        return {
          products: paginatedProducts,
          total,
          totalPages
        };
      }),
      catchError(error => {
        console.error('Error fetching paginated products:', error);
        return throwError(() => new Error('Failed to fetch paginated products'));
      })
    );
  }

  private getNextId(): number {
    const maxId = Math.max(...this.products.map(p => p.id), 0);
    return maxId + 1;
  }
}
