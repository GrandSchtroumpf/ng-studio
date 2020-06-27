import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitComponent } from './unit.component';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [UnitComponent],
  exports: [UnitComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ]
})
export class FormUnitModule { }
