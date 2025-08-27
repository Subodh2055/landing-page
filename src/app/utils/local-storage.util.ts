import { Injectable } from '@angular/core';

export interface StorageItem {
  key: string;
  value: any;
  expiry?: number;
  encrypted?: boolean;
}

export interface StorageConfig {
  prefix: string;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  maxSize: number; // in bytes
}

@Injectable({
  providedIn: 'root'
})
export class LocalStorageUtil {
  private readonly DEFAULT_CONFIG: StorageConfig = {
    prefix: 'producthub_',
    encryptionEnabled: false,
    compressionEnabled: false,
    maxSize: 5 * 1024 * 1024 // 5MB
  };

  private config: StorageConfig = { ...this.DEFAULT_CONFIG };

  constructor() {
    this.initializeStorage();
  }

  /**
   * Initialize storage and check for any issues
   */
  private initializeStorage(): void {
    try {
      // Test if localStorage is available
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      // Check storage quota
      this.checkStorageQuota();
      
      console.log('LocalStorage initialized successfully');
    } catch (error) {
      console.error('LocalStorage initialization failed:', error);
      throw new Error('LocalStorage is not available');
    }
  }

  /**
   * Configure the storage utility
   */
  configure(config: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('LocalStorage configured:', this.config);
  }

  /**
   * Get the full key with prefix
   */
  private getFullKey(key: string): string {
    return `${this.config.prefix}${key}`;
  }

  /**
   * Check if localStorage has enough space
   */
  private checkStorageQuota(): void {
    try {
      const testData = 'x'.repeat(1024); // 1KB test data
      const testKey = '__quota_test__';
      
      // Try to store test data
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
    } catch (error) {
      console.warn('Storage quota warning:', error);
    }
  }

