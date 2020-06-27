import { FormControlSchema } from 'ng-form-factory';

export interface UnitSchema extends FormControlSchema {
  options: string[];
}

export function unitSchema(options: string[] = ['px', '%']): UnitSchema {
  return {
    form: 'control',
    load: 'unit',
    options,
  };
}