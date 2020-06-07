import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormAttributeComponent } from './attribute.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
  declarations: [FormAttributeComponent],
  exports: [FormAttributeComponent],
  imports: [
    CommonModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ]
})
export class FormAttributeModule { }
