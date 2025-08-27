import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UserManagementComponent } from '../../components/admin/user-management/user-management.component';

const routes: Routes = [
  {
    path: '',
    component: UserManagementComponent
  }
];

@NgModule({
  declarations: [
    UserManagementComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class UserManagementModule { }
