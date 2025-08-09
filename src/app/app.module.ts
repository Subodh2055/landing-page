import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MobileViewComponent } from './components/product-list/mobile-view/mobile-view.component';
import { DesktopViewComponent } from './components/product-list/desktop-view/desktop-view.component';

import { AuthService } from './services/auth.service';
import { ProductService } from './services/product.service';
import { MockBackendService } from './services/mock-backend.service';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthController } from './controllers/auth.controller';
import { ProductController } from './controllers/product.controller';

const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'products', component: ProductListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: ProductFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } }
];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ProductListComponent,
    ProductCardComponent,
    ProductFormComponent,
    LoginComponent,
    RegisterComponent,
    SidebarComponent,
    MobileViewComponent,
    DesktopViewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true
    })
  ],
  providers: [
    AuthService,
    ProductService,
    MockBackendService,
    AuthGuard,
    RoleGuard,
    AuthController,
    ProductController,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
