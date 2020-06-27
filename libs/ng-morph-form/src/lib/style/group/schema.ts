import { FormGroupSchema } from 'ng-form-factory';

export function groupSchema<T>(
  controls: FormGroupSchema<T>['controls'] = {}
): FormGroupSchema {
  return {
    form: 'group',
    load: 'group',
    controls,
  };
}