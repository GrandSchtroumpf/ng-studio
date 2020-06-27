import { FormArraySchema, GetSchema, FormControlSchema, FormGroupSchema, } from 'ng-form-factory';

export const text = (): FormControlSchema => ({
  form: 'control',
  load: 'text'
});

export const list = <T>(factory: GetSchema<T>): FormArraySchema<T> => ({
  form: 'array',
  load: 'list',
  controls: [],
  factory,
});

export const group = <T>(controls: FormGroupSchema<T>['controls']): FormGroupSchema<T> => ({
  form: 'group',
  load: 'entity',
  controls
});