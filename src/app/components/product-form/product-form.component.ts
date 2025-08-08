import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductController } from '../../controllers/product.controller';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  products: Product[] = [];
  editingProduct: Product | null = null;
  storageInfo: { totalProducts: number; storageSize: number } = { totalProducts: 0, storageSize: 0 };
  categories: string[] = [];
  loading = false;
  totalProducts = 0;
  inStockProducts = 0;
  outOfStockProducts = 0;
  successMessage = '';
  errorMessage = '';
  selectedImage: string | null = null;
  today: string;

  constructor(
    private fb: FormBuilder,
    private productController: ProductController,
    private toastr: ToastrService,
    private router: Router
  ) {
    // Set today's date for the calendar max value
    this.today = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.buildForm();
    this.loadProducts();
    this.updateStorageInfo();
    this.categories = this.productController.getProductCategories();
  }

  private buildForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      price: ['', [Validators.required, Validators.min(0.01), Validators.max(999999.99)]],
      category: ['', Validators.required],
      imageUrl: ['', Validators.required],
      role: ['', Validators.required],
      inStock: [true],
      createdAt: [this.today, Validators.required]
    });
  }

  // Image upload functionality
  triggerFileInput(): void {
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    fileInput?.click();
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Please select a valid image file.', 'Invalid File');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('Image size should be less than 5MB.', 'File Too Large');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
        this.productForm.patchValue({ imageUrl: e.target.result });
        this.toastr.success('Image uploaded successfully!', 'Success');
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.productForm.patchValue({ imageUrl: '' });
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Enhanced form validation
  private validateForm(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const form = this.productForm;

    // Name validation
    if (form.get('name')?.errors?.['required']) {
      errors.push('Product name is required');
    } else if (form.get('name')?.errors?.['minlength']) {
      errors.push('Product name must be at least 2 characters long');
    } else if (form.get('name')?.errors?.['maxlength']) {
      errors.push('Product name cannot exceed 100 characters');
    }

    // Description validation
    if (form.get('description')?.errors?.['required']) {
      errors.push('Product description is required');
    } else if (form.get('description')?.errors?.['minlength']) {
      errors.push('Product description must be at least 10 characters long');
    } else if (form.get('description')?.errors?.['maxlength']) {
      errors.push('Product description cannot exceed 500 characters');
    }

    // Price validation
    if (form.get('price')?.errors?.['required']) {
      errors.push('Product price is required');
    } else if (form.get('price')?.errors?.['min']) {
      errors.push('Product price must be at least $0.01');
    } else if (form.get('price')?.errors?.['max']) {
      errors.push('Product price cannot exceed $999,999.99');
    }

    // Category validation
    if (form.get('category')?.errors?.['required']) {
      errors.push('Product category is required');
    }

    // Image validation
    if (form.get('imageUrl')?.errors?.['required']) {
      errors.push('Product image is required');
    }

    // Role validation
    if (form.get('role')?.errors?.['required']) {
      errors.push('Access role is required');
    }

    // Creation date validation
    if (form.get('createdAt')?.errors?.['required']) {
      errors.push('Creation date is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private loadProducts(): void {
    this.loading = true;
    this.productController.getProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.updateStatistics();
        this.updateStorageInfo();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error('Failed to load products.', 'Error');
      }
    });
  }

  private updateStatistics(): void {
    this.totalProducts = this.products.length;
    this.inStockProducts = this.products.filter(p => p.isInStock()).length;
    this.outOfStockProducts = this.products.filter(p => !p.isInStock()).length;
  }

  private updateStorageInfo(): void {
    this.storageInfo = this.productController.getStorageInfo();
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      // Additional custom validation
      const validation = this.validateForm();
      if (!validation.isValid) {
        this.toastr.error(validation.errors.join(', '), 'Validation Error');
        return;
      }

      this.loading = true;
      const productData = this.productForm.value;
      
      // Convert inStock boolean to stock count
      productData.stock = productData.inStock ? Math.floor(Math.random() * 100) + 1 : 0;
      delete productData.inStock; // Remove the boolean field
      
      // Validate product using controller
      const controllerValidation = this.productController.validateProduct(productData);
      if (!controllerValidation.isValid) {
        this.toastr.error(controllerValidation.errors.join(', '), 'Validation Error');
        this.loading = false;
        return;
      }
      
      if (this.editingProduct) {
        this.productController.updateProduct(this.editingProduct.id, productData).subscribe({
          next: (product: Product) => {
            this.loading = false;
            this.toastr.success(`Product "${product.name}" updated successfully!`, 'Success');
            this.resetForm();
            this.loadProducts();
            // Navigate to home after successful update
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 1500);
          },
          error: (error) => {
            this.loading = false;
            this.toastr.error('Failed to update product.', 'Error');
          }
        });
      } else {
        this.productController.createProduct(productData).subscribe({
          next: (product: Product) => {
            this.loading = false;
            this.toastr.success(`Product "${product.name}" created successfully!`, 'Success');
            this.resetForm();
            this.loadProducts();
            // Navigate to home after successful creation
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 1500);
          },
          error: (error) => {
            this.loading = false;
            this.toastr.error('Failed to create product.', 'Error');
          }
        });
      }
    } else {
      this.toastr.warning('Please fill in all required fields correctly.', 'Validation Error');
      // Mark all fields as touched to show validation errors
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    const formData = {
      ...product,
      inStock: product.stock > 0, // Convert stock count to boolean
      createdAt: new Date(product.createdAt).toISOString().split('T')[0] // Format date for input
    };
    this.productForm.patchValue(formData);
    this.selectedImage = product.imageUrl; // Set the image preview
    this.toastr.info(`Editing product: ${product.name}`, 'Edit Mode');
  }

  deleteProduct(productId: number): void {
    this.productController.deleteProduct(productId).subscribe({
      next: () => {
        this.toastr.success('Product deleted successfully!', 'Success');
        this.loadProducts();
      },
      error: (error) => {
        this.toastr.error('Failed to delete product.', 'Error');
      }
    });
  }

  resetForm(): void {
    this.editingProduct = null;
    this.productForm.reset();
    this.buildForm();
  }

  resetData(): void {
    this.productController.clearAllProducts().subscribe({
      next: () => {
        const sampleProducts = this.productController['productService'].getSampleProducts();
        this.productController['productService']['products'] = sampleProducts;
        this.productController['productService']['saveProductsToStorage']();
        this.toastr.success('Data reset successfully!', 'Success');
        this.loadProducts();
      },
      error: (error) => {
        this.toastr.error('Failed to reset data.', 'Error');
      }
    });
  }

  exportData(): void {
    this.productController.autoSaveToFile().subscribe({
      next: (success) => {
        if (success) {
          this.toastr.success('Data exported successfully!', 'Export Success');
        } else {
          this.toastr.error('Failed to export data.', 'Export Error');
        }
      }
    });
  }

  importData(): void {
    // Create file input for import
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const jsonData = e.target.result;
            this.productController['productService'].importFromJson(jsonData).subscribe({
              next: (success) => {
                if (success) {
                  this.toastr.success('Data imported successfully!', 'Import Success');
                  this.loadProducts();
                } else {
                  this.toastr.error('Failed to import data.', 'Import Error');
                }
              }
            });
          } catch (error) {
            this.toastr.error('Invalid JSON file.', 'Import Error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  autoSaveToFile(): void {
    this.productController.autoSaveToFile().subscribe({
      next: (success) => {
        if (success) {
          this.toastr.success('Data exported successfully!', 'Export Success');
        } else {
          this.toastr.error('Failed to export data.', 'Export Error');
        }
      }
    });
  }

  saveToSpecificLocation(): void {
    this.productController.saveToSpecificFile().subscribe({
      next: (success) => {
        if (success) {
          this.toastr.success('Data saved to file successfully!', 'Save Success');
        } else {
          this.toastr.error('Failed to save data to file.', 'Save Error');
        }
      }
    });
  }

  clearAllData(): void {
    this.productController.clearAllProducts().subscribe({
      next: () => {
        this.toastr.success('All data cleared successfully!', 'Clear Success');
        this.loadProducts();
      },
      error: (error) => {
        this.toastr.error('Failed to clear data.', 'Clear Error');
      }
    });
  }
}
