import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProductManagementComponent } from '../../components/admin/product-management/product-management.component';

const routes: Routes = [
  {
    path: '',
    component: ProductManagementComponent
  }
];

@NgModule({
  declarations: [
    ProductManagementComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ProductManagementModule { }
