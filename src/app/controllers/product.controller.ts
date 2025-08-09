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

  getProducts(role?: string): Observable<Product[]> {
    return new Observable(observer => {
      this.productService.getProducts(role).subscribe({
        next: (products: any[]) => {
          const productModels = products.map(product => Product.fromJson(product));
          observer.next(productModels);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  getProduct(id: number): Observable<Product | undefined> {
    return new Observable(observer => {
      this.productService.getProduct(id).subscribe({
        next: (product: any) => {
          const productModel = product ? Product.fromJson(product) : undefined;
          observer.next(productModel);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  createProduct(productData: any): Observable<Product> {
    return new Observable(observer => {
      this.productService.createProduct(productData).subscribe({
        next: (product: any) => {
          const productModel = Product.fromJson(product);
          observer.next(productModel);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  updateProduct(id: number, productData: any): Observable<Product> {
    return new Observable(observer => {
      this.productService.updateProduct(id, productData).subscribe({
        next: (product: any) => {
          const productModel = Product.fromJson(product);
          observer.next(productModel);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  deleteProduct(id: number): Observable<boolean> {
    return this.productService.deleteProduct(id);
  }

  getStorageInfo(): { totalProducts: number; storageSize: number } {
    return this.productService.getStorageInfo();
  }

  clearAllProducts(): Observable<boolean> {
    return this.productService.clearAllProducts();
  }

  autoSaveToFile(): Observable<boolean> {
    return this.productService.autoSaveToFile();
  }

  saveToSpecificFile(): Observable<boolean> {
    return this.productService.saveToSpecificFile();
  }

  validateProduct(productData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!productData.name || productData.name.trim() === '') {
      errors.push('Product name is required');
    } else if (productData.name.length < 2) {
      errors.push('Product name must be at least 2 characters long');
    }

    if (!productData.description || productData.description.trim() === '') {
      errors.push('Product description is required');
    } else if (productData.description.length < 10) {
      errors.push('Product description must be at least 10 characters long');
    }

    if (!productData.price || productData.price <= 0) {
      errors.push('Product price must be greater than 0');
    }

    if (!productData.category || productData.category.trim() === '') {
      errors.push('Product category is required');
    }

    if (!productData.imageUrl || productData.imageUrl.trim() === '') {
      errors.push('Product image URL is required');
    } else if (!this.isValidUrl(productData.imageUrl)) {
      errors.push('Please enter a valid image URL');
    }

    if (productData.stock === undefined || productData.stock < 0) {
      errors.push('Product stock must be 0 or greater');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getProductCategories(): string[] {
    return [
      'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 
      'Automotive', 'Health & Beauty', 'Toys & Games', 'Food & Beverages', 'Jewelry'
    ];
  }

  getProductsByCategory(category: string, role?: string): Observable<Product[]> {
    return new Observable(observer => {
      this.getProducts(role).subscribe({
        next: (products: Product[]) => {
          const filteredProducts = products.filter(product => product.category === category);
          observer.next(filteredProducts);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  getProductsByPriceRange(minPrice: number, maxPrice: number, role?: string): Observable<Product[]> {
    return new Observable(observer => {
      this.getProducts(role).subscribe({
        next: (products: Product[]) => {
          const filteredProducts = products.filter(product => 
            product.price >= minPrice && product.price <= maxPrice
          );
          observer.next(filteredProducts);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  getInStockProducts(role?: string): Observable<Product[]> {
    return new Observable(observer => {
      this.getProducts(role).subscribe({
        next: (products: Product[]) => {
          const inStockProducts = products.filter(product => product.isInStock());
          observer.next(inStockProducts);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
