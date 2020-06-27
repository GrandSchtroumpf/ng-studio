import { FormGroupSchema } from 'ng-form-factory';
import { text } from '../schema';
import { AttributeNode } from 'ng-morph/template'


// SCHEMA
export interface AttributeSchema extends FormGroupSchema<AttributeNode> {}
export const attributeSchema: AttributeSchema = {
  form: 'group',
  load: 'entity',
  controls: {
    name: text(),
    value: text()
  }
};
