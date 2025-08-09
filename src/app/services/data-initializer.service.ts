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
          name: "iPhone 15 Pro",
          description: "Latest iPhone with advanced camera system and A17 Pro chip",
          price: 999.99,
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
          stock: 50,
          rating: 4.8,
          reviews: 1250,
          role: "public",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 2,
          name: "MacBook Air M2",
          description: "Ultra-thin laptop with M2 chip for incredible performance",
          price: 1199.99,
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
          stock: 30,
          rating: 4.9,
          reviews: 890,
          role: "public",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 3,
          name: "Samsung Galaxy S24",
          description: "Android flagship with AI features and stunning display",
          price: 899.99,
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
          stock: 45,
          rating: 4.7,
          reviews: 1100,
          role: "public",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 4,
          name: "Nike Air Max 270",
          description: "Comfortable running shoes with Air Max technology",
          price: 129.99,
          category: "Sports",
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
          stock: 100,
          rating: 4.6,
          reviews: 750,
          role: "public",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 5,
          name: "Adidas Ultraboost 22",
          description: "Premium running shoes with responsive cushioning",
          price: 179.99,
          category: "Sports",
          image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop",
          stock: 75,
          rating: 4.8,
          reviews: 620,
          role: "public",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 6,
          name: "Sony WH-1000XM5",
          description: "Wireless noise-canceling headphones with premium sound",
          price: 349.99,
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
          stock: 25,
          rating: 4.9,
          reviews: 450,
          role: "public",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 7,
          name: "Levi's 501 Original Jeans",
          description: "Classic straight-fit jeans with timeless style",
          price: 89.99,
          category: "Fashion",
          image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
          stock: 200,
          rating: 4.5,
          reviews: 1200,
          role: "public",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 8,
          name: "Zara Oversized Blazer",
          description: "Trendy oversized blazer perfect for any occasion",
          price: 129.99,
          category: "Fashion",
          image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
          stock: 60,
          rating: 4.4,
          reviews: 380,
          role: "public",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 9,
          name: "KitchenAid Stand Mixer",
          description: "Professional stand mixer for all your baking needs",
          price: 399.99,
          category: "Home & Garden",
          image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
          stock: 40,
          rating: 4.9,
          reviews: 890,
          role: "public",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 10,
          name: "IKEA MALM Bed Frame",
          description: "Modern bed frame with clean lines and storage",
          price: 299.99,
          category: "Home & Garden",
          image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&h=400&fit=crop",
          stock: 35,
          rating: 4.6,
          reviews: 520,
          role: "public",
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