  /**
   * Get current storage usage
   */
  getStorageUsage(): { used: number; available: number; percentage: number } {
    try {
      let used = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.config.prefix)) {
          used += localStorage.getItem(key)?.length || 0;
        }
      }
      
      const available = this.config.maxSize - used;
      const percentage = (used / this.config.maxSize) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Set an item in localStorage
   */
  setItem(key: string, value: any, options?: { expiry?: number; encrypted?: boolean }): boolean {
    try {
      const fullKey = this.getFullKey(key);
      const item: StorageItem = {
        key: fullKey,
        value: value,
        expiry: options?.expiry,
        encrypted: options?.encrypted || this.config.encryptionEnabled
      };

      // Check storage quota before saving
      const serializedValue = JSON.stringify(item);
      if (serializedValue.length > this.config.maxSize) {
        console.error('Item too large for storage:', serializedValue.length, 'bytes');
        return false;
      }

      // Encrypt if needed
      const finalValue = item.encrypted ? this.encrypt(serializedValue) : serializedValue;
      
      localStorage.setItem(fullKey, finalValue);
      
      console.log(`Item stored successfully: ${key}`);
      return true;
    } catch (error) {
      console.error(`Error storing item ${key}:`, error);
      return false;
    }
  }

  /**
   * Get an item from localStorage
   */
  getItem<T = any>(key: string): T | null {
    try {
      const fullKey = this.getFullKey(key);
      const storedValue = localStorage.getItem(fullKey);
      
      if (storedValue === null) {
        return null;
      }

      // Try to decrypt if needed
      let decryptedValue: string;
      try {
        decryptedValue = this.decrypt(storedValue);
      } catch {
        // If decryption fails, assume it's not encrypted
        decryptedValue = storedValue;
      }

      const item: StorageItem = JSON.parse(decryptedValue);
      
      // Check if item has expired
      if (item.expiry && Date.now() > item.expiry) {
        console.log(`Item expired: ${key}`);
        this.removeItem(key);
        return null;
      }

      return item.value as T;
    } catch (error) {
      console.error(`Error retrieving item ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove an item from localStorage
   */
  removeItem(key: string): boolean {
    try {
      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
      console.log(`Item removed successfully: ${key}`);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if an item exists
   */
  hasItem(key: string): boolean {
    try {
      const fullKey = this.getFullKey(key);
      return localStorage.getItem(fullKey) !== null;
    } catch (error) {
      console.error(`Error checking item ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all keys with the configured prefix
   */
  getKeys(): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.config.prefix)) {
          // Remove prefix from key
          const cleanKey = key.replace(this.config.prefix, '');
          keys.push(cleanKey);
        }
      }
      return keys;
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  }

  /**
   * Get all items with the configured prefix
   */
  getAllItems(): { [key: string]: any } {
    try {
      const items: { [key: string]: any } = {};
      const keys = this.getKeys();
      
      keys.forEach(key => {
        const value = this.getItem(key);
        if (value !== null) {
          items[key] = value;
        }
      });
      
      return items;
    } catch (error) {
      console.error('Error getting all items:', error);
      return {};
    }
  }

  /**
   * Clear all items with the configured prefix
   */
  clearAll(): boolean {
    try {
      const keys = this.getKeys();
      keys.forEach(key => this.removeItem(key));
      console.log('All items cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing all items:', error);
      return false;
    }
  }

  /**
   * Clear expired items
   */
  clearExpired(): number {
    try {
      let clearedCount = 0;
      const keys = this.getKeys();
      
      keys.forEach(key => {
        const value = this.getItem(key);
        if (value === null) {
          // Item was expired and removed
          clearedCount++;
        }
      });
      
      console.log(`Cleared ${clearedCount} expired items`);
      return clearedCount;
    } catch (error) {
      console.error('Error clearing expired items:', error);
      return 0;
    }
  }

  /**
   * Simple encryption (for demonstration - use proper encryption in production)
   */
  private encrypt(text: string): string {
    if (!this.config.encryptionEnabled) {
      return text;
    }
    
    try {
      // Simple base64 encoding with a simple shift cipher
      const shifted = text.split('').map(char => 
        String.fromCharCode(char.charCodeAt(0) + 1)
      ).join('');
      return btoa(shifted);
    } catch (error) {
      console.error('Encryption failed:', error);
      return text;
    }
  }

  /**
   * Simple decryption (for demonstration - use proper decryption in production)
   */
  private decrypt(encryptedText: string): string {
    if (!this.config.encryptionEnabled) {
      return encryptedText;
    }
    
    try {
      // Simple base64 decoding with a simple shift cipher
      const decoded = atob(encryptedText);
      const unshifted = decoded.split('').map(char => 
        String.fromCharCode(char.charCodeAt(0) - 1)
      ).join('');
      return unshifted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedText;
    }
  }

  /**
   * Set item with expiry time
   */
  setItemWithExpiry(key: string, value: any, expiryMinutes: number): boolean {
    const expiry = Date.now() + (expiryMinutes * 60 * 1000);
    return this.setItem(key, value, { expiry });
  }

  /**
   * Set item with TTL (Time To Live) in seconds
   */
  setItemWithTTL(key: string, value: any, ttlSeconds: number): boolean {
    const expiry = Date.now() + (ttlSeconds * 1000);
    return this.setItem(key, value, { expiry });
  }

  /**
   * Get item expiry time
   */
  getItemExpiry(key: string): number | null {
    try {
      const fullKey = this.getFullKey(key);
      const storedValue = localStorage.getItem(fullKey);
      
      if (storedValue === null) {
        return null;
      }

      let decryptedValue: string;
      try {
        decryptedValue = this.decrypt(storedValue);
      } catch {
        decryptedValue = storedValue;
      }

      const item: StorageItem = JSON.parse(decryptedValue);
      return item.expiry || null;
    } catch (error) {
      console.error(`Error getting expiry for ${key}:`, error);
      return null;
    }
  }

  /**
   * Check if item is expired
   */
  isItemExpired(key: string): boolean {
    const expiry = this.getItemExpiry(key);
    return expiry !== null && Date.now() > expiry;
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): {
    totalItems: number;
    totalSize: number;
    usage: { used: number; available: number; percentage: number };
    expiredItems: number;
  } {
    try {
      const keys = this.getKeys();
      const usage = this.getStorageUsage();
      let totalSize = 0;
      let expiredItems = 0;

      keys.forEach(key => {
        const fullKey = this.getFullKey(key);
        const value = localStorage.getItem(fullKey);
        if (value) {
          totalSize += value.length;
        }
        
        if (this.isItemExpired(key)) {
          expiredItems++;
        }
      });

      return {
        totalItems: keys.length,
        totalSize,
        usage,
        expiredItems
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalItems: 0,
        totalSize: 0,
        usage: { used: 0, available: 0, percentage: 0 },
        expiredItems: 0
      };
    }
  }

  /**
   * Backup all data
   */
  backup(): string {
    try {
      const data = this.getAllItems();
      const backup = {
        timestamp: new Date().toISOString(),
        config: this.config,
        data: data
      };
      return JSON.stringify(backup);
    } catch (error) {
      console.error('Error creating backup:', error);
      return '';
    }
  }

  /**
   * Restore from backup
   */
  restore(backupData: string): boolean {
    try {
      const backup = JSON.parse(backupData);
      
      // Clear existing data
      this.clearAll();
      
      // Restore data
      Object.keys(backup.data).forEach(key => {
        this.setItem(key, backup.data[key]);
      });
      
      console.log('Backup restored successfully');
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }

  /**
   * Export data as JSON
   */
  exportData(): string {
    try {
      const data = this.getAllItems();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return '';
    }
  }

  /**
   * Import data from JSON
   */
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      Object.keys(data).forEach(key => {
        this.setItem(key, data[key]);
      });
      
      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}
