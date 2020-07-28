import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AppComponent } from './app.component';
import { FormFactoryModule } from 'ng-form-factory';
import { styleFormFactory } from 'ng-morph-form';
import { CLIENT } from 'ng-plugin';
import { Client } from './client';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    FormFactoryModule.forRoot(styleFormFactory)
  ],
  providers: [{ provide: CLIENT, useExisting: Client}],
  bootstrap: [AppComponent],
})
export class AppModule {}
