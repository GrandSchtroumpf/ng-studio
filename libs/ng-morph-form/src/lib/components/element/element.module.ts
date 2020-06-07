import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormElementComponent, InputContextPipe, OutputContextPipe } from './element.component';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormAttributeModule } from '../attribute/attribute.module';

@NgModule({
  declarations: [FormElementComponent, InputContextPipe, OutputContextPipe],
  exports: [FormElementComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormAttributeModule,

    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatExpansionModule,
  ]
})
export class FormElementModule { }
