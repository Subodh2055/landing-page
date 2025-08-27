import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { MobileViewComponent } from '../../components/product-list/mobile-view/mobile-view.component';
import { DesktopViewComponent } from '../../components/product-list/desktop-view/desktop-view.component';
import { SearchComponent } from '../../components/search/search.component';

const routes: Routes = [
  {
    path: '',
    component: ProductListComponent
  }
];

@NgModule({
  declarations: [
    ProductListComponent,
    ProductCardComponent,
    SidebarComponent,
    MobileViewComponent,
    DesktopViewComponent,
    SearchComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ProductsModule { }
