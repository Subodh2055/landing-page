import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminDashboardComponent } from '../components/admin/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from '../components/admin/user-management/user-management.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent
  },
  {
    path: 'dashboard',
    component: AdminDashboardComponent
  },
  {
    path: 'users',
    component: UserManagementComponent
  },
  {
    path: 'analytics',
    loadChildren: () => import('./analytics/analytics.module').then(m => m.AnalyticsModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./product-management/product-management.module').then(m => m.ProductManagementModule)
  },
  {
    path: 'seller',
    loadChildren: () => import('./seller-panel/seller-panel.module').then(m => m.SellerPanelModule)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
