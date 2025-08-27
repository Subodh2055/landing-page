import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';

import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    UserManagementComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: AdminDashboardComponent },
      { path: 'analytics', loadChildren: () => import('../../admin/analytics/analytics.module').then(m => m.AnalyticsModule) },
      { path: 'products', loadChildren: () => import('../../admin/product-management/product-management.module').then(m => m.ProductManagementModule) },
      { path: 'users', component: UserManagementComponent },
      { path: 'seller', loadChildren: () => import('../../admin/seller-panel/seller-panel.module').then(m => m.SellerPanelModule) }
    ])
  ]
})
export class AdminModule { }
