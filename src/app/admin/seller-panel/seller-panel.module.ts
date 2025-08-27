import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
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
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class SellerPanelModule { }
