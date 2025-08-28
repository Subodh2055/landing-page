import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { WishlistComponent } from '../../components/wishlist/wishlist.component';

const routes: Routes = [
  {
    path: '',
    component: WishlistComponent
  }
];

@NgModule({
  declarations: [
    WishlistComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class WishlistModule { }
