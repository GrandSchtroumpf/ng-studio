import { Component, Input, NgModule, ViewChild, Renderer2, ElementRef, forwardRef } from '@angular/core';
import { FormControl, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormOutlet, FormControlSchema } from 'ng-form-factory';
import { PluginClient } from '@remixproject/plugin';

import { CommonModule } from '@angular/common';

export type UrlSchema = FormControlSchema;

export function urlSchema(params: Partial<UrlSchema> = {}): UrlSchema {
  return {
    form: 'control',
    load: 'select',
    ...params,
  };
}

@Component({
  selector: 'form-url',
  template: '<form-url-accessor [formControl]="form"></form-url-accessor>',
})
export class FormUrlComponent implements FormOutlet {
  @Input() schema: UrlSchema;
  @Input() form: FormControl;

  constructor(private client: PluginClient<any, any>) {}

  async selectUrl() {
    const path = await this.client.call('window', 'selectFiles');
    this.form.setValue(path);
  }
}


@Component({
  selector: 'form-url-accessor',
  template: `
    <input #input type="url" (change)="onChange($event.target.value)" (blur)="onTouched()" [disabled]="disabled" />
    <button [disabled]="disabled" (click)="selectUrl()">url</button>
  `,
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

  @ViewChild('input') form: ElementRef<HTMLInputElement>;

  constructor(
    private client: PluginClient<any, any>,
    private renderer: Renderer2
  ) {}

  private update(value: string) {
    this.renderer.setProperty(this.form.nativeElement, 'value', value);
  }

  selectUrl() {
    this.client.call('window', 'selectFiles').then(path => {
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
  imports: [CommonModule, ReactiveFormsModule],
})
export class FormSelectSchema {}
