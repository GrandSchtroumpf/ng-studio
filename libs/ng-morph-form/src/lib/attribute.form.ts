import { FormGroupSchema } from 'ng-form-factory';
import { text } from './schema';
import { AST } from '@angular/compiler/src/expression_parser/ast';

// MODEL
export interface AttributeNode {
  name: string;
  value?: string;
}

// FACTORY
export const createAttributeNode = (params: Partial<AttributeNode> = {}): AttributeNode => ({
  name: '',
  ...params
});


// TRANSFORM
interface AttributeLike {
  name: string;
  value: string | AST
}
export const toAttributeNode = (node: AttributeLike) => createAttributeNode({
  name: node.name,
  value: typeof node.value === 'string'
    ? node.value
    : (node.value['source'] || '')
});


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
