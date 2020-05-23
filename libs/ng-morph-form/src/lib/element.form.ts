import { FormGroupSchema, FormEntity, createForms,  GetForm } from 'ng-form-factory';
import { text, list } from './schema';
import { AttributeNode, attributeSchema, toAttributeNode } from './attribute.form';
import { Element } from '@angular/compiler/src/render3/r3_ast';

// TODO : remove "name" & "attribute"
// Set the list of inputs / output depending on the component name & directive

// MODEL
export interface ElementNode {
  name: string;
  attributes: AttributeNode[];
  inputs: AttributeNode[];
  outputs: AttributeNode[];
  references: AttributeNode[];
}

// FACTORY
export const createElementNode = (params: Partial<ElementNode> = {}): ElementNode => ({
  name: '',
  attributes: [],
  inputs: [],
  outputs: [],
  references: [],
  ...params
});


// Transform
export const toElementNode = (node: Element): ElementNode => {
  return createElementNode({
    name: node.name,
    attributes: node.attributes.map(a => toAttributeNode(a)),
    inputs: node.inputs.map(a => toAttributeNode(a)),
    outputs: node.outputs.map(a => toAttributeNode({ name: a.name, value: a.handler })),
    references: node.references.map(a => toAttributeNode(a)),
  })
}

// SCHEMA
export interface ElementSchema extends FormGroupSchema<ElementNode> {}
export const elementSchema: ElementSchema = {
  form: 'group',
  load: 'entity',
  controls: {
    name: text(),
    attributes: list(attributeSchema),
    inputs: list(attributeSchema),
    outputs: list(attributeSchema),
    references: list(attributeSchema),
  },
}

// FORM

type ElementFormKeys = {
  [key in keyof ElementNode]: GetForm<ElementSchema['controls'][key]>
}

export type ElementForm = FormEntity<ElementSchema, ElementNode> & ElementFormKeys;

export function elementForm(element: Partial<ElementNode> = {}): ElementForm {
  const initial = createElementNode(element);
  const form = createForms(elementSchema, initial);
  for (const key in initial) {
    if (!(key in form)) {
      form[key] = form.get(key as keyof ElementNode);
    } else {
      throw new Error(`Cannot set getter "${key}" on entity form because it's already part of the api`)
    }
  }
  return form as any;
}
