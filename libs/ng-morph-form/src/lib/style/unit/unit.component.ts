import { Component, OnDestroy, ChangeDetectionStrategy, Input, NgModule, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormGroup, FormControl, ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormOutlet } from 'ng-form-factory';
import { change } from '../utils';
import { Subject } from 'rxjs';
import { UnitSchema } from './schema';

interface Unit {
  value: number;
  unit: string;
}

@Component({
  selector: 'form-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UnitComponent),
    multi: true
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitComponent implements ControlValueAccessor, OnDestroy {
  static nextId = 0;

  form = new FormGroup({
    value: new FormControl(),
    unit: new FormControl()
  });

  stateChanges = new Subject<void>();

  @Input() @change() value: Unit;
  @Input() @change() placeholder: string;
  @Input() @change('bool') disabled: boolean;
  @Input() @change('bool') required: boolean;

  // Specific
  @Input() options: string[];

  onChange = (_: any) => {};
  onTouched = () => {};
  

  constructor() {}

  ngOnDestroy(): void {
    this.stateChanges.complete();
  }

  // CONTROL VALUE ACCESSOR

  writeValue(valueStr: string | null): void {
    const [ value = '', unit = this.options[0] ] = valueStr?.replace(/^[0-9]*/g, (int) => `${int}-`).split('-');
    this.form.setValue({ value, unit });
  }

  registerOnChange(fn: any): void {
    this.onChange = ({value, unit}: Unit) => fn(`${value}${unit}`);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

}


@Component({
  selector: 'form-unit-container',
  template: '<form-unit [options]="schema.options" [formControl]="form"></form-unit>',
  styles: [':host {display: block;}']
})
export class FormUnitComponent implements FormOutlet {
  @Input() form: FormControl;
  @Input() schema: UnitSchema;
}

@NgModule({
  declarations: [FormUnitComponent, UnitComponent],
  exports: [UnitComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ]
})
export class FormUnitModule { }
