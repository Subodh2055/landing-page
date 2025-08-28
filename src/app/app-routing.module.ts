import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/products',
    pathMatch: 'full'
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.module').then(m => m.ProductsModule)
  },
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart.module').then(m => m.CartModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'storage-debug',
    loadChildren: () => import('./features/storage-debug/storage-debug.module').then(m => m.StorageDebugModule)
  },
  {
    path: 'wishlist',
    loadChildren: () => import('./features/wishlist/wishlist.module').then(m => m.WishlistModule),
    canActivate: [AuthGuard]
  },
      {
      path: 'orders',
      loadChildren: () => import('./features/orders/orders.module').then(m => m.OrdersModule),
      canActivate: [AuthGuard]
    },
    {
      path: 'profile',
      loadChildren: () => import('./features/user-profile/user-profile.module').then(m => m.UserProfileModule),
      canActivate: [AuthGuard]
    },
  {
    path: '**',
    redirectTo: '/products'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
