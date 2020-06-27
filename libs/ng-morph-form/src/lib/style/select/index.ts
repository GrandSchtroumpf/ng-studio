import { Component, Input, NgModule } from '@angular/core';
import { FormOutlet, FormControlSchema } from 'ng-form-factory';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SelectSchema extends FormControlSchema {
  options: string[];
}

export function selectSchema(params: Partial<SelectSchema> = {}): SelectSchema {
  return {
    form: 'control',
    load: 'select',
    options: [],
    ...params,
  };
}

@Component({
  selector: 'form-select',
  template: `
    <select [formControl]="form">
      <ng-container *ngFor="let option of schema.options">
        <option [value]="option">{{ option }}</option>
      </ng-container>
    </select>
  `,
})
export class FormSelectComponent implements FormOutlet {
  @Input() form: FormControl;
  @Input() schema: SelectSchema;
}

@NgModule({
  declarations: [FormSelectComponent],
  exports: [FormSelectComponent],
  imports: [CommonModule, ReactiveFormsModule],
})
export class FormSelectSchema {}
