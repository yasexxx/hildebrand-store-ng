import { MainSharedModule } from './main-shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './core/footer/footer.component';
import { HeaderComponent } from './core/header/header.component';

import { LoadedDirective } from './directives/image/img.directives';

import { RouterComponent } from './router/router.component';
import { MatBadgeModule } from '@angular/material/badge';
import { WishlistComponent } from './core/wishlist/wishlist.component';
import { MatIconModule } from '@angular/material/icon';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SocialLoginModule } from 'angularx-social-login';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';



@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoadedDirective,
    FooterComponent,
    HeaderComponent,
    RouterComponent,
    WishlistComponent,
    PageNotFoundComponent

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatBadgeModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    Ng2SearchPipeModule,
    SimpleNotificationsModule.forRoot(),
    MainSharedModule.forRoot(),
    SocialLoginModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }