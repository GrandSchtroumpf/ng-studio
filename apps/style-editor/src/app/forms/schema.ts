import { FormControlSchema, } from 'ng-form-factory';
import { matSelect, } from 'material-form-factory/select';

export const color = (): FormControlSchema => ({
  form: 'control',
  load: 'color'
});

export const unit = (units: string[]) => matSelect({ options: units });
