import { Component, NgModule, Input } from '@angular/core';
import { FormOutlet, FormControlSchema } from 'ng-form-factory';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ColorPickerModule, ColorPickerService } from 'ngx-color-picker';


@Component({
  selector: 'form-color',
  template: `<input type="color" [formControl]="form"/>`,
  styles: [`
    :host {
      display: flex;
      border: var(--vscode-input-border);
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
    }
    input{
      border: none;
    }`
  ],
  providers: [ColorPickerService]
})
export class FormColorComponent implements FormOutlet {
  @Input() form: FormControl;
  @Input() schema: FormControlSchema;
}

@NgModule({
  declarations: [FormColorComponent],
  exports: [FormColorComponent],
  imports: [CommonModule, ReactiveFormsModule, ColorPickerModule]
})
export class FormColorModule {
  constructor() {
    console.log('COLOR LOADED');
  }
}