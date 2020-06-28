import { FormControlSchema } from 'ng-form-factory';

export const colorSchema = (params: Partial<FormControlSchema> = {}): FormControlSchema => ({
  form: 'control',
  load: 'color',
  ...params
});