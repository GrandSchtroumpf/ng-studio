import { FormArraySchema, GetSchema, FormControlSchema, } from 'ng-form-factory';

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