import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { OrdersListComponent } from '../../components/orders-list/orders-list.component';
import { OrderTrackingComponent } from '../../components/order-tracking/order-tracking.component';

const routes: Routes = [
  {
    path: '',
    component: OrdersListComponent
  },
  {
    path: ':orderId',
    component: OrderTrackingComponent
  },
  {
    path: ':orderId/track',
    component: OrderTrackingComponent
  }
];

@NgModule({
  declarations: [
    OrdersListComponent,
    OrderTrackingComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class OrdersModule { }
