import { FormGroupSchema } from 'ng-form-factory';

export function ruleSchema<T>(
  controls: FormGroupSchema<T>['controls'] = {}
): FormGroupSchema {
  return {
    form: 'group',
    load: 'rule',
    controls,
  };
}