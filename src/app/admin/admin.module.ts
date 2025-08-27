import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminDashboardComponent } from '../components/admin/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from '../components/admin/user-management/user-management.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    UserManagementComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
