import { FormGroupSchema, FormEntity, createForms,  GetForm } from 'ng-form-factory';
import { text, list } from '../schema';
import { attributeSchema } from './attribute.form';
import { ElementNode, elementNode, isTextNode, TextNode, AttributeNode } from 'ng-morph/template';
import { textNodeSchema } from './text.form';

interface ElementBuilder {
  id: string;
  text: TextNode;
  attributes: AttributeNode[];
  outputs: AttributeNode[];
}

export function toElementBuilder(element: ElementNode): ElementBuilder {
  return {
    id: element.id,
    text: element.children.find(isTextNode),
    attributes: element.attributes.concat(element.inputs),
    outputs: element.outputs
  }
}

function isInput(attr: AttributeNode) {
  return attr.value.startsWith('[') && attr.value.endsWith(']');
}

export function fromElementBuilder(builder: ElementBuilder): Partial<ElementNode> {
  return {
    id: builder.id,
    children: builder.text ? [builder.text] : [],
    inputs: builder.attributes.filter(attr => isInput(attr)),
    attributes: builder.attributes.filter(attr => !isInput(attr)),
    outputs: builder.outputs
  }
}

export interface ElementSchema extends FormGroupSchema<ElementBuilder> {}
export const elementBuilderSchema = (builder): ElementSchema => ({
  form: 'group',
  load: 'entity',
  controls: {
    id: text(),
    text: builder.text ? textNodeSchema : undefined,
    attributes: list(attributeSchema),
    outputs: list(attributeSchema),
  },
})

type ElementFormKeys = {
  [key in keyof ElementBuilder]: GetForm<ElementSchema['controls'][key]>
}
export type ElementForm = FormEntity<ElementSchema, ElementBuilder> & ElementFormKeys;
export function elementForm(element: Partial<ElementNode> = {}): [ElementSchema, ElementForm] {
  const initial = toElementBuilder(elementNode(element));
  const schema = elementBuilderSchema(initial);
  const form = createForms(schema, initial);
  for (const key in initial) {
    if (!(key in form)) {
      form[key] = form.get(key as keyof ElementBuilder);
    } else {
      throw new Error(`Cannot set getter "${key}" on entity form because it's already part of the api`)
    }
  }
  return [schema, form] as any;
}
