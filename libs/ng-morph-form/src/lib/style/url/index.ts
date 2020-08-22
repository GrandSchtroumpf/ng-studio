import { Component, Input, NgModule, ViewChild, Renderer2, ElementRef, forwardRef, Inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormOutlet } from 'ng-form-factory';
import { PluginClient } from '@remixproject/plugin';
import { CLIENT } from 'ng-plugin';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule, Clipboard } from '@angular/cdk/clipboard';
import { UrlSchema } from './schema';




@Component({
  selector: 'form-url',
  template: '<form-url-accessor [formControl]="form" [schema]="schema"></form-url-accessor>',
  styles: [':host { display: block }']
})
export class FormUrlComponent implements FormOutlet {
  @Input() schema: UrlSchema;
  @Input() form: FormControl;
}


////////////////////////////
// CONTROL VALUE ACCESSOR //
////////////////////////////


@Component({
  selector: 'form-url-accessor',
  template: `
    <button mat-icon-button [disabled]="disabled" (click)="copy()">
      <mat-icon>content_copy</mat-icon>
    </button>
    <input type="url" [value]="value" (change)="onChange($event.target.value)" (blur)="onTouched()" [disabled]="disabled" />
    <button mat-icon-button [disabled]="disabled" (click)="selectUrl()">
      <mat-icon>cloud_upload</mat-icon>
    </button>
  `,
  styles: [`
    :host {
      display: flex;
      border: var(--vscode-input-border);
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
    }
    input{
      flex: 1;
      border: none;
      background: transparent;
    }`
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FormUrlAccessorComponent),
    multi: true
  }]
})
export class FormUrlAccessorComponent implements ControlValueAccessor {
  onChange: (url: string) => void;
  onTouched: () => void;
  disabled: boolean;
  value: string;

  @Input() schema: UrlSchema;
  @ViewChild('input') form: ElementRef<HTMLInputElement>;

  constructor(
    @Inject(CLIENT) private client: PluginClient<any, any>,
    private clipboard: Clipboard
  ) {}

  copy() {
    this.clipboard.copy(this.value);
  }

  selectUrl() {
    this.client.call('window', 'selectFile', { relative: true, formats: this.schema.formats })
    .then(path => {
      this.value = path;
      this.onChange(path);
    });
  }

  writeValue(value: any): void {
    if (value) {
      const regex = new RegExp(/\((?<url>.*?)\)/g); // url('https://') -> 'https://'
      const { url } = regex.exec(value).groups;
      const path = url.replace(/("|')/g, '');       // 'https://' -> https://
      this.value = path;
    } else {
      this.value = '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = (url: string) => fn(`url(${url})`);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}



@NgModule({
  declarations: [FormUrlComponent, FormUrlAccessorComponent],
  exports: [FormUrlComponent, FormUrlAccessorComponent],
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule, ClipboardModule],
})
export class FormUrlSchema {
  constructor() {
    console.log('URL LOADED');
  }
}
