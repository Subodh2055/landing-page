import { Component, OnInit } from '@angular/core';
import { LocalStorageUtil } from '../../utils/local-storage.util';

@Component({
  selector: 'app-storage-debug',
  template: `
    <div class="storage-debug-container">
      <h3>LocalStorage Debug Panel</h3>
      
      <div class="storage-stats">
        <h4>Storage Statistics</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total Items:</span>
            <span class="stat-value">{{ storageStats.totalItems }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Size:</span>
            <span class="stat-value">{{ formatBytes(storageStats.totalSize) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Used Space:</span>
            <span class="stat-value">{{ formatBytes(storageStats.usage.used) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Available:</span>
            <span class="stat-value">{{ formatBytes(storageStats.usage.available) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Usage %:</span>
            <span class="stat-value">{{ storageStats.usage.percentage.toFixed(1) }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Expired Items:</span>
            <span class="stat-value">{{ storageStats.expiredItems }}</span>
          </div>
        </div>
      </div>

      <div class="storage-actions">
        <h4>Storage Actions</h4>
        <div class="action-buttons">
          <button (click)="clearExpired()" class="btn btn-warning">
            Clear Expired Items
          </button>
          <button (click)="clearAll()" class="btn btn-danger">
            Clear All Data
          </button>
          <button (click)="exportData()" class="btn btn-info">
            Export Data
          </button>
          <button (click)="createBackup()" class="btn btn-success">
            Create Backup
          </button>
        </div>
      </div>

      <div class="storage-items">
        <h4>Storage Items</h4>
        <div class="items-list">
          <div *ngFor="let item of storageItems" class="item-card">
            <div class="item-header">
              <span class="item-key">{{ item.key }}</span>
              <span class="item-type">{{ getItemType(item.value) }}</span>
            </div>
            <div class="item-value">
              <pre>{{ formatItemValue(item.value) }}</pre>
            </div>
            <div class="item-actions">
              <button (click)="removeItem(item.key)" class="btn btn-sm btn-danger">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="test-actions">
        <h4>Test Actions</h4>
        <div class="test-buttons">
          <button (click)="testSetItem()" class="btn btn-primary">
            Test Set Item
          </button>
          <button (click)="testSetItemWithExpiry()" class="btn btn-secondary">
            Test Set Item with Expiry (1 min)
          </button>
          <button (click)="testEncryption()" class="btn btn-dark">
            Test Encryption
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .storage-debug-container {
      padding: 20px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 10px;
      margin: 20px;
    }

    .storage-stats {
      margin-bottom: 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 5px;
    }

    .stat-label {
      font-weight: bold;
    }

    .stat-value {
      color: #667eea;
    }

    .storage-actions, .storage-items, .test-actions {
      margin-bottom: 20px;
    }

    .action-buttons, .test-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 10px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .btn-primary { background: #667eea; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-success { background: #28a745; color: white; }
    .btn-warning { background: #ffc107; color: black; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-info { background: #17a2b8; color: white; }
    .btn-dark { background: #343a40; color: white; }
    .btn-sm { padding: 4px 8px; font-size: 12px; }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .items-list {
      display: grid;
      gap: 10px;
      margin-top: 10px;
    }

    .item-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 5px;
      padding: 15px;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .item-key {
      font-weight: bold;
      color: #667eea;
    }

    .item-type {
      background: rgba(102, 126, 234, 0.2);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
    }

    .item-value {
      background: rgba(0, 0, 0, 0.1);
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 10px;
    }

    .item-value pre {
      margin: 0;
      font-size: 12px;
      color: #fff;
      overflow-x: auto;
    }

    .item-actions {
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class StorageDebugComponent implements OnInit {
  storageStats: any = {};
  storageItems: Array<{ key: string; value: any }> = [];

  constructor(private localStorageUtil: LocalStorageUtil) {}

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.storageStats = this.localStorageUtil.getStorageStats();
    this.storageItems = this.getStorageItems();
  }

  getStorageItems(): Array<{ key: string; value: any }> {
    const items: Array<{ key: string; value: any }> = [];
    const keys = this.localStorageUtil.getKeys();
    
    keys.forEach(key => {
      const value = this.localStorageUtil.getItem(key);
      if (value !== null) {
        items.push({ key, value });
      }
    });
    
    return items;
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getItemType(value: any): string {
    if (Array.isArray(value)) return 'Array';
    if (value === null) return 'Null';
    if (typeof value === 'object') return 'Object';
    return typeof value;
  }

  formatItemValue(value: any): string {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  clearExpired(): void {
    const cleared = this.localStorageUtil.clearExpired();
    console.log(`Cleared ${cleared} expired items`);
    this.refreshData();
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all data?')) {
      this.localStorageUtil.clearAll();
      console.log('All data cleared');
      this.refreshData();
    }
  }

  exportData(): void {
    const data = this.localStorageUtil.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `localstorage-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  createBackup(): void {
    const backup = this.localStorageUtil.backup();
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `localstorage-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  removeItem(key: string): void {
    if (confirm(`Are you sure you want to remove "${key}"?`)) {
      this.localStorageUtil.removeItem(key);
      console.log(`Item "${key}" removed`);
      this.refreshData();
    }
  }

  testSetItem(): void {
    const testData = {
      message: 'Hello from LocalStorageUtil!',
      timestamp: new Date().toISOString(),
      random: Math.random()
    };
    
    const success = this.localStorageUtil.setItem('test_item', testData);
    if (success) {
      console.log('Test item set successfully');
      this.refreshData();
    } else {
      console.error('Failed to set test item');
    }
  }

  testSetItemWithExpiry(): void {
    const testData = {
      message: 'This item will expire in 1 minute',
      timestamp: new Date().toISOString()
    };
    
    const success = this.localStorageUtil.setItemWithExpiry('test_expiry_item', testData, 1);
    if (success) {
      console.log('Test expiry item set successfully');
      this.refreshData();
    } else {
      console.error('Failed to set test expiry item');
    }
  }

  testEncryption(): void {
    // Configure encryption
    this.localStorageUtil.configure({ encryptionEnabled: true });
    
    const testData = {
      secret: 'This is encrypted data',
      timestamp: new Date().toISOString()
    };
    
    const success = this.localStorageUtil.setItem('test_encrypted_item', testData);
    if (success) {
      console.log('Test encrypted item set successfully');
      this.refreshData();
      
      // Disable encryption for other operations
      this.localStorageUtil.configure({ encryptionEnabled: false });
    } else {
      console.error('Failed to set test encrypted item');
    }
  }
}
