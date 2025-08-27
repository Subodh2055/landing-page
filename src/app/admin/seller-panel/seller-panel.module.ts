import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SellerPanelComponent } from '../../components/admin/seller-panel/seller-panel.component';

const routes: Routes = [
  {
    path: '',
    component: SellerPanelComponent
  }
];

@NgModule({
  declarations: [
    SellerPanelComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class SellerPanelModule { }
