import { Component, NgModule, Input } from '@angular/core';
import { FormOutlet, FormControlSchema } from 'ng-form-factory';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'form-color',
  template: `<input [formControl]="form" type="color" />`,
  styles: ['input{ border: none; background: transparent; }']
})
export class FormColorComponent implements FormOutlet {
  @Input() form: FormControl;
  @Input() schema: FormControlSchema;
}

@NgModule({
  declarations: [FormColorComponent],
  exports: [FormColorComponent],
  imports: [CommonModule, ReactiveFormsModule]
})
export class FormColorModule {}