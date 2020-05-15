import { FormGroupSchema, FormEntity, createForms } from 'ng-form-factory';
import { createElement } from 'ng-morph/template';
import { TextAttribute, Element } from '@angular/compiler/src/render3/r3_ast';

interface TextAttributSchema extends FormGroupSchema<TextAttribute> {}
const textAttributeSchema: TextAttributSchema = {
  form: 'group',
  load: 'entity',
  controls: {
    name: { form: 'control', load: 'text' },
    value: { form: 'control', load: 'text' }
  }
};

interface ElementSchema extends FormGroupSchema<Element> {}
const elementSchema: ElementSchema = {
  form: 'group',
  load: 'entity',
  controls: {
    name: { form: 'control', load: 'text' },
    attributes: {
      form: 'array',
      load: 'list',
      factory: textAttributeSchema,
      controls: []
    },
    inputs: {
      form: 'array',
      load: 'list',
      factory: textAttributeSchema as any,
      controls: []
    }
  },
}

export function elementForm(element: Element = createElement()) {
  return createForms(elementSchema, element) as FormEntity<ElementSchema, Element>;
}

