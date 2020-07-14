import { Component, NgModule, Input } from '@angular/core';
import { FormOutlet, FormControlSchema } from 'ng-form-factory';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'form-color',
  template: `
  <input [formControl]="form" [value]="form.valueChanges | async" type="text" />
  <input [formControl]="form" [value]="form.valueChanges | async" type="color" />
  `,
  styles: [`
    :host {
      display: flex;
      border: var(--vscode-input-border);
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
    }
    input{
      border: none;
      background: transparent;
    }`
  ]
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