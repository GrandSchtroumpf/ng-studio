import { FormGroupSchema } from 'ng-form-factory';

export function propertyListSchema<T>(
  controls: FormGroupSchema<T>['controls'] = {}
): FormGroupSchema {
  return {
    form: 'group',
    load: 'propertyList',
    controls,
  };
}