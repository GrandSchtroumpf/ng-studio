import { FormGroupSchema, createForms, FormEntity, GetForm } from "ng-form-factory";
import { text, list } from "./schema";
import { AttributeNode, attributeSchema } from "./attribute.form";

// MODEL
interface TemplateNode {
  tagName: string;
  attributes: AttributeNode[];
  inputs: AttributeNode[];
  outputs: AttributeNode[];
  templateAttrs: AttributeNode[],
  children: AttributeNode[];
  references: AttributeNode[];
  variables: AttributeNode[];
}

// FACTORY
const createTemplateNode = (params: Partial<TemplateNode> = {}) => ({
  tagName: '',
  attributes: [],
  inputs: [],
  outputs: [],
  templateAttrs: [],
  children: [],
  references: [],
  variables: [],
  ...params
});

// SCHEMA
interface TemplateSchema extends FormGroupSchema<TemplateNode> {}
const templateSchema: TemplateSchema = {
  form: 'group',
  load: 'entity',
  controls: {
    tagName: text(),
    attributes: list(attributeSchema),
    inputs: list(attributeSchema),
    outputs: list(attributeSchema),
    templateAttrs: list(attributeSchema),
    references: list(attributeSchema),
    variables: list(attributeSchema),
  },
}

// FORM

type TemplateFormKeys = {
  [key in keyof TemplateNode]: GetForm<TemplateSchema['controls'][key]>
}

export type TemplateForm = FormEntity<TemplateSchema, TemplateNode> & TemplateFormKeys;

export function templateForm(template: Partial<TemplateNode> = {}): TemplateForm {
  const initial = createTemplateNode(template);
  const form = createForms(templateSchema, initial);
  for (const key in initial) {
    form[key] = form.get(key as keyof TemplateNode);
  }
  return form as any;
}
