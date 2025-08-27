import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductController {
  constructor(private productService: ProductService) {}

  getCategoryCount(category: string, role?: string): number {
    return this.productService.getCategoryCount(category, role);
  }

  getProducts(): Observable<Product[]> {
    return new Observable(observer => {
      this.productService.getProducts().subscribe({
        next: (products: Product[]) => {
          observer.next(products);
          observer.complete();
        },
        error: (error: any) => {
          observer.error(error);
        }
      });
    });
  }

  getProductById(id: number): Observable<Product> {
    return new Observable(observer => {
      this.productService.getProductById(id).subscribe({
        next: (product: Product) => {
          observer.next(product);
          observer.complete();
        },
        error: (error: any) => {
          observer.error(error);
        }
      });
    });
  }

  createProduct(productData: Omit<Product, 'id'>): Observable<Product> {
    return new Observable(observer => {
      this.productService.createProduct(productData).subscribe({
        next: (product: Product) => {
          observer.next(product);
          observer.complete();
        },
        error: (error: any) => {
          observer.error(error);
        }
      });
    });
  }

  updateProduct(id: number, productData: Partial<Product>): Observable<Product> {
    return new Observable(observer => {
      this.productService.updateProduct(id, productData).subscribe({
        next: (product: Product) => {
          observer.next(product);
          observer.complete();
        },
        error: (error: any) => {
          observer.error(error);
        }
      });
    });
  }

  deleteProduct(id: number): Observable<boolean> {
    return this.productService.deleteProduct(id);
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.productService.searchProducts(query);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.productService.getProductsByCategory(category);
  }

  getCategories(): Observable<any[]> {
    return this.productService.getCategories();
  }

  getFilteredProducts(filters: any): Observable<Product[]> {
    return this.productService.getFilteredProducts(filters);
  }

  getPaginatedProducts(page: number = 1, limit: number = 50): Observable<{products: Product[], total: number, totalPages: number}> {
    return this.productService.getPaginatedProducts(page, limit);
  }

  exportProducts(): Observable<string> {
    return this.productService.exportProducts();
  }

  importProducts(file: File): Observable<string> {
    return this.productService.importProducts(file);
  }

  getStorageInfo(): { products: number; totalSize: number } {
    return this.productService.getStorageInfo();
  }

  clearAllProducts(): Observable<boolean> {
    return this.productService.clearAllProducts();
  }

  autoSaveToFile(): Observable<string> {
    return this.productService.autoSaveToFile();
  }

  saveToSpecificFile(): Observable<string> {
    return this.productService.saveToSpecificFile();
  }

  // Expose the product service for direct access when needed
  get service(): ProductService {
    return this.productService;
  }
}
