import { Factory, FormGroupSchema } from 'ng-form-factory';
import { selectSchema } from './select';
import { arraySchema } from './array';
import { groupSchema } from './group/schema';
import { propertyListSchema } from './property-list/schema';
import { ruleSchema } from './rule/schema';
import { unitSchema, UnitSchema } from './unit/schema';
import { buttonToggleSchema } from './button-toggle/schema';
import { colorSchema } from './color/schema';
import { urlSchema } from './url';

interface StyleFormFactory {
  select: string;
  array: any[];
  group: object;
  propertyList: object;
  rule: object;
  unit: string;
  buttonToggle: string | string[];
  color: string;
  url: string;
}

export const styleFormFactory: Factory<StyleFormFactory> = {
  select: {
    component: () => import('./select').then(c => c.FormSelectComponent),
    schema: selectSchema
  },
  array: {
    component: () => import('./array').then(c => c.FormListComponent),
    schema: arraySchema
  },
  group: {
    component: () => import('./group').then(c => c.FormGroupComponent),
    schema: groupSchema
  },
  propertyList: {
    component: () => import('./property-list').then(c => c.FormPropertyListComponent),
    schema: (schema: FormGroupSchema) => propertyListSchema(schema.controls)
  },
  rule: {
    component: () => import('./rule').then(c => c.FormRuleComponent),
    schema: (schema: FormGroupSchema) => ruleSchema(schema.controls)
  },
  unit: {
    component: () => import('./unit').then(c => c.FormUnitComponent),
    schema: (schema: UnitSchema) => unitSchema(schema.options)
  },
  buttonToggle: {
    component: () => import('./button-toggle').then(c => c.ButtonToggleFormComponent),
    schema: buttonToggleSchema
  },
  color: {
    component: () => import('./color').then(c => c.FormColorComponent),
    schema: colorSchema
  },
  url: {
    component: () => import('./url').then(c => c.FormUrlComponent),
    schema: urlSchema,
  }
} as const
