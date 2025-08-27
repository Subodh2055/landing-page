import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
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
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ProductManagementModule { }
