import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

const STORAGE_KEY = 'products';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: any[] = [];

  constructor() {
    this.initializeProducts();
  }

  private initializeProducts(): void {
    const storedProducts = this.loadProductsFromStorage();
    if (storedProducts.length === 0) {
      this.products = this.getSampleProducts();
      this.saveProductsToStorage();
    } else {
      this.products = storedProducts;
    }
  }

  private loadProductsFromStorage(): any[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading products from storage:', error);
      return [];
    }
  }

  private saveProductsToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.products));
    } catch (error) {
      console.error('Error saving products to storage:', error);
    }
  }

  public getSampleProducts(): any[] {
    const categories = [
      'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 
      'Automotive', 'Health & Beauty', 'Toys & Games', 'Food & Beverages', 'Jewelry'
    ];

    const sampleProducts: any[] = [];
    let id = 1;

    // Generate 100 diverse products
    for (let i = 0; i < 100; i++) {
      const category = categories[i % categories.length];
      const price = Math.floor(Math.random() * 1000) + 10;
      const stock = Math.floor(Math.random() * 100) + 1;
      
      const product = {
        id: id++,
        name: this.generateProductName(category, i),
        description: this.generateProductDescription(category, i),
        price: price,
        category: category,
        imageUrl: `https://picsum.photos/400/300?random=${i}`,
        stock: stock,
        role: i < 30 ? 'public' : i < 70 ? 'user' : 'admin',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      };
      
      sampleProducts.push(product);
    }

    return sampleProducts;
  }

  private generateProductName(category: string, index: number): string {
    const names = {
      'Electronics': ['Smartphone', 'Laptop', 'Tablet', 'Headphones', 'Camera', 'Speaker', 'Monitor', 'Keyboard', 'Mouse', 'Router'],
      'Clothing': ['T-Shirt', 'Jeans', 'Dress', 'Sweater', 'Jacket', 'Shoes', 'Hat', 'Scarf', 'Socks', 'Belt'],
      'Home & Garden': ['Chair', 'Table', 'Lamp', 'Plant', 'Vase', 'Cushion', 'Rug', 'Mirror', 'Clock', 'Candle'],
      'Sports': ['Basketball', 'Football', 'Tennis Racket', 'Golf Club', 'Yoga Mat', 'Dumbbells', 'Bicycle', 'Helmet', 'Gloves', 'Water Bottle'],
      'Books': ['Novel', 'Textbook', 'Cookbook', 'Biography', 'Poetry', 'Magazine', 'Dictionary', 'Encyclopedia', 'Comic', 'Journal'],
      'Automotive': ['Car', 'Motorcycle', 'Bicycle', 'Tire', 'Oil', 'Battery', 'Brake Pad', 'Air Filter', 'Spark Plug', 'Windshield Wiper'],
      'Health & Beauty': ['Shampoo', 'Toothpaste', 'Deodorant', 'Perfume', 'Makeup', 'Sunscreen', 'Vitamins', 'Bandage', 'Thermometer', 'Scale'],
      'Toys & Games': ['Puzzle', 'Board Game', 'Doll', 'Action Figure', 'Building Blocks', 'Art Set', 'Remote Control Car', 'Plush Toy', 'Card Game', 'Science Kit'],
      'Food & Beverages': ['Coffee', 'Tea', 'Chocolate', 'Nuts', 'Cereal', 'Pasta', 'Sauce', 'Snacks', 'Juice', 'Water'],
      'Jewelry': ['Necklace', 'Ring', 'Earrings', 'Bracelet', 'Watch', 'Pendant', 'Anklet', 'Brooch', 'Cufflinks', 'Tiara']
    };

    const categoryNames = names[category as keyof typeof names] || ['Product'];
    const baseName = categoryNames[index % categoryNames.length];
    const adjectives = ['Premium', 'Deluxe', 'Professional', 'Classic', 'Modern', 'Vintage', 'Elegant', 'Sporty', 'Comfortable', 'Stylish'];
    const adjective = adjectives[index % adjectives.length];
    
    return `${adjective} ${baseName} ${String.fromCharCode(65 + (index % 26))}`;
  }

  private generateProductDescription(category: string, index: number): string {
    const descriptions = {
      'Electronics': 'High-quality electronic device with advanced features and modern design.',
      'Clothing': 'Comfortable and stylish clothing item perfect for everyday wear.',
      'Home & Garden': 'Beautiful home decor item that adds elegance to any space.',
      'Sports': 'Professional sports equipment designed for optimal performance.',
      'Books': 'Engaging and informative book that provides valuable knowledge.',
      'Automotive': 'Reliable automotive part that ensures vehicle safety and performance.',
      'Health & Beauty': 'Premium health and beauty product for personal care and wellness.',
      'Toys & Games': 'Fun and educational toy that provides hours of entertainment.',
      'Food & Beverages': 'Delicious and nutritious food product with excellent taste.',
      'Jewelry': 'Elegant jewelry piece that adds sophistication to any outfit.'
    };

    const baseDescription = descriptions[category as keyof typeof descriptions] || 'Quality product with excellent features.';
    return `${baseDescription} This item is carefully crafted and designed to meet your needs.`;
  }

  getProducts(role?: string): Observable<any[]> {
    let filteredProducts = [...this.products];
    
    if (role) {
      filteredProducts = this.products.filter(product => 
        product.role === 'public' || product.role === role
      );
    }
    
    return of(filteredProducts);
  }

  getProduct(id: number): Observable<any> {
    const product = this.products.find(p => p.id === id);
    return of(product);
  }

  createProduct(productData: any): Observable<any> {
    const newProduct = {
      ...productData,
      id: this.getNextId(),
      createdAt: new Date()
    };
    
    this.products.push(newProduct);
    this.saveProductsToStorage();
    return of(newProduct);
  }

  updateProduct(id: number, productData: any): Observable<any> {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...productData };
      this.saveProductsToStorage();
      return of(this.products[index]);
    }
    throw new Error('Product not found');
  }

  deleteProduct(id: number): Observable<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      this.saveProductsToStorage();
      return of(true);
    }
    return of(false);
  }

  private getNextId(): number {
    return Math.max(...this.products.map(p => p.id), 0) + 1;
  }

  exportToJson(): Observable<string> {
    return of(JSON.stringify(this.products, null, 2));
  }

  importFromJson(jsonData: string): Observable<boolean> {
    try {
      const importedProducts = JSON.parse(jsonData);
      if (Array.isArray(importedProducts)) {
        this.products = importedProducts;
        this.saveProductsToStorage();
        return of(true);
      }
      return of(false);
    } catch (error) {
      return of(false);
    }
  }

  // Clear all products from localStorage
  clearAllProducts(): Observable<boolean> {
    try {
      localStorage.removeItem(STORAGE_KEY);
      this.products = [];
      return of(true);
    } catch (error) {
      return of(false);
    }
  }

  // Get storage info
  getStorageInfo(): { totalProducts: number; storageSize: number } {
    const totalProducts = this.products.length;
    
    // Calculate storage size in bytes
    const productsJson = JSON.stringify(this.products);
    const storageSizeBytes = productsJson.length;
    
    return {
      totalProducts,
      storageSize: storageSizeBytes
    };
  }

  // Check if localStorage is available
  isLocalStorageAvailable(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Auto-save to file
  autoSaveToFile(): Observable<boolean> {
    try {
      const products = this.loadProductsFromStorage();
      const jsonData = JSON.stringify(products, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `products_backup_${timestamp}.json`;
      
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return of(true);
    } catch (error) {
      return of(false);
    }
  }

  // Save to specific file path (requires user permission)
  saveToSpecificFile(): Observable<boolean> {
    return new Observable(observer => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.webkitdirectory = true; // This property is non-standard and might not work as expected for directory selection
      
      input.onchange = (event: any) => {
        const file = event.target.files[0]; // This will be a file, not a directory
        if (file) {
          const products = this.loadProductsFromStorage();
          const jsonData = JSON.stringify(products, null, 2);
          
          // Use File System Access API if available
          if ('showSaveFilePicker' in window) {
            (window as any).showSaveFilePicker({
              suggestedName: 'products.json',
              types: [{
                description: 'JSON Files',
                accept: { 'application/json': ['.json'] }
              }]
            }).then((fileHandle: any) => {
              fileHandle.createWritable().then((writable: any) => {
                writable.write(jsonData);
                writable.close();
                observer.next(true);
                observer.complete();
              });
            }).catch(() => {
              observer.next(false);
              observer.complete();
            });
          } else {
            // Fallback to download
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'products.json';
            a.click();
            window.URL.revokeObjectURL(url);
            observer.next(true);
            observer.complete();
          }
        } else {
          observer.next(false);
          observer.complete();
        }
      };
      
      input.click();
    });
  }
}
