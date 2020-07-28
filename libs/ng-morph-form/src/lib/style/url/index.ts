import { Component, Input, NgModule, ViewChild, Renderer2, ElementRef, forwardRef, Inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormOutlet, FormControlSchema } from 'ng-form-factory';
import { PluginClient } from '@remixproject/plugin';
import { CLIENT } from 'ng-plugin';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { format } from 'path';

const formats = {
  Images: ['png', 'webp', 'jpg', 'jpeg', 'svg'],
  Javascript: ['js', 'jsx', 'ts', 'tsx'],
}
export interface UrlSchema extends FormControlSchema {
  formats: (keyof typeof formats)[];
}

export function urlSchema(params: Partial<UrlSchema> = {}): UrlSchema {
  return {
    form: 'control',
    load: 'url',
    formats: ['Images'],
    ...params,
  };
}

@Component({
  selector: 'form-url',
  template: '<form-url-accessor [formControl]="form" [schema]="schema"></form-url-accessor>',
  styles: [':host { display: block }']
})
export class FormUrlComponent implements FormOutlet {
  @Input() schema: UrlSchema;
  @Input() form: FormControl;
}


@Component({
  selector: 'form-url-accessor',
  template: `
    <input #input type="url" (change)="onChange($event.target.value)" (blur)="onTouched()" [disabled]="disabled" />
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

  @Input() schema: UrlSchema;
  @ViewChild('input') form: ElementRef<HTMLInputElement>;

  constructor(
    @Inject(CLIENT) private client: PluginClient<any, any>,
    private renderer: Renderer2
  ) {}

  private update(value: string) {
    this.renderer.setProperty(this.form.nativeElement, 'value', value);
  }

  selectUrl() {
    const filters = {};
    this.schema.formats.forEach(name => filters[name] = formats[name]);
    this.client.call('window', 'selectFile', { filters }).then(path => {
      this.update(path);
      this.onChange(path);
    });
  }

  writeValue(value: any): void {
    if (value) {
      const regex = new RegExp(/\((?<url>.*?)\)/g); // url('https://') -> 'https://'
      const { url } = regex.exec(value).groups;
      const path = url.replace(/("|')/g, '');       // 'https://' -> https://
      this.update(path);
    } else {
      this.update('');
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
  exports: [FormUrlComponent],
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule],
})
export class FormSelectSchema {}
