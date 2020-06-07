import { FormGroupSchema, FormEntity, createForms,  GetForm } from 'ng-form-factory';
import { text, list } from './schema';
import { attributeSchema } from './attribute.form';
import { ElementNode, elementNode } from 'ng-morph/template';
import { templateSchema } from './template.form';

// TODO : remove "name" & "attribute"
// Set the list of inputs / output depending on the component name & directive


// SCHEMA
export interface ElementSchema extends FormGroupSchema<ElementNode> {}
export const elementSchema: ElementSchema = {
  form: 'group',
  load: 'entity',
  controls: {
    name: text(),
    template: templateSchema,
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
  const initial = elementNode(element);
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
