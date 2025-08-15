import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class DataInitializerService {
  private readonly PRODUCTS_STORAGE_KEY = 'products_data';
  private readonly USERS_STORAGE_KEY = 'users_data';

  constructor() {}

  initializeDefaultData(): void {
    this.initializeUsers();
    this.initializeProducts();
  }

  private initializeUsers(): void {
    const existingUsers = this.loadFromLocalStorage(this.USERS_STORAGE_KEY);
    if (existingUsers.length === 0) {
      const defaultUsers = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          mobileNumber: '+1234567890',
          role: 'admin',
          password: 'admin123',
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          username: 'user',
          email: 'user@example.com',
          mobileNumber: '+9876543210',
          role: 'user',
          password: 'user123',
          createdAt: '2024-01-02T00:00:00.000Z'
        }
      ];
      this.saveToLocalStorage(this.USERS_STORAGE_KEY, defaultUsers);
    }
  }

  private initializeProducts(): void {
    const existingProducts = this.loadFromLocalStorage(this.PRODUCTS_STORAGE_KEY);
    if (existingProducts.length === 0) {
      const defaultProducts = [
        {
          id: 1,
          name: "iPhone 15 Pro Max",
          description: "Latest iPhone with advanced camera system, A17 Pro chip, and titanium design",
          price: 1199.99,
          originalPrice: 1299.99,
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
          stock: 25,
          rating: 4.8,
          reviews: 1250,
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 2,
          name: "MacBook Pro M3",
          description: "Professional laptop with M3 chip for incredible performance and battery life",
          price: 1999.99,
          originalPrice: 2199.99,
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
          stock: 15,
          rating: 4.9,
          reviews: 890,
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 3,
          name: "Samsung Galaxy S24 Ultra",
          description: "Android flagship with AI features, S Pen, and stunning display",
          price: 1299.99,
          originalPrice: 1399.99,
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
          stock: 30,
          rating: 4.7,
          reviews: 1100,
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 4,
          name: "Nike Air Jordan 1 Retro",
          description: "Classic basketball shoes with premium leather and iconic design",
          price: 179.99,
          originalPrice: 199.99,
          category: "Sports",
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
          stock: 50,
          rating: 4.6,
          reviews: 750,
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 5,
          name: "Adidas Ultraboost 23",
          description: "Premium running shoes with responsive cushioning and energy return",
          price: 189.99,
          originalPrice: 219.99,
          category: "Sports",
          image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop",
          stock: 40,
          rating: 4.8,
          reviews: 620,
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 6,
          name: "Sony WH-1000XM6",
          description: "Wireless noise-canceling headphones with premium sound and long battery life",
          price: 399.99,
          originalPrice: 449.99,
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
          stock: 20,
          rating: 4.9,
          reviews: 450,
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 7,
          name: "Levi's 501 Original Jeans",
          description: "Classic straight-fit jeans with timeless style and premium denim",
          price: 89.99,
          originalPrice: 109.99,
          category: "Fashion",
          image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
          stock: 100,
          rating: 4.5,
          reviews: 1200,
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 8,
          name: "Zara Oversized Blazer",
          description: "Trendy oversized blazer perfect for any occasion with modern fit",
          price: 129.99,
          originalPrice: 159.99,
          category: "Fashion",
          image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
          stock: 35,
          rating: 4.4,
          reviews: 380,
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 9,
          name: "KitchenAid Professional Stand Mixer",
          description: "Professional stand mixer for all your baking needs with 10 speeds",
          price: 449.99,
          originalPrice: 499.99,
          category: "Home & Garden",
          image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
          stock: 25,
          rating: 4.9,
          reviews: 890,
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 10,
          name: "IKEA MALM Bed Frame",
          description: "Modern bed frame with clean lines, storage, and queen size",
          price: 299.99,
          originalPrice: 349.99,
          category: "Home & Garden",
          image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&h=400&fit=crop",
          stock: 20,
          rating: 4.6,
          reviews: 520,
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 11,
          name: "Apple Watch Series 9",
          description: "Latest smartwatch with health monitoring and fitness tracking",
          price: 399.99,
          originalPrice: 429.99,
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop",
          stock: 45,
          rating: 4.7,
          reviews: 680,
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 12,
          name: "Dyson V15 Detect",
          description: "Cordless vacuum with laser technology and powerful suction",
          price: 699.99,
          originalPrice: 799.99,
          category: "Home & Garden",
          image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop",
          stock: 15,
          rating: 4.8,
          reviews: 420,
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 13,
          name: "Canon EOS R6 Mark II",
          description: "Professional mirrorless camera with 4K video and fast autofocus",
          price: 2499.99,
          originalPrice: 2799.99,
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop",
          stock: 8,
          rating: 4.9,
          reviews: 156,
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 14,
          name: "Nike Dri-FIT Training Set",
          description: "Moisture-wicking workout clothes for maximum comfort during training",
          price: 89.99,
          originalPrice: 119.99,
          category: "Sports",
          image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop",
          stock: 60,
          rating: 4.5,
          reviews: 320,
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 15,
          name: "Ray-Ban Aviator Classic",
          description: "Timeless aviator sunglasses with UV protection and gold frame",
          price: 159.99,
          originalPrice: 189.99,
          category: "Fashion",
          image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
          stock: 75,
          rating: 4.6,
          reviews: 890,
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        }
      ];
      this.saveToLocalStorage(this.PRODUCTS_STORAGE_KEY, defaultProducts);
    }
  }

  private loadFromLocalStorage(key: string): any[] {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(`Error loading from localStorage (${key}):`, error);
      return [];
    }
  }

  private saveToLocalStorage(key: string, data: any[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
    }
  }

  // Clear all data (for testing)
  clearAllData(): void {
    try {
      localStorage.removeItem(this.PRODUCTS_STORAGE_KEY);
      localStorage.removeItem(this.USERS_STORAGE_KEY);
      localStorage.removeItem('auth_token');
      console.log('All data cleared from localStorage');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  // Get storage info
  getStorageInfo(): { products: number; users: number; totalSize: number } {
    const products = this.loadFromLocalStorage(this.PRODUCTS_STORAGE_KEY);
    const users = this.loadFromLocalStorage(this.USERS_STORAGE_KEY);
    
    const productsJson = JSON.stringify(products);
    const usersJson = JSON.stringify(users);
    const totalSize = productsJson.length + usersJson.length;
    
    return {
      products: products.length,
      users: users.length,
      totalSize
    };
  }
}
