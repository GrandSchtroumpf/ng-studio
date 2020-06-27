import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatChipsModule } from '@angular/material/chips';

import { AppComponent } from './app.component';
import { FormFactoryModule } from 'ng-form-factory';
import { styleFormFactory } from 'ng-morph-form';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatChipsModule,
    FormFactoryModule.forRoot(styleFormFactory)
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
